export class PaymentError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function paymentConfig(env = process.env) {
  const unavailable = () =>
    new PaymentError(
      503,
      "Online payments are not available yet. Please contact CallCare about your order."
    );
  if (env.PAYMENTS_ENABLED !== "true") throw unavailable();
  const mode = env.PAYSTACK_MODE || "test";
  if (mode !== "test" && mode !== "live") throw unavailable();
  const secret = env.PAYSTACK_SECRET_KEY || "";
  if (!secret.startsWith(`sk_${mode}_`)) throw unavailable();
  // Preview deployments cannot charge real money even if live keys are inherited.
  if (
    mode === "live" &&
    (env.VERCEL_ENV !== "production" || env.PAYMENTS_ALLOW_LIVE !== "true")
  )
    throw unavailable();
  let origin: URL;
  try {
    origin = new URL(env.PAYMENTS_SITE_URL || "");
  } catch {
    throw unavailable();
  }
  const localTest =
    mode === "test" &&
    !env.VERCEL_ENV &&
    origin.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(origin.hostname);
  if (
    (!localTest && origin.protocol !== "https:") ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  )
    throw unavailable();
  if (!env.PAYMENTS_SUPABASE_URL || !env.PAYMENTS_SUPABASE_SECRET_KEY)
    throw unavailable();
  return {
    mode,
    secret,
    origin: origin.origin,
    databaseUrl: env.PAYMENTS_SUPABASE_URL,
    databaseSecret: env.PAYMENTS_SUPABASE_SECRET_KEY,
    usdEnabled: env.PAYMENTS_USD_ENABLED === "true",
  };
}
export type PaymentConfig = ReturnType<typeof paymentConfig>;
