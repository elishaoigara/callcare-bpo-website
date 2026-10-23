import { paymentEnvironment } from "./config.js";

export type SetupCheck = { name: string; ok: boolean; message: string };
type Environment = Record<string, string | undefined>;

function keyRole(key: string) {
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString())
      .role;
  } catch {
    return undefined;
  }
}

function httpsOrigin(value: string | undefined) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

// Configuration checks only: no values, customer data or network calls returned.
export function paymentSetupChecks(
  env: Environment = process.env
): SetupCheck[] {
  const checks: SetupCheck[] = [];
  const add = (name: string, ok: boolean, message: string) =>
    checks.push({ name, ok, message });
  const mode = env.PAYSTACK_MODE || "test";
  add(
    "mode",
    mode === "test" || mode === "live",
    "PAYSTACK_MODE must be test or live."
  );
  add(
    "gateway-key",
    Boolean(
      env.PAYSTACK_SECRET_KEY?.startsWith(`sk_${mode}_`) &&
        env.PAYSTACK_SECRET_KEY.length > `sk_${mode}_`.length
    ),
    "PAYSTACK_SECRET_KEY must contain the matching Paystack SECRET key, not the public key."
  );
  const secret = env.PAYMENTS_SUPABASE_SECRET_KEY || "";
  add(
    "database-key",
    secret.startsWith("sb_secret_") || keyRole(secret) === "service_role",
    "PAYMENTS_SUPABASE_SECRET_KEY needs a backend secret key (legacy service_role is supported)."
  );
  const publicKey = env.VITE_BILLING_SUPABASE_PUBLISHABLE_KEY || "";
  add(
    "billing-public-key",
    publicKey.startsWith("sb_publishable_") || keyRole(publicKey) === "anon",
    "VITE_BILLING_SUPABASE_PUBLISHABLE_KEY needs a public publishable key (legacy anon is supported)."
  );
  const databaseOrigin = httpsOrigin(env.PAYMENTS_SUPABASE_URL);
  add(
    "billing-project",
    Boolean(
      databaseOrigin &&
        databaseOrigin === httpsOrigin(env.VITE_BILLING_SUPABASE_URL)
    ),
    "Payment database and billing auth must use the same HTTPS Supabase project origin."
  );
  add(
    "private-links",
    /^[a-f0-9]{64}$/i.test(env.PAYMENTS_LINK_SECRET || ""),
    "PAYMENTS_LINK_SECRET must be a stable, server-only 32-byte hexadecimal secret."
  );
  const exposed = Object.entries(env).some(
    ([name, value]) =>
      name.startsWith("VITE_") &&
      value &&
      (/^(sk_(live|test)_|sb_secret_)/.test(value) ||
        keyRole(value) === "service_role")
  );
  add(
    "browser-secrets",
    !exposed,
    "Remove backend secret keys from every VITE_ variable."
  );
  let validEnvironment = true;
  try {
    paymentEnvironment(env);
  } catch {
    validEnvironment = false;
  }
  add(
    "environment",
    validEnvironment,
    "Check PAYMENTS_SITE_URL, database settings and live-mode guards. Live requires Vercel Production and PAYMENTS_ALLOW_LIVE=true."
  );
  add(
    "enabled-flag",
    ["true", "false"].includes(env.PAYMENTS_ENABLED || ""),
    "Set PAYMENTS_ENABLED explicitly to true or false; false keeps collection disabled."
  );
  return checks;
}
