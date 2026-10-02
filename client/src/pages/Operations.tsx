import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  UsersRound,
  Workflow,
  Monitor,
  ShieldCheck,
  Layers3,
  Menu,
  X,
  Check,
} from "lucide-react";

const pillars = [
  [
    "People",
    UsersRound,
    "Trained professionals matched to the requirements of each client and campaign.",
  ],
  [
    "Process",
    Workflow,
    "Clear SOPs, workflows, escalation paths, and documented procedures.",
  ],
  [
    "Technology",
    Monitor,
    "Communication, CRM, project management, reporting, and collaboration tools.",
  ],
  [
    "Quality",
    ShieldCheck,
    "Ongoing reviews, coaching, and feedback loops aligned to agreed standards.",
  ],
  [
    "Scalability",
    Layers3,
    "Start small, test, optimize, and scale as business requirements grow.",
  ],
] as const;
const steps = [
  [
    "Discovery",
    "We understand your business, customers, objectives, workflows, and requirements.",
  ],
  [
    "Solution design",
    "We define the team structure, responsibilities, tools, workflows, and KPIs.",
  ],
  [
    "Recruitment & assignment",
    "We select suitable people based on your campaign and operational requirements.",
  ],
  [
    "Training & onboarding",
    "The team learns your processes, systems, brand, communication standards, and SOPs.",
  ],
  [
    "Launch",
    "The operation goes live with defined reporting, supervision, and escalation processes.",
  ],
  [
    "QA & optimization",
    "We review performance and refine processes using results and client feedback.",
  ],
  ["Scale", "Once the model is working, we expand it in line with your needs."],
];
const training = [
  [
    "Client & process training",
    "Your business, products, services, customers, and workflows.",
  ],
  ["Systems training", "The platforms and tools required for the engagement."],
  [
    "Communication training",
    "Brand voice, customer communication, escalation handling, and professional standards.",
  ],
  [
    "SOP training",
    "Documented procedures and knowing when and how to escalate.",
  ],
  [
    "Quality calibration",
    "Sample interactions and shared expectations before full production.",
  ],
  [
    "Ongoing coaching",
    "Feedback based on quality findings and performance data.",
  ],
];
function Section({
  number,
  title,
  children,
  dark = false,
}: {
  number: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`px-5 py-20 lg:px-10 lg:py-28 ${dark ? "bg-[#173226] text-white" : "border-t border-[#173226]/10"}`}
    >
      <div className="mx-auto max-w-[1280px]">
        <p
          className={`text-xs font-bold uppercase tracking-[.2em] ${dark ? "text-[#c9a227]" : "text-[#338461]"}`}
        >
          {number} / CallCare operations
        </p>
        <h2 className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
function CTA({
  children,
  href = "/#contact",
  secondary = false,
}: {
  children: ReactNode;
  href?: string;
  secondary?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 py-3 text-sm font-bold ${secondary ? "border-current" : "border-[#c9a227] bg-[#c9a227] text-[#173226]"}`}
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
export default function Operations() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const previous = document.title;
    document.title = "Our Operations | CallCare BPO";
    return () => {
      document.title = previous;
    };
  }, []);
  const links = [
    ["Services", "/#services"],
    ["Our Operations", "/operations"],
    ["Who We Help", "/#industries"],
    ["About", "/#about"],
    ["Careers", "/careers"],
  ];
  return (
    <div className="bg-[#fbfdfc] text-[#173226]">
      <header className="sticky top-0 z-40 border-b border-[#173226]/10 bg-[#fbfdfc]/95 px-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex min-h-20 max-w-[1280px] items-center justify-between gap-6">
          <a href="/" aria-label="CallCare BPO home">
            <img
              src="/brand/logo_primary_horizontal.svg"
              alt="CallCare BPO"
              className="w-40"
            />
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden gap-6 text-sm md:flex"
          >
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                aria-current={href === "/operations" ? "page" : undefined}
                className={
                  href === "/operations"
                    ? "font-bold text-[#338461]"
                    : "hover:underline"
                }
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            className="grid size-12 place-items-center md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="operations-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            id="operations-nav"
            aria-label="Mobile navigation"
            className="flex flex-col gap-5 pb-6 md:hidden"
          >
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main>
        <section className="overflow-hidden bg-[#173226] px-5 py-20 text-white lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-[#c9a227]">
                Our Operations / Built around your business
              </p>
              <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-7xl">
                Built to Keep Your Business{" "}
                <span className="font-editorial italic text-[#c9a227]">
                  Moving.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#c5d9cd]">
                Behind every CallCare service is a structured operation designed
                around people, process, technology, quality, and accountability.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <CTA>Work With CallCare</CTA>
                <CTA secondary href="mailto:info@callcarebpo.com">
                  Talk to Our Team
                </CTA>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-9">
              <div className="flex items-center justify-between border-b border-white/15 pb-5">
                <span className="text-sm font-bold">
                  The operational framework
                </span>
                <Workflow className="text-[#c9a227]" />
              </div>
              <div className="mt-6 grid gap-3">
                {pillars.map(([name, Icon, text], i) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#27503e]/40 p-4"
                  >
                    <Icon className="shrink-0 text-[#c9a227]" size={22} />
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="mt-1 text-xs leading-5 text-[#c5d9cd]">
                        {text}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-[#c9a227]">
                      0{i + 1}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-5 text-[#c5d9cd]">
                Connected by accountability. Configured for your engagement.
              </p>
            </div>
          </div>
        </section>
        <Section number="01" title="One model. Five connected pillars.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {pillars.map(([name, Icon, text]) => (
              <article
                key={name}
                className="rounded-2xl border border-[#c4d6cb] p-6"
              >
                <Icon className="text-[#338461]" />
                <h3 className="mt-6 text-lg font-bold">{name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#516b5e]">{text}</p>
              </article>
            ))}
          </div>
        </Section>
        <Section
          number="02"
          title="From first conversation to a working operation."
        >
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map(([title, desc], i) => (
              <li
                key={title}
                className="flex gap-5 rounded-2xl bg-[#edf3ef] p-6"
              >
                <span className="font-display text-3xl text-[#338461]">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#516b5e]">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        <Section number="03" title="A team supported by an operation." dark>
          <p className="max-w-2xl leading-7 text-[#c5d9cd]">
            You are supported by an operational structure, with clear ownership,
            supervision, quality checks, and a route for feedback. Roles and
            responsibilities are agreed for each engagement.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <ol
              aria-label="Operational delivery and feedback loop"
              className="space-y-3"
            >
              {[
                "Client objectives",
                "Account / operations management",
                "Team lead / supervisor",
                "Dedicated agents / specialists",
                "Quality assurance & reporting",
                "Client feedback",
                "Continuous improvement",
              ].map((label, i) => (
                <li
                  key={label}
                  className="flex items-center gap-4 rounded-xl border border-white/15 p-4"
                >
                  <span className="text-sm text-[#c9a227]">0{i + 1}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl bg-white/5 p-7">
              <h3 className="text-xl font-bold">
                Clear responsibility at every level
              </h3>
              <ul className="mt-6 space-y-5">
                {[
                  "Dedicated operational oversight",
                  "Team-level supervision",
                  "Performance monitoring",
                  "Quality assurance",
                  "Escalation management",
                  "Client communication",
                  "Ongoing coaching",
                ].map(x => (
                  <li
                    key={x}
                    className="flex items-center gap-3 text-[#c5d9cd]"
                  >
                    <Check size={18} className="text-[#c9a227]" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
        <Section
          number="04"
          title="We Don't Just Assign People. We Prepare Them."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {training.map(([title, desc]) => (
              <article key={title} className="border-t-2 border-[#338461] pt-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#516b5e]">{desc}</p>
              </article>
            ))}
          </div>
        </Section>
        <Section number="05" title="Quality Is Built Into the Operation.">
          <div className="grid gap-8 lg:grid-cols-2">
            <p className="text-lg leading-8 text-[#516b5e]">
              Quality checks belong in the day-to-day workflow. Review findings
              feed into coaching and process improvements, with standards and
              review frequency agreed for the engagement.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "Regular interaction reviews",
                "QA scorecards",
                "SOP compliance checks",
                "Customer experience monitoring",
                "Coaching and feedback",
                "Performance tracking",
                "Escalation monitoring",
                "Continuous process improvement",
              ].map(x => (
                <li
                  key={x}
                  className="rounded-xl bg-[#edf3ef] p-4 text-sm font-semibold"
                >
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 rounded-xl border border-[#c4d6cb] p-5 text-sm font-semibold leading-7">
            Monitor → Review → Identify → Coach → Improve → Repeat
          </p>
        </Section>
        <Section number="06" title="Your tools. A connected team." dark>
          <p className="text-lg text-[#c5d9cd]">
            We work within your existing technology stack whenever possible.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Communication",
                "Slack, Aircall, and client communication platforms",
              ],
              [
                "CRM & customer support",
                "Zendesk, Gorgias, HubSpot, Shopify, and other client systems",
              ],
              ["Project management", "ClickUp, Asana, Notion"],
              ["Productivity", "Google Workspace and Microsoft tools"],
              [
                "Reporting",
                "Google Sheets, dashboards, and client reporting systems",
              ],
            ].map(([title, desc]) => (
              <article
                key={title}
                className="rounded-xl border border-white/15 p-6"
              >
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#c5d9cd]">{desc}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs leading-5 text-[#c5d9cd]">
            Illustrative platform examples. Tool access, training, and
            configuration are agreed during solution design; this list does not
            imply vendor partnerships.
          </p>
        </Section>
        <Section number="07" title="You Always Know What's Happening.">
          <p className="max-w-2xl leading-7 text-[#516b5e]">
            Reporting cadence, measures, and access are agreed with you.
            Visibility is shaped around the decisions you need to make.
          </p>
          <div className="mt-8 rounded-2xl border border-[#c4d6cb] p-5 sm:p-8">
            <div className="flex flex-wrap justify-between gap-3 border-b border-[#c4d6cb] pb-5">
              <h3 className="font-bold">Operational reporting overview</h3>
              <span className="text-xs font-semibold text-[#338461]">
                Illustrative dashboard · No live performance data
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Productivity",
                "Quality",
                "Response times",
                "Attendance / availability",
                "Task completion",
                "Customer interactions",
                "SLA performance",
                "Campaign-specific KPIs",
              ].map(x => (
                <div key={x} className="rounded-xl bg-[#edf3ef] p-5">
                  <p className="text-sm font-bold">{x}</p>
                  <p className="mt-4 text-xs text-[#516b5e]">
                    Measure agreed with client
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-4 h-1 rounded bg-[#c4d6cb]"
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>
        <Section number="08" title="The right issue. The right level.">
          <div className="grid gap-8 md:grid-cols-2">
            <ol className="space-y-3">
              {[
                "Agent — identifies and documents the issue",
                "Team lead — resolves team-level questions",
                "Operations — coordinates complex escalation",
                "Client — provides decisions where required",
              ].map(x => (
                <li
                  key={x}
                  className="rounded-xl border border-[#c4d6cb] p-4 text-sm"
                >
                  {x}
                </li>
              ))}
            </ol>
            <p className="text-lg leading-8 text-[#516b5e]">
              Clear escalation procedures help the team resolve routine issues
              and bring you matters that need your input. We agree on
              communication channels, responsible contacts, and escalation
              expectations before launch.
            </p>
          </div>
        </Section>
        <Section
          number="09"
          title="Start With What You Need. Scale When You're Ready."
          dark
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Pilot", "Validate", "Optimize", "Expand"].map((x, i) => (
              <div key={x} className="rounded-xl border border-white/20 p-6">
                <span className="text-sm text-[#c9a227]">0{i + 1}</span>
                <h3 className="mt-5 text-2xl font-bold">{x}</h3>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl leading-8 text-[#c5d9cd]">
            Whether you need a small dedicated team, additional capacity, or a
            larger outsourced function, growth should follow a validated model.
            Staffing, coverage, readiness, and timelines are agreed before
            expansion.
          </p>
        </Section>
        <Section number="10" title="Your Business Isn't Our Template.">
          <p className="max-w-2xl leading-7 text-[#516b5e]">
            We adapt the operation to your requirements, with responsibilities
            and expectations documented together.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              "Team structure",
              "Workflows",
              "SOPs",
              "Training",
              "Communication channels",
              "KPIs",
              "Reporting",
              "Escalation procedures",
            ].map(x => (
              <span
                key={x}
                className="rounded-full border border-[#c4d6cb] px-5 py-3 text-sm"
              >
                {x}
              </span>
            ))}
          </div>
        </Section>
        <Section number="11" title="An operations snapshot.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Coverage planning",
                "Extended or 24/7 coverage can be discussed and confirmed for your engagement.",
              ],
              [
                "Talent preparation",
                "Selection and training aligned to the work.",
              ],
              [
                "Multiple service functions",
                "Support across customer experience, administration, creative work, and data.",
              ],
              [
                "Remote operations",
                "Connected workflows and clear communication.",
              ],
              [
                "Structured quality",
                "Agreed review standards and coaching loops.",
              ],
              [
                "Scalable teams",
                "Capacity planned around readiness and demand.",
              ],
            ].map(([title, desc]) => (
              <article key={title} className="rounded-2xl bg-[#edf3ef] p-6">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#516b5e]">{desc}</p>
              </article>
            ))}
          </div>
        </Section>
        <section className="bg-[#27503e] px-5 py-24 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Let's Build the Right Operation for Your Business.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#c5d9cd]">
              Tell us what you need help with, and we'll work with you to design
              an operational model that fits your business.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <CTA>Start a Conversation</CTA>
              <CTA secondary href="/#services">
                Explore Our Services
              </CTA>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
