# CallCare payment integration — review branch

This branch prepares quote-based, direct Paystack payments. It must not be merged
or enabled for live collection until the founder approves the flow and terms.
No production database changes or payments were made during development.

## What is included

- `/orders`: private order view, scope, terms, fixed amount/currency, consent,
  hosted checkout, pending/error states and printable payment confirmation.
- Four Vercel Node functions under `/api/payments`: order, checkout, verify, webhook.
- Server-owned quotes and payment references. Browser prices are never trusted.
- KES card/mobile money and optional USD card checkout. Actual availability is
  subject to the merchant's approved Paystack channels and currency configuration.
- Durable initialization claim; verified, idempotent payment recording.
- Fail-closed configuration: previews reject live keys; disabled by default.
- Private payment tables inaccessible to anonymous users and recruitment users.

This is not escrow. It does not hold balances or release funds upon acceptance.
There is no self-service price catalog, customer login, billing staff dashboard,
recurring subscription, tax invoice, automatic refund, or automated email receipt.
Existing business inquiries continue through the current form; staff agree on a
quote before creating an order. The printed page is a payment confirmation,
not a tax invoice. Refunds/disputes remain managed in Paystack by the founder.

## Test configuration (do this before any production setup)

1. Create a **separate test Supabase project**. Run `supabase/payments.sql` in its
   SQL editor. This is an additive, rerunnable setup script, not a change to the
   existing recruitment schema. Do not run it against production for this review.
2. On Vercel, set the following variables for **Preview**, scoped to this branch
   where possible. Never use a `VITE_` prefix for payment secrets.

| Variable                       | Preview value                                             |
| ------------------------------ | --------------------------------------------------------- |
| `PAYMENTS_ENABLED`             | `true` only when ready to test                            |
| `PAYSTACK_MODE`                | `test`                                                    |
| `PAYSTACK_SECRET_KEY`          | Paystack `sk_test_…` key                                  |
| `PAYMENTS_SUPABASE_URL`        | Separate test project's URL                               |
| `PAYMENTS_SUPABASE_SECRET_KEY` | Test project's backend secret/service-role key            |
| `PAYMENTS_SITE_URL`            | Exact stable HTTPS branch preview origin, without a route |
| `PAYMENTS_USD_ENABLED`         | `true` only when USD is approved and being tested         |
| `PAYMENTS_ALLOW_LIVE`          | `false`                                                   |

`VERCEL_ENV` is supplied by Vercel. Do not override it. This implementation uses
server-initialized hosted checkout, so **no Paystack public key is needed**.
If preview access is protected, Paystack must be allowed to reach the webhook
through a supported Vercel deployment-protection exception before real webhook tests.
Do not put a protection bypass secret in a customer link.

3. Redeploy the branch after setting variables. Missing configuration produces a
   friendly unavailable message and never starts a transaction.
4. In Paystack **Test Mode → API Keys & Webhooks**, set Webhook URL to:
   `https://YOUR-BRANCH-PREVIEW/api/payments/webhook`.
   Checkout supplies the callback URL (`PAYMENTS_SITE_URL/orders`) itself.
   Keep test and live webhook URLs separate.

## Creating the first agreed order

Only trusted staff/operators should run the order creation script. There is no
public create-order API and no access for existing recruiters by default.

Create `.env.payments.local` on your trusted machine with the server variables
above. Use the SAME database, mode and site origin as the preview. Never commit it.

Save a private `quote.order.json` (ignored by git), containing for example:

```json
{
  "email": "client@example.invalid",
  "title": "Customer support pilot",
  "scope": "Replace with the actual agreed work, deliverables and delivery dates.",
  "terms": "Replace with agreed payment purpose, cancellation/refund terms and next steps.",
  "amountMinor": 250000,
  "currency": "KES",
  "expiresAt": "2099-01-01T00:00:00Z"
}
```

