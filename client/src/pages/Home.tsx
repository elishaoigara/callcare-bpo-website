/* Quiet Authority: editorial landing page with forest-green fields, warm paper space, and operational clarity. */
import { useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ClipboardList,
  Database,
  Headphones,
  Layers3,
  Menu,
  MessageCircle,
  Palette,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/callcare-hero_b927f0fa.png";
const operationsImage = "/manus-storage/callcare-operations_3f2206be.png";
const servicesImage = "/manus-storage/callcare-services_bb91f26c.png";
const teamImage = "/manus-storage/callcare-team_dc14a11a.png";
const logoPrimary = "/brand/logo_primary_horizontal.svg";
const logoIconCream = "/brand/icon_mono_cream.svg";
const logoIconDark = "/brand/icon_mono_dark.svg";

const services = [
  {
    icon: Headphones,
    number: "01",
    title: "Customer experience",
    summary: "Make every customer interaction feel considered, consistent, and on-brand.",
    details: ["Phone, email, and live chat support", "Customer onboarding", "Complaint resolution", "CRM management and reporting"],
  },
  {
    icon: UsersRound,
    number: "02",
    title: "Virtual assistance",
    summary: "Give your leaders and teams back the time to work on what only they can do.",
    details: ["Executive assistance", "Calendar and inbox management", "Appointment scheduling", "Research, documents, and travel coordination"],
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Administrative growth",
    summary: "Keep the pipeline moving and the operational details from becoming bottlenecks.",
    details: ["Lead tracking and CRM management", "Market and competitor research", "Business reporting", "Sales administration and process organization"],
  },
  {
    icon: Palette,
    number: "04",
    title: "Creative design",
    summary: "Turn your ideas into clear, useful assets that help your brand move forward.",
    details: ["Social media graphics", "Branding materials", "Presentations and pitch decks", "Marketing designs, infographics, and digital assets"],
  },
  {
    icon: Database,
    number: "05",
    title: "Data & operations",
    summary: "Bring order to the information your business needs to make better decisions.",
    details: ["Data entry, cleaning, and organization", "Spreadsheet and database management", "Report preparation", "Documentation, online research, and records"],
  },
];

const industries = ["E-commerce", "SaaS", "Healthcare", "Service businesses", "Real estate", "Digital agencies"];

function Logo({ light = false, full = false }: { light?: boolean; full?: boolean }) {
  if (full) {
    return <a href="#top" className="group inline-flex max-w-[225px] items-center bg-[#f6f3ec] px-4 py-3" aria-label="CallCare BPO home"><img src={logoPrimary} alt="CallCare BPO" className="h-auto w-full" /></a>;
  }

  return (
    <a href="#top" className="group inline-flex items-center gap-3" aria-label="CallCare BPO home">
      <span className={`grid size-11 place-items-center overflow-hidden rounded-[13px] border ${light ? "border-white/20 bg-[#e8f0e9]" : "border-[#9db9a9] bg-[#0b4f3b]"}`}>
        <img src={light ? logoIconCream : logoIconDark} alt="" className="size-8 object-contain" />
      </span>
      <span className={`font-display text-[16px] font-bold tracking-[-.05em] ${light ? "text-white" : "text-[#123d31]"}`}>
        CALLCARE <span className={light ? "text-[#d99a3d]" : "text-[#4a7d6b]"}>BPO</span>
      </span>
    </a>
  );
}

function SectionLabel({ index, label, light = false }: { index: string; label: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? "text-[#d7e6db]" : "text-[#76958b]"}`}>
      <span className={`grid size-8 place-items-center rounded-full text-[11px] font-bold ${light ? "bg-[#d99a3d] text-[#163b31]" : "bg-[#0b4f3b] text-[#f6f3ec]"}`}>{index}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = heroRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    heroRef.current.style.setProperty("--hero-x", `${x * 7}px`);
    heroRef.current.style.setProperty("--hero-y", `${y * 5}px`);
  };

  const resetHeroMove = () => {
    heroRef.current?.style.setProperty("--hero-x", "0px");
    heroRef.current?.style.setProperty("--hero-y", "0px");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="top" className="min-h-screen overflow-hidden bg-[#f6f3ec] text-[#163b31]">
      <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-[#082f25]/70 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-10">
          <Logo light />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {[['Services', '#services'], ['Process', '#process'], ['Who we help', '#industries'], ['About', '#about']].map(([label, href]) => (
              <a key={label} href={href} className="text-[13px] font-medium text-white/75 hover:text-white">{label}</a>
            ))}
          </nav>
          <a href="#contact" className="hidden items-center gap-2 rounded-full bg-[#d99a3d] px-4 py-2.5 text-[12px] font-bold text-[#163b31] hover:bg-[#eab467] sm:inline-flex">Talk to our team <ArrowUpRight size={15} /></a>
          <button className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#082f25] px-5 py-5 md:hidden"><div className="flex flex-col gap-5">{[['Services', '#services'], ['Process', '#process'], ['Who we help', '#industries'], ['About', '#about'], ['Start a conversation', '#contact']].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="text-sm text-white/85">{label}</a>)}</div></nav>}
      </header>

      <main>
        <section ref={heroRef} onMouseMove={handleHeroMove} onMouseLeave={resetHeroMove} className="hero-noise relative isolate min-h-[720px] overflow-hidden bg-[#073a2d] text-white lg:min-h-[760px]">
          <img src={heroImage} alt="CallCare operations professional at work" className="absolute inset-0 -z-20 size-full object-cover object-center opacity-65" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#073a2d_0%,rgba(7,58,45,.92)_29%,rgba(7,58,45,.36)_65%,rgba(7,58,45,.2)_100%)]" />
          <div className="hero-ring absolute right-[8%] top-[18%] -z-10 hidden size-72 rounded-full border border-[#d99a3d]/35 lg:block" /><div className="absolute inset-y-0 right-0 -z-10 hidden w-[28%] bg-[#d99a3d]/10 lg:block [clip-path:polygon(35%_0,100%_0,100%_100%,0%_100%)]" />
          <div className="relative mx-auto flex min-h-[720px] max-w-[1280px] items-end px-5 pb-16 pt-36 lg:min-h-[760px] lg:px-10 lg:pb-24"><span className="absolute left-5 top-32 hidden size-3 rounded-full bg-[#d99a3d] shadow-[0_0_0_7px_rgba(217,154,61,.12)] lg:block" />
            <div className="max-w-[760px] reveal">
              <div className="mb-7 flex items-center gap-3 text-[#d6e6db]"><span className="h-px w-12 bg-[#d99a3d]" /><span className="eyebrow">Operational support that helps you scale</span></div>
              <h1 className="font-display max-w-[760px] text-balance text-[clamp(3.25rem,7vw,7.15rem)] font-semibold leading-[.92] tracking-[-.075em]">Put the busywork in <span className="font-editorial italic text-[#d99a3d]">capable hands.</span></h1>
              <p className="mt-8 max-w-[520px] text-[17px] leading-8 text-[#e4eee7]/80">CallCare BPO becomes an extension of your team, handling the work that keeps your business moving so you can focus on what matters most: growth.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><a href="#contact" className="inline-flex items-center gap-3 rounded-full bg-[#f6f3ec] px-5 py-3.5 text-sm font-bold text-[#163b31] hover:bg-white">Build your support team <ArrowUpRight size={17} /></a><a href="#services" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-white/80 hover:text-white">Explore services <ArrowDownRight size={17} /></a></div>
            </div>
            <div className="absolute bottom-8 right-5 hidden w-[240px] lg:block"><div className="flex items-end justify-between gap-2 border-b border-white/25 pb-3"><div className="bar-graph flex h-32 items-end gap-2">{[42, 70, 54, 100, 78].map((h, i) => <span key={i} className="w-7 bg-[#98c0aa]" style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />)}</div><span className="font-display pb-1 text-4xl font-semibold text-[#d99a3d]">↑</span></div><p className="mt-3 text-[10px] uppercase tracking-[.16em] text-white/60">Remote support / built to scale</p></div>
          </div>
        </section>

        <section id="about" className="paper-grid section-rule relative px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-28">
            <div><SectionLabel index="01" label="The CallCare approach" /><div className="relative mt-12 overflow-hidden bg-[#0b4f3b] p-6 text-[#edf3ed] sm:p-8"><span className="absolute right-0 top-0 size-24 bg-[#d99a3d]/20 [clip-path:polygon(100%_0,100%_100%,0_0)]" /><div className="relative flex items-center justify-between border-b border-white/20 pb-5"><span className="eyebrow text-[#a8c9b7]">Field note / 001</span><span className="size-2 rounded-full bg-[#d99a3d] shadow-[0_0_0_5px_rgba(217,154,61,.15)]" /></div><div className="relative mt-12 flex h-36 items-end gap-2 border-b border-white/20 pb-0"><span className="h-[38%] w-[15%] bg-[#6e9e88]" /><span className="h-[62%] w-[15%] bg-[#8bb49d]" /><span className="h-[50%] w-[15%] bg-[#6e9e88]" /><span className="h-[88%] w-[15%] bg-[#b9d4c3]" /><span className="h-[72%] w-[15%] bg-[#8bb49d]" /><span className="ml-auto font-display text-5xl text-[#d99a3d]">↗</span></div><div className="relative mt-6"><p className="font-display text-xl leading-snug">“We handle the operational work, so you can focus on your big goals.”</p><p className="mt-3 text-xs uppercase tracking-[.13em] text-[#a8c9b7]">A calmer way to grow</p></div></div></div>
            <div className="pt-0 lg:pt-10"><p className="section-kicker">Your partner in growth</p><h2 className="mt-5 max-w-[650px] font-display text-[clamp(2.35rem,4.6vw,4.65rem)] font-semibold leading-[.96] tracking-[-.065em]">The steady team behind your next <span className="font-editorial italic text-[#0b4f3b]">stage.</span></h2><p className="mt-8 max-w-[560px] text-[17px] leading-8 text-[#4e6c61]">CallCare BPO is a remote workforce solutions company for businesses that need reliable support without adding unnecessary operational weight. We match the right people and process to the pressure points in your business.</p><div className="mt-10 grid max-w-[600px] gap-x-8 gap-y-4 border-t border-[#b8cbc0] pt-7 sm:grid-cols-2">{['Skilled, reliable professionals','Cost-effective, scalable solutions','High-quality service delivery','Flexible engagement models','Strong communication','Security and confidentiality'].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#315b4d]"><span className="grid size-6 place-items-center rounded-full bg-[#dbeae0] text-[#0b4f3b]"><Check size={14} /></span>{item}</div>)}</div></div>
          </div>
        </section>

        <section id="services" className="section-rule bg-[#e7f0ea] px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1280px]"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-24"><div><SectionLabel index="02" label="What we do" /><div className="mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#76958b]"><span className="size-2 rounded-full bg-[#d99a3d]" /> Operating manual / service map</div><h2 className="mt-10 max-w-[430px] font-display text-[clamp(2.5rem,4.5vw,4.6rem)] font-semibold leading-[.98] tracking-[-.06em]">Support for the parts that keep business moving.</h2><p className="mt-7 max-w-[370px] text-[16px] leading-7 text-[#57776b]">From customer experience to data operations, our support is designed around the way your business actually works.</p><div className="paper-grid relative mt-10 hidden min-h-[235px] overflow-hidden border border-[#b8cbc0] bg-[#f6f3ec] p-6 lg:block"><div className="flex items-center justify-between border-b border-[#b8cbc0] pb-4"><span className="eyebrow text-[#76958b]">Field note / 002</span><span className="size-2 rounded-full bg-[#d99a3d]" /></div><div className="mt-6 grid grid-cols-[1.1fr_.9fr] gap-5"><div><div className="mb-4 h-2 w-32 bg-[#0b4f3b]/80" /><div className="mb-3 h-2 w-44 bg-[#b8cbc0]" /><div className="mb-3 h-2 w-28 bg-[#b8cbc0]" /><div className="h-2 w-36 bg-[#b8cbc0]" /></div><div className="flex items-end gap-2"><span className="h-16 w-5 bg-[#9fc2ae]" /><span className="h-24 w-5 bg-[#0b4f3b]" /><span className="h-20 w-5 bg-[#d99a3d]" /><span className="h-32 w-5 bg-[#6e9e88]" /></div></div><p className="absolute bottom-6 left-6 text-[11px] font-bold uppercase tracking-[.12em] text-[#4e6c61]">Support, organized.</p></div></div><div className="divide-y divide-[#b8cbc0] border-t border-[#b8cbc0]">{services.map((service, index) => { const Icon = service.icon; const active = activeService === index; return <div key={service.title} className="py-6 first:pt-0 last:pb-0"><button className="flex w-full items-start justify-between gap-5 text-left" onClick={() => setActiveService(active ? -1 : index)} aria-expanded={active}><div className="flex items-start gap-5"><span className={`grid size-12 shrink-0 place-items-center rounded-full ${active ? 'bg-[#0b4f3b] text-[#f6f3ec]' : 'bg-[#d5e5da] text-[#0b4f3b]'}`}><Icon size={21} strokeWidth={1.7} /></span><div><div className="mb-2 flex items-center gap-3"><span className="eyebrow text-[#88a59a]">{service.number}</span><h3 className="font-display text-2xl font-semibold tracking-[-.04em] text-[#163b31]">{service.title}</h3></div><p className="max-w-[570px] text-[15px] leading-7 text-[#57776b]">{service.summary}</p></div></div><ChevronDown size={20} className={`mt-2 shrink-0 text-[#719288] transition-transform ${active ? 'rotate-180' : ''}`} /></button>{active && <div className="ml-[68px] mt-5 grid gap-x-6 gap-y-2 border-l border-[#9fbcaf] pl-5 sm:grid-cols-2">{service.details.map(detail => <div key={detail} className="text-[13px] text-[#4e6c61]">{detail}</div>)}</div>}</div>; })}</div></div></div>
        </section>

        <section id="industries" className="section-rule bg-[#0b4f3b] px-5 py-24 text-[#f6f3ec] lg:px-10 lg:py-32"><div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24"><div><SectionLabel index="03" label="Who we help" light /><h2 className="mt-10 max-w-[550px] font-display text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[.92] tracking-[-.065em]">A good fit for businesses with room to <span className="font-editorial italic text-[#d99a3d]">grow.</span></h2><p className="mt-8 max-w-[470px] text-[17px] leading-8 text-[#c7ddd0]">From startups to established companies, we provide the support your business needs to run smoothly and scale faster.</p><a href="#contact" className="mt-9 inline-flex items-center gap-2 border-b-2 border-[#d99a3d] pb-2 text-sm font-bold text-white">Find your support model <ArrowUpRight size={16} /></a></div><div className="industry-mosaic grid grid-cols-2 gap-3 sm:grid-cols-3">{industries.map((industry, i) => <div key={industry} className={`industry-tile group relative flex min-h-[140px] flex-col justify-between overflow-hidden border border-[#b8e4d1]/40 bg-[#b8e4d1] p-5 text-[#163b31] transition-transform hover:-translate-y-1 sm:min-h-[170px] sm:p-7 ${i === 0 ? 'sm:col-span-2 sm:row-span-2 sm:min-h-[352px]' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>{i === 0 && <img src={operationsImage} alt="CallCare team member supporting business operations" className="absolute inset-0 size-full object-cover opacity-35 mix-blend-multiply" />}<span className="relative text-[11px] font-bold tracking-[.12em] text-[#315b4d]">0{i + 1}</span><div className="relative flex items-end justify-between"><span className={`font-display font-semibold tracking-[-.04em] ${i === 0 ? 'text-3xl sm:text-4xl' : 'text-lg'}`}>{industry}</span><ArrowUpRight size={17} className="text-[#0b4f3b] opacity-0 transition-opacity group-hover:opacity-100" /></div></div>)}</div></div></section>

        <section id="process" className="section-rule bg-[#0b4f3b] px-5 py-24 text-white lg:px-10 lg:py-32"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><SectionLabel index="04" label="How we work" light /><h2 className="mt-9 max-w-[700px] font-display text-[clamp(2.7rem,5vw,5.4rem)] font-semibold leading-[.92] tracking-[-.07em]">A simple partnership process, built around your <span className="font-editorial italic text-[#d99a3d]">reality.</span></h2></div><p className="max-w-[290px] text-sm leading-6 text-[#b8d0c3]">We do the listening first, then build the support model around the work that needs to move.</p></div><div className="mt-20 grid gap-0 border-t border-white/20 lg:grid-cols-5">{[['01','Understand','We learn about your business, challenges, and goals.'],['02','Build','We recommend the right support model and plan.'],['03','Match','We find and train the right professionals.'],['04','Integrate','We onboard our team into your tools and processes.'],['05','Improve','We monitor performance, gather feedback, and improve.']].map(([n,title,desc]) => <div key={n} className="border-b border-white/20 py-7 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"><span className="font-display text-4xl text-[#d99a3d]">{n}</span><h3 className="mt-9 font-display text-lg font-semibold">{title}</h3><p className="mt-3 max-w-[180px] text-sm leading-6 text-[#b8d0c3]">{desc}</p></div>)}</div></div></section>

        <section className="paper-grid section-rule px-5 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><SectionLabel index="05" label="Flexible engagement" /><h2 className="mt-9 max-w-[650px] font-display text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[.96] tracking-[-.07em]">Start where you are. Scale when you’re ready.</h2></div><p className="max-w-[300px] text-sm leading-6 text-[#57776b]">Indicative packages from the service brochure. We’ll shape the right scope together.</p></div><div className="mt-14 grid gap-4 lg:grid-cols-3">{[['Starter','From $800/month','Dedicated remote professional','Part-time support','Administrative or customer support'],['Growth','From $1,500/month','Full-time specialist','Business operations support','Reporting and administrative assistance'],['Scale','From $3,000/month','Team of specialists','Customer, admin, and growth support','Creative and data support']].map(([name,price,...items], i) => <div key={name} className={`relative flex min-h-[340px] flex-col justify-between border p-7 ${i === 1 ? 'growth-card border-[#0b4f3b] bg-[#0b4f3b] text-[#f6f3ec]' : 'border-[#b8cbc0] bg-[#f6f3ec]'}`}><div><div className="mb-12 flex items-center justify-between"><span className="eyebrow opacity-70">0{i + 1} / package</span>{i === 1 && <span className="rounded-full bg-[#d99a3d] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#163b31]">Popular path</span>}</div><h3 className="font-display text-3xl font-semibold tracking-[-.05em]">{name}</h3><p className={`mt-2 text-sm font-bold ${i === 1 ? 'text-[#d99a3d]' : 'text-[#0b4f3b]'}`}>{price}</p></div><div className={`space-y-2 border-t pt-5 text-sm ${i === 1 ? 'border-white/20 text-[#c7ddd0]' : 'border-[#c7d5ca] text-[#57776b]'}`}>{items.map(item => <div key={item} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#d99a3d]" />{item}</div>)}</div></div>)}</div></div></section>

        <section id="contact" className="section-rule relative overflow-hidden bg-[#dceae0] px-5 py-24 lg:px-10 lg:py-32"><div className="absolute -right-20 -top-20 size-80 rounded-full border-[36px] border-[#c2d9ca] opacity-60" /><div className="relative mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[1fr_.9fr] lg:gap-24"><div><SectionLabel index="06" label="Let’s work together" /><h2 className="mt-10 max-w-[600px] font-display text-[clamp(2.9rem,5vw,5.6rem)] font-semibold leading-[.94] tracking-[-.07em]">Tell us where the pressure is.</h2><p className="mt-8 max-w-[470px] text-[17px] leading-8 text-[#57776b]">We’ll map the right support around it. Share a little about your business and we’ll come back with a thoughtful next step.</p><div className="mt-12 space-y-4 border-t border-[#a8c2b1] pt-6 text-sm text-[#315b4d]"><div className="flex items-center gap-3"><MessageCircle size={17} className="text-[#0b4f3b]" /> +254 700 000 000</div><div className="flex items-center gap-3"><Send size={17} className="text-[#0b4f3b]" /> info@callcarebpo.com</div><div className="flex items-center gap-3"><BriefcaseBusiness size={17} className="text-[#0b4f3b]" /> Nairobi, Kenya</div></div></div><form onSubmit={handleSubmit} className="bg-[#f6f3ec] p-6 shadow-[0_20px_60px_rgba(11,79,59,.1)] sm:p-8"><div className="mb-7 flex items-center justify-between"><span className="eyebrow text-[#76958b]">Start a conversation</span><Sparkles size={18} className="text-[#d99a3d]" /></div>{submitted ? <div className="flex min-h-[340px] flex-col items-start justify-center"><span className="mb-5 grid size-12 place-items-center rounded-full bg-[#dceae0] text-[#0b4f3b]"><Check /></span><h3 className="font-display text-3xl font-semibold tracking-[-.05em]">Message ready.</h3><p className="mt-3 max-w-[320px] text-sm leading-6 text-[#57776b]">Thanks for reaching out. We’ll review the details and follow up with the next step.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-8 text-sm font-bold text-[#0b4f3b] underline underline-offset-4">Send another message</button></div> : <div className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#76958b]">Your name</span><input required name="name" className="w-full border-b border-[#b8cbc0] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#9ab1a5] focus:border-[#0b4f3b]" placeholder="Jane Smith" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#76958b]">Work email</span><input required type="email" name="email" className="w-full border-b border-[#b8cbc0] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#9ab1a5] focus:border-[#0b4f3b]" placeholder="jane@company.com" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#76958b]">What would you like support with?</span><textarea required name="message" rows={4} className="w-full resize-none border-b border-[#b8cbc0] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#9ab1a5] focus:border-[#0b4f3b]" placeholder="Tell us what is taking up too much of your team’s time..." /></label><button className="mt-3 inline-flex w-full items-center justify-center gap-3 bg-[#0b4f3b] px-5 py-4 text-sm font-bold text-white hover:bg-[#12644c]">Send enquiry <ArrowUpRight size={17} /></button><p className="text-center text-[11px] leading-5 text-[#8ba49a]">We’ll use your details only to respond to this enquiry.</p></div>}</form></div></section>
      </main>

      <footer className="bg-[#073a2d] px-5 py-10 text-[#c5d9cd] lg:px-10"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><Logo full /><p className="mt-5 max-w-[260px] text-sm leading-6 text-[#9fbdad]">Your partner in growth. Our commitment to excellence.</p></div><div className="flex flex-col gap-2 text-right text-xs text-[#9fbdad]"><a href="mailto:info@callcarebpo.com" className="hover:text-white">info@callcarebpo.com</a><a href="tel:+254700000000" className="hover:text-white">+254 700 000 000</a><span>© {new Date().getFullYear()} CallCare BPO</span></div></div></footer>
    </div>
  );
}
