// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Orders from "../client/src/pages/Orders";
const token = "a".repeat(64);
const order = {
  orderNumber: "CC-TEST",
  title: "Customer support pilot",
  scope: "An agreed support pilot",
  terms: "Payment for the agreed pilot",
  amountMinor: 250000,
  currency: "KES",
  mode: "test",
  status: "awaiting_payment",
  expiresAt: "2099-01-01T00:00:00Z",
  paidAt: null,
  reference: "cc-test",
  canPay: true,
};
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/orders");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows a usable private-link entry page and validates access codes", () => {
  render(<Orders />);
  fireEvent.change(screen.getByLabelText("Private order link or access code"), {
    target: { value: "invalid" },
  });
  fireEvent.click(screen.getByRole("button", { name: /View my order/ }));
  expect(screen.getByRole("alert").textContent).toContain(
    "complete private order link"
  );
});
it("loads agreed details, removes the URL secret, and requires terms acceptance", async () => {
  window.history.replaceState(null, "", `/orders#order=${token}`);
  const request = vi.fn().mockResolvedValue(Response.json({ order }));
  vi.stubGlobal("fetch", request);
  render(<Orders />);
  await screen.findByText("Customer support pilot");
  expect(window.location.hash).toBe("");
  expect(sessionStorage.getItem("callcare-private-order")).toBe(token);
  expect(screen.getByText(/Test mode/)).toBeTruthy();
  const button = screen.getByRole("button", {
    name: /Continue to test payment/,
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox"));
  expect(button.disabled).toBe(false);
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ token });
});
it("a callback does not show success until the server confirms payment", async () => {
  sessionStorage.setItem("callcare-private-order:cc-test", token);
  window.history.replaceState(null, "", "/orders?reference=cc-test");
  const request = vi.fn().mockResolvedValue(Response.json({ order }));
  vi.stubGlobal("fetch", request);
  render(<Orders />);
  await screen.findByText("Customer support pilot");
  expect(request.mock.calls[0][0]).toBe("/api/payments/verify");
  expect(screen.queryByText("Test payment confirmed")).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("not confirmed");
  request.mockResolvedValue(
    Response.json({
      order: {
        ...order,
        status: "paid",
        paidAt: "2026-10-07T12:00:00Z",
        canPay: false,
      },
    })
  );
  fireEvent.click(screen.getByRole("button", { name: /Already paid/ }));
  await screen.findByText("Test payment confirmed");
  expect(screen.queryByRole("button", { name: /Continue to/ })).toBeNull();
});
it("preserves an order and shows a useful error when checkout fails", async () => {
  window.history.replaceState(null, "", `/orders#order=${token}`);
  const request = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ order }))
    .mockResolvedValue(
      Response.json(
        { error: "Online payments are not available yet." },
        { status: 503 }
      )
    );
  vi.stubGlobal("fetch", request);
  render(<Orders />);
  await screen.findByText("Customer support pilot");
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: /Continue to test payment/ })
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("not available")
  );
  expect(screen.getByText("Customer support pilot")).toBeTruthy();
  expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({
    token,
    accepted: true,
  });
});
