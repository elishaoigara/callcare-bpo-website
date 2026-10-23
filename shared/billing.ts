import { z } from "zod";
export const deliveryStates = [
  "not_started",
  "in_progress",
  "delivered",
  "revisions_requested",
  "completed",
] as const;
export const deliveryLabels: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  delivered: "Delivered",
  revisions_requested: "Revisions requested",
  completed: "Completed",
};
export const newOrderSchema = z
  .object({
    id: z.uuid(),
    email: z
      .email()
      .max(254)
      .transform(v => v.toLowerCase()),
    title: z.string().trim().min(1).max(160),
    scope: z.string().trim().min(1).max(10000),
    terms: z.string().trim().min(1).max(10000),
    amountMinor: z.number().int().min(100).max(1000000000),
    currency: z.enum(["KES", "USD"]),
    expiresAt: z.iso
      .datetime({ offset: true })
      .refine(v => Date.parse(v) > Date.now(), "Choose a future expiry"),
  })
  .strict();
export type NewOrder = z.infer<typeof newOrderSchema>;
export type BillingOrder = {
  id: string;
  order_number: string;
  customer_email: string;
  title: string;
  scope: string;
  terms: string;
  amount_minor: number;
  currency: "KES" | "USD";
  mode: "test" | "live";
  status: "awaiting_payment" | "paid";
  reference: string;
  created_at: string;
  expires_at: string;
  paid_at: string | null;
  initialization_started_at: string | null;
  delivery_status: (typeof deliveryStates)[number];
  delivery_version: number;
  payment_review: boolean;
};
export type OrderEvent = {
  id: string;
  action: string;
  actor: string;
  note: string;
  created_at: string;
};
export function paymentLabel(order: BillingOrder) {
  if (order.payment_review) return "Payment review";
  if (order.status === "paid") return "Paid";
  return order.initialization_started_at ? "Pending" : "Unpaid";
}
export function parseAmount(value: string) {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value)) return NaN;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
