import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Globe2,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import { openJobs } from "@/data/careers";

const values = [
  {
    icon: GraduationCap,
    title: "Grow with intention",
    text: "Build practical skills, take ownership, and keep moving toward the work you want to do next.",
  },
  {
    icon: Globe2,
    title: "See the wider world",
    text: "Work alongside global clients and learn how thoughtful support helps businesses scale.",
  },
  {
    icon: Sparkles,
    title: "Keep learning",
    text: "Training, feedback, and clear expectations help good people become exceptional professionals.",
  },
  {
    icon: HeartHandshake,
    title: "Bring your whole self",
    text: "We are building a people-first culture grounded in respect, communication, and trust.",
  },
];

const qualities = ["Reliability", "Accountability", "Coachability", "Resilience", "Professionalism", "Communication"];

export default function Careers() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfdfc] text-[#173226]">
      <header className="sticky top-0 z-40 border-b border-[#173226]/10 bg-[#fbfdfc]/90 shadow-[0_10px_30px_-26px_rgba(23,50,38,.45)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="CallCare BPO home">
            <span className="grid size-10 place-items-center rounded-[13px] border border-[#c9a227]/35 bg-white">
              <span className="font-display text-sm font-bold text-[#27503e]">CC</span>
            </span>
            <span className="font-display text-[16px] font-bold tracking-[-.05em]">CALLCARE <span className="text-[#338461]">BPO</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#4d6459] md:flex" aria-label="Careers navigation">
            <a href="#why-callcare" className="hover:text-[#27503e]">Why CallCare</a>
            <a href="#positions" className="hover:text-[#27503e]">Open positions</a>
            <a href="#talent-network" className="hover:text-[#27503e]">Talent network</a>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#27503e] px-4 py-2.5 text-white hover:bg-[#173226]">Main site <ArrowUpRight size={14} /></Link>
          </nav>
          <Link href="#positions" className="inline-flex items-center gap-2 rounded-full bg-[#27503e] px-4 py-2.5 text-[12px] font-bold text-white md:hidden">Jobs <ArrowDownRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="hero-noise relative isolate overflow-hidden bg-[#173226] text-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_84%_18%,rgba(201,162,39,.22),transparent_28%),linear-gradient(118deg,#173226_0%,#0b4f3b_58%,#27503e_100%)]" />
          <div className="absolute -right-24 top-20 -z-10 size-[420px] rounded-full border border-[#c9a227]/30" />
          <div className="absolute right-[12%] top-36 -z-10 size-40 rounded-full border border-white/10" />
          <div className="mx-auto grid min-h-[610px] max-w-[1280px] items-end gap-14 px-5 pb-16 pt-28 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-20">
            <div className="reveal max-w-[760px]">
              <div className="mb-6 flex items-center gap-3 text-[#d6e6db]"><span className="h-px w-12 bg-[#c9a227]" /><span className="eyebrow">Careers at CallCare</span></div>
              <h1 className="font-display max-w-[760px] text-balance text-[clamp(3.4rem,7vw,7rem)] font-semibold leading-[.9] tracking-[-.08em]">Build your career. <span className="font-editorial italic text-[#c9a227]">Do work that matters.</span></h1>
              <p className="mt-7 max-w-[560px] text-[17px] leading-8 text-[#e4eee7]/80">Join a growing Kenyan BPO team helping ambitious businesses deliver better experiences, stay organized, and make room for their next stage.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4"><a href="#positions" className="inline-flex items-center gap-3 rounded-full bg-[#fbfdfc] px-5 py-3.5 text-sm font-bold text-[#173226] hover:bg-white">View open positions <ArrowDownRight size={17} /></a><a href="#talent-network" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-white/80 hover:text-white">Join our talent network <ArrowUpRight size={17} /></a></div>
            </div>
            <div className="hidden lg:block">
              <div className="relative ml-auto max-w-[390px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm"><div className="flex items-center justify-between border-b border-white/20 pb-4"><span className="eyebrow text-[#b8d0c3]">Field note / people</span><span className="size-2 rounded-full bg-[#c9a227]" /></div><p className="mt-9 font-display text-3xl leading-tight">The right support starts with the right people.</p><div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[.16em] text-[#b8d0c3]"><span>Learn</span><span>Contribute</span><span>Grow</span></div></div>
            </div>
          </div>
        </section>

        <section id="why-callcare" className="paper-grid section-rule px-5 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1280px]"><div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24"><div><p className="section-kicker">Why CallCare</p><h2 className="mt-5 max-w-[430px] font-display text-[clamp(2.7rem,4.6vw,4.7rem)] font-semibold leading-[.95] tracking-[-.07em]">A place to do your <span className="font-editorial italic text-[#27503e]">best work.</span></h2></div><div><p className="max-w-[650px] text-[17px] leading-8 text-[#516b5e]">We are building a team where high standards and human support can exist in the same room. You will be trusted with meaningful work, given room to learn, and expected to follow through.</p><div className="mt-12 grid gap-4 sm:grid-cols-2">{values.map(({ icon: Icon, title, text }) => <div key={title} className="border border-[#c4d6cb] bg-[#fbfdfc] p-6"><span className="grid size-11 place-items-center rounded-full bg-[#dbeae0] text-[#27503e]"><Icon size={20} strokeWidth={1.7} /></span><h3 className="mt-8 font-display text-2xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#516b5e]">{text}</p></div>)}</div></div></div></div>
        </section>

        <section className="section-rule bg-[#eaf3ee] px-5 py-24 lg:px-10 lg:py-32"><div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-28"><div><p className="section-kicker">What we look for</p><h2 className="mt-5 max-w-[440px] font-display text-[clamp(2.7rem,4.5vw,4.6rem)] font-semibold leading-[.95] tracking-[-.07em]">Good work is built on <span className="font-editorial italic text-[#27503e]">good habits.</span></h2></div><div className="grid gap-3 sm:grid-cols-2">{qualities.map((quality, index) => <div key={quality} className="flex items-center gap-4 border-b border-[#bfd2c6] py-5"><span className="font-display text-2xl text-[#c9a227]">0{index + 1}</span><span className="text-base font-semibold text-[#315b4d]">{quality}</span><Check size={17} className="ml-auto text-[#27503e]" /></div>)}</div></div></section>

        <section id="positions" className="section-rule bg-[#27503e] px-5 py-24 text-white lg:px-10 lg:py-32"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><p className="section-kicker text-[#a8c9b7]">Open positions</p><h2 className="mt-5 max-w-[620px] font-display text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[.94] tracking-[-.07em]">Find your next <span className="font-editorial italic text-[#c9a227]">move.</span></h2></div><p className="max-w-[310px] text-sm leading-6 text-[#b8d0c3]">Roles change as we grow. If you see a position that fits, we would like to hear from you.</p></div><div className="mt-14 grid gap-4 lg:grid-cols-2">{openJobs.map((job) => <article key={job.id} className="group border border-white/20 bg-white/[.06] p-7 transition hover:-translate-y-1 hover:bg-white/[.1]"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow text-[#a8c9b7]">{job.department}</p><h3 className="mt-3 font-display text-3xl font-semibold tracking-[-.05em]">{job.title}</h3></div><BriefcaseBusiness className="shrink-0 text-[#c9a227]" size={24} strokeWidth={1.6} /></div><p className="mt-6 max-w-[520px] text-sm leading-6 text-[#d2e4d8]">{job.summary}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-[11px] font-bold uppercase tracking-[.12em] text-[#a8c9b7]"><span>{job.location}</span><span>{job.employmentType}</span><span>{job.workArrangement}</span></div><Link href={`/careers/jobs/${job.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#c9a227]">View position <ArrowUpRight size={17} /></Link></article>)}</div></div></section>

        <section id="talent-network" className="paper-grid section-rule px-5 py-24 lg:px-10 lg:py-32"><div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-28"><div><p className="section-kicker">No perfect match yet?</p><h2 className="mt-5 max-w-[680px] font-display text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[.94] tracking-[-.07em]">Keep the conversation <span className="font-editorial italic text-[#27503e]">open.</span></h2><p className="mt-7 max-w-[560px] text-[17px] leading-8 text-[#516b5e]">Join our talent network and tell us what you do best. When a suitable opportunity opens, we will know where to look.</p><a href="mailto:info@callcarebpo.com?subject=CallCare%20Talent%20Network" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#173226]">Join the talent network <ArrowUpRight size={17} /></a></div><div className="border border-[#c4d6cb] bg-[#eaf3ee] p-7"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-full bg-[#27503e] text-white"><UsersRound size={21} /></span><div><p className="eyebrow text-[#5f7b6c]">Talent network</p><p className="mt-1 font-display text-2xl font-semibold">Keep your next move in view.</p></div></div><div className="mt-8 space-y-3 border-t border-[#bfd2c6] pt-6 text-sm text-[#516b5e]"><p>Share your background and the work you want to grow into.</p><p>We will keep your details with our recruitment team for future opportunities.</p></div></div></div></section>
      </main>

      <footer className="bg-[#173226] px-5 py-9 text-[#c5d9cd] lg:px-10"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 sm:flex-row sm:items-center"><p className="font-display text-lg font-semibold text-white">CALLCARE <span className="text-[#c9a227]">BPO</span></p><div className="flex flex-wrap gap-4 text-xs text-[#9fbdad]"><Link href="/" className="hover:text-white">Main website</Link><a href="mailto:info@callcarebpo.com" className="hover:text-white">info@callcarebpo.com</a><span>© {new Date().getFullYear()} CallCare BPO</span></div></div></footer>
    </div>
  );
}
