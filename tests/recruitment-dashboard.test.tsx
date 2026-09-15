// @vitest-environment jsdom
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { RecruitmentWorkspace } from "../client/src/pages/RecruitmentDashboard";
const mock = vi.hoisted(() => ({
  from: vi.fn(),
  sign: vi.fn(),
  update: vi.fn(),
  load: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mock.from,
    storage: { from: () => ({ createSignedUrl: mock.sign }) },
  },
}));
vi.mock("@/components/PasswordSettings", () => ({ default: () => null }));
const candidate = {
  id: "one",
  full_name: "Test Candidate",
  email: "test@example.invalid",
  status: "new",
  created_at: "2026-09-15",
  introduction: null,
  jobs: { title: "Executive Assistant" },
  cv_storage_path: "cv/test.pdf",
  cv_original_name: "resume.pdf",
};
beforeEach(() => {
  vi.clearAllMocks();
  mock.load.mockResolvedValue({ data: [candidate], error: null });
  mock.update.mockResolvedValue({
    data: { id: "one", status: "screening" },
    error: null,
  });
  mock.from.mockImplementation(() => {
    const builder: any = {
      select: vi.fn(() => builder),
      order: vi.fn(() => builder),
      range: vi.fn(() => builder),
      abortSignal: mock.load,
      update: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      single: mock.update,
    };
    return builder;
  });
  mock.sign.mockResolvedValue({
    data: { signedUrl: "https://example.invalid/cv" },
    error: null,
  });
  vi.spyOn(window, "open").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function open() {
  render(
    <RecruitmentWorkspace userEmail="info@callcarebpo.com" signOut={vi.fn()} />
  );
  const button = await screen.findByRole("button", {
    name: "Open application for Test Candidate",
  });
  fireEvent.click(button);
  return screen.findByRole("dialog");
}
it("opens candidate details in a visible dialog and closes it", async () => {
  const dialog = await open();
  expect(within(dialog).getByText("No introduction provided.")).toBeTruthy();
  expect(within(dialog).getByText(/Executive Assistant/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
it("provides a signed CV link even when popups are blocked", async () => {
  const dialog = await open();
  fireEvent.click(
    within(dialog).getByRole("button", { name: /Open resume.pdf/ })
  );
  const link = await within(dialog).findByRole("link", {
    name: "View or download CV",
  });
  expect(link.getAttribute("href")).toBe("https://example.invalid/cv");
  expect(mock.sign).toHaveBeenCalledWith("cv/test.pdf", 300);
});
it("shows CV errors in the dialog and permits retry", async () => {
  mock.sign.mockResolvedValueOnce({
    data: null,
    error: { message: "unavailable" },
  });
  const dialog = await open();
  fireEvent.click(
    within(dialog).getByRole("button", { name: /Open resume.pdf/ })
  );
  await within(dialog).findByRole("alert");
  fireEvent.click(
    within(dialog).getByRole("button", { name: /Open resume.pdf/ })
  );
  await within(dialog).findByRole("link", { name: "View or download CV" });
});
it("saves status changes and refreshes the application list", async () => {
  const dialog = await open();
  fireEvent.change(
    within(dialog).getByLabelText("Candidate application status"),
    { target: { value: "screening" } }
  );
  await waitFor(() => expect(mock.update).toHaveBeenCalled());
  await waitFor(() =>
    expect(
      (
        within(dialog).getByLabelText(
          "Candidate application status"
        ) as HTMLSelectElement
      ).value
    ).toBe("screening")
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  fireEvent.click(screen.getByRole("button", { name: "Refresh applications" }));
  await waitFor(() => expect(mock.load).toHaveBeenCalledTimes(2));
});
