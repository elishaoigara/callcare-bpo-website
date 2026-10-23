import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import { publicContact } from "@/lib/publicContact";
import {
  formatMoney,
  orderTokenPattern,
  type OrderSummary,
} from "../../../shared/payments";
import "./engagement.css";
import "./orders.css";

const storageKey = "callcare-private-order";
function initialAccess() {
  const url = new URL(window.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1)).get("order") || "";
  const reference =
    url.searchParams.get("reference") || url.searchParams.get("trxref");
  let saved = "";
  try {
    saved =
      sessionStorage.getItem(
        reference ? `${storageKey}:${reference}` : storageKey
      ) || "";
  } catch {
    /* Private browsing can disable storage. */
  }
  return {
    token: orderTokenPattern.test(fragment) ? fragment : saved,
    returning: Boolean(reference),
  };
}
async function paymentRequest(
  action: string,
  token: string,
  accepted?: boolean
) {
  const response = await fetch(`/api/payments/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      ...(accepted === undefined ? {} : { accepted }),
    }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new Error(
      data?.error ||
        "We could not connect to payments. Please try checking the status again or contact CallCare."
    );
  return data;
}
export default function Orders() {
  const [access] = useState(initialAccess);
  const [token, setToken] = useState(access.token);
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accepted, setAccepted] = useState(false);
  const inFlight = useRef(false);
  useEffect(() => {
    // The link is a bearer credential: remove it from the address bar and do not run analytics here.
    window.history.replaceState(window.history.state, "", "/orders");
  }, []);
  useEffect(() => {
    if (!token) return;
    let active = true;
    setBusy(true);
    setError("");
    setOrder(null);
    setAccepted(false);
    try {
      sessionStorage.setItem(storageKey, token);
    } catch {
      /* Link can be reopened. */
    }
    paymentRequest(access.returning ? "verify" : "order", token)
      .then(data => {
        if (active) {
          setOrder(data.order);
          if (access.returning && data.order.status !== "paid")
            setNotice(
              "Payment is not confirmed yet. Check again shortly; do not make another payment if you were debited."
            );
        }
      })
      .catch(reason => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load your order."
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [token, access.returning]);

  function openOrder(event: FormEvent) {
    event.preventDefault();
    let value = input.trim();
    try {
      if (value.startsWith("https://"))
        value =
          new URLSearchParams(new URL(value).hash.slice(1)).get("order") || "";
    } catch {
      value = "";
    }
    if (!orderTokenPattern.test(value)) {
      setError(
        "Paste the complete private order link or access code supplied by CallCare."
      );
      return;
    }
    setNotice("");
    setInput("");
    setToken(value);
  }
  async function act(action: "checkout" | "verify") {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await paymentRequest(
        action,
        token,
        action === "checkout" ? accepted : undefined
      );
      if (action === "checkout") {
        const url = new URL(data.checkoutUrl);
        if (
          url.protocol !== "https:" ||
          url.hostname !== "checkout.paystack.com" ||
          url.username ||
          url.password ||
          url.port
        )
          throw new Error(
            "Checkout address could not be verified. Please contact CallCare."
          );
        try {
          sessionStorage.setItem(`${storageKey}:${order!.reference}`, token);
        } catch {
          /* Return via the original private link. */
        }
        window.location.assign(url.href);
      } else {
        setOrder(data.order);
        if (data.order.status !== "paid")
          setNotice(
            "Payment is not confirmed yet. If you were debited, check again shortly or contact CallCare before paying again."
          );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Please check your connection and try again."
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="engagement-page orders-page">
      <a href="#order-content" className="cc-skip">
        Skip to content
      </a>
      <PublicHeader current="/orders" />
      <main id="order-content" className="cc-section">
        <div className="cc-container">
          <div className="order-heading">
            <p className="cc-kicker">Your CallCare engagement</p>
            <h1>
              Clear scope.
              <br />
              <em>Confident next steps.</em>
            </h1>
            <p className="cc-intro">
              Review the work we’ve agreed on, confirm the details, and take the
              next step with your team.
            </p>
          </div>
          <div className="order-layout">
            <section
              className="order-card"
              aria-label="Your order"
              aria-busy={busy}
            >
              {order ? (
                <>
                  <div className="order-meta">
                    <span>{order.orderNumber}</span>
                    <span className="order-badge">
                      {order.status === "paid"
                        ? "Payment confirmed"
                        : "Awaiting payment"}
                    </span>
                  </div>
                  {order.mode === "test" && (
                    <p className="order-test">
                      Test mode — no real money is collected.
                    </p>
                  )}
                  <h2>{order.title}</h2>
                  <h3>Agreed scope</h3>
                  <p className="order-copy">{order.scope}</p>
                  <h3>Payment terms</h3>
                  <p className="order-copy">{order.terms}</p>
                  <div className="order-total">
                    <span>Agreed payment</span>
                    <strong>
                      {formatMoney(order.amountMinor, order.currency)}
                    </strong>
                  </div>
                  {order.status === "paid" ? (
                    <div className="order-confirmation" role="status">
                      <CheckCircle2 />
                      <div>
                        <h3>
                          {order.mode === "test"
                            ? "Test payment confirmed"
                            : "Thank you. Payment confirmed."}
                        </h3>
                        <p>
                          CallCare will coordinate the next step with you. This
                          confirms payment, not completion of the work.
                        </p>
                        <p>
                          Reference: <strong>{order.reference}</strong>
                        </p>
                        <p>
                          {order.paidAt &&
                            new Date(order.paidAt).toLocaleString("en-KE")}
                        </p>
                        <button
                          className="cc-text-link"
                          onClick={() => window.print()}
                        >
                          Print payment confirmation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="order-expiry">
                        Checkout available until{" "}
                        {new Date(order.expiresAt).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        .
                      </p>
                      {order.canPay ? (
                        <>
                          <label className="order-consent">
                            <input
                              type="checkbox"
                              checked={accepted}
                              onChange={event =>
                                setAccepted(event.target.checked)
                              }
                              disabled={busy}
                            />
                            <span>
                              I agree to the scope and payment terms shown
                              above.
                            </span>
                          </label>
                          <button
                            className="cc-button order-pay"
                            disabled={!accepted || busy}
                            onClick={() => act("checkout")}
                          >
                            {busy
                              ? "Please wait…"
                              : `Continue to ${order.mode === "test" ? "test " : ""}payment`}
                            <ArrowRight size={18} />
                          </button>
                          <p className="order-small">
                            Secure checkout by Paystack. Available methods
                            depend on the currency and merchant account.
                          </p>
                        </>
                      ) : (
                        <p className="order-copy">
                          This order is not available for checkout. Contact
                          CallCare to confirm the next step.
                        </p>
                      )}
                      <button
                        className="cc-text-link"
                        disabled={busy}
                        onClick={() => act("verify")}
                      >
                        Already paid? Check payment status
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FileText className="order-icon" size={32} />
                  <h2>Your work, in one place.</h2>
                  <p className="order-copy">
                    Already agreed on an engagement? Open the private order link
                    your CallCare contact shared with you, or paste it below.
                  </p>
                  <form onSubmit={openOrder} className="order-access">
                    <label htmlFor="order-link">
                      Private order link or access code
                    </label>
                    <input
                      id="order-link"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={input}
                      onChange={event => setInput(event.target.value)}
                      placeholder="Paste your private order link"
                      required
                      maxLength={2048}
                    />
                    <button className="cc-button" disabled={busy}>
                      {busy ? "Opening your order…" : "View my order"}
                      <ArrowRight size={18} />
                    </button>
                  </form>
                  {token && !busy && (
                    <button
                      className="cc-text-link"
                      onClick={() => act("verify")}
                    >
                      Retry payment status check
                    </button>
                  )}
                </>
              )}
              {error && (
                <p className="order-error" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="order-notice" role="status">
                  {notice}
                </p>
              )}
            </section>
            <aside className="order-aside">
              <div>
                <ShieldCheck size={26} />
                <h2>A clear way forward.</h2>
                <ol>
                  <li>
                    <strong>Review your agreement</strong>
                    <span>
                      Scope, currency, and payment terms stay together.
                    </span>
                  </li>
                  <li>
                    <strong>Pay securely</strong>
                    <span>
                      Your card or mobile money details are handled by Paystack.
                    </span>
                  </li>
                  <li>
                    <strong>Keep your confirmation</strong>
                    <span>
                      Return here to check the payment against your order.
                    </span>
                  </li>
                </ol>
              </div>
              <div className="order-help">
                <LockKeyhole size={20} />
                <p>
                  Keep your order link private. Anyone with it can view your
                  order.
                </p>
                <h3>Something doesn’t look right?</h3>
                <p>Talk to us before making a payment.</p>
                <a href={`mailto:${publicContact.email}`}>
                  {publicContact.email}
                </a>
                <a href="/contact">
                  Contact the team <ArrowRight size={15} />
                </a>
              </div>
            </aside>
          </div>
          <p className="order-new">
            Still exploring what you need?{" "}
            <a href="/work-with-us">
              Let’s Work Together <ArrowRight size={15} />
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
