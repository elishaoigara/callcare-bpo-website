// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WorkTogether from "../client/src/pages/WorkTogether";
import Contact from "../client/src/pages/Contact";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function beginInquiry() {
  render(<WorkTogether />);
  fireEvent.click(
    screen.getAllByRole("button", { name: "Tell Us What You Need" })[0]
  );
}
function continueInquiry() {
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}
function fillInquiry() {
  beginInquiry();
  fireEvent.click(screen.getByRole("radio", { name: /^I need a team/ }));
  continueInquiry();
  fireEvent.change(
    screen.getByRole("textbox", { name: "Work you need help with" }),
    { target: { value: "Help our customers with order questions." } }
  );
  continueInquiry();
  fireEvent.click(screen.getByRole("radio", { name: "1–3 people" }));
  continueInquiry();
  fireEvent.click(
    screen.getByRole("radio", { name: "Within the next 30 days" })
  );
  continueInquiry();
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: "Jane Example" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Work Email" }), {
    target: { value: "jane@example.com" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Company" }), {
    target: { value: "Example Company" },
  });
}

describe("Partnership inquiry", () => {
  it("validates each stage and retains answers when visitors go back", () => {
    beginInquiry();
    continueInquiry();
    expect(screen.getByRole("alert").textContent).toMatch(
      /Choose what brings you here/
    );
    fireEvent.click(
      screen.getByRole("radio", { name: /I need extra capacity/ })
    );
    continueInquiry();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Work you need help with" }),
      { target: { value: "Overflow support" } }
    );
    continueInquiry();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Work you need help with",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("Overflow support");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(
      (
        screen.getByRole("radio", {
          name: /I need extra capacity/,
        }) as HTMLInputElement
      ).checked
    ).toBe(true);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "1"
    );
  });

  it("keeps details after a rejected request and only confirms a successful retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    fillInquiry();
    fireEvent.click(
      screen.getByRole("button", { name: "Let’s Figure This Out" })
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/couldn’t confirm/)
    );
    expect(screen.queryByRole("heading", { name: /Thanks/ })).toBeNull();
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value
    ).toBe("Jane Example");
    fireEvent.click(
      screen.getByRole("button", { name: "Let’s Figure This Out" })
    );
    await screen.findByRole("heading", {
      name: "Thanks — we’ve got the picture. 👋",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [endpoint, options] = fetchMock.mock.calls[1];
    expect(endpoint).toBe("https://formspree.io/f/mqpkkkdb");
    expect(JSON.parse(options.body)).toMatchObject({
      name: "Jane Example",
      email: "jane@example.com",
      company: "Example Company",
      inquiry_type: "I need a team",
      message: "Help our customers with order questions.",
      support_capacity: "1–3 people",
      start_timing: "Within the next 30 days",
    });
  });

  it("does not issue duplicate requests while an inquiry is being sent", async () => {
    let resolveRequest: (response: { ok: boolean }) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise(resolve => {
          resolveRequest = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    fillInquiry();
    const submit = screen.getByRole("button", {
      name: "Let’s Figure This Out",
    });
    fireEvent.click(submit);
    fireEvent.submit(submit.closest("form")!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest({ ok: true });
    await screen.findByRole("heading", {
      name: /Thanks — we’ve got the picture/,
    });
  });
});

describe("Separate Contact page", () => {
  it("offers direct contact, a city map, and a separate partnership destination", () => {
    const { container } = render(<Contact />);
    expect(screen.getByRole("heading", { name: "Let’s Talk." })).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "info@callcarebpo.com" })
        .getAttribute("href")
    ).toBe("mailto:info@callcarebpo.com");
    expect(container.querySelector("form")).toBeNull();
    expect(
      container.querySelector('img[src^="https://tile.openstreetmap.org"]')
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "View Nairobi Map" }));
    expect(
      screen.getByRole("img", { name: /Map centered on Nairobi/ })
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "© OpenStreetMap contributors" })
    ).toBeTruthy();
    fireEvent.error(
      container.querySelector('img[src^="https://tile.openstreetmap.org"]')!
    );
    expect(screen.getByRole("status").textContent).toContain("couldn’t load");
    screen
      .getAllByRole("link", { name: "Let’s Work Together" })
      .forEach(link => expect(link.getAttribute("href")).toBe("/work-with-us"));
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" })
    ).toBeTruthy();
  });
});
