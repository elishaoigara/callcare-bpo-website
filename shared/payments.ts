export type OrderSummary = {
  orderNumber: string;
  title: string;
  scope: string;
  terms: string;
  amountMinor: number;
  currency: "KES" | "USD";
  mode: "test" | "live";
  status: "awaiting_payment" | "paid";
  expiresAt: string;
  paidAt: string | null;
  reference: string;
  canPay: boolean;
};

export const orderTokenPattern = /^[a-f0-9]{64}$/;
export function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(
    amountMinor / 100
  );
}
