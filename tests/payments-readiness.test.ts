import { expect, it } from "vitest";
import { paymentSetupChecks } from "../server/payments/readiness";

const env = {
  PAYMENTS_ENABLED: "false",
  PAYSTACK_MODE: "test",
  PAYSTACK_SECRET_KEY: "sk_test_fixture",
  PAYMENTS_SITE_URL: "https://preview.example.com",
  PAYMENTS_SUPABASE_URL: "https://db.example.com",
  PAYMENTS_SUPABASE_SECRET_KEY: "sb_secret_fixture",
  VITE_BILLING_SUPABASE_URL: "https://db.example.com/",
  VITE_BILLING_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
  PAYMENTS_LINK_SECRET: "a".repeat(64),
};
const failures = (value: Record<string, string>) =>
  paymentSetupChecks(value)
    .filter(check => !check.ok)
    .map(check => check.name);
it("allows fully configured disabled collection and reports missing setup without secrets", () => {
  expect(failures(env)).toEqual([]);
  expect(
    paymentSetupChecks({}).filter(check => !check.ok).length
  ).toBeGreaterThan(0);
  expect(JSON.stringify(paymentSetupChecks(env))).not.toContain(
    env.PAYMENTS_LINK_SECRET
  );
  expect(JSON.stringify(paymentSetupChecks(env))).not.toContain(
    env.PAYSTACK_SECRET_KEY
  );
});
it("rejects swapped public/secret keys, mismatched auth projects and missing link secrets", () => {
  expect(
    failures({ ...env, PAYSTACK_SECRET_KEY: "pk_live_fixture" })
  ).toContain("gateway-key");
  expect(
    failures({
      ...env,
      VITE_BILLING_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture",
    })
  ).toContain("billing-public-key");
  expect(
    failures({ ...env, PAYMENTS_SUPABASE_SECRET_KEY: "sb_publishable_fixture" })
  ).toContain("database-key");
  expect(
    failures({ ...env, VITE_BILLING_SUPABASE_URL: "https://other.example.com" })
  ).toContain("billing-project");
  expect(failures({ ...env, PAYMENTS_LINK_SECRET: "" })).toContain(
    "private-links"
  );
});
it("detects secrets in arbitrary browser variables including legacy service-role JWTs", () => {
  const legacy = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
  for (const value of [
    "sk_live_fixture",
    "sk_test_fixture",
    "sb_secret_fixture",
    legacy,
  ])
    expect(failures({ ...env, VITE_ACCIDENTAL_KEY: value })).toContain(
      "browser-secrets"
    );
});
it("rejects live setup in previews and accepts explicit production guards", () => {
  const live = {
    ...env,
    PAYSTACK_MODE: "live",
    PAYSTACK_SECRET_KEY: "sk_live_fixture",
    PAYMENTS_ALLOW_LIVE: "true",
  };
  expect(failures({ ...live, VERCEL_ENV: "preview" })).toContain("environment");
  expect(failures({ ...live, VERCEL_ENV: "production" })).toEqual([]);
});
