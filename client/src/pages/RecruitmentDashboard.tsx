import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings2,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

import RecruitmentAccess from "@/components/RecruitmentAccess";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PasswordSettings from "@/components/PasswordSettings";
import {
  applicationRole,
  applicationIntroduction,
  safeWebUrl,
} from "@/lib/recruitment";

type Status =
  | "new"
  | "screening"
  | "shortlisted"
  | "interview"
  | "assessment"
  | "selected"
  | "hired"
  | "rejected";
type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  years_experience: string | null;
  availability: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  introduction: string | null;
  job_title?: string | null;
  status: Status;
  cv_storage_path: string | null;
  cv_original_name: string | null;
  created_at: string;
};

const statuses: Status[] = [
  "new",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "selected",
  "hired",
  "rejected",
];
const statusStyles: Record<Status, string> = {
  new: "bg-[#e7f3ec] text-[#27503e]",
  screening: "bg-[#f6efd8] text-[#816519]",
  shortlisted: "bg-[#e5eef7] text-[#285777]",
  interview: "bg-[#eee6f7] text-[#68428a]",
  assessment: "bg-[#f8e8dd] text-[#95522e]",
  selected: "bg-[#dff0e8] text-[#176b4e]",
  hired: "bg-[#ccebdc] text-[#125a3f]",
  rejected: "bg-[#f5e2e0] text-[#9a4139]",
};
const label = (status: Status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function RecruitmentDashboard() {
  return (
    <RecruitmentAccess>
      {({ email, signOut }) => (
        <RecruitmentWorkspace userEmail={email} signOut={signOut} />
      )}
    </RecruitmentAccess>
  );
}

export function RecruitmentWorkspace({
  userEmail,
  signOut,
}: {
  userEmail: string;
  signOut: () => Promise<void>;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [reload, setReload] = useState(0);
  const [cvLink, setCvLink] = useState<{ id: string; url: string } | null>(
    null
  );
  const [cvBusy, setCvBusy] = useState(false);
  const openButton = useRef<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const mutationPending = useRef(false);
  const mounted = useRef(true);
  const pendingCvWindows = useRef(new Set<Window>());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingCvWindows.current.forEach(tab => tab.close());
      pendingCvWindows.current.clear();
    };
  }, []);
  const [error, setError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    setLoading(true);
    setError("");
    const controller = new AbortController();
    async function loadApplications() {
      try {
        // Page through results; Supabase caps each response at its configured limit.
        const rows: Application[] = [];
        for (let offset = 0; ; offset += 100) {
          const { data, error: queryError } = await client!
            .from("applications")
            .select("*, jobs(title)")
            .order("created_at", { ascending: false })
            .order("id")
            .range(offset, offset + 99)
            .abortSignal(controller.signal);
          if (queryError) throw queryError;
          const page = data ?? [];
          rows.push(
            ...page.map(row => ({ ...row, job_title: row.jobs?.title ?? null }))
          );
          if (page.length < 100) break;
        }
        if (!controller.signal.aborted) setApplications(rows);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "We couldn't load applications. Please refresh and try again."
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadApplications();
    return () => controller.abort();
  }, [reload]);

  const filtered = useMemo(
    () =>
      applications.filter(application => {
        const text =
          `${application.full_name} ${application.email} ${applicationRole(application)} ${application.introduction ?? ""}`.toLowerCase();
        return (
          text.includes(query.trim().toLowerCase()) &&
          (status === "all" || application.status === status)
        );
      }),
    [applications, query, status]
  );

  async function updateStatus(application: Application, nextStatus: Status) {
    if (!supabase || mutationPending.current) return;
    mutationPending.current = true;
    setWorking(true);
    setError("");
    try {
      const { data, error: updateError } = await supabase
        .from("applications")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", application.id)
        .eq("status", application.status)
        .select("id,status")
        .single();
      if (updateError || !data) throw updateError;
      if (!mounted.current) return;
      const updated = { ...application, status: data.status as Status };
      setApplications(items =>
        items.map(item => (item.id === application.id ? updated : item))
      );
      setSelected(current =>
        current?.id === application.id ? updated : current
      );
    } catch {
      setError(
        "The status wasn't saved. Your access or this application may have changed. Refresh before trying again."
      );
    } finally {
      mutationPending.current = false;
      setWorking(false);
    }
  }

  async function openCv(application: Application) {
    if (!supabase || !application.cv_storage_path) return;
    if (cvBusy) return;
    setCvBusy(true);
    setCvLink(null);
    setError("");
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      tab.opener = null;
      pendingCvWindows.current.add(tab);
    }
    try {
      const { data, error: signedError } = await supabase.storage
        .from("candidate-cvs")
        .createSignedUrl(application.cv_storage_path, 300);
      if (!mounted.current) {
        tab?.close();
        return;
      }
      if (signedError || !data?.signedUrl) throw signedError;
      setCvLink({ id: application.id, url: data.signedUrl });
      if (tab && !tab.closed) tab.location.replace(data.signedUrl);
    } catch {
      tab?.close();
      if (mounted.current)
        setError(
          "We couldn't open this CV. Please try again. Your application record has not been changed."
        );
    } finally {
      if (tab) pendingCvWindows.current.delete(tab);
      if (mounted.current) setCvBusy(false);
    }
  }

  const counts = statuses.reduce<Record<string, number>>((acc, item) => {
    acc[item] = applications.filter(
      application => application.status === item
    ).length;
    return acc;
  }, {});
  return (
    <div className="min-h-screen bg-[#f3f7f4] text-[#173226]">
      <header className="border-b border-[#173226]/10 bg-[#fbfdfc]">
        <div className="flex items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-[-.05em]"
          >
            CALLCARE <span className="text-[#338461]">BPO</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full bg-[#eaf3ee] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#27503e] sm:inline-flex">
              Founder workspace
            </span>
            <span className="hidden text-sm text-[#577468] sm:inline">
              {userEmail}
            </span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e]"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden min-h-[calc(100vh-73px)] w-[230px] shrink-0 border-r border-[#d5e2d9] bg-[#fbfdfc] p-5 xl:block">
          <p className="eyebrow mb-5 text-[#7d9e92]">Recruitment</p>
          <nav className="space-y-1">
            <a
              href="#overview"
              className="flex items-center gap-3 rounded-lg bg-[#eaf3ee] px-3 py-2.5 text-sm font-bold text-[#27503e]"
            >
              <LayoutDashboard size={17} /> Overview
            </a>
            <a
              href="#applications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468]"
            >
              <UsersRound size={17} /> Applications{" "}
              <span className="ml-auto rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-bold text-[#173226]">
                {applications.length}
              </span>
            </a>
            <a
              href="#settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#577468]"
            >
              <Settings2 size={17} /> Settings
            </a>
          </nav>
          <div className="mt-12 border-t border-[#d5e2d9] pt-5">
            <Link href="/careers" className="text-xs font-bold text-[#27503e]">
              View careers site →
            </Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div
            id="overview"
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="section-kicker">Founder workspace</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
                Recruitment overview
              </h1>
              <p className="mt-3 max-w-[550px] text-sm leading-6 text-[#6c8479]">
                Review talent-pool candidates and move people through the next
                step.
              </p>
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-5 border border-[#e7b4ad] bg-[#fff5f3] px-4 py-3 text-sm text-[#9a4139]"
            >
              {error}
            </p>
          )}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [applications.length, "Applications", "all time"],
              [counts.new ?? 0, "New", "needs review"],
              [counts.interview ?? 0, "In interview", "active process"],
              [counts.selected ?? 0, "Selected", "next step"],
            ].map(([value, labelText, note]) => (
              <div
                key={String(labelText)}
                className="border border-[#d5e2d9] bg-[#fbfdfc] p-5"
              >
                <p className="font-display text-4xl font-semibold tracking-[-.06em] text-[#27503e]">
                  {String(value)}
                </p>
                <p className="mt-3 text-sm font-bold text-[#315b4d]">
                  {String(labelText)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[.12em] text-[#8aa298]">
                  {String(note)}
                </p>
              </div>
            ))}
          </div>
          <section
            id="applications"
            className="mt-8 border border-[#d5e2d9] bg-[#fbfdfc]"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-[#d5e2d9] p-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-.04em]">
                  Applications
                </h2>
                <p className="mt-1 text-sm text-[#7a9186]">
                  Review candidates and move them through the recruitment
                  pipeline.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={loading || working}
                  onClick={() => setReload(n => n + 1)}
                  className="border border-[#d5e2d9] px-3 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? "Loading…" : "Refresh applications"}
                </button>
                <label className="flex items-center gap-2 border border-[#d5e2d9] px-3 py-2 text-sm text-[#6d8579]">
                  <Search size={15} />
                  <input
                    aria-label="Search candidates"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search candidates"
                    className="w-full bg-transparent outline-none placeholder:text-[#9bb0a6] sm:w-40"
                  />
                </label>
                <select
                  aria-label="Filter by status"
                  value={status}
                  onChange={event =>
                    setStatus(event.target.value as "all" | Status)
                  }
                  className="border border-[#d5e2d9] bg-white px-3 py-2 text-sm text-[#577468] outline-none"
                >
                  <option value="all">All statuses</option>
                  {statuses.map(item => (
                    <option key={item} value={item}>
                      {label(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#f3f7f4] text-[10px] uppercase tracking-[.14em] text-[#799287]">
                  <tr>
                    <th className="px-5 py-3 font-bold">Candidate</th>
                    <th className="px-5 py-3 font-bold">Role</th>
                    <th className="px-5 py-3 font-bold">Submitted</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e9e3]">
                  {filtered.map(application => (
                    <tr key={application.id} className="hover:bg-[#fbfdfc]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#27503e]">
                          {application.full_name}
                        </p>
                        <p className="mt-1 text-xs text-[#8aa298]">
                          {application.location || "Location not provided"} ·{" "}
                          {application.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#577468]">
                        {applicationRole(application)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#577468]">
                        {new Date(application.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Status for ${application.full_name}`}
                          disabled={working}
                          value={application.status}
                          onChange={event =>
                            updateStatus(
                              application,
                              event.target.value as Status
                            )
                          }
                          className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-bold outline-none ${statusStyles[application.status]}`}
                        >
                          {statuses.map(item => (
                            <option key={item} value={item}>
                              {label(item)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={event => {
                            openButton.current = event.currentTarget;
                            setCvLink(null);
                            setError("");
                            setSelected(application);
                          }}
                          aria-label={`Open application for ${application.full_name}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#27503e]"
                        >
                          Open <ArrowUpRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-[#7a9186]"
                      >
                        {loading
                          ? "Loading applications..."
                          : "No applications match your filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <Dialog
            open={!!selected}
            onOpenChange={open => {
              if (!open) {
                setSelected(null);
                setCvLink(null);
              }
            }}
          >
            {selected && (
              <DialogContent
                onCloseAutoFocus={event => {
                  event.preventDefault();
                  openButton.current?.focus();
                }}
                className="max-h-[90dvh] overflow-y-auto bg-[#fbfdfc] text-[#173226] sm:max-w-3xl"
              >
                {error && (
                  <p role="alert" className="mr-6 text-sm text-[#9a4139]">
                    {error}
                  </p>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">Candidate detail</p>
                    <DialogTitle className="mt-3 pr-6 font-display text-3xl font-semibold tracking-[-.05em]">
                      {selected.full_name}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {applicationRole(selected)} ·{" "}
                      {selected.location || "Location not provided"}
                    </DialogDescription>
                    <p className="mt-2 text-sm text-[#577468]">
                      {selected.email} {selected.phone && `· ${selected.phone}`}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold">
                    Application status
                    <select
                      aria-label="Candidate application status"
                      disabled={working}
                      value={selected.status}
                      onChange={event =>
                        updateStatus(selected, event.target.value as Status)
                      }
                      className="ml-3 rounded border p-2"
                    >
                      {statuses.map(item => (
                        <option key={item} value={item}>
                          {label(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.75fr]">
                  <div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#516b5e]">
                      {applicationIntroduction(selected)}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#577468]">
                      {selected.years_experience && (
                        <span className="rounded-full bg-[#eaf3ee] px-3 py-2">
                          {selected.years_experience}
                        </span>
                      )}
                      {selected.availability && (
                        <span className="rounded-full bg-[#eaf3ee] px-3 py-2">
                          Available: {selected.availability}
                        </span>
                      )}
                      {safeWebUrl(selected.linkedin_url) && (
                        <a
                          href={safeWebUrl(selected.linkedin_url)!}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-[#eaf3ee] px-3 py-2 font-bold text-[#27503e]"
                        >
                          LinkedIn
                        </a>
                      )}
                      {safeWebUrl(selected.portfolio_url) && (
                        <a
                          href={safeWebUrl(selected.portfolio_url)!}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-[#eaf3ee] px-3 py-2 font-bold text-[#27503e]"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="border-l border-[#d5e2d9] pl-6">
                    <p className="eyebrow text-[#7d9e92]">Candidate file</p>
                    {cvLink?.id === selected.id && (
                      <p className="mt-3 text-sm">
                        <a
                          href={cvLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline"
                        >
                          View or download CV
                        </a>
                        <span className="mt-1 block">
                          Use this link if a new tab did not open. It expires
                          after five minutes; press Open again for a new link.
                        </span>
                      </p>
                    )}
                    {selected.cv_storage_path ? (
                      <button
                        disabled={cvBusy}
                        onClick={() => openCv(selected)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#27503e] px-4 py-3 text-sm font-bold text-white"
                      >
                        <FileText size={16} /> {cvBusy ? "Preparing…" : "Open"}{" "}
                        {selected.cv_original_name || "CV"}
                      </button>
                    ) : (
                      <p className="mt-4 text-sm text-[#7a9186]">
                        No CV uploaded.
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
          <PasswordSettings />
        </main>
      </div>
    </div>
  );
}
