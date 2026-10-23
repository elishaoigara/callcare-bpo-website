import { afterEach, expect, it, vi } from "vitest";
import { handlePayment } from "../server/payments/http";
afterEach(() => vi.unstubAllEnvs());
function configure() {
  for (const [key, value] of Object.entries({
    PAYMENTS_ENABLED: "true",
    PAYSTACK_MODE: "test",
    PAYSTACK_SECRET_KEY: "sk_test_fixture",
    PAYMENTS_SITE_URL: "https://preview.example.com",
    PAYMENTS_SUPABASE_URL: "https://db.example.com",
    PAYMENTS_SUPABASE_SECRET_KEY: "fixture",
  }))
    vi.stubEnv(key, value);
}
it("returns a controlled disabled response without any network request", async () => {
  vi.stubEnv("PAYMENTS_ENABLED", "false");
  const result = await handlePayment(
    new Request("https://example.com/api/payments/order", { method: "POST" }),
    "order"
  );
  expect(result.status).toBe(503);
  expect(result.headers.get("cache-control")).toBe("no-store");
  expect(await result.text()).not.toContain("sk_");
});
it("rejects GET and cross-origin payment requests", async () => {
  configure();
  expect(
    (
      await handlePayment(
        new Request("https://preview.example.com/api/payments/order"),
        "order"
      )
    ).status
  ).toBe(405);
  const request = new Request(
    "https://preview.example.com/api/payments/checkout",
    {
      method: "POST",
      headers: {
        origin: "https://attacker.invalid",
        "content-type": "application/json",
      },
      body: "{}",
    }
  );
  expect((await handlePayment(request, "checkout")).status).toBe(403);
});
it("rejects browser-controlled amounts and excessive/malformed payloads before contacting providers", async () => {
  configure();
  for (const [body, expected] of [
    [JSON.stringify({ token: "a".repeat(64), accepted: true, amount: 1 }), 400],
    ["a".repeat(3000), 413],
    ["{", 400],
  ] as const) {
    const request = new Request(
      "https://preview.example.com/api/payments/checkout",
      { method: "POST", headers: { "content-type": "application/json" }, body }
    );
    expect((await handlePayment(request, "checkout")).status).toBe(expected);
  }
});
