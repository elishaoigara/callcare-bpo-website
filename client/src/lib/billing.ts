import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_BILLING_SUPABASE_URL;
const key = import.meta.env.VITE_BILLING_SUPABASE_PUBLISHABLE_KEY;
export const billingAuth =
  url && key
    ? createClient(url, key, {
        auth: {
          storageKey: "callcare-billing-session",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage:
            typeof window !== "undefined" ? window.sessionStorage : undefined,
        },
      })
    : null;
export type BillingRequest = (body: Record<string, unknown>) => Promise<any>;
export class BillingAccessError extends Error {}
export const billingRequest: BillingRequest = async body => {
  const { data } = await billingAuth!.auth.getSession();
  if (!data.session) throw new BillingAccessError("Please sign in again.");
  let response;
  try {
    response = await fetch("/api/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new Error(
      "Connection interrupted. Your form is still here. Retry the same order before creating another."
    );
  }
  const result = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403)
    throw new BillingAccessError(result.error || "Billing access denied.");
  if (!response.ok)
    throw new Error(
      result.error || "The request could not be completed. Please try again."
    );
  return result;
};
