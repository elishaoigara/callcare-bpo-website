import { useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, Search, Settings2, UsersRound } from "lucide-react";
import { Link } from "wouter";

type Status = "New" | "Screening" | "Shortlisted" | "Interview" | "Assessment" | "Selected" | "Hired" | "Rejected";

type Application = {
  id: string;
  candidate: string;
  email: string;
  position: string;
  submitted: string;
  status: Status;
  location: string;
};

const applications: Application[] = [
  { id: "APP-1042", candidate: "Jane Doe", email: "jane@example.com", position: "Customer Service Representative", submitted: "Today, 09:42", status: "New", location: "Nairobi" },
  { id: "APP-1041", candidate: "John Smith", email: "john@example.com", position: "Sales Appointment Setter", submitted: "Yesterday", status: "Interview", location: "Mombasa" },
  { id: "APP-1040", candidate: "Mary Ann", email: "mary@example.com", position: "Customer Service Representative", submitted: "7 Sept 2026", status: "Shortlisted", location: "Nakuru" },
  { id: "APP-1039", candidate: "Peter Otieno", email: "peter@example.com", position: "Sales Appointment Setter", submitted: "6 Sept 2026", status: "Screening", location: "Kisumu" },
];

const statusStyles: Record<Status, string> = {
  New: "bg-[#e7f3ec] text-[#27503e]",
  Screening: "bg-[#f6efd8] text-[#816519]",
  Shortlisted: "bg-[#e5eef7] text-[#285777]",
  Interview: "bg-[#eee6f7] text-[#68428a]",
  Assessment: "bg-[#f8e8dd] text-[#95522e]",
  Selected: "bg-[#dff0e8] text-[#176b4e]",
  Hired: "bg-[#ccebdc] text-[#125a3f]",
  Rejected: "bg-[#f5e2e0] text-[#9a4139]",
};

