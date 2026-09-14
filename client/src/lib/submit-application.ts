import type { SupabaseClient } from "@supabase/supabase-js";
import { cvContentType } from "./recruitment";

export type Submission = {
  id: string;
  token: string;
  jobSlug: string;
  details: Record<string, string | boolean | null>;
  cv: File | null;
};

/** Retries reuse the same ID/token, including when a response is lost. */
export async function submitApplication(
  client: SupabaseClient,
  submission: Submission,
  onSaved: () => void
) {
  const { id, token, jobSlug, details, cv } = submission;
  const { data, error } = await client.rpc("submit_application", {
    p_id: id,
    p_token: token,
    p_job_slug: jobSlug,
    p_details: details,
    p_cv: cv ? { name: cv.name, size: cv.size, mime: cvContentType(cv) } : null,
  });
  if (error) throw error;
  if (!data?.application_id)
    throw new Error("We couldn't confirm your application. Please retry.");
  onSaved();
  if (!cv) return;
  if (!data.upload_path)
    throw new Error(
      "Your application was saved, but a CV upload could not be prepared."
    );

  const finish = () =>
    client.rpc("complete_application_cv", { p_id: id, p_token: token });
  // An earlier upload/finalization may have succeeded despite a lost response.
  const existing = await finish();
  if (existing.error) throw existing.error;
  if (existing.data === true) return;
  const { error: uploadError } = await client.storage
    .from("candidate-cvs")
    .upload(data.upload_path, cv, {
      upsert: false,
      contentType: cvContentType(cv),
    });
  if (uploadError) throw uploadError;
  const completed = await finish();
  if (completed.error) throw completed.error;
  if (completed.data !== true)
    throw new Error(
      "Your application was saved, but we couldn't confirm the CV upload. Please retry."
    );
}
