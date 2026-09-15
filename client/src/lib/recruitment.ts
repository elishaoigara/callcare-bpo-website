export const FOUNDER_EMAIL = "info@callcarebpo.com";
export const RECRUITER_EMAILS = [FOUNDER_EMAIL, "lambertelisha732@gmail.com"];
export const MAX_CV_BYTES = 10 * 1024 * 1024;
export const CV_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export function cvContentType(file: Pick<File, "name" | "size">) {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase() as keyof typeof CV_TYPES;
  if (
    !CV_TYPES[extension] ||
    file.name.length > 240 ||
    file.size <= 0 ||
    file.size > MAX_CV_BYTES
  ) {
    throw new Error("Please choose a PDF or Word CV up to 10 MB.");
  }
  return CV_TYPES[extension];
}

export function safeWebUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function applicationRole(application: {
  job_title?: string | null;
  introduction?: string | null;
}) {
  return (
    application.job_title ||
    application.introduction?.split("\n")[0]?.trim() ||
    "Talent pool"
  );
}

export function applicationIntroduction(application: {
  job_title?: string | null;
  introduction?: string | null;
}) {
  const text = application.introduction ?? "";
  return (
    (application.job_title
      ? text
      : text.split("\n").slice(1).join("\n") || text
    ).trim() || "No introduction provided."
  );
}

export function errorMessage(error: unknown, fallback: string) {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : fallback;
}
