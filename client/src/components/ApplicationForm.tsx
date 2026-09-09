import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ApplicationFormProps = {
  jobTitle: string;
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

export default function ApplicationForm({ jobTitle }: ApplicationFormProps) {
  const [form, setForm] = useState(initialState);
  const [cv, setCv] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const update = (key: keyof typeof initialState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!supabase) {
      setError("Applications are being connected. Please email info@callcarebpo.com while staging setup is completed.");
      setState("error");
      return;
    }
    if (!form.consent) {
      setError("Please confirm that CallCare may use your details for recruitment purposes.");
      setState("error");
      return;
    }
    if (cv && (cv.size > 10 * 1024 * 1024 || !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(cv.type))) {
      setError("Please upload a PDF or Word CV smaller than 10 MB.");
      setState("error");
      return;
    }

    setState("submitting");
    try {
      const applicationId = crypto.randomUUID();
      let cvPath: string | null = null;
      if (cv) {
        cvPath = `public/${applicationId}/${cv.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("candidate-cvs").upload(cvPath, cv, { upsert: false });
        if (upload.error) throw upload.error;
      }

      const { error: insertError } = await supabase.from("applications").insert({
        id: applicationId,
        application_type: "talent_pool",
        full_name: form.fullName,
        email: form.email,
        phone: form.phone || null,
        location: form.location || null,
        years_experience: form.yearsExperience || null,
        availability: form.availability || null,
        linkedin_url: form.linkedinUrl || null,
        portfolio_url: form.portfolioUrl || null,
        introduction: `${jobTitle}\n\n${form.introduction}`,
        consent_at: new Date().toISOString(),
        cv_storage_path: cvPath,
        cv_original_name: cv?.name ?? null,
        cv_mime_type: cv?.type ?? null,
        cv_size_bytes: cv?.size ?? null,
      });
      if (insertError) throw insertError;
      setState("success");
      setForm(initialState);
      setCv(null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your details. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return <div className="border border-[#9fc2ae] bg-[#eaf3ee] p-6"><p className="eyebrow text-[#5f7b6c]">Application received</p><h3 className="mt-3 font-display text-2xl font-semibold text-[#27503e]">Thank you for joining our talent pool.</h3><p className="mt-3 text-sm leading-6 text-[#516b5e]">The CallCare recruitment team will review your details and contact you when a suitable opportunity opens.</p></div>;
  }

  const fieldClass = "mt-2 w-full border border-[#c4d6cb] bg-white px-3 py-3 text-sm text-[#315b4d] outline-none focus:border-[#27503e]";
  return <form onSubmit={submit} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-semibold text-[#315b4d]">Full name<input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className={fieldClass} placeholder="Your full name" /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Email<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={fieldClass} placeholder="you@example.com" /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Phone<input value={form.phone} onChange={(event) => update("phone", event.target.value)} className={fieldClass} placeholder="+254 ..." /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Location<input value={form.location} onChange={(event) => update("location", event.target.value)} className={fieldClass} placeholder="Nairobi, Kenya" /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Years of experience<input value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} className={fieldClass} placeholder="e.g. 3 years" /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Availability<input value={form.availability} onChange={(event) => update("availability", event.target.value)} className={fieldClass} placeholder="e.g. 2 weeks" /></label>
      <label className="text-sm font-semibold text-[#315b4d]">LinkedIn URL<input type="url" value={form.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} className={fieldClass} placeholder="https://linkedin.com/in/..." /></label>
      <label className="text-sm font-semibold text-[#315b4d]">Portfolio URL <span className="font-normal text-[#79958a]">(if relevant)</span><input type="url" value={form.portfolioUrl} onChange={(event) => update("portfolioUrl", event.target.value)} className={fieldClass} placeholder="https://..." /></label>
    </div>
    <label className="block text-sm font-semibold text-[#315b4d]">Tell us about yourself<textarea required value={form.introduction} onChange={(event) => update("introduction", event.target.value)} className={`${fieldClass} min-h-32`} placeholder="Share your experience, strengths, and the work you want to grow into." /></label>
    <label className="flex cursor-pointer items-center gap-3 border border-dashed border-[#9fbcaf] bg-[#f6faf7] px-4 py-4 text-sm text-[#516b5e]"><UploadCloud size={18} className="shrink-0 text-[#27503e]" /><span className="flex-1"><span className="block font-semibold text-[#315b4d]">Upload your CV</span><span className="block text-xs">PDF or Word document, up to 10 MB</span></span><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setCv(event.target.files?.[0] ?? null)} className="max-w-[150px] text-xs" /></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-[#516b5e]"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 size-4 accent-[#27503e]" />I consent to CallCare storing and reviewing my details for recruitment and future talent-pool opportunities.</label>
    {state === "error" && <p role="alert" className="border border-[#e7b4ad] bg-[#fff5f3] px-4 py-3 text-sm text-[#9a4139]">{error}</p>}
    <button type="submit" disabled={state === "submitting"} className="inline-flex items-center gap-2 rounded-full bg-[#27503e] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#173226] disabled:cursor-wait disabled:opacity-60">{state === "submitting" && <Loader2 size={16} className="animate-spin" />} {state === "submitting" ? "Submitting..." : "Join the talent pool"}</button>
  </form>;
}
