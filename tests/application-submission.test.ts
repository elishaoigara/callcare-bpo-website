import { expect, it, vi } from "vitest";
import {
  submitApplication,
  type Submission,
} from "../client/src/lib/submit-application";
import {
  applicationIntroduction,
  applicationRole,
  cvContentType,
} from "../client/src/lib/recruitment";
import type { SupabaseClient } from "@supabase/supabase-js";
const ticket: Submission = {
  id: "id",
  token: "token",
  jobSlug: "sales-development-representative",
  details: {},
  cv: { name: "cv.pdf", size: 20 } as File,
};
function client(
  rpc: ReturnType<typeof vi.fn>,
  upload = vi.fn().mockResolvedValue({ error: null })
) {
  return {
    rpc,
    storage: { from: () => ({ upload }) },
  } as unknown as SupabaseClient;
}
it("does not upload a file when saving the application fails", async () => {
  const upload = vi.fn(),
    rpc = vi.fn().mockResolvedValue({ error: { message: "Insert failed" } });
  await expect(
    submitApplication(client(rpc, upload), ticket, vi.fn())
  ).rejects.toBeTruthy();
  expect(upload).not.toHaveBeenCalled();
});
it("saves before uploading and confirms the attachment", async () => {
  const order: string[] = [];
  const rpc = vi.fn().mockImplementation(async name => {
    order.push(name);
    return name === "submit_application"
      ? { data: { application_id: "id", upload_path: "path" }, error: null }
      : {
          data: order.filter(x => x === "complete_application_cv").length > 1,
          error: null,
        };
  });
  const upload = vi.fn().mockImplementation(async () => {
    order.push("upload");
    return { error: null };
  });
  await submitApplication(client(rpc, upload), ticket, vi.fn());
  expect(order).toEqual([
    "submit_application",
    "complete_application_cv",
    "upload",
    "complete_application_cv",
  ]);
});
it("recovers a lost upload response without uploading twice", async () => {
  const rpc = vi
    .fn()
    .mockResolvedValueOnce({
      data: { application_id: "id", upload_path: "path" },
      error: null,
    })
    .mockResolvedValue({ data: true, error: null });
  const upload = vi.fn();
  await submitApplication(client(rpc, upload), ticket, vi.fn());
  expect(upload).not.toHaveBeenCalled();
  expect(rpc.mock.calls[0][1]).toMatchObject({
    p_id: ticket.id,
    p_token: ticket.token,
  });
});
it("handles missing legacy introductions and MIME-less Word CVs", () => {
  expect(applicationRole({ introduction: null })).toBe("Talent pool");
  expect(applicationIntroduction({ introduction: null })).toBe(
    "No introduction provided."
  );
  expect(applicationIntroduction({ introduction: "SDR\n\nExperience" })).toBe(
    "Experience"
  );
  expect(cvContentType({ name: "CV.DOCX", size: 100 })).toContain(
    "wordprocessingml"
  );
  expect(() => cvContentType({ name: "bad.exe", size: 100 })).toThrow();
});
