import { createClient } from "@supabase/supabase-js";
import type { SetupCheck } from "./readiness.js";

export async function paymentDatabaseChecks(
  url: string,
  secret: string
): Promise<SetupCheck[]> {
  const db = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  });
  const checks: SetupCheck[] = [];
  // HEAD requests check table/column visibility without retrieving client records.
  const tables = [
    [
      "payment_orders",
      "id,access_hash,order_number,customer_email,title,scope,terms,amount_minor,currency,mode,status,reference,expires_at,checkout_url,initialization_started_at,terms_accepted_at,paid_at,transaction_id,created_at,delivery_status,delivery_version,payment_review",
    ],
    ["billing_order_events", "id,order_id,action,actor,note,created_at"],
  ];
  for (const [table, columns] of tables) {
    const { error } = await db
      .from(table)
      .select(columns, { head: true })
      .limit(0);
    checks.push({
      name: table,
      ok: !error,
      message:
        "Apply supabase/payments.sql, then supabase/billing.sql; confirm backend access.",
    });
  }
  const { count, error } = await db
    .from("billing_users")
    .select("user_id", { count: "exact", head: true })
    .eq("active", true);
  checks.push({
    name: "founder-access",
    ok: !error && (count || 0) > 0,
    message:
      "Create a confirmed founder login and explicitly grant active billing_users membership.",
  });
  return checks;
}
