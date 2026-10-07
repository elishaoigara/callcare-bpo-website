import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { PaymentError, paymentEnvironment } from "../payments/config.js";
export function billingDatabase() {
  const config = paymentEnvironment();
  const db = createClient(config.databaseUrl, config.databaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  });
  return { config, db };
}
export async function authorizeBilling(
  db: SupabaseClient,
  header: string | null
) {
  if (!header?.startsWith("Bearer ") || header.length > 8192)
    throw new PaymentError(401, "Please sign in to the billing workspace.");
  const { data, error } = await db.auth.getUser(header.slice(7));
  if (
    error ||
    !data.user ||
    data.user.is_anonymous ||
    !data.user.email_confirmed_at
  )
    throw new PaymentError(
      401,
      "Your session could not be verified. Please sign in again."
    );
  const { data: member, error: roleError } = await db
    .from("billing_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();
  if (roleError)
    throw new PaymentError(
      503,
      "Billing access could not be checked. Please contact your administrator."
    );
  if (!member)
    throw new PaymentError(
      403,
      "This account does not have billing access. Recruitment access does not include billing."
    );
  return { id: data.user.id, email: data.user.email || data.user.id };
}
export function orderAccessToken(id: string) {
  const key = process.env.PAYMENTS_LINK_SECRET || "";
  if (!/^[a-f0-9]{64}$/i.test(key))
    throw new PaymentError(
      503,
      "Private order links have not been configured."
    );
  return createHmac("sha256", Buffer.from(key, "hex"))
    .update(`callcare-order:v1:${id}`)
    .digest("hex");
}
