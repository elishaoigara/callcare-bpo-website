import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { orderTokenPattern, type OrderSummary } from "../../shared/payments.js";
import { PaymentError, type PaymentConfig } from "./config.js";

export type Order = {
  id: string;
  access_hash: string;
  order_number: string;
  customer_email: string;
  title: string;
  scope: string;
  terms: string;
  amount_minor: number;
  currency: "KES" | "USD";
  mode: "test" | "live";
  status: "awaiting_payment" | "paid";
  expires_at: string;
  paid_at: string | null;
  reference: string;
  checkout_url: string | null;
  initialization_started_at: string | null;
};
export interface PaymentStore {
  byTokenHash(hash: string): Promise<Order | null>;
  byReference(reference: string): Promise<Order | null>;
  claimInitialization(id: string): Promise<boolean>;
  saveCheckout(id: string, url: string): Promise<void>;
  markPaid(order: Order, transaction: Transaction): Promise<void>;
}
export type Transaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  domain: string;
  paid_at: string;
  customer: { email: string };
  metadata: { order_id?: string };
};
export interface Gateway {
  initialize(order: Order, callback: string): Promise<string>;
  verify(reference: string): Promise<Transaction>;
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function validCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "checkout.paystack.com" &&
      !url.username &&
      !url.password &&
      !url.port
    );
  } catch {
    return false;
  }
}
export function validSignature(
  raw: Buffer,
  signature: string | null,
  secret: string
) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export function matchesOrder(order: Order, data: Transaction) {
  return (
    data.status === "success" &&
    Number.isSafeInteger(data.id) &&
    data.id > 0 &&
    data.reference === order.reference &&
    data.amount === Number(order.amount_minor) &&
    data.currency === order.currency &&
    data.domain === order.mode &&
    data.customer?.email?.toLowerCase() ===
      order.customer_email.toLowerCase() &&
    data.metadata?.order_id === order.id &&
    Boolean(data.paid_at) &&
    Number.isFinite(Date.parse(data.paid_at))
  );
}
export class PaymentService {
  constructor(
    private store: PaymentStore,
    private gateway: Gateway,
    private config: PaymentConfig
  ) {}
  async getOrder(token: unknown) {
    if (typeof token !== "string" || !orderTokenPattern.test(token))
      throw new PaymentError(
        404,
        "This order link is not valid. Please ask CallCare for your private order link."
      );
    const order = await this.store.byTokenHash(hashToken(token));
    if (!order || order.mode !== this.config.mode)
      throw new PaymentError(
        404,
        "This order link is not valid. Please ask CallCare for your private order link."
      );
    return order;
  }
  summary(order: Order): OrderSummary {
    return {
      orderNumber: order.order_number,
      title: order.title,
      scope: order.scope,
      terms: order.terms,
      amountMinor: Number(order.amount_minor),
      currency: order.currency,
      mode: order.mode,
      status: order.status,
      expiresAt: order.expires_at,
      paidAt: order.paid_at,
      reference: order.reference,
      canPay:
        order.status !== "paid" &&
        Date.parse(order.expires_at) > Date.now() &&
        (order.currency !== "USD" || this.config.usdEnabled),
    };
  }
  async checkout(token: unknown, accepted: unknown) {
    const order = await this.getOrder(token);
    if (accepted !== true)
      throw new PaymentError(
        400,
        "Please accept the agreed scope and payment terms first."
      );
    if (order.status === "paid")
      throw new PaymentError(
        409,
        "This order has already been paid. Check its payment status."
      );
    if (!this.summary(order).canPay)
      throw new PaymentError(
        409,
        "This order is not currently available for payment. Please contact CallCare."
      );
    if (order.checkout_url && validCheckoutUrl(order.checkout_url))
      return order.checkout_url;
    // Durable compare-and-set: concurrent clicks/retries cannot create two transactions.
    if (!(await this.store.claimInitialization(order.id)))
      throw new PaymentError(
        409,
        "Checkout is being prepared or needs a payment check. Check payment status before trying again; contact CallCare if this continues."
      );
    // No access token sent to Paystack. The customer reopens their private link if storage was cleared.
    const url = await this.gateway.initialize(
      order,
      `${this.config.origin}/orders`
    );
    if (!validCheckoutUrl(url))
      throw new PaymentError(
        502,
        "Checkout could not be opened. Please contact CallCare before paying again."
      );
    await this.store.saveCheckout(order.id, url);
    return url;
  }
  async reconcile(order: Order) {
    if (order.status === "paid") return this.summary(order);
    if (!order.initialization_started_at) return this.summary(order);
    const transaction = await this.gateway.verify(order.reference);
    if (transaction.status !== "success") return this.summary(order);
    if (!matchesOrder(order, transaction))
      throw new PaymentError(
        409,
        "The payment needs a manual review. Please contact CallCare and do not pay again."
      );
    await this.store.markPaid(order, transaction);
    return this.summary({
      ...order,
      status: "paid",
      paid_at: transaction.paid_at,
    });
  }
  async webhook(raw: Buffer, signature: string | null) {
    if (!validSignature(raw, signature, this.config.secret))
      throw new PaymentError(401, "Invalid signature.");
    let event;
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      throw new PaymentError(400, "Invalid event.");
    }
    if (event?.event !== "charge.success") return;
    const reference = event?.data?.reference;
    if (typeof reference !== "string" || reference.length > 100)
      throw new PaymentError(400, "Invalid reference.");
    const order = await this.store.byReference(reference);
    // Other products can use the same merchant account; don't process their transactions.
    if (!order || order.mode !== this.config.mode) return;
    const result = await this.reconcile(order);
    if (result.status !== "paid")
      throw new PaymentError(503, "Payment verification is still pending.");
  }
}
