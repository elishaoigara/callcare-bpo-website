import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, Loader2, LogOut, Search, Settings2, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Status = "new" | "screening" | "shortlisted" | "interview" | "assessment" | "selected" | "hired" | "rejected";
type Application = { id: string; full_name: string; email: string; phone: string | null; location: string | null; years_experience: string | null; availability: string | null; linkedin_url: string | null; portfolio_url: string | null; introduction: string; status: Status; cv_storage_path: string | null; cv_original_name: string | null; created_at: string; };

const statuses: Status[] = ["new", "screening", "shortlisted", "interview", "assessment", "selected", "hired", "rejected"];
const statusStyles: Record<Status, string> = { new: "bg-[#e7f3ec] text-[#27503e]", screening: "bg-[#f6efd8] text-[#816519]", shortlisted: "bg-[#e5eef7] text-[#285777]", interview: "bg-[#eee6f7] text-[#68428a]", assessment: "bg-[#f8e8dd] text-[#95522e]", selected: "bg-[#dff0e8] text-[#176b4e]", hired: "bg-[#ccebdc] text-[#125a3f]", rejected: "bg-[#f5e2e0] text-[#9a4139]" };
const label = (status: Status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function RecruitmentDashboard() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => { if (mounted) { setUserEmail(data.user?.email ?? null); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user?.email ?? null));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !userEmail) return;
    setLoading(true);
    supabase.from("applications").select("*").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError("Your account is not yet authorized as a recruiter. Add your user ID to recruiter_users in Supabase.");
      else setApplications((data ?? []) as Application[]);
      setLoading(false);
    });
  }, [userEmail]);

  const filtered = useMemo(() => applications.filter((application) => {
    const text = `${application.full_name} ${application.email} ${application.introduction}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "all" || application.status === status);
  }), [applications, query, status]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setWorking(true); setError(""); setMessage("");
    const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    if (signInError) setError(signInError.message); else setMessage("Check your inbox for the secure founder sign-in link.");
    setWorking(false);
  }

  async function updateStatus(application: Application, nextStatus: Status) {
    if (!supabase) return;
    setWorking(true); setError("");
    const { error: updateError } = await supabase.from("applications").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", application.id);
    if (updateError) setError(updateError.message);
    else { const updated = { ...application, status: nextStatus }; setApplications((items) => items.map((item) => item.id === application.id ? updated : item)); setSelected(updated); }
    setWorking(false);
  }

  async function openCv(application: Application) {
    if (!supabase || !application.cv_storage_path) return;
    const { data, error: signedError } = await supabase.storage.from("candidate-cvs").createSignedUrl(application.cv_storage_path, 300);
    if (signedError) setError(signedError.message); else if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (!isSupabaseConfigured) return <SetupState />;
  if (loading && !userEmail) return <div className="grid min-h-screen place-items-center bg-[#f3f7f4] text-[#27503e]"><Loader2 className="animate-spin" /></div>;
  if (!userEmail) return <LoginState email={email} setEmail={setEmail} onSubmit={signIn} working={working} message={message} error={error} />;

  const counts = statuses.reduce<Record<string, number>>((acc, item) => { acc[item] = applications.filter((application) => application.status === item).length; return acc; }, {});
  return <div className="min-h-screen bg-[#f3f7f4] text-[#173226]"><header className="border-b border-[#173226]/10 bg-[#fbfdfc]"><div className="flex items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="font-display text-xl font-bold tracking-[-.05em]">CALLCARE <span className="text-[#338461]">BPO</span></Link><div className="flex items-center gap-4"><span className="hidden rounded-full bg-[#eaf3ee] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#27503e] sm:inline-flex">Founder workspace</span><span className="hidden text-sm text-[#577468] sm:inline">{userEmail}</span><button onClick={() => supabase?.auth.signOut()} className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e]"><LogOut size={16} /> Sign out</button></div></div></header><div className="mx-auto flex max-w-[1440px]"><aside className="hidden min-h-[calc(100vh-73px)] w-[230px] shrink-0 border-r border-[#d5e2d9] bg-[#fbfdfc] p-5 lg:block"><p className="eyebrow mb-5 text-[#7d9e92]">Recruitment</p><nav className="space-y-1"><a href="#overview" className="flex items-center gap-3 rounded-lg bg-[#eaf3ee] px-3 py-2.5 text-sm font-bold text-[#27503e]"><LayoutDashboard size={17} /> Overview</a><a href="#applications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468]"><UsersRound size={17} /> Applications <span className="ml-auto rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-bold text-[#173226]">{applications.length}</span></a><a href="#settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468]"><Settings2 size={17} /> Settings</a></nav><div className="mt-12 border-t border-[#d5e2d9] pt-5"><Link href="/careers" className="text-xs font-bold text-[#27503e]">View careers site →</Link></div></aside><main className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10"><div id="overview" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">Founder workspace</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.06em] sm:text-5xl">Recruitment overview</h1><p className="mt-3 max-w-[550px] text-sm leading-6 text-[#6c8479]">Review talent-pool candidates, keep notes, and move people through the next step.</p></div></div>{error && <p className="mt-5 border border-[#e7b4ad] bg-[#fff5f3] px-4 py-3 text-sm text-[#9a4139]">{error}</p>}{message && <p className="mt-5 border border-[#9fc2ae] bg-[#eaf3ee] px-4 py-3 text-sm text-[#27503e]">{message}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[applications.length, "Applications", "all time"], [counts.new ?? 0, "New", "needs review"], [counts.interview ?? 0, "In interview", "active process"], [counts.selected ?? 0, "Selected", "next step"]].map(([value, labelText, note]) => <div key={String(labelText)} className="border border-[#d5e2d9] bg-[#fbfdfc] p-5"><p className="font-display text-4xl font-semibold tracking-[-.06em] text-[#27503e]">{String(value)}</p><p className="mt-3 text-sm font-bold text-[#315b4d]">{String(labelText)}</p><p className="mt-1 text-xs uppercase tracking-[.12em] text-[#8aa298]">{String(note)}</p></div>)}</div><section id="applications" className="mt-8 border border-[#d5e2d9] bg-[#fbfdfc]"><div className="flex flex-col justify-between gap-4 border-b border-[#d5e2d9] p-5 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl font-semibold tracking-[-.04em]">Applications</h2><p className="mt-1 text-sm text-[#7a9186]">Review candidates and move them through the recruitment pipeline.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex items-center gap-2 border border-[#d5e2d9] px-3 py-2 text-sm text-[#6d8579]"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates" className="w-full bg-transparent outline-none placeholder:text-[#9bb0a6] sm:w-40" /></label><select value={status} onChange={(event) => setStatus(event.target.value as "all" | Status)} className="border border-[#d5e2d9] bg-white px-3 py-2 text-sm text-[#577468] outline-none"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f3f7f4] text-[10px] uppercase tracking-[.14em] text-[#799287]"><tr><th className="px-5 py-3 font-bold">Candidate</th><th className="px-5 py-3 font-bold">Role</th><th className="px-5 py-3 font-bold">Submitted</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Action</th></tr></thead><tbody className="divide-y divide-[#e0e9e3]">{filtered.map((application) => <tr key={application.id} className="hover:bg-[#fbfdfc]"><td className="px-5 py-4"><p className="font-semibold text-[#27503e]">{application.full_name}</p><p className="mt-1 text-xs text-[#8aa298]">{application.location || "Location not provided"} · {application.email}</p></td><td className="px-5 py-4 text-sm text-[#577468]">{application.introduction.split("\n")[0]}</td><td className="px-5 py-4 text-sm text-[#577468]">{new Date(application.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><select value={application.status} onChange={(event) => updateStatus(application, event.target.value as Status)} className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-bold outline-none ${statusStyles[application.status]}`}>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></td><td className="px-5 py-4"><button onClick={() => setSelected(application)} className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e]">Open <ArrowUpRight size={15} /></button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#7a9186]">{loading ? "Loading applications..." : "No applications match your filters."}</td></tr>}</tbody></table></div></section>{selected && <section className="mt-8 border border-[#d5e2d9] bg-[#fbfdfc] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="section-kicker">Candidate detail</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-.05em]">{selected.full_name}</h2><p className="mt-2 text-sm text-[#577468]">{selected.email} {selected.phone && `· ${selected.phone}`}</p></div><button onClick={() => setSelected(null)} className="text-sm font-bold text-[#27503e]">Close</button></div><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.75fr]"><div><p className="text-sm leading-7 text-[#516b5e]">{selected.introduction.split("\n").slice(1).join("\n") || selected.introduction}</p><div className="mt-6 flex flex-wrap gap-3 text-sm text-[#577468]">{selected.years_experience && <span className="rounded-full bg-[#eaf3ee] px-3 py-2">{selected.years_experience}</span>}{selected.availability && <span className="rounded-full bg-[#eaf3ee] px-3 py-2">Available: {selected.availability}</span>}{selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#eaf3ee] px-3 py-2 font-bold text-[#27503e]">LinkedIn</a>}{selected.portfolio_url && <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#eaf3ee] px-3 py-2 font-bold text-[#27503e]">Portfolio</a>}</div></div><div className="border-l border-[#d5e2d9] pl-6"><p className="eyebrow text-[#7d9e92]">Candidate file</p>{selected.cv_storage_path ? <button onClick={() => openCv(selected)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#27503e] px-4 py-3 text-sm font-bold text-white"><FileText size={16} /> Open {selected.cv_original_name || "CV"}</button> : <p className="mt-4 text-sm text-[#7a9186]">No CV uploaded.</p>}</div></div></section>}<section id="settings" className="mt-8 border border-[#d5e2d9] bg-[#27503e] p-6 text-white"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#a8c9b7]">Owner controls</p><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-.04em]">Keep the handoff clear.</h2></div><FileText size={21} className="text-[#c9a227]" /></div><p className="mt-5 max-w-2xl text-sm leading-6 text-[#c8ded2]">Supabase keeps applicant records protected behind recruiter access. Add the founder’s user ID to the recruiter_users table before reviewing live submissions.</p></section></main></div></div>;
}

