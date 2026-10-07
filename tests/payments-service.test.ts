import { createHmac } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";
import {
  PaymentService,
  hashToken,
  matchesOrder,
  validSignature,
  type Order,
  type PaymentStore,
  type Transaction,
} from "../server/payments/service";
import { paymentConfig } from "../server/payments/config";

const env = {
  PAYMENTS_ENABLED: "true",
  PAYSTACK_MODE: "test",
  PAYSTACK_SECRET_KEY: "sk_test_fixture",
  PAYMENTS_SITE_URL: "https://preview.example.com",
  PAYMENTS_SUPABASE_URL: "https://db.example.com",
  PAYMENTS_SUPABASE_SECRET_KEY: "fixture",
};
const config = paymentConfig(env);
const token = "a".repeat(64);
let order: Order;
let service: PaymentService;
const gateway = { initialize: vi.fn(), verify: vi.fn() };
let store: PaymentStore;
const transaction = (): Transaction => ({
  id: 123456,
  status: "success",
  reference: order.reference,
  amount: 25000,
  currency: "KES",
  domain: "test",
  paid_at: "2026-10-07T12:00:00Z",
  customer: { email: order.customer_email },
  metadata: { order_id: order.id },
});
beforeEach(() => {
  vi.clearAllMocks();
  order = {
    id: "test-order",
    access_hash: hashToken(token),
    order_number: "CC-TEST",
    customer_email: "client@example.invalid",
    title: "Pilot",
    scope: "An agreed pilot",
    terms: "Agreed terms",
    amount_minor: 25000,
    currency: "KES",
    mode: "test",
    status: "awaiting_payment",
    expires_at: "2099-01-01T00:00:00Z",
    paid_at: null,
    reference: "cc-test-reference",
    checkout_url: null,
    initialization_started_at: null,
  };
  store = {
    byTokenHash: vi.fn(async hash =>
      hash === order.access_hash ? { ...order } : null
    ),
    byReference: vi.fn(async ref =>
      ref === order.reference ? { ...order } : null
    ),
    claimInitialization: vi.fn(async () => {
      if (order.initialization_started_at) return false;
      order.initialization_started_at = new Date().toISOString();
      return true;
    }),
    saveCheckout: vi.fn(async (_id, url) => {
      order.checkout_url = url;
    }),
    markPaid: vi.fn(async () => {
      order.status = "paid";
    }),
  };
  gateway.initialize.mockResolvedValue(
    "https://checkout.paystack.com/test-access"
  );
  gateway.verify.mockImplementation(async () => transaction());
  service = new PaymentService(store, gateway, config);
});
it("fails closed for missing settings, preview live keys, and mismatched keys", () => {
  expect(() => paymentConfig({})).toThrow();
  expect(() =>
    paymentConfig({ ...env, PAYSTACK_SECRET_KEY: "sk_live_fixture" })
  ).toThrow();
  expect(() =>
    paymentConfig({
      ...env,
      PAYSTACK_MODE: "live",
      PAYSTACK_SECRET_KEY: "sk_live_fixture",
      PAYMENTS_ALLOW_LIVE: "true",
      VERCEL_ENV: "preview",
    })
  ).toThrow();
  expect(
    paymentConfig({
      ...env,
      PAYSTACK_MODE: "live",
      PAYSTACK_SECRET_KEY: "sk_live_fixture",
      PAYMENTS_ALLOW_LIVE: "true",
      VERCEL_ENV: "production",
    }).mode
  ).toBe("live");
});
it("blocks invalid/private links and keeps email and token hashes out of summaries", async () => {
  await expect(service.getOrder("b".repeat(64))).rejects.toThrow("not valid");
  await expect(service.getOrder("short")).rejects.toThrow("not valid");
  const summary = service.summary(await service.getOrder(token));
  expect(summary).not.toHaveProperty("customer_email");
  expect(summary).not.toHaveProperty("access_hash");
});
it("blocks unpaid consent, expired quotes, paid orders and disabled USD", async () => {
  await expect(service.checkout(token, false)).rejects.toThrow("accept");
  order.expires_at = "2020-01-01T00:00:00Z";
  await expect(service.checkout(token, true)).rejects.toThrow("not currently");
  order.expires_at = "2099-01-01T00:00:00Z";
  order.currency = "USD";
  await expect(service.checkout(token, true)).rejects.toThrow("not currently");
  order.status = "paid";
  await expect(service.checkout(token, true)).rejects.toThrow(
    "already been paid"
  );
  expect(gateway.initialize).not.toHaveBeenCalled();
});
it("initializes only once across concurrent clicks and reuses the saved checkout", async () => {
  const results = await Promise.allSettled([
    service.checkout(token, true),
    service.checkout(token, true),
  ]);
  expect(results.filter(result => result.status === "fulfilled")).toHaveLength(
    1
  );
  expect(gateway.initialize).toHaveBeenCalledTimes(1);
  expect(await service.checkout(token, true)).toBe(
    "https://checkout.paystack.com/test-access"
  );
  expect(gateway.initialize).toHaveBeenCalledTimes(1);
  expect(gateway.initialize.mock.calls[0][1]).toBe(
    "https://preview.example.com/orders"
  );
});
it("does not create another payment after an ambiguous timeout", async () => {
  gateway.initialize.mockRejectedValue(new Error("timeout"));
  await expect(service.checkout(token, true)).rejects.toThrow("timeout");
  await expect(service.checkout(token, true)).rejects.toThrow("payment check");
  expect(gateway.initialize).toHaveBeenCalledTimes(1);
});
it("rejects an untrusted checkout redirect", async () => {
  gateway.initialize.mockResolvedValue(
    "https://checkout.paystack.com.attacker.invalid/pay"
  );
  await expect(service.checkout(token, true)).rejects.toThrow(
    "could not be opened"
  );
  expect(store.saveCheckout).not.toHaveBeenCalled();
});
it.each([
  "amount",
  "currency",
  "domain",
  "reference",
  "customer",
  "metadata",
  "id",
  "paid_at",
])("does not mark paid when %s differs", async field => {
  order.initialization_started_at = new Date().toISOString();
  const invalid = {
    ...transaction(),
    [field]: "wrong",
  } as unknown as Transaction;
  gateway.verify.mockResolvedValue(invalid);
  expect(matchesOrder(order, invalid)).toBe(false);
  await expect(service.reconcile(order)).rejects.toThrow("manual review");
  expect(store.markPaid).not.toHaveBeenCalled();
});
it("pending verification is never treated as paid", async () => {
  order.initialization_started_at = new Date().toISOString();
  gateway.verify.mockResolvedValue({ ...transaction(), status: "pending" });
  expect((await service.reconcile(order)).status).toBe("awaiting_payment");
  expect(store.markPaid).not.toHaveBeenCalled();
});
it("authenticates raw webhook bytes, verifies independently, and tolerates duplicates", async () => {
  order.initialization_started_at = new Date().toISOString();
  const raw = Buffer.from(
    JSON.stringify({
      event: "charge.success",
      data: { reference: order.reference },
    })
  );
  const signature = createHmac("sha512", config.secret)
    .update(raw)
    .digest("hex");
  expect(validSignature(raw, signature, config.secret)).toBe(true);
  await expect(service.webhook(raw, "0".repeat(128))).rejects.toThrow(
    "Invalid signature"
  );
  expect(gateway.verify).not.toHaveBeenCalled();
  await service.webhook(raw, signature);
  await service.webhook(raw, signature);
  expect(store.markPaid).toHaveBeenCalledTimes(1);
  expect(gateway.verify).toHaveBeenCalledTimes(1);
});
it("asks Paystack to retry a success webhook when verification is still pending", async () => {
  order.initialization_started_at = new Date().toISOString();
  gateway.verify.mockResolvedValue({ ...transaction(), status: "pending" });
  const raw = Buffer.from(
    JSON.stringify({
      event: "charge.success",
      data: { reference: order.reference },
    })
  );
  const signature = createHmac("sha512", config.secret)
    .update(raw)
    .digest("hex");
  await expect(service.webhook(raw, signature)).rejects.toThrow(
    "still pending"
  );
});
