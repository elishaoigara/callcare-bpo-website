import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  UsersRound,
  Workflow,
  Monitor,
  ShieldCheck,
  Layers3,
  Menu,
  X,
  ChevronDown,
  Check,
  Activity,
  MessageCircle,
  ClipboardList,
  RefreshCw,
  Clock3,
  CircleCheck,
  Radio,
} from "lucide-react";
import "./operations.css";

const pillars = [
  [
    "People",
    UsersRound,
    "Trained professionals selected and assigned for the requirements of your engagement.",
  ],
  [
    "Process",
    Workflow,
    "Documented workflows, SOPs, escalation paths, and clearly defined responsibilities.",
  ],
  [
    "Technology",
    Monitor,
    "The tools and systems that keep the team connected, productive, and accountable.",
  ],
  [
    "Quality",
    ShieldCheck,
    "Performance monitoring, QA reviews, coaching, and continuous feedback.",
  ],
  [
    "Scalability",
    Layers3,
    "Start with the capacity you need and expand as the operation grows.",
  ],
] as const;
const journey = [
  [
    "Discover",
    "We understand your business, customers, workflows, challenges, and goals.",
    "A shared brief",
  ],
  [
    "Design",
    "We shape the team structure, workflow, SOPs, tools, and KPIs.",
    "An operating plan",
  ],
  [
    "Build",
    "We identify and assign the right people for the engagement.",
    "A matched team",
  ],
  [
    "Train",
    "Your team learns the processes, systems, communication standards, and expectations.",
    "A prepared team",
  ],
  [
    "Launch",
    "Supervision, communication, and reporting are in place as work goes live.",
    "A supported launch",
  ],
  [
    "Monitor",
    "We review performance, quality, productivity, and operational issues.",
    "Operational visibility",
  ],
  [
    "Optimize",
    "Feedback and performance findings inform changes to the operation.",
    "A stronger workflow",
  ],
  [
    "Scale",
    "Expand the team, hours, responsibilities, or capacity when the model is working.",
    "Controlled growth",
  ],
];
const layers = [
  [
    "Client",
    "Sets the direction",
    [
      "Business objectives",
      "Agreed scope and priorities",
      "Approval criteria",
      "Decisions requiring client input",
    ],
  ],
  [
    "Operations management",
    "Owns the engagement",
    [
      "Client communication",
      "Workflow management",
      "Escalation handling",
      "Performance oversight",
    ],
  ],
  [
    "Team lead / supervision",
    "Supports the daily work",
    [
      "Daily team coordination",
      "Task allocation",
      "Coaching",
      "Escalation support",
    ],
  ],
  [
    "Delivery team",
    "Moves the work forward",
    [
      "Customer interactions",
      "Administrative work",
      "Data tasks",
      "Client-specific responsibilities",
    ],
  ],
  [
    "Quality assurance",
    "Checks the work",
    [
      "Interaction reviews",
      "SOP compliance",
      "Quality checks",
      "Coaching feedback",
    ],
  ],
  [
    "Reporting & feedback",
    "Makes performance visible",
    ["Performance tracking", "Productivity", "Quality", "Client-specific KPIs"],
  ],
  [
    "Continuous improvement",
    "Closes the feedback loop",
    [
      "Client feedback",
      "Coaching priorities",
      "Process improvements",
      "Workflow changes",
    ],
  ],
] as const;
const day = [
  [
    "Start of shift",
    "Check readiness",
    "Attendance and availability checked. Systems and tools checked. Daily priorities reviewed.",
    UsersRound,
  ],
  [
    "During operations",
    "Run the work",
    "Teams handle assigned work. Team leads monitor activity and support escalations.",
    Activity,
  ],
  [
    "Quality checks",
    "Review against standards",
    "Interactions and tasks are reviewed against the standards agreed with you.",
    ShieldCheck,
  ],
  [
    "Client communication",
    "Keep you informed",
    "Important issues, updates, and escalations move through the agreed channels.",
    MessageCircle,
  ],
  [
    "Performance review",
    "Look at the whole picture",
    "Productivity, quality, outstanding work, and issues are reviewed together.",
    ClipboardList,
  ],
  [
    "Continuous improvement",
    "Turn feedback into action",
    "Findings become coaching, process improvements, or workflow changes.",
    RefreshCw,
  ],
] as const;
const readiness = [
  "Role selection",
  "Client training",
  "Systems training",
  "SOP training",
  "Practice / calibration",
  "Quality review",
  "Go live",
  "Ongoing coaching",
];
const qa = ["Monitor", "Review", "Identify", "Coach", "Improve", "Repeat"];
const tools = [
  [
    "Communication",
    "Slack, communication platforms, telephony tools",
    MessageCircle,
  ],
  [
    "CRM & customer support",
    "Zendesk, Gorgias, HubSpot, Shopify, and other client systems",
    UsersRound,
  ],
  ["Project management", "ClickUp, Asana, Notion", ClipboardList],
  ["Productivity", "Google Workspace and Microsoft tools", Layers3],
  ["Reporting", "Spreadsheets, dashboards, client reporting systems", Monitor],
] as const;
function Section({
  id,
  number,
  title,
  intro,
  children,
  dark = false,
}: {
  id: string;
  number: string;
  title: string;
  intro?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={`ops-section px-5 py-20 lg:px-10 lg:py-24 ${dark ? "bg-[#173226] text-white" : "border-t border-[#173226]/10"}`}
    >
      <div className="mx-auto max-w-[1280px]">
        <p
          className={`text-xs font-bold uppercase tracking-[.2em] ${dark ? "text-[#c9a227]" : "text-[#338461]"}`}
        >
          {number} / Inside CallCare
        </p>
        <h2 className="mt-5 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h2>
        {intro && (
          <p
            className={`mt-5 max-w-2xl text-base leading-7 ${dark ? "text-[#c5d9cd]" : "text-[#516b5e]"}`}
          >
            {intro}
          </p>
        )}
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
      className={`ops-cta inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 py-3 text-sm font-bold ${secondary ? "border-current" : "border-[#c9a227] bg-[#c9a227] text-[#173226]"}`}
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
function Dashboard({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState("Delivery");
  return (
    <div
      className={`ops-dashboard overflow-hidden rounded-2xl border border-[#c4d6cb] bg-[#fbfdfc] text-[#173226] ${compact ? "shadow-2xl" : "shadow-sm"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e5dd] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#173226] text-[#c9a227]">
            <Activity size={18} />
          </span>
          <div>
            <p className="text-sm font-bold">Operations workspace</p>
            <p className="text-[11px] text-[#516b5e]">
              Sample operational dashboard
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#edf3ef] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          Illustrative view
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[#d9e5dd]">
        {[
          ["Team status", "Availability view"],
          ["Quality", "Review workflow"],
          ["Reporting", "Agreed cadence"],
        ].map(([a, b]) => (
          <div key={a} className="bg-white px-4 py-5">
            <p className="text-[11px] text-[#516b5e]">{a}</p>
            <p className="mt-2 text-xs font-semibold sm:text-sm">{b}</p>
          </div>
        ))}
      </div>
      <div
        role="tablist"
        aria-label={compact ? "Hero dashboard views" : "Sample dashboard views"}
        className="flex gap-1 border-b border-[#d9e5dd] px-4 pt-4"
      >
        {["Delivery", "Quality", "Escalations"].map(x => (
          <button
            key={x}
            role="tab"
            id={`${compact ? "hero" : "report"}-tab-${x}`}
            aria-selected={tab === x}
            aria-controls={`${compact ? "hero" : "report"}-panel`}
            tabIndex={tab === x ? 0 : -1}
            onKeyDown={event => {
              const views = ["Delivery", "Quality", "Escalations"];
              const index = views.indexOf(x);
              const next =
                event.key === "ArrowRight"
                  ? views[(index + 1) % views.length]
                  : event.key === "ArrowLeft"
                    ? views[(index + views.length - 1) % views.length]
                    : event.key === "Home"
                      ? views[0]
                      : event.key === "End"
                        ? views[2]
                        : null;
              if (next) {
                event.preventDefault();
                setTab(next);
                document
                  .getElementById(`${compact ? "hero" : "report"}-tab-${next}`)
                  ?.focus();
              }
            }}
            onClick={() => setTab(x)}
            className={`min-h-11 border-b-2 px-3 text-xs font-bold ${tab === x ? "border-[#338461] text-[#27503e]" : "border-transparent text-[#516b5e]"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${compact ? "hero" : "report"}-panel`}
        aria-labelledby={`${compact ? "hero" : "report"}-tab-${tab}`}
        className="p-5"
      >
        <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#516b5e]">
          <span>Workstream / sample entry</span>
          <span>Workflow stage</span>
        </div>
        {(tab === "Delivery"
          ? [
              ["Customer support", "In progress"],
              ["Administrative tasks", "Quality review"],
              ["Client report", "Ready for review"],
            ]
          : tab === "Quality"
            ? [
                ["Interaction review", "Review queue"],
                ["SOP check", "In review"],
                ["Coaching feedback", "Follow-up"],
              ]
            : [
                ["Client decision", "Awaiting input"],
                ["Process question", "Team lead"],
                ["System access", "Operations"],
              ]
        ).map(([name, state]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 border-t border-[#e1e9e4] py-4 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#338461]"
              />
              {name}
            </span>
            <span className="shrink-0 rounded-full border border-[#d9e5dd] px-2 py-1 text-[10px]">
              {state}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#d9e5dd] bg-[#edf3ef] px-5 py-3 text-[10px] leading-5 text-[#516b5e]">
        Sample entries only. No live team status or performance data.
      </div>
    </div>
  );
}
export default function Operations() {
  const [open, setOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [activeLayer, setActiveLayer] = useState(1);
  const [activeDay, setActiveDay] = useState(0);
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
    <div className="ops-page bg-[#fbfdfc] text-[#173226]">
      <a href="#operations-content" className="ops-skip">
        Skip to content
      </a>
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
      <main id="operations-content">
        <section className="ops-hero relative overflow-hidden bg-[#173226] px-5 py-20 text-white lg:px-10 lg:py-28">
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="ops-enter">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-[#c9a227]">
                Our Operations / A look inside
              </p>
              <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-6xl xl:text-7xl">
                See How CallCare Works{" "}
                <span className="font-editorial italic text-[#c9a227]">
                  Behind the Scenes.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#c5d9cd]">
                From the moment work reaches us to the moment it's delivered,
                there's a structured operation working behind it.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <CTA>Work With CallCare</CTA>
                <CTA secondary href="/#services">
                  Explore Our Services
                </CTA>
              </div>
              <a
                href="#inside"
                className="mt-8 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#c5d9cd]"
              >
                Look inside the operation <ArrowDown size={15} />
              </a>
            </div>
            <div className="ops-enter">
              <Dashboard compact />
              <ol
                aria-label="Operational flow"
                className="mt-5 grid grid-cols-3 gap-2"
              >
                {[
                  "Client",
                  "CallCare",
                  "Team",
                  "QA",
                  "Reporting",
                  "Results",
                ].map((x, i) => (
                  <li
                    key={x}
                    className="flex items-center justify-between rounded-lg border border-white/15 px-3 py-3 text-xs"
                  >
                    <span>{x}</span>
                    {i < 5 && (
                      <ArrowRight size={12} className="text-[#c9a227]" />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <nav
          aria-label="Explore operations sections"
          className="border-b border-[#c4d6cb] bg-[#edf3ef] px-5 py-4"
        >
          <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-7 gap-y-2 text-xs font-bold">
            {[
              ["The model", "model"],
              ["Your journey", "journey"],
              ["Inside the operation", "inside"],
              ["A working day", "day"],
              ["Quality", "quality"],
              ["Visibility", "visibility"],
            ].map(([x, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex min-h-9 items-center gap-2"
              >
                {x}
                <ArrowDown size={12} />
              </a>
            ))}
          </div>
        </nav>
        <Section
          id="model"
          number="02"
          title="People. Process. Technology. Quality."
          intro="CallCare combines trained people, clear processes, technology, and ongoing quality management to build reliable operations around our clients' needs."
        >
          <div className="ops-pillars grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map(([name, Icon], i) => (
              <button
                key={name}
                aria-pressed={activePillar === i}
                onClick={() => setActivePillar(i)}
                className={`ops-pillar relative flex items-center gap-3 rounded-2xl border p-5 text-left transition-colors lg:flex-col lg:items-start ${activePillar === i ? "border-[#27503e] bg-[#27503e] text-white" : "border-[#c4d6cb] bg-white hover:bg-[#edf3ef]"}`}
              >
                <Icon size={25} />
                <span className="text-sm font-bold">{name}</span>
                <span className="ml-auto text-[10px] lg:absolute lg:right-4 lg:top-4">
                  0{i + 1}
                </span>
              </button>
            ))}
          </div>
          <div
            aria-live="polite"
            className="mt-5 flex min-h-24 flex-wrap items-center gap-4 rounded-2xl border border-[#c4d6cb] bg-[#edf3ef] p-6"
          >
            <span className="font-bold">{pillars[activePillar][0]}</span>
            <p className="text-sm leading-6 text-[#516b5e]">
              {pillars[activePillar][2]}
            </p>
          </div>
          <p className="mt-4 text-xs text-[#516b5e]">
            Each part supports the next. Accountability connects the whole
            operation.
          </p>
        </Section>
        <Section
          id="journey"
          number="03"
          title="From Your Business to Our Operation"
          intro="You bring us the work. Together, we turn it into an operation the team can run, review, and improve."
        >
          <ol className="ops-journey grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {journey.map(([title, desc, output], i) => (
              <li
                key={title}
                className="ops-step relative rounded-2xl border border-[#c4d6cb] bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl text-[#338461]">
                    0{i + 1}
                  </span>
                  <ArrowRight size={18} className="text-[#9ab1a5]" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#516b5e]">{desc}</p>
                <p className="mt-6 border-t border-[#d9e5dd] pt-4 text-xs font-semibold text-[#338461]">
                  Output / {output}
                </p>
              </li>
            ))}
          </ol>
        </Section>
        <Section
          id="inside"
          number="04"
          title="What Happens After You Hand Us the Work?"
          dark
          intro="There is a structure supporting the delivery team. Explore who owns the work, who checks it, and how feedback turns into improvement."
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <ol className="ops-layers space-y-3">
              {layers.map(([name, desc], i) => (
                <li key={name}>
                  <button
                    aria-expanded={activeLayer === i}
                    aria-controls="layer-detail"
                    onClick={() => setActiveLayer(i)}
                    className={`flex min-h-16 w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${activeLayer === i ? "border-[#c9a227] bg-[#c9a227] text-[#173226]" : "border-white/20 bg-white/5 hover:bg-white/10"}`}
                  >
                    <span className="text-xs">0{i + 1}</span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{name}</span>
                      <span className="mt-1 block text-xs opacity-75">
                        {desc}
                      </span>
                    </span>
                    <ChevronDown size={16} />
                  </button>
                </li>
              ))}
            </ol>
            <div
              id="layer-detail"
              aria-live="polite"
              className="self-start rounded-2xl border border-white/15 bg-white/5 p-7 lg:sticky lg:top-28"
            >
              <p className="text-xs uppercase tracking-widest text-[#c9a227]">
                Inside this layer
              </p>
              <h3 className="mt-5 text-3xl font-semibold">
                {layers[activeLayer][0]}
              </h3>
              <ul className="mt-8 space-y-5">
                {layers[activeLayer][2].map(x => (
                  <li
                    key={x}
                    className="flex items-center gap-3 text-sm text-[#c5d9cd]"
                  >
                    <Check size={18} className="shrink-0 text-[#c9a227]" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-10 border-t border-white/15 pt-6">
                <RefreshCw className="text-[#c9a227]" size={20} />
                <p className="mt-3 text-sm leading-6 text-[#c5d9cd]">
                  Reporting and client feedback return to operations management,
                  shaping the next round of work.
                </p>
              </div>
              <p className="mt-6 text-xs leading-5 text-[#9fbdad]">
                Typical structure. Roles and responsibilities are tailored to
                the engagement.
              </p>
            </div>
          </div>
        </Section>
        <Section
          id="day"
          number="05"
          title="A Day Inside CallCare"
          intro="An illustrative operating day. The sequence, coverage, and review cadence depend on the work we agree with you."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <ol className="ops-timeline">
              {day.map(([name, title, , Icon], i) => (
                <li key={name} className="relative pb-5 pl-12">
                  <span
                    className={`ops-timeline-dot absolute left-0 top-1 grid size-8 place-items-center rounded-full border ${activeDay === i ? "border-[#27503e] bg-[#27503e] text-white" : "border-[#c4d6cb] bg-white text-[#338461]"}`}
                  >
                    <Icon size={15} />
                  </span>
                  <button
                    aria-pressed={activeDay === i}
                    onClick={() => setActiveDay(i)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${activeDay === i ? "border-[#338461] bg-[#edf3ef]" : "border-[#e1e9e4] bg-white hover:bg-[#edf3ef]"}`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#338461]">
                      {name}
                    </span>
                    <span className="mt-2 block text-sm">{title}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div
              aria-live="polite"
              className="self-start rounded-3xl bg-[#edf3ef] p-8 sm:p-10 lg:sticky lg:top-28"
            >
              <Clock3 size={32} className="text-[#338461]" />
              <p className="mt-8 text-xs font-bold uppercase tracking-wider text-[#338461]">
                {day[activeDay][0]}
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold">
                {day[activeDay][1]}
              </h3>
              <p className="mt-5 text-lg leading-8 text-[#516b5e]">
                {day[activeDay][2]}
              </p>
              <div className="mt-9 flex gap-2" aria-hidden="true">
                {day.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded ${i === activeDay ? "bg-[#338461]" : "bg-[#c4d6cb]"}`}
                  />
                ))}
              </div>
              <p className="mt-6 text-xs leading-5 text-[#516b5e]">
                No fixed shift times or performance figures are implied.
              </p>
            </div>
          </div>
        </Section>
        <Section
          id="readiness"
          number="06"
          title="We Don't Just Assign People. We Prepare Them."
          intro="Training is shaped around your operation, including your brand voice, communication standards, tools, and escalation expectations."
        >
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {readiness.map((x, i) => (
              <li
                key={x}
                className="flex items-center gap-3 rounded-xl border border-[#c4d6cb] p-5"
              >
                <span className="text-xs font-bold text-[#338461]">
                  0{i + 1}
                </span>
                <span className="flex-1 text-sm font-semibold">{x}</span>
                <ArrowRight size={14} className="shrink-0 text-[#338461]" />
              </li>
            ))}
          </ol>
          <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#edf3ef] p-5">
            <CircleCheck size={20} className="shrink-0 text-[#338461]" />
            <p className="text-sm leading-6 text-[#516b5e]">
              Readiness is checked before go-live. Coaching continues as real
              work reveals new learning needs.
            </p>
          </div>
        </Section>
        <Section
          id="quality"
          number="07"
          title="Quality Is Part of the Operation — Not an Afterthought"
          dark
          intro="Reviews feed back into the work. The purpose is to identify issues, support people, and make the next interaction or task better."
        >
          <ol
            aria-label="Quality improvement loop"
            className="ops-qa-loop grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {qa.map((x, i) => (
              <li
                key={x}
                className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/5 p-6"
              >
                <span className="flex items-center gap-4">
                  <span className="text-xs text-[#c9a227]">0{i + 1}</span>
                  <span className="font-bold">{x}</span>
                </span>
                {i === 5 ? (
                  <RefreshCw size={18} className="text-[#c9a227]" />
                ) : (
                  <ArrowRight size={18} className="text-[#c9a227]" />
                )}
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              "QA reviews",
              "SOP compliance",
              "Performance monitoring",
              "Coaching",
              "Error identification",
              "Client feedback",
              "Process improvement",
            ].map(x => (
              <span
                key={x}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#c5d9cd]"
              >
                {x}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#c5d9cd]">
            Repeat the loop: improvements become the standards for the next
            review.
          </p>
        </Section>
        <Section
          id="technology"
          number="08"
          title="Your Tools. Our Team. One Operation."
          intro="We adapt to the systems your business already uses whenever possible."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(([title, desc, Icon]) => (
              <article
                key={title}
                className="ops-tool rounded-2xl border border-[#c4d6cb] bg-white p-6"
              >
                <Icon size={23} className="text-[#338461]" />
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#516b5e]">{desc}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs leading-6 text-[#516b5e]">
            Platform examples, not a fixed bundle or vendor partnership claim.
            Access, training, and tool selection are agreed for each engagement.
          </p>
        </Section>
        <Section
          id="visibility"
          number="09"
          title="You Shouldn't Have to Guess What's Happening."
          intro="We agree on what to measure, how to report it, and when to discuss it. You can see the work and the issues that need attention."
        >
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Dashboard />
            <div className="rounded-2xl bg-[#edf3ef] p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-[#338461]">
                Visibility agreed with you
              </p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  "Team status & attendance",
                  "Tasks completed & outstanding work",
                  "Productivity & quality",
                  "Response times & SLA performance",
                  "Outstanding issues & escalations",
                  "Client-specific KPIs",
                ].map(x => (
                  <li key={x} className="flex items-center gap-3 text-sm">
                    <Radio size={15} className="shrink-0 text-[#338461]" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-t border-[#c4d6cb] pt-5 text-xs leading-6 text-[#516b5e]">
                Reporting formats and cadence vary by engagement. The dashboard
                illustrates how information can be organised; it is not a live
                client portal.
              </p>
            </div>
          </div>
        </Section>
        <Section
          id="scale"
          number="10"
          title="Start Small. Prove the Model. Scale When You're Ready."
          dark
        >
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Pilot", "Begin with an agreed scope."],
              ["Validate", "Check delivery and readiness."],
              ["Optimize", "Improve the way work runs."],
              ["Expand", "Add capacity when the model is ready."],
            ].map(([x, desc], i) => (
              <li key={x} className="rounded-2xl border border-white/20 p-6">
                <div className="flex justify-between text-[#c9a227]">
                  <span className="text-xs">0{i + 1}</span>
                  <ArrowRight size={17} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{x}</h3>
                <p className="mt-3 text-sm leading-6 text-[#c5d9cd]">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl leading-7 text-[#c5d9cd]">
            The operation starts around your current needs. Team size, coverage,
            responsibilities, and capacity can grow as requirements change, with
            readiness and timelines agreed before expansion.
          </p>
        </Section>
        <Section id="outcomes" number="11" title="What You Get Behind the Work">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Dedicated People",
              "Clear Processes",
              "Operational Oversight",
              "Quality Control",
              "Performance Visibility",
              "Flexible Scaling",
              "Client Communication",
              "Continuous Improvement",
            ].map((x, i) => (
              <div
                key={x}
                className="flex items-center gap-3 rounded-xl bg-[#edf3ef] p-5"
              >
                <span className="text-xs text-[#338461]">0{i + 1}</span>
                <h3 className="text-sm font-bold">{x}</h3>
              </div>
            ))}
          </div>
        </Section>
        <section className="bg-[#27503e] px-5 py-24 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#c9a227]">
              12 / Your next step
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Let's Build the Right Operation for Your Business.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#c5d9cd]">
              Tell us what you need help with, and we'll work with you to design
              an operational setup that fits your business.
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