These are illustrative values, not CallCare pricing or recommended terms. Choose
a realistic expiry. `250000` minor units means KES 2,500.00 or USD 2,500.00 depending
on the currency. Do not silently convert one currency into another.

With Node 22+ and installed dependencies:

```sh
node --env-file=.env.payments.local --import tsx scripts/create-payment-order.ts ./quote.order.json
```

The script writes the order and prints a private link once. It does not email
anyone or charge a payment. Share it only with the intended customer.
The access code is a 256-bit random bearer secret stored as a SHA-256 hash in the
database. Anyone possessing the link can view/pay that order; use it only for
ordinary commercial scope/terms, not passwords or confidential client datasets.
It is kept in browser session storage for the payment return, removed from the
address bar on load, and omitted from Paystack metadata and request URLs.
Payment pages do not initialize analytics, are noindex, and omit customer email.

## Acceptance checks

- Review order on desktop and mobile; verify actual amount, currency and terms.
- Verify consent is required and duplicate clicks do not make duplicate charges.
- Complete a test card payment; verify webhook and callback produce one paid record.
- Close checkout before return; a webhook must still confirm the order.
- Test failed, cancelled, pending, malformed and delayed responses.
- Reopen the original order link from another browser to check payment status.
- Replay a signed test webhook; verify the original confirmation is unchanged.
- Confirm wrong amount/currency/email/reference/domain cannot mark paid.
- Confirm direct Supabase access with anon/recruitment credentials is denied.
- Test enabled channels in Paystack's supported test environment. M-PESA and
  international settlement still require an authorized live check later.

Local automated checks: `pnpm test` and `pnpm build`. `pnpm start` serves the
compiled website and payment API locally; provide server environment variables
to that process. A loopback HTTP site origin is accepted only in local test mode.
Plain `pnpm dev` serves the frontend only; use the built server for payment API
testing (or Vercel's supported local development environment).

## Interrupted checkout and reconciliation

Each order has one immutable Paystack reference. An initialization timeout or
database save failure deliberately keeps the claim locked: it must not quietly
create a second payment. The customer can use **Check payment status**, which
verifies the saved reference with Paystack. CallCare can also search that reference
in the Paystack Dashboard. If initialization succeeded, support can recover its
existing Paystack checkout URL into `checkout_url` after verifying the reference.
Never reset the reference or issue a replacement just because a request timed out.
If recovery is impossible, resolve the existing transaction with Paystack first.

Expiry prevents starting a new checkout. It cannot revoke a checkout URL already
issued by Paystack; a later successful payment will still be recorded. Do not
promise automatic cancellation/refunds when a date expires.

Webhook success is acknowledged only after verification and database recording.
Non-2xx responses cause Paystack retries. Other merchant transactions are ignored.
Only `charge.success` updates this first version; refund and dispute operations
must be tracked in Paystack, and this page remains a historical payment receipt.
Do not use `status=paid` as proof that no later refund/chargeback exists or as an
automatic trigger for irreversible fulfillment. Review payment health and apply
Vercel firewall rate limits before opening live collection broadly.

## Later live activation — requires separate approval

- Confirm international cards, M-PESA, USD and the correct payout accounts.
- Founder approves actual contract/refund/privacy terms and quote creation access.
- Apply the reviewed SQL to the chosen production database separately.
- Configure production-only `sk_live_…`, `PAYSTACK_MODE=live`, `PAYMENTS_ALLOW_LIVE=true`,
  `PAYMENTS_ENABLED=true`, and `PAYMENTS_SITE_URL=https://www.callcarebpo.com`.
- Set the LIVE webhook to `https://www.callcarebpo.com/api/payments/webhook`.
- Merge only after approval. Perform a small authorized live payment and confirm
  its order record, dashboard transaction, and payout. Do not infer settlement
  from test results. Never expose production secrets in preview environments.

References: Paystack Accept Payments, Verify Payments and Webhooks documentation;
Supabase RLS documentation; Vercel Node.js Web Standard function documentation.
