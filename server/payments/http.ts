import { paymentConfig, PaymentError } from "./config.js";
import { createGateway, createPaymentStore } from "./adapters.js";
import { PaymentService } from "./service.js";

export type PaymentAction = "order" | "checkout" | "verify" | "webhook";
const response = (body: object, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
async function readBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) {
      await reader.cancel();
      throw new PaymentError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function handlePayment(request: Request, action: PaymentAction) {
  try {
    if (request.method !== "POST")
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST", "Cache-Control": "no-store" },
      });
    const config = paymentConfig();
    const origin = request.headers.get("origin");
    if (action !== "webhook" && origin && origin !== config.origin)
      throw new PaymentError(403, "This request is not allowed.");
    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("application/json")
    )
      throw new PaymentError(415, "JSON is required.");
    const raw = await readBody(request, action === "webhook" ? 65536 : 2048);
    const service = new PaymentService(
      createPaymentStore(config),
      createGateway(config),
      config
    );
    if (action === "webhook") {
      await service.webhook(raw, request.headers.get("x-paystack-signature"));
      return response({ received: true });
    }
    let body;
    try {
      body = JSON.parse(raw.toString("utf8"));
    } catch {
      throw new PaymentError(400, "Invalid request.");
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new PaymentError(400, "Invalid request.");
    // Reject price, currency, email, callback URL and reference overrides from the browser.
    const allowed = action === "checkout" ? ["token", "accepted"] : ["token"];
    if (Object.keys(body).some(key => !allowed.includes(key)))
      throw new PaymentError(400, "Unsupported request fields.");
    if (action === "checkout")
      return response({
        checkoutUrl: await service.checkout(body.token, body.accepted),
      });
    const order = await service.getOrder(body.token);
    return response({
      order:
        action === "verify"
          ? await service.reconcile(order)
          : service.summary(order),
    });
  } catch (error) {
    const known = error instanceof PaymentError;
    if (!known)
      console.error(
        "Payment request failed; review service health. No payment details logged."
      );
    return response(
      {
        error: known
          ? error.message
          : "We could not confirm this request. Please check payment status before paying again.",
      },
      known ? error.status : 503
    );
  }
}
