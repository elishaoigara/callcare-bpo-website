import { z } from "zod";
import { newOrderSchema, deliveryStates } from "../../shared/billing.js";
import { PaymentError, paymentConfig } from "../payments/config.js";
import { hashToken, PaymentService, type Order } from "../payments/service.js";
import { createGateway, createPaymentStore } from "../payments/adapters.js";
import {
  authorizeBilling,
  billingDatabase,
  orderAccessToken,
} from "./access.js";

const publicColumns =
  "id,order_number,customer_email,title,scope,terms,amount_minor,currency,mode,status,reference,created_at,expires_at,paid_at,initialization_started_at,delivery_status,delivery_version,payment_review";
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("session") }).strict(),
  z
    .object({
      action: z.literal("list"),
      page: z.number().int().min(0).max(10000).default(0),
      search: z.string().max(160).default(""),
    })
    .strict(),
  z.object({ action: z.literal("create"), order: newOrderSchema }).strict(),
  z.object({ action: z.literal("detail"), id: z.uuid() }).strict(),
  z.object({ action: z.literal("link"), id: z.uuid() }).strict(),
  z.object({ action: z.literal("verify"), id: z.uuid() }).strict(),
  z
    .object({
      action: z.literal("delivery"),
      id: z.uuid(),
      status: z.enum(deliveryStates),
      version: z.number().int().min(0),
      note: z.string().trim().min(1).max(2000),
    })
    .strict(),
  z
    .object({
      action: z.literal("review"),
      id: z.uuid(),
      review: z.boolean(),
      note: z.string().trim().min(1).max(2000),
    })
    .strict(),
]);
function reply(data: object, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
function databaseError(error: { code?: string } | null) {
  if (error)
    throw new PaymentError(
      error.code === "P0001" ? 409 : 503,
      error.code === "P0001"
        ? "The order changed or could not be updated. Refresh it and try again."
        : "The billing request could not be completed. Your details have been preserved; retry or contact support."
    );
}
export async function handleBilling(request: Request) {
  try {
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const { db, config } = billingDatabase();
    const origin = request.headers.get("origin");
    if (origin && origin !== config.origin)
      throw new PaymentError(403, "Request origin is not allowed.");
    const actor = await authorizeBilling(
      db,
      request.headers.get("authorization")
    );
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new PaymentError(415, "JSON is required.");
    const reader = request.body?.getReader();
    let size = 0;
    const chunks: Uint8Array[] = [];
    if (reader)
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 32768) {
          await reader.cancel();
          throw new PaymentError(413, "Request is too large.");
        }
        chunks.push(value);
      }
    let input;
    try {
      input = actionSchema.parse(
        JSON.parse(Buffer.concat(chunks).toString("utf8"))
      );
    } catch {
      throw new PaymentError(
        400,
        "Check the required fields, amount, currency and future expiry date."
      );
    }
    if (input.action === "session")
      return reply({
        email: actor.email,
        mode: config.mode,
        usdEnabled: config.usdEnabled,
        paymentsEnabled: process.env.PAYMENTS_ENABLED === "true",
      });
    if (input.action === "list") {
      let query = db
        .from("payment_orders")
        .select(publicColumns)
        .eq("mode", config.mode)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      // Search a single text column without interpolating PostgREST filter expressions.
      if (input.search.trim())
        query = query.ilike(
          "title",
          `%${input.search.trim().replace(/[\\%_]/g, "\\$&")}%`
        );
      const { data, error } = await query.range(
        input.page * 25,
        input.page * 25 + 25
      );
      databaseError(error);
      return reply({
        orders: data?.slice(0, 25) || [],
        hasMore: (data?.length || 0) > 25,
      });
    }
    if (input.action === "create") {
      const order = input.order;
      if (order.currency === "USD" && !config.usdEnabled)
        throw new PaymentError(
          400,
          "USD has not been enabled for this account."
        );
      const token = orderAccessToken(order.id);
      const { error } = await db.rpc("billing_create_order", {
        p_id: order.id,
        p_actor: actor.id,
        p_hash: hashToken(token),
        p_email: order.email,
        p_title: order.title,
        p_scope: order.scope,
        p_terms: order.terms,
        p_amount: order.amountMinor,
        p_currency: order.currency,
        p_mode: config.mode,
        p_expires: order.expiresAt,
      });
      databaseError(error);
      return reply({
        id: order.id,
        link: `${config.origin}/orders#order=${token}`,
      });
    }
    const { data: record, error } = await db
      .from("payment_orders")
      .select("*")
      .eq("id", input.id)
      .eq("mode", config.mode)
      .maybeSingle();
    databaseError(error);
    if (!record) throw new PaymentError(404, "Order not found.");
    if (input.action === "detail") {
      const { data: events, error: eventError } = await db
        .from("billing_order_events")
        .select("id,action,actor,note,created_at")
        .eq("order_id", input.id)
        .order("created_at", { ascending: false })
        .limit(100);
      databaseError(eventError);
      return reply({
        order: Object.fromEntries(
          publicColumns.split(",").map(key => [key, record[key]])
        ),
        events,
      });
    }
    if (input.action === "link") {
      const token = orderAccessToken(input.id);
      if (hashToken(token) !== record.access_hash)
        throw new PaymentError(
          409,
          "This older order uses a different link. Use its original private link; do not create another payment to replace it."
        );
      return reply({ link: `${config.origin}/orders#order=${token}` });
    }
    if (input.action === "verify") {
      const payment = paymentConfig();
      const service = new PaymentService(
        createPaymentStore(payment),
        createGateway(payment),
        payment
      );
      const result = await service.reconcile(record as Order);
      return reply({ status: result.status });
    }
    const args =
      input.action === "delivery"
        ? {
            p_id: input.id,
            p_actor: actor.id,
            p_status: input.status,
            p_version: input.version,
            p_note: input.note,
          }
        : {
            p_id: input.id,
            p_actor: actor.id,
            p_review: input.review,
            p_note: input.note,
          };
    const { error: updateError } = await db.rpc(
      input.action === "delivery"
        ? "billing_update_delivery"
        : "billing_set_review",
      args
    );
    databaseError(updateError);
    return reply({ updated: true });
  } catch (error) {
    return reply(
      {
        error:
          error instanceof PaymentError
            ? error.message
            : "Billing is temporarily unavailable. Please try again.",
      },
      error instanceof PaymentError ? error.status : 503
    );
  }
}
