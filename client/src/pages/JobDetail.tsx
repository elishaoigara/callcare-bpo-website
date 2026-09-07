import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { getJobBySlug } from "@/data/careers";
import NotFound from "@/pages/NotFound";

export default function JobDetail() {
  const [, params] = useRoute("/careers/jobs/:slug");
  const job = params?.slug ? getJobBySlug(params.slug) : undefined;

  if (!job) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#fbfdfc] text-[#173226]">
      <header className="border-b border-[#173226]/10 bg-[#fbfdfc]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 lg:px-10"><Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e] hover:text-[#173226]"><ArrowLeft size={16} /> Back to careers</Link><Link href="/" className="font-display text-lg font-bold tracking-[-.05em]">CALLCARE <span className="text-[#338461]">BPO</span></Link></div>
      </header>
      <main>
        <section className="relative overflow-hidden bg-[#173226] px-5 py-20 text-white lg:px-10 lg:py-28"><div className="absolute -right-24 -top-28 size-[420px] rounded-full border border-[#c9a227]/25" /><div className="relative mx-auto max-w-[1100px]"><p className="eyebrow text-[#a8c9b7]">{job.department}</p><h1 className="mt-5 max-w-[780px] font-display text-[clamp(3rem,6vw,6.2rem)] font-semibold leading-[.92] tracking-[-.08em]">{job.title}</h1><p className="mt-7 max-w-[650px] text-lg leading-8 text-[#d2e4d8]">{job.summary}</p><div className="mt-10 grid max-w-[780px] gap-4 border-t border-white/20 pt-6 sm:grid-cols-4">{[[MapPin, job.location], [BriefcaseBusiness, job.employmentType], [Clock3, job.workArrangement], [ShieldCheck, "People-first team"]].map(([Icon, value]) => <div key={String(value)} className="flex items-start gap-3 text-sm text-[#d2e4d8]"><Icon size={17} className="mt-0.5 shrink-0 text-[#c9a227]" />{String(value)}</div>)}</div></div></section>
        <section className="px-5 py-16 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-[1100px] gap-14 lg:grid-cols-[1.25fr_.75fr] lg:gap-24"><div className="space-y-14"><div><p className="section-kicker">About the role</p><p className="mt-5 max-w-[680px] text-[17px] leading-8 text-[#516b5e]">{job.description}</p></div><div><p className="section-kicker">Responsibilities</p><div className="mt-5 space-y-4">{job.responsibilities.map((item) => <div key={item} className="flex gap-4 border-b border-[#d2dfd6] pb-4 text-[15px] leading-7 text-[#315b4d]"><span className="mt-2 size-2 shrink-0 rounded-full bg-[#c9a227]" />{item}</div>)}</div></div><div><p className="section-kicker">Requirements</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{job.requirements.map((item) => <div key={item} className="flex gap-3 text-[15px] leading-7 text-[#315b4d]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dbeae0] text-[#27503e"><ShieldCheck size={14} /></span>{item}</div>)}</div></div><div><p className="section-kicker">Preferred qualifications</p><div className="mt-5 space-y-3 text-[15px] leading-7 text-[#315b4d]">{job.preferredQualifications.map((item) => <p key={item}>• {item}</p>)}</div></div></div><aside className="h-fit border border-[#c4d6cb] bg-[#eaf3ee] p-7 lg:sticky lg:top-8"><p className="eyebrow text-[#5f7b6c]">Ready to apply?</p><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-.05em]">Bring your best work to CallCare.</h2><p className="mt-4 text-sm leading-6 text-[#516b5e]">The application form will be connected to the private recruitment system in the next preview phase.</p><a href="mailto:info@callcarebpo.com?subject=Application%20-%20${encodeURIComponent(job.title)}" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#173226]">Express interest <ArrowUpRight size={17} /></a><p className="mt-4 text-center text-[11px] leading-5 text-[#79958a]">Please include your CV and the role title in your email.</p></aside></div></section>
      </main>
    </div>
  );
}