function LoginState({ email, setEmail, onSubmit, working, message, error }: { email: string; setEmail: (value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; working: boolean; message: string; error: string }) {
  return <div className="grid min-h-screen place-items-center bg-[#f3f7f4] px-5"><div className="w-full max-w-md border border-[#d5e2d9] bg-[#fbfdfc] p-8 shadow-[0_25px_60px_rgba(23,50,38,.08)]"><p className="eyebrow text-[#7d9e92]">Founder workspace</p><h1 className="mt-4 font-display text-4xl font-semibold tracking-[-.06em]">Sign in to review candidates.</h1><p className="mt-4 text-sm leading-6 text-[#6c8479]">We will email you a secure sign-in link. No shared password is needed.</p><form onSubmit={onSubmit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-[#315b4d]">Founder email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-[#c4d6cb] bg-white px-3 py-3 outline-none" placeholder="founder@callcarebpo.com" /></label><button disabled={working} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{working && <Loader2 size={16} className="animate-spin" />} Send secure link</button></form>{message && <p className="mt-5 border border-[#9fc2ae] bg-[#eaf3ee] px-4 py-3 text-sm text-[#27503e]">{message}</p>}{error && <p className="mt-5 border border-[#e7b4ad] bg-[#fff5f3] px-4 py-3 text-sm text-[#9a4139]">{error}</p>}</div></div>;
}

function SetupState() {
  return <div className="grid min-h-screen place-items-center bg-[#f3f7f4] px-5"><div className="max-w-xl border border-[#d5e2d9] bg-[#fbfdfc] p-8"><p className="eyebrow text-[#7d9e92]">Supabase setup required</p><h1 className="mt-4 font-display text-4xl font-semibold tracking-[-.06em]">The recruitment workspace is ready to connect.</h1><p className="mt-4 text-sm leading-7 text-[#6c8479]">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the staging environment, then run the SQL in <code>supabase/schema.sql</code>. After creating the founder user in Supabase Auth, add that user to recruiter_users.</p><Link href="/careers" className="mt-7 inline-flex rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white">Back to Careers</Link></div></div>;
}
