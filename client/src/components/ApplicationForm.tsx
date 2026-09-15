import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { cvContentType, safeWebUrl, errorMessage } from "@/lib/recruitment";
import {
  ApplicationRejectedError,
  submitApplication,
  type Submission,
} from "@/lib/submit-application";

type ApplicationFormProps = {
  jobTitle: string;
  jobSlug: string;
  portfolioRequired?: boolean;
};

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  yearsExperience: "",
  availability: "",
  linkedinUrl: "",
  portfolioUrl: "",
  introduction: "",
  consent: false,
};

export default function ApplicationForm({
  jobTitle,
  jobSlug,
  portfolioRequired = false,
}: ApplicationFormProps) {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    if (!supabase) {
      setReady(false);
      return;
    }
    supabase.rpc("recruitment_schema_version").then(
      ({ data, error }) => {
        if (active) setReady(!error && data === 2);
      },
      () => {
        if (active) setReady(false);
      }
    );
    return () => {
      active = false;
    };
  }, []);
  const [form, setForm] = useState(initialState);
  const [cv, setCv] = useState<File | null>(null);
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const submission = useRef<Submission | null>(null);
  const pending = useRef(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof initialState, value: string | boolean) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    if (!supabase) {
      setError(
        "Online applications are temporarily unavailable. Please email info@callcarebpo.com."
      );
      setState("error");
      return;
    }
    try {
      if (!submission.current) {
        if (!form.fullName.trim() || !form.introduction.trim())
          throw new Error("Please enter your name and introduction.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
          throw new Error("Please enter a valid email address.");
        if (!form.consent)
          throw new Error(
            "Please consent to the recruitment use of your details."
          );
        if (portfolioRequired && !safeWebUrl(form.portfolioUrl))
          throw new Error("Please include your portfolio URL for this role.");
        if (
          (form.portfolioUrl && !safeWebUrl(form.portfolioUrl)) ||
          (form.linkedinUrl && !safeWebUrl(form.linkedinUrl))
        )
          throw new Error("Links must start with https:// or http://.");
        if (cv) cvContentType(cv);
        submission.current = {
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          jobSlug,
          cv,
          details: {
            full_name: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            location: form.location.trim(),
            years_experience: form.yearsExperience.trim(),
            availability: form.availability.trim(),
            linkedin_url: form.linkedinUrl.trim(),
            portfolio_url: form.portfolioUrl.trim(),
            introduction: form.introduction.trim(),
            consent: form.consent,
          },
        };
      }
      pending.current = true;
      setState("submitting");
      await submitApplication(supabase, submission.current, () =>
        setSaved(true)
      );
      setState("success");
      setForm(initialState);
      setCv(null);
    } catch (cause) {
      if (cause instanceof ApplicationRejectedError && !saved)
        submission.current = null;
      setError(
        submission.current
          ? "We couldn't finish this submission. Please retry below; your details will not be submitted twice. If this continues, email info@callcarebpo.com."
          : errorMessage(cause, "Please check your application details.")
      );
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  if (state === "success") {
    return (
      <div className="border border-[#9fc2ae] bg-[#eaf3ee] p-6">
        <p className="eyebrow text-[#5f7b6c]">Application received</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-[#27503e]">
          Thank you for joining our talent pool.
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#516b5e]">
          The CallCare recruitment team will review your details and contact you
          when a suitable opportunity opens.
        </p>
      </div>
    );
  }

  if (ready === null)
    return (
      <p role="status" className="text-sm text-[#516b5e]">
        Checking application availability…
      </p>
    );
  if (!ready)
    return (
      <div className="space-y-4 text-sm leading-6 text-[#516b5e]">
        <p>
          Online applications are being updated. You can still apply for{" "}
          {jobTitle} by email.
        </p>
        <p>
          Include your name, experience, availability and CV
          {portfolioRequired ? ", plus your portfolio link" : ""}.
        </p>
        <a
          className="inline-flex rounded-full bg-[#27503e] px-5 py-3 font-bold text-white"
          href={`mailto:info@callcarebpo.com?subject=${encodeURIComponent(`Talent pool application — ${jobTitle}`)}`}
        >
          Apply by email
        </a>
      </div>
    );

  const fieldClass =
    "mt-2 w-full border border-[#c4d6cb] bg-white px-3 py-3 text-sm text-[#315b4d] outline-none focus:border-[#27503e]";
  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset
        disabled={Boolean(submission.current)}
        className="space-y-5 disabled:opacity-70"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#315b4d]">
            Full name
            <input
              required
              maxLength={200}
              autoComplete="name"
              value={form.fullName}
              onChange={event => update("fullName", event.target.value)}
              className={fieldClass}
              placeholder="Your full name"
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Email
            <input
              required
              maxLength={320}
              autoComplete="email"
              type="email"
              value={form.email}
              onChange={event => update("email", event.target.value)}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Phone
            <input
              value={form.phone}
              onChange={event => update("phone", event.target.value)}
              className={fieldClass}
              placeholder="+254 ..."
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Location
            <input
              value={form.location}
              onChange={event => update("location", event.target.value)}
              className={fieldClass}
              placeholder="Nairobi, Kenya"
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Years of experience
            <input
              value={form.yearsExperience}
              onChange={event => update("yearsExperience", event.target.value)}
              className={fieldClass}
              placeholder="e.g. 3 years"
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Availability
            <input
              value={form.availability}
              onChange={event => update("availability", event.target.value)}
              className={fieldClass}
              placeholder="e.g. 2 weeks"
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            LinkedIn URL
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={event => update("linkedinUrl", event.target.value)}
              className={fieldClass}
              placeholder="https://linkedin.com/in/..."
            />
          </label>
          <label className="text-sm font-semibold text-[#315b4d]">
            Portfolio URL{" "}
            <span className="font-normal text-[#79958a]">
              {portfolioRequired ? "(required)" : "(optional)"}
            </span>
            <input
              required={portfolioRequired}
              type="url"
              value={form.portfolioUrl}
              onChange={event => update("portfolioUrl", event.target.value)}
              className={fieldClass}
              placeholder="https://..."
            />
          </label>
        </div>
        <label className="block text-sm font-semibold text-[#315b4d]">
          Tell us about yourself
          <textarea
            required
            maxLength={10000}
            value={form.introduction}
            onChange={event => update("introduction", event.target.value)}
            className={`${fieldClass} min-h-32`}
            placeholder="Share your experience, strengths, and the work you want to grow into."
          />
        </label>
        <label className="flex cursor-pointer items-center gap-3 border border-dashed border-[#9fbcaf] bg-[#f6faf7] px-4 py-4 text-sm text-[#516b5e]">
          <UploadCloud size={18} className="shrink-0 text-[#27503e]" />
          <span className="flex-1">
            <span className="block font-semibold text-[#315b4d]">
              Upload your CV
            </span>
            <span className="block text-xs">
              PDF or Word document, up to 10 MB
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={event => setCv(event.target.files?.[0] ?? null)}
            className="max-w-[150px] text-xs"
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-[#516b5e]">
          <input
            required
            type="checkbox"
            checked={form.consent}
            onChange={event => update("consent", event.target.checked)}
            className="mt-1 size-4 accent-[#27503e]"
          />
          I consent to CallCare storing and reviewing my details for recruitment
          and future talent-pool opportunities.
        </label>
      </fieldset>
      {saved && submission.current?.cv && (
        <p role="status" className="text-sm text-[#27503e]">
          Your application is saved. Your CV still needs to finish uploading;
          retry below to attach it.
        </p>
      )}
      {state === "error" && (
        <p
          role="alert"
          className="border border-[#e7b4ad] bg-[#fff5f3] px-4 py-3 text-sm text-[#9a4139]"
        >
          {error}
        </p>
      )}
      <p className="text-sm leading-6 text-[#516b5e]">
        Read our{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Privacy Policy (opens in a new tab)
        </a>{" "}
        for how we handle your details and retain them for future opportunities,
        and our{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Terms &amp; Conditions (opens in a new tab)
        </a>
        . Joining the talent pool does not guarantee employment.
      </p>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex items-center gap-2 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#173226] disabled:cursor-wait disabled:opacity-60"
      >
        {state === "submitting" && (
          <Loader2 size={16} className="animate-spin" />
        )}{" "}
        {state === "submitting"
          ? "Submitting..."
          : submission.current
            ? "Retry submission"
            : "Join the talent pool"}
      </button>
    </form>
  );
}
