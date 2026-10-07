import { useEffect, useRef, useState, type FormEvent } from "react";
import { Copy, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import {
  billingAuth,
  billingRequest,
  BillingAccessError,
  type BillingRequest,
} from "@/lib/billing";
import {
  deliveryLabels,
  deliveryStates,
  parseAmount,
  paymentLabel,
  newOrderSchema,
  type BillingOrder,
  type OrderEvent,
} from "../../../shared/billing";
import { formatMoney } from "../../../shared/payments";
import "./engagement.css";
import "./billing.css";

type Access = {
  email: string;
  mode: string;
  usdEnabled: boolean;
  paymentsEnabled: boolean;
};
export default function Billing() {
  const [access, setAccess] = useState<Access | null>(null);
  const [sessionRevision, setSessionRevision] = useState(0);
  const [checking, setChecking] = useState(Boolean(billingAuth));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sample =
    import.meta.env.VITE_BILLING_REVIEW === "true" &&
    new URLSearchParams(window.location.search).get("sample") === "1";
  useEffect(() => {
    if (!billingAuth || sample) return;
    const { data } = billingAuth.auth.onAuthStateChange(() => {
      setSessionRevision(v => v + 1);
    });
    return () => data.subscription.unsubscribe();
  }, [sample]);
  useEffect(() => {
    if (!billingAuth || sample) return;
    let active = true;
    async function check() {
      setChecking(true);
      try {
        const { data } = await billingAuth!.auth.getSession();
        if (!data.session) {
          if (active) {
            setAccess(null);
            setChecking(false);
          }
          return;
        }
        const result = await billingRequest({ action: "session" });
        if (active) {
          setAccess(result);
          setError("");
        }
      } catch (cause) {
        if (active) {
          setAccess(null);
          setError((cause as Error).message);
        }
      } finally {
        if (active) setChecking(false);
      }
    }
    void check();
    return () => {
      active = false;
    };
  }, [sessionRevision, sample]);
  async function login(event: FormEvent) {
    event.preventDefault();
    if (!billingAuth || busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await billingAuth.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        throw new Error("Sign-in failed. Check your email and password.");
      setPassword("");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setAccess(null);
    setPassword("");
    await billingAuth?.auth.signOut({ scope: "local" });
  }
  return (
    <div className="engagement-page billing-page">
      <header className="billing-header">
        <a href="/" aria-label="CallCare home">
          CallCare <small>BPO</small>
        </a>
        <span>Orders & billing</span>
        {access && <button onClick={signOut}>Sign out</button>}
      </header>
      {sample ? (
        <BillingWorkspace
          request={sampleRequest}
          access={{
            email: "Sample workspace",
            mode: "test",
            usdEnabled: true,
            paymentsEnabled: false,
          }}
          readOnly
        />
      ) : access ? (
        <BillingWorkspace
          request={billingRequest}
          access={access}
          onDenied={message => {
            setAccess(null);
            setError(message);
          }}
        />
      ) : (
        <main className="billing-login">
          <ShieldCheck size={32} />
          <p className="cc-kicker">Restricted workspace</p>
          <h1>
            Keep the work
            <br />
            <em>moving forward.</em>
          </h1>
          <p>
            Create agreed orders, track payments, and keep delivery on course.
          </p>
          {checking ? (
            <p role="status">Checking your billing access…</p>
          ) : billingAuth ? (
            <form onSubmit={login}>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </label>
              <button className="cc-button" disabled={busy}>
                {busy ? "Signing in…" : "Sign in to billing"}
              </button>
            </form>
          ) : (
            <p className="billing-notice">
              The billing workspace is being prepared. Your administrator will
              provide access when it is ready.
            </p>
          )}
          {error && (
            <p role="alert" className="billing-error">
              {error}
            </p>
          )}
          <p className="billing-small">
            Only accounts granted billing permission can access client orders.
            For account or password help, contact your site administrator.
          </p>
          {import.meta.env.VITE_BILLING_REVIEW === "true" && (
            <a className="cc-text-link" href="/billing?sample=1">
              Preview a sample workspace →
            </a>
          )}
        </main>
      )}
    </div>
  );
}

export function BillingWorkspace({
  request,
  access,
  onDenied,
  readOnly = false,
}: {
  request: BillingRequest;
  access: Access;
  onDenied?: (message: string) => void;
  readOnly?: boolean;
}) {
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<BillingOrder | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState("");
  const [delivery, setDelivery] = useState("not_started");
  const [note, setNote] = useState("");
  const lock = useRef(false);
  const viewGeneration = useRef(0);
  function failure(cause: unknown) {
    if (cause instanceof BillingAccessError) onDenied?.(cause.message);
    else setError(cause instanceof Error ? cause.message : "Request failed.");
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    request({ action: "list", page, search: query })
      .then(result => {
        if (active) {
          setOrders(result.orders);
          setHasMore(result.hasMore);
        }
      })
      .catch(cause => {
        if (active) failure(cause);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [request, page, query, revision]);
  async function open(id: string) {
    const generation = ++viewGeneration.current;
    setError("");
    setNotice("");
    setLink("");
    setSelected(null);
    setEvents([]);
    setShowCreate(false);
    setLoading(true);
    try {
      const result = await request({ action: "detail", id });
      if (generation === viewGeneration.current) {
        setSelected(result.order);
        setDelivery(result.order.delivery_status);
        setEvents(result.events);
        setNote("");
      }
    } catch (cause) {
      failure(cause);
    } finally {
      if (generation === viewGeneration.current) setLoading(false);
    }
  }
  async function mutate(action: string, extra: Record<string, unknown> = {}) {
    if (lock.current || readOnly || !selected) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const id = selected.id;
    try {
      const result = await request({ action, id, ...extra });
      if (action === "link") {
        setLink(result.link);
        try {
          await navigator.clipboard.writeText(result.link);
          setNotice(
            "Private order link copied. Share it only with the client."
          );
        } catch {
          setNotice("Your private link is ready. Select and copy it below.");
        }
      } else {
        await open(id);
        setRevision(v => v + 1);
        setNotice(
          action === "verify"
            ? result.status === "paid"
              ? "Payment confirmed by Paystack."
              : "Payment is not confirmed yet. Do not ask the client to pay again if they were debited."
            : "Order updated. The change is recorded in its history."
        );
      }
    } catch (cause) {
      failure(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="billing-workspace">
      <div className="billing-top">
        <div>
          <p className="cc-kicker">
            {readOnly
              ? "Illustrative preview · no customer data"
              : access.email}
          </p>
          <h1>
            Your orders.
            <br />
            <em>A clear view of the work.</em>
          </h1>
        </div>
        <button
          className="cc-button"
          disabled={readOnly || busy}
          onClick={() => {
            ++viewGeneration.current;
            setSelected(null);
            setShowCreate(true);
            setError("");
            setLink("");
            setNotice("");
          }}
        >
          <Plus size={18} />
          Create order
        </button>
      </div>
      {(readOnly || access.mode === "test" || !access.paymentsEnabled) && (
        <p className="billing-notice">
          {readOnly
            ? "Sample workspace. All names, amounts and activity are illustrative. Creating, sharing and updating are disabled."
            : `${access.mode === "test" ? "Test mode. No real money is collected. " : ""}${!access.paymentsEnabled ? "Checkout is disabled. You can prepare orders while payment setup is completed." : ""}`}
        </p>
      )}
      <div className="billing-grid">
        <section className="billing-list" aria-label="Order list">
          <form
            onSubmit={e => {
              e.preventDefault();
              setPage(0);
              setQuery(search);
            }}
            className="billing-search"
          >
            <input
              aria-label="Search order titles"
              placeholder="Search order titles"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
            <button
              type="button"
              aria-label="Refresh orders"
              onClick={() => setRevision(v => v + 1)}
            >
              <RefreshCw size={17} />
            </button>
          </form>
          {loading && <p role="status">Loading orders…</p>}
          {!loading && orders.length === 0 && (
            <p className="billing-empty">
              No orders found. Create an order once you and the client have
              agreed on the work.
            </p>
          )}
          {orders.map(order => (
            <button
              disabled={busy}
              key={order.id}
              className={`billing-order-row ${selected?.id === order.id ? "selected" : ""}`}
              onClick={() => open(order.id)}
            >
              <span className="billing-row-title">{order.title}</span>
              <span>{order.customer_email}</span>
              <div>
                <strong>
                  {formatMoney(Number(order.amount_minor), order.currency)}
                </strong>
                <span
                  className={`billing-status ${paymentLabel(order) === "Paid" ? "paid" : ""}`}
                >
                  {paymentLabel(order)}
                </span>
              </div>
              <small>{deliveryLabels[order.delivery_status]}</small>
            </button>
          ))}
          <div className="billing-pagination">
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage(v => v - 1)}
            >
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button
              disabled={!hasMore || loading}
              onClick={() => setPage(v => v + 1)}
            >
              Next
            </button>
          </div>
        </section>
        <section className="billing-detail" aria-label="Order workspace">
          {error && (
            <p className="billing-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="billing-notice" role="status">
              {notice}
            </p>
          )}
          {showCreate ? (
            <CreateOrder
              request={request}
              usdEnabled={access.usdEnabled}
              onCreated={async id => {
                setShowCreate(false);
                await open(id);
                setRevision(v => v + 1);
              }}
              onDenied={onDenied}
            />
          ) : selected ? (
            <>
              <p className="cc-kicker">{selected.order_number}</p>
              <h2>{selected.title}</h2>
              <p>{selected.customer_email}</p>
              <div className="billing-amount">
                {formatMoney(Number(selected.amount_minor), selected.currency)}
                <span className="billing-status">{paymentLabel(selected)}</span>
              </div>
              <p className="billing-small">
                Pending means checkout has started, but payment has not been
                verified. A paid record is a historical confirmation; refunds
                and disputes are managed in Paystack.
              </p>
              <div className="billing-actions">
                <button
                  disabled={busy || readOnly}
                  onClick={() => mutate("link")}
                >
                  <Copy size={16} />
                  Copy private link
                </button>
                <button
                  disabled={busy || readOnly || !access.paymentsEnabled}
                  onClick={() => mutate("verify")}
                >
                  <RefreshCw size={16} />
                  Check payment
                </button>
              </div>
              {link && (
                <label className="billing-link">
                  Private client link
                  <input
                    readOnly
                    value={link}
                    onFocus={e => e.target.select()}
                  />
                </label>
              )}
              <h3>Agreed scope</h3>
              <p className="billing-pre">{selected.scope}</p>
              <h3>Payment terms</h3>
              <p className="billing-pre">{selected.terms}</p>
              <dl className="billing-facts">
                <dt>Payment reference</dt>
                <dd>{selected.reference}</dd>
                <dt>Created</dt>
                <dd>{new Date(selected.created_at).toLocaleString("en-KE")}</dd>
                <dt>Checkout expiry</dt>
                <dd>{new Date(selected.expires_at).toLocaleString("en-KE")}</dd>
                {selected.paid_at && (
                  <>
                    <dt>Payment confirmed</dt>
                    <dd>
                      {new Date(selected.paid_at).toLocaleString("en-KE")}
                    </dd>
                  </>
                )}
              </dl>
              <div className="billing-update">
                <h3>Delivery progress</h3>
                <p className="billing-small">
                  Delivery changes never charge, refund, hold, or release money.
                </p>
                <label>
                  Status
                  <select
                    value={delivery}
                    disabled={busy || readOnly}
                    onChange={e => setDelivery(e.target.value)}
                  >
                    {deliveryStates.map(state => (
                      <option key={state} value={state}>
                        {deliveryLabels[state]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Internal note (required for updates)
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    disabled={busy || readOnly}
                    maxLength={2000}
                    placeholder="What changed, and why?"
                  />
                </label>
                <div className="billing-actions">
                  <button
                    disabled={busy || readOnly || !note.trim()}
                    onClick={() =>
                      mutate("delivery", {
                        status: delivery,
                        version: selected.delivery_version,
                        note,
                      })
                    }
                  >
                    Save delivery update
                  </button>
                  <button
                    disabled={busy || readOnly || !note.trim()}
                    onClick={() =>
                      mutate("review", {
                        review: !selected.payment_review,
                        note,
                      })
                    }
                  >
                    {selected.payment_review
                      ? "Resolve payment review"
                      : "Flag payment for review"}
                  </button>
                </div>
              </div>
              <h3>Order history</h3>
              <p className="billing-small">
                Latest 100 events. Staff identifiers are recorded with each
                change.
              </p>
              <ol className="billing-history">
                {events.map(event => (
                  <li key={event.id}>
                    <strong>{event.action}</strong>
                    <p>{event.note}</p>
                    <small>
                      {new Date(event.created_at).toLocaleString("en-KE")} ·{" "}
                      {event.actor}
                    </small>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="billing-empty">
              <ShieldCheck size={32} />
              <h2>Everything behind an order.</h2>
              <p>
                Select an order to view its agreement, payment status and
                delivery history—or create a new one.
              </p>
              <p className="billing-small">
                Orders are priced by CallCare after agreeing on the work with
                the client.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CreateOrder({
  request,
  usdEnabled,
  onCreated,
  onDenied,
}: {
  request: BillingRequest;
  usdEnabled: boolean;
  onCreated: (id: string) => Promise<void>;
  onDenied?: (s: string) => void;
}) {
  const [id] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    email: "",
    title: "",
    scope: "",
    terms: "",
    amount: "",
    currency: "KES",
    expiry: "",
  });
  function field(key: keyof typeof draft, value: string) {
    setDraft(v => ({ ...v, [key]: value }));
  }
  async function create(e: FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    setError("");
    const parsed = newOrderSchema.safeParse({
      id,
      email: draft.email,
      title: draft.title,
      scope: draft.scope,
      terms: draft.terms,
      amountMinor: parseAmount(draft.amount),
      currency: draft.currency,
      expiresAt:
        draft.expiry && Number.isFinite(new Date(draft.expiry).getTime())
          ? new Date(draft.expiry).toISOString()
          : "",
    });
    if (!parsed.success) {
      setError(
        "Complete all fields, use a positive amount with at most two decimal places, and choose a future expiry."
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const result = await request({ action: "create", order: parsed.data });
      await onCreated(result.id);
    } catch (cause) {
      if (cause instanceof BillingAccessError) onDenied?.(cause.message);
      else setError((cause as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <p className="cc-kicker">Start with an agreement</p>
      <h2>Create a client order</h2>
      <p className="billing-small">
        Enter the agreed details. Creating an order does not charge the client
        or send an email.
      </p>
      <form className="billing-create" onSubmit={create}>
        <label>
          Client email
          <input
            type="email"
            required
            maxLength={254}
            value={draft.email}
            onChange={e => field("email", e.target.value)}
          />
        </label>
        <label>
          Order title
          <input
            required
            maxLength={160}
            value={draft.title}
            onChange={e => field("title", e.target.value)}
          />
        </label>
        <label>
          Agreed scope
          <textarea
            required
            maxLength={10000}
            value={draft.scope}
            onChange={e => field("scope", e.target.value)}
            placeholder="Deliverables, responsibilities and delivery dates"
          />
        </label>
        <label>
          Payment terms
          <textarea
            required
            maxLength={10000}
            value={draft.terms}
            onChange={e => field("terms", e.target.value)}
            placeholder="What this payment covers, next steps, and agreed cancellation/refund terms"
          />
        </label>
        <div className="billing-form-pair">
          <label>
            Amount
            <input
              inputMode="decimal"
              required
              value={draft.amount}
              onChange={e => field("amount", e.target.value)}
              placeholder="2500.00"
            />
          </label>
          <label>
            Currency
            <select
              value={draft.currency}
              onChange={e => field("currency", e.target.value)}
            >
              <option>KES</option>
              {usdEnabled && <option>USD</option>}
            </select>
          </label>
        </div>
        <label>
          Checkout expiry (your local time)
          <input
            type="datetime-local"
            required
            value={draft.expiry}
            onChange={e => field("expiry", e.target.value)}
          />
        </label>
        <p className="billing-small">
          Check the currency carefully. No automatic conversion is applied.
          Issued Paystack checkout links may still accept payment after this
          date.
        </p>
        {error && (
          <p role="alert" className="billing-error">
            {error}
          </p>
        )}
        <button className="cc-button" disabled={busy}>
          {busy ? "Creating order…" : "Create private order"}
        </button>
      </form>
    </>
  );
}

const sampleOrders: BillingOrder[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    order_number: "SAMPLE-001",
    customer_email: "client@example.invalid",
    title: "Customer support pilot",
    scope:
      "Illustrative scope: prepare a support workflow, onboard the team and run an agreed pilot.",
    terms:
      "Illustrative terms only. Actual scope, pricing and payment terms are agreed separately with each client.",
    amount_minor: 250000,
    currency: "USD",
    mode: "test",
    status: "paid",
    reference: "sample-not-a-transaction",
    created_at: "2026-10-07T09:00:00Z",
    expires_at: "2026-11-01T09:00:00Z",
    paid_at: "2026-10-07T10:00:00Z",
    initialization_started_at: "2026-10-07T09:30:00Z",
    delivery_status: "in_progress",
    delivery_version: 1,
    payment_review: false,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    order_number: "SAMPLE-002",
    customer_email: "operations@example.invalid",
    title: "Back-office onboarding",
    scope: "Illustrative onboarding scope.",
    terms: "Sample terms, not a real offer.",
    amount_minor: 4500000,
    currency: "KES",
    mode: "test",
    status: "awaiting_payment",
    reference: "sample-not-a-transaction-2",
    created_at: "2026-10-07T09:00:00Z",
    expires_at: "2026-11-01T09:00:00Z",
    paid_at: null,
    initialization_started_at: null,
    delivery_status: "not_started",
    delivery_version: 0,
    payment_review: false,
  },
];
const sampleRequest: BillingRequest = async body => {
  if (body.action === "list")
    return {
      orders: sampleOrders.filter(o =>
        o.title.toLowerCase().includes(String(body.search || "").toLowerCase())
      ),
      hasMore: false,
    };
  if (body.action === "detail")
    return {
      order: sampleOrders.find(o => o.id === body.id),
      events: [
        {
          id: "1",
          action: "Illustrative delivery update",
          actor: "Sample founder",
          note: "The team is preparing the agreed workflow. This is sample activity.",
          created_at: "2026-10-07T11:00:00Z",
        },
      ],
    };
  throw new Error("The sample workspace is read-only.");
};
