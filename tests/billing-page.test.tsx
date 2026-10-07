// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BillingWorkspace } from "../client/src/pages/Billing";
import { BillingAccessError } from "../client/src/lib/billing";
const access = {
  email: "founder@example.invalid",
  mode: "test",
  usdEnabled: false,
  paymentsEnabled: true,
};
afterEach(cleanup);
it("preserves a failed order and reuses its id on retry without rounding money", async () => {
  const request = vi.fn(async (body: any) => {
    if (body.action === "list") return { orders: [], hasMore: false };
    throw new Error("Connection interrupted");
  });
  render(<BillingWorkspace access={access} request={request} />);
  await screen.findByText(/No orders found/);
  fireEvent.click(screen.getByRole("button", { name: "Create order" }));
  for (const [label, value] of [
    ["Client email", "client@example.invalid"],
    ["Order title", "Pilot"],
    ["Agreed scope", "Support pilot"],
    ["Payment terms", "Agreed terms"],
    ["Amount", "2500.25"],
    ["Checkout expiry (your local time)", "2099-01-01T12:00"],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  const button = screen.getByRole("button", { name: "Create private order" });
  fireEvent.click(button);
  await screen.findByRole("alert");
  expect(
    (screen.getByLabelText("Agreed scope") as HTMLTextAreaElement).value
  ).toBe("Support pilot");
  fireEvent.click(button);
  await waitFor(() =>
    expect(
      request.mock.calls.filter(([b]) => b.action === "create")
    ).toHaveLength(2)
  );
  const calls = request.mock.calls.filter(([b]) => b.action === "create");
  expect(calls[0][0].order.id).toBe(calls[1][0].order.id);
  expect(calls[0][0].order.amountMinor).toBe(250025);
  expect(screen.queryByRole("option", { name: "USD" })).toBeNull();
});
it("removes access when the server rejects billing membership", async () => {
  const denied = vi.fn();
  render(
    <BillingWorkspace
      access={access}
      request={async () => {
        throw new BillingAccessError("Billing access denied");
      }}
      onDenied={denied}
    />
  );
  await waitFor(() =>
    expect(denied).toHaveBeenCalledWith("Billing access denied")
  );
});
it("makes the illustrative workspace read only", async () => {
  render(
    <BillingWorkspace
      access={access}
      request={async () => ({ orders: [], hasMore: false })}
      readOnly
    />
  );
  await screen.findByText(/No orders found/);
  expect(
    (screen.getByRole("button", { name: "Create order" }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  expect(
    screen.getByText(/All names, amounts and activity are illustrative/)
  ).toBeTruthy();
});