export default function RecruitmentDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const filtered = useMemo(() => applications.filter((application) => {
    const matchesQuery = `${application.candidate} ${application.position}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || application.status === status;
    return matchesQuery && matchesStatus;
  }), [query, status]);

  return (
    <div className="min-h-screen bg-[#f3f7f4] text-[#173226]">
      <header className="border-b border-[#173226]/10 bg-[#fbfdfc]"><div className="flex items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="font-display text-xl font-bold tracking-[-.05em]">CALLCARE <span className="text-[#338461]">BPO</span></Link><div className="flex items-center gap-4"><span className="hidden rounded-full bg-[#eaf3ee] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#27503e] sm:inline-flex">Preview workspace</span><div className="flex items-center gap-3 border-l border-[#d5e2d9] pl-4"><span className="grid size-9 place-items-center rounded-full bg-[#27503e] text-sm font-bold text-white">EO</span><span className="hidden text-sm font-semibold sm:block">Elisha Oigara</span><ChevronDown size={15} className="text-[#769388]" /></div></div></div></header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden min-h-[calc(100vh-73px)] w-[230px] shrink-0 border-r border-[#d5e2d9] bg-[#fbfdfc] p-5 lg:block"><p className="eyebrow mb-5 text-[#7d9e92]">Recruitment</p><nav className="space-y-1"><a href="#overview" className="flex items-center gap-3 rounded-lg bg-[#eaf3ee] px-3 py-2.5 text-sm font-bold text-[#27503e]"><LayoutDashboard size={17} /> Overview</a><a href="#applications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468] hover:bg-[#f1f6f3]"><UsersRound size={17} /> Applications <span className="ml-auto rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-bold text-[#173226]">12</span></a><a href="#jobs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468] hover:bg-[#f1f6f3]"><BriefcaseBusiness size={17} /> Jobs</a><a href="#settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468] hover:bg-[#f1f6f3]"><Settings2 size={17} /> Settings</a></nav><div className="mt-12 border-t border-[#d5e2d9] pt-5"><Link href="/careers" className="text-xs font-bold text-[#27503e] hover:text-[#173226]">View careers site →</Link></div></aside>
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div id="overview" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">Good morning, Elisha</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Recruitment overview</h1><p className="mt-3 max-w-[550px] text-sm leading-6 text-[#6c8479]">A calm place to see what came in, what needs attention, and where each candidate is in the process.</p></div><button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#27503e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#173226]"><BriefcaseBusiness size={16} /> Add a job</button></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["12", "Applications", "all time"], ["4", "New this week", "needs review"], ["3", "In interview", "active process"], ["2", "Open positions", "published"]].map(([value, label, note]) => <div key={label} className="border border-[#d5e2d9] bg-[#fbfdfc] p-5"><p className="font-display text-4xl font-semibold tracking-[-.06em] text-[#27503e]">{value}</p><p className="mt-3 text-sm font-bold text-[#315b4d]">{label}</p><p className="mt-1 text-xs uppercase tracking-[.12em] text-[#8aa298]">{note}</p></div>)}</div>
          <section id="applications" className="mt-8 border border-[#d5e2d9] bg-[#fbfdfc]"><div className="flex flex-col justify-between gap-4 border-b border-[#d5e2d9] p-5 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl font-semibold tracking-[-.04em]">Applications</h2><p className="mt-1 text-sm text-[#7a9186]">Review candidates and move them through the hiring process.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex items-center gap-2 border border-[#d5e2d9] px-3 py-2 text-sm text-[#6d8579]"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates" className="w-full bg-transparent outline-none placeholder:text-[#9bb0a6] sm:w-40" /></label><select value={status} onChange={(event) => setStatus(event.target.value as "All" | Status)} className="border border-[#d5e2d9] bg-white px-3 py-2 text-sm text-[#577468] outline-none"><option value="All">All statuses</option>{Object.keys(statusStyles).map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f3f7f4] text-[10px] uppercase tracking-[.14em] text-[#799287]"><tr><th className="px-5 py-3 font-bold">Candidate</th><th className="px-5 py-3 font-bold">Position</th><th className="px-5 py-3 font-bold">Submitted</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Action</th></tr></thead><tbody className="divide-y divide-[#e0e9e3]">{filtered.map((application) => <tr key={application.id} className="hover:bg-[#fbfdfc]"><td className="px-5 py-4"><p className="font-semibold text-[#27503e]">{application.candidate}</p><p className="mt-1 text-xs text-[#8aa298]">{application.location} · {application.email}</p></td><td className="px-5 py-4 text-sm text-[#577468]">{application.position}</td><td className="px-5 py-4 text-sm text-[#577468]">{application.submitted}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[application.status]}`}>{application.status}</span></td><td className="px-5 py-4"><button className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e] hover:text-[#173226]">Open <ArrowUpRight size={15} /></button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#7a9186]">No applications match your filters.</td></tr>}</tbody></table></div></section>
          <section id="jobs" className="mt-8 grid gap-4 lg:grid-cols-2"><div className="border border-[#d5e2d9] bg-[#fbfdfc] p-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-2xl font-semibold tracking-[-.04em]">Open jobs</h2><p className="mt-1 text-sm text-[#7a9186]">Keep public vacancies current.</p></div><BriefcaseBusiness size={20} className="text-[#c9a227]" /></div><div className="mt-6 space-y-4"><div className="flex items-center justify-between border-t border-[#e0e9e3] pt-4"><div><p className="text-sm font-bold text-[#315b4d]">Customer Service Representative</p><p className="mt-1 text-xs text-[#8aa298]">12 applications · Published</p></div><button className="text-xs font-bold text-[#27503e]">Edit</button></div><div className="flex items-center justify-between border-t border-[#e0e9e3] pt-4"><div><p className="text-sm font-bold text-[#315b4d]">Sales Appointment Setter</p><p className="mt-1 text-xs text-[#8aa298]">8 applications · Published</p></div><button className="text-xs font-bold text-[#27503e]">Edit</button></div></div></div><div id="settings" className="border border-[#d5e2d9] bg-[#27503e] p-5 text-white"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#a8c9b7]">Owner controls</p><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-.04em]">Keep the handoff clear.</h2></div><FileText size={21} className="text-[#c9a227]" /></div><p className="mt-5 text-sm leading-6 text-[#c8ded2]">Recruiter access, notification emails, privacy settings, and company details will live here when the secure backend is connected.</p><button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#27503e]">Open settings <ArrowUpRight size={15} /></button></div></section>
        </main>
      </div>
    </div>
  );
}
