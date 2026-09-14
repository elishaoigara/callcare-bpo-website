// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ApplicationForm from "../client/src/components/ApplicationForm";
const mock = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { rpc: mock.rpc } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("offers email applications while the database upgrade is missing", async () => {
  mock.rpc.mockResolvedValue({
    data: null,
    error: { message: "Function not found" },
  });
  render(
    <ApplicationForm
      jobTitle="SDR"
      jobSlug="sales-development-representative"
    />
  );
  const link = await screen.findByRole("link", { name: "Apply by email" });
  expect(link.getAttribute("href")).toContain("mailto:info@callcarebpo.com");
  expect(screen.queryByLabelText("Full name")).toBeNull();
});
it("requires a designer portfolio in the actual form", async () => {
  mock.rpc.mockResolvedValue({ data: 2, error: null });
  render(
    <ApplicationForm
      jobTitle="Designer"
      jobSlug="web-graphic-designer"
      portfolioRequired
    />
  );
  const field = await screen.findByLabelText(/Portfolio URL/);
  expect((field as HTMLInputElement).required).toBe(true);
  fireEvent.change(field, { target: { value: "" } });
  expect((field as HTMLInputElement).checkValidity()).toBe(false);
});
