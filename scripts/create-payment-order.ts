import { readFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { paymentConfig } from "../server/payments/config.js";
import { orderAccessToken } from "../server/billing/access.js";
import { hashToken } from "../server/payments/service.js";

const schema = z
  .object({
    email: z
      .email()
      .max(254)
      .transform(value => value.toLowerCase()),
    title: z.string().trim().min(1).max(160),
    scope: z.string().trim().min(1).max(10000),
    terms: z.string().trim().min(1).max(10000),
    amountMinor: z.number().int().min(100).max(1000000000),
    currency: z.enum(["KES", "USD"]),
    expiresAt: z.iso
      .datetime({ offset: true })
      .refine(
        value => Date.parse(value) > Date.now(),
        "Expiry must be in the future"
      ),
  })
  .strict();

async function main() {
  const file = process.argv[2];
  if (!file)
    throw new Error(
      "Usage: node --env-file=.env.payments.local --import tsx scripts/create-payment-order.ts ./quote.order.json"
    );
  const config = paymentConfig();
  const input = schema.parse(JSON.parse(await readFile(file, "utf8")));
  if (input.currency === "USD" && !config.usdEnabled)
    throw new Error(
      "Enable USD only after confirming USD activation with Paystack."
    );
  const db = createClient(config.databaseUrl, config.databaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const id = randomUUID();
  const token = orderAccessToken(id);
  const number = `CC-${randomBytes(6).toString("hex").toUpperCase()}`;
  const { error } = await db.from("payment_orders").insert({
    id,
    access_hash: hashToken(token),
    order_number: number,
    customer_email: input.email,
    title: input.title,
    scope: input.scope,
    terms: input.terms,
    amount_minor: input.amountMinor,
    currency: input.currency,
    mode: config.mode,
    expires_at: input.expiresAt,
    reference: `cc-${config.mode}-${id}`,
  });
  if (error)
    throw new Error(
      "Order was not created. Check payment database configuration and schema."
    );
  console.log(
    `Created ${number} (${config.mode}). Share this private link only with the intended client:`
  );
  console.log(`${config.origin}/orders#order=${token}`);
}
main().catch(error => {
  console.error(
    error instanceof z.ZodError
      ? "Invalid order fields. Check the documented format."
      : error.message
  );
  process.exitCode = 1;
});
