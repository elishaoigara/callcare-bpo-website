import { createClient } from "@supabase/supabase-js";
import { PaymentError, type PaymentConfig } from "./config.js";
import type { Gateway, Order, PaymentStore, Transaction } from "./service.js";

export function createPaymentStore(config: PaymentConfig): PaymentStore {
  const db = createClient(config.databaseUrl, config.databaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  });
  const check = (error: unknown) => {
    if (error)
      throw new PaymentError(
        503,
        "We could not update your order. Please check payment status before paying again."
      );
  };
  return {
    async byTokenHash(hash) {
      const { data, error } = await db
        .from("payment_orders")
        .select("*")
        .eq("access_hash", hash)
        .maybeSingle();
      check(error);
      return data as Order | null;
    },
    async byReference(reference) {
      const { data, error } = await db
        .from("payment_orders")
        .select("*")
        .eq("reference", reference)
        .maybeSingle();
      check(error);
      return data as Order | null;
    },
    async claimInitialization(id) {
      const { data, error } = await db
        .from("payment_orders")
        .update({
          initialization_started_at: new Date().toISOString(),
          terms_accepted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "awaiting_payment")
        .is("initialization_started_at", null)
        .gt("expires_at", new Date().toISOString())
        .select("id");
      check(error);
      return data?.length === 1;
    },
    async saveCheckout(id, url) {
      const { error } = await db
        .from("payment_orders")
        .update({ checkout_url: url })
        .eq("id", id);
      check(error);
    },
    async markPaid(order, transaction) {
      const { error } = await db.rpc("record_order_payment", {
        p_reference: order.reference,
        p_transaction_id: String(transaction.id),
        p_amount: transaction.amount,
        p_currency: transaction.currency,
        p_mode: transaction.domain,
        p_paid_at: transaction.paid_at,
      });
      check(error);
    },
  };
}
export function createGateway(config: PaymentConfig): Gateway {
  async function request(path: string, body?: object) {
    let response: Response;
    try {
      response = await fetch(`https://api.paystack.co${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${config.secret}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(10000),
      });
      const payload = await response.json();
      if (!response.ok || payload.status !== true || !payload.data)
        throw new Error("Gateway response unavailable");
      return payload.data;
    } catch {
      // Don't log provider payloads, customer details, or credentials.
      throw new PaymentError(
        502,
        "Paystack could not confirm this request. Check payment status before paying again, or contact CallCare."
      );
    }
  }
  return {
    async initialize(order: Order, callback: string) {
      const data = await request("/transaction/initialize", {
        email: order.customer_email,
        amount: Number(order.amount_minor),
        currency: order.currency,
        reference: order.reference,
        callback_url: callback,
        channels:
          order.currency === "KES" ? ["card", "mobile_money"] : ["card"],
        metadata: { order_id: order.id, order_number: order.order_number },
      });
      return data.authorization_url as string;
    },
    async verify(reference) {
      return (await request(
        `/transaction/verify/${encodeURIComponent(reference)}`
      )) as Transaction;
    },
  };
}
