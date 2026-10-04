import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Headphones,
  Layers3,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import { callLabel, callLink, publicContact } from "@/lib/publicContact";
import "./engagement.css";

const reasons = [
  {
    title: "I need a team",
    detail: "I want CallCare to handle part of my operations.",
    icon: UsersRound,
  },
  {
    title: "I need extra capacity",
    detail: "My existing team needs additional support.",
    icon: Layers3,
  },
  {
    title: "I need customer support",
    detail:
      "I need help with calls, chats, tickets, customers, or similar work.",
    icon: Headphones,
  },
  {
    title: "I need operational / admin support",
    detail:
      "I need help with executive assistance, data, administration, or back-office work.",
    icon: BriefcaseBusiness,
  },
  {
    title: "I have a specific project",
    detail: "I need a team for a defined project, campaign, or workload.",
    icon: MessageCircle,
  },
  {
    title: "I’m not sure yet",
    detail: "I know I need help, but I’m still figuring out the right setup.",
    icon: CircleHelp,
  },
];
const capacities = [
  "Just getting started",
  "1–3 people",
  "4–10 people",
  "10+ people",
  "I’m not sure yet",
];
const timings = [
  "ASAP",
  "Within the next 30 days",
  "1–3 months",
  "Just exploring for now",
];
const titles = [
  "What brings you to CallCare?",
  "What would you like CallCare to take off your plate?",
  "How much support are you looking for?",
  "When are you looking to get started?",
  "And who are we talking to? 👋",
];
const nextSteps = [
  [
    "You tell us what you need",
    "A quick overview is enough. You don’t need to have everything figured out.",
  ],
  [
    "We learn about your operation",
    "We look at the work, workflow, requirements, and type of support you’re looking for.",
  ],
  [
    "We talk through the right setup",
    "We discuss the team structure, responsibilities, tools, and approach.",
  ],
  [
    "We build the next step together",
    "If CallCare is a good fit, we move forward with a clear operational plan.",
  ],
];
type Answers = {
  reason: string;
  workload: string;
  capacity: string;
  timing: string;
  name: string;
  email: string;
  company: string;
  website: string;
};
const emptyAnswers: Answers = {
  reason: "",
  workload: "",
  capacity: "",
  timing: "",
  name: "",
  email: "",
  company: "",
  website: "",
};

