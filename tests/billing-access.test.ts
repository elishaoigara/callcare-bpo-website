import { afterEach, expect, it, vi } from "vitest";
import { authorizeBilling, orderAccessToken } from "../server/billing/access";
import { paymentEnvironment } from "../server/payments/config";
import { parseAmount } from "../shared/billing";
afterEach(() => vi.unstubAllEnvs());
function db(
  member: boolean,
  user: object | null = {
    id: "founder",
    email: "founder@example.invalid",
    email_confirmed_at: "2026-01-01",
  }
) {
  const query: any = {
    select: () => query,
    eq: () => query,
    maybeSingle: async () => ({
      data: member ? { user_id: "founder" } : null,
      error: null,
    }),
  };
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user }, error: null })) },
    from: vi.fn(() => query),
  } as any;
}
it("requires a verified identity AND billing membership; user metadata is not authorization", async () => {
  await expect(authorizeBilling(db(true), null)).rejects.toThrow("sign in");
  await expect(authorizeBilling(db(true, null), "Bearer fake")).rejects.toThrow(
    "verified"
  );
  await expect(
    authorizeBilling(
      db(false, {
        id: "recruiter",
        email_confirmed_at: "2026-01-01",
        user_metadata: { role: "billing_admin" },
      }),
      "Bearer fake"
    )
  ).rejects.toThrow("does not have billing");
  await expect(
    authorizeBilling(db(true), "Bearer valid")
  ).resolves.toMatchObject({ id: "founder" });
});
it("uses stable unguessable links and fails closed when the link secret is absent", () => {
  vi.stubEnv("PAYMENTS_LINK_SECRET", "");
  expect(() => orderAccessToken("order-1")).toThrow("not been configured");
  vi.stubEnv("PAYMENTS_LINK_SECRET", "a".repeat(64));
  expect(orderAccessToken("order-1")).toBe(orderAccessToken("order-1"));
  expect(orderAccessToken("order-1")).not.toBe(orderAccessToken("order-2"));
});
it("can prepare orders with checkout disabled but never allows live mode in previews", () => {
  const env = {
    PAYMENTS_ENABLED: "false",
    PAYMENTS_SITE_URL: "https://preview.example.com",
    PAYMENTS_SUPABASE_URL: "https://db.example.com",
    PAYMENTS_SUPABASE_SECRET_KEY: "fixture",
  };
  expect(paymentEnvironment(env).mode).toBe("test");
  expect(() =>
    paymentEnvironment({
      ...env,
      PAYSTACK_MODE: "live",
      VERCEL_ENV: "preview",
      PAYMENTS_ALLOW_LIVE: "true",
    })
  ).toThrow();
});
it("converts decimal amounts without float rounding and rejects ambiguous formats", () => {
  expect(parseAmount("2500.01")).toBe(250001);
  for (const value of ["1e3", "1.001", "-10", "1,000", "abc"])
    expect(parseAmount(value)).toBeNaN();
});
