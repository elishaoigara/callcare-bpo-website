// @vitest-environment jsdom
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import App from "../client/src/App";
import PublicHeader from "../client/src/components/PublicHeader";
import { pageDetails, missingPage } from "../client/src/data/site-pages";
import { analyticsUrl } from "../client/src/lib/analytics";

vi.mock("@/lib/supabase", () => ({ supabase: null }));
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

it("renders every public route with valid local links, anchors, and image files", async () => {
  const { hook, navigate } = memoryLocation({ path: "/" });
  const { container } = render(
    <Router hook={hook}>
      <App />
    </Router>
  );
  const idsByPath = new Map<string, Set<string>>();
  const internalLinks: URL[] = [];
  for (const [path, details] of Object.entries(pageDetails)) {
    await act(async () => {
      navigate(path);
    });
    await waitFor(() => expect(document.title).toBe(details.title));
    expect(container.querySelectorAll("h1").length, path).toBe(1);
    const ids = [...container.querySelectorAll("[id]")].map(
      element => element.id
    );
    expect(new Set(ids).size, `Duplicate IDs on ${path}`).toBe(ids.length);
    idsByPath.set(path, new Set(ids));
    for (const image of container.querySelectorAll<HTMLImageElement>(
      "img[src]"
    )) {
      const src = image.getAttribute("src")!;
      if (src.startsWith("/"))
        expect(existsSync(resolve("client/public", src.slice(1))), src).toBe(
          true
        );
    }
    for (const link of container.querySelectorAll<HTMLAnchorElement>(
      "a[href]"
    )) {
      const href = link.getAttribute("href")!;
      expect(href).not.toMatch(/^javascript:/i);
      if (href.startsWith("/") || href.startsWith("#")) {
        const url = new URL(href, `https://www.callcarebpo.com${path}`);
        expect(
          pageDetails[url.pathname],
          `Broken route ${href} on ${path}`
        ).toBeTruthy();
        internalLinks.push(url);
      }
    }
  }
  for (const link of internalLinks.filter(link => link.hash)) {
    expect(
      idsByPath.get(link.pathname)?.has(decodeURIComponent(link.hash.slice(1))),
      `Broken anchor ${link.href}`
    ).toBe(true);
  }
  await act(async () => {
    navigate("/this-page-does-not-exist");
  });
  await waitFor(() => expect(document.title).toBe(missingPage.title));
  expect(screen.getByRole("link", { name: "Back to Home" })).toBeTruthy();
  expect(
    document.querySelector('meta[name="robots"]')?.getAttribute("content")
  ).toContain("noindex");
});

it("removes About from both menus and supports closing the mobile menu with Escape", () => {
  render(<PublicHeader current="/contact" />);
  expect(screen.queryByRole("link", { name: "About" })).toBeNull();
  const toggle = screen.getByRole("button", { name: "Open navigation" });
  fireEvent.click(toggle);
  expect(screen.queryByRole("link", { name: "About" })).toBeNull();
  fireEvent.keyDown(
    screen.getByRole("navigation", { name: "Mobile navigation" }),
    { key: "Escape" }
  );
  expect(
    screen.queryByRole("navigation", { name: "Mobile navigation" })
  ).toBeNull();
  expect(document.activeElement).toBe(toggle);
});

it("only enables analytics with a valid secure endpoint and website ID", () => {
  expect(analyticsUrl()).toBeNull();
  expect(analyticsUrl("%VITE_ANALYTICS_ENDPOINT%", "site")).toBeNull();
  expect(analyticsUrl("https://analytics.example.com", "")).toBeNull();
  expect(analyticsUrl("javascript:alert(1)", "site")).toBeNull();
  expect(analyticsUrl("https://analytics.example.com/", "site")).toBe(
    "https://analytics.example.com/umami"
  );
});