export default function WorkTogether() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (started) {
      headingRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({ block: "start" });
    }
  }, [step, started, complete]);
  function update(key: keyof Answers, value: string) {
    setAnswers(previous => ({ ...previous, [key]: value }));
    setError("");
  }
  function begin() {
    setStarted(true);
    document.getElementById("inquiry")?.scrollIntoView({ block: "start" });
  }
  function validationError() {
    if (step === 0 && !answers.reason)
      return "Choose what brings you here. It’s fine to be unsure.";
    if (step === 1 && !answers.workload.trim())
      return "Tell us a little about the work you need help with.";
    if (step === 2 && !answers.capacity)
      return "Choose a level of support, or select ‘I’m not sure yet’.";
    if (step === 3 && !answers.timing)
      return "Choose when you’re looking to start.";
    if (step === 4) {
      if (!answers.name.trim() || !answers.company.trim())
        return "Please add your name and company.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim()))
        return "Please add a valid work email so we can get back to you.";
    }
    return "";
  }
  async function advance(event: React.FormEvent) {
    event.preventDefault();
    if (requestInFlight.current) return;
    const issue = validationError();
    if (issue) {
      setError(issue);
      return;
    }
    if (step < 4) {
      setError("");
      setStep(step + 1);
      return;
    }
    requestInFlight.current = true;
    setSending(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("https://formspree.io/f/mqpkkkdb", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          _subject: "New CallCare partnership inquiry",
          name: answers.name.trim(),
          email: answers.email.trim(),
          company: answers.company.trim(),
          website_or_linkedin: answers.website.trim(),
          inquiry_type: answers.reason,
          message: answers.workload.trim(),
          support_capacity: answers.capacity,
          start_timing: answers.timing,
        }),
      });
      if (!response.ok) throw new Error("Inquiry not accepted");
      setComplete(true);
    } catch {
      setError(
        `We couldn’t confirm your inquiry was received. Your answers are still here. Try again, or email ${publicContact.email}.`
      );
    } finally {
      window.clearTimeout(timeout);
      requestInFlight.current = false;
      setSending(false);
    }
  }
  return (
    <div className="engagement-page">
      <a href="#work-content" className="cc-skip">
        Skip to content
      </a>
      <PublicHeader current="/work-with-us" />
      <main id="work-content">
        <section className="work-hero cc-section">
          <div className="cc-container work-hero-grid">
            <div>
              <p className="cc-kicker">Let’s Work Together</p>
              <h1>
                Got Work That <span>Needs Doing?</span>
              </h1>
              <h2 className="work-subtitle">
                Let’s figure out the right way to handle it.
              </h2>
              <p className="cc-intro">
                You don’t need to have everything figured out before you talk to
                us. Tell us what you’re dealing with, what you’re trying to
                accomplish, or simply where you’re stretched thin.
              </p>
              <p className="work-promise">We’ll take it from there.</p>
              <div className="cc-actions">
                <button className="cc-button cc-button-gold" onClick={begin}>
                  Tell Us What You Need <ArrowRight size={18} />
                </button>
                <a className="cc-text-link" href={callLink}>
                  Prefer to Talk? {callLabel} <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
            <div
              className="conversation-visual"
              aria-label="From your workload to a plan we build together"
            >
              <div className="conversation-label">
                <span className="conversation-dot" /> The beginning of a
                conversation
              </div>
              <div className="conversation-note">
                <span>Your business</span>
                <p>“We’ve got more work than our team can handle.”</p>
              </div>
              <div className="conversation-connector" aria-hidden="true" />
              <div className="conversation-note conversation-response">
                <span>CallCare</span>
                <p>
                  Let’s understand the work. Then build the right support around
                  it.
                </p>
              </div>
              <div className="conversation-footer">
                <UsersRound size={20} />
                <span>
                  Your people. Your processes.
                  <br />
                  <strong>A plan we build together.</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
        <section id="inquiry" className="cc-section inquiry-section">
          <div className="cc-container inquiry-grid">
            <aside className="inquiry-aside">
              <p className="cc-kicker">A little context goes a long way</p>
              <h2>
                Start with the work.
                <br />
                <em>We’ll work out the rest.</em>
              </h2>
              <p>
                No exact headcount or perfect brief needed. Tell us what you
                know, and we’ll help shape the next step.
              </p>
              <div className="inquiry-aside-note">
                <MessageCircle size={20} />
                <span>A conversation about your business, at your pace.</span>
              </div>
            </aside>
            <div className="inquiry-panel" ref={panelRef}>
              {!started ? (
                <div className="inquiry-start">
                  <span className="inquiry-symbol">
                    <MessageCircle size={28} />
                  </span>
                  <h2>What’s on your plate?</h2>
                  <p>
                    Five short steps to help us understand where support could
                    make a difference.
                  </p>
                  <button className="cc-button" onClick={begin}>
                    Tell Us What You Need <ArrowRight size={18} />
                  </button>
                  <p className="inquiry-privacy">
                    We use your details to respond to your inquiry.{" "}
                    <a href="/privacy">Privacy Policy</a>.
                  </p>
                </div>
              ) : complete ? (
                <div className="inquiry-success" role="status">
                  <span className="inquiry-symbol">
                    <Check size={28} />
                  </span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    Thanks — we’ve got the picture. 👋
                  </h2>
                  <p>
                    We’ve received your details and we’ll take a look at what
                    you’re trying to build, fix, or take off your plate.
                  </p>
                  <p>
                    <strong>We’ll be in touch with the next step.</strong>
                  </p>
                  <div className="success-call">
                    <h3>Prefer to talk now?</h3>
                    <a href={callLink} className="cc-button">
                      {callLabel} <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inquiry-progress">
                    <span aria-live="polite">0{step + 1} / 05</span>
                    <span>
                      {
                        [
                          "Your needs",
                          "The work",
                          "The support",
                          "Your timing",
                          "Your details",
                        ][step]
                      }
                    </span>
                  </div>
                  <div
                    className="inquiry-progress-track"
                    role="progressbar"
                    aria-label="Inquiry progress"
                    aria-valuemin={1}
                    aria-valuemax={5}
                    aria-valuenow={step + 1}
                  >
                    <span style={{ width: `${(step + 1) * 20}%` }} />
                  </div>
                  <form onSubmit={advance} noValidate aria-busy={sending}>
                    <div key={step} className="inquiry-step">
                      <h2 ref={headingRef} tabIndex={-1}>
                        {titles[step]}
                      </h2>
                      {step === 0 && (
                        <div
                          className="reason-grid"
                          role="radiogroup"
                          aria-label={titles[0]}
                        >
                          {reasons.map(({ title, detail, icon: Icon }) => (
                            <label
                              key={title}
                              className={`reason-card ${answers.reason === title ? "selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name="reason"
                                value={title}
                                checked={answers.reason === title}
                                onChange={() => update("reason", title)}
                              />
                              <Icon size={21} />
                              <strong>{title}</strong>
                              <span>{detail}</span>
                              <Check
                                className="selection-check"
                                size={17}
                                aria-hidden="true"
                              />
                            </label>
                          ))}
                        </div>
                      )}
                      {step === 1 && (
                        <>
                          <label className="cc-field">
                            <span className="sr-only">
                              Work you need help with
                            </span>
                            <textarea
                              name="workload"
                              rows={7}
                              maxLength={6000}
                              value={answers.workload}
                              onChange={e => update("workload", e.target.value)}
                              placeholder="Tell us what you’re currently handling, what’s becoming difficult, or what you’d like a team to take care of."
                              aria-required="true"
                            />
                          </label>
                          <p className="field-hint">
                            A few sentences is a good place to start.
                          </p>
                        </>
                      )}
                      {(step === 2 || step === 3) && (
                        <div
                          className="choice-list"
                          role="radiogroup"
                          aria-label={titles[step]}
                        >
                          {(step === 2 ? capacities : timings).map(option => (
                            <label
                              key={option}
                              className={`choice-row ${answers[step === 2 ? "capacity" : "timing"] === option ? "selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name={step === 2 ? "capacity" : "timing"}
                                value={option}
                                checked={
                                  answers[
                                    step === 2 ? "capacity" : "timing"
                                  ] === option
                                }
                                onChange={() =>
                                  update(
                                    step === 2 ? "capacity" : "timing",
                                    option
                                  )
                                }
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {step === 4 && (
                        <div className="contact-fields">
                          {(
                            [
                              ["name", "Name", "text", "name", "Your name"],
                              [
                                "email",
                                "Work Email",
                                "email",
                                "email",
                                "you@company.com",
                              ],
                              [
                                "company",
                                "Company",
                                "text",
                                "organization",
                                "Company name",
                              ],
                              [
                                "website",
                                "Company Website / LinkedIn — optional",
                                "text",
                                "url",
                                "Website or LinkedIn profile",
                              ],
                            ] as const
                          ).map(
                            ([key, label, type, autoComplete, placeholder]) => (
                              <label key={key} className="cc-field">
                                <span>{label}</span>
                                <input
                                  name={key}
                                  type={type}
                                  autoComplete={autoComplete}
                                  maxLength={key === "website" ? 500 : 200}
                                  value={answers[key]}
                                  onChange={e => update(key, e.target.value)}
                                  placeholder={placeholder}
                                  aria-required={key !== "website"}
                                  disabled={sending}
                                />
                              </label>
                            )
                          )}
                          <p className="inquiry-privacy">
                            We use your details to respond to your inquiry. Read
                            our{" "}
                            <a
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Privacy Policy (opens in a new tab)
                            </a>
                            .
                          </p>
                        </div>
                      )}
                    </div>
                    {error && (
                      <p className="inquiry-error" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="inquiry-controls">
                      {step > 0 ? (
                        <button
                          type="button"
                          className="cc-back"
                          disabled={sending}
                          onClick={() => {
                            setError("");
                            setStep(step - 1);
                          }}
                        >
                          <ArrowLeft size={17} /> Back
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="submit"
                        className="cc-button"
                        disabled={sending}
                      >
                        {sending
                          ? "Sharing your details…"
                          : step === 4
                            ? "Let’s Figure This Out"
                            : "Continue"}
                        {!sending && <ArrowRight size={18} />}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
        <section className="cc-section next-section">
          <div className="cc-container">
            <p className="cc-kicker">A clear next step</p>
            <h2>What happens after you reach out?</h2>
            <div className="next-grid">
              {nextSteps.map(([title, detail], index) => (
                <article key={title}>
                  <span className="next-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
