// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import Operations from "../client/src/pages/Operations";
afterEach(cleanup);
describe("Operations review", () => {
  it("shows all eight engagement steps and illustrative dashboards", () => {
    render(<Operations />);
    expect(
      screen.getByRole("heading", {
        name: "See How CallCare Works Behind the Scenes.",
      })
    ).toBeTruthy();
    expect(screen.getAllByRole("heading", { name: "Optimize" })).toHaveLength(
      2
    );
    expect(screen.getByRole("heading", { name: "Monitor" })).toBeTruthy();
    expect(screen.getAllByText("Sample operational dashboard")).toHaveLength(2);
  });
  it("lets visitors explore layers, shift stages, and reporting views", () => {
    render(<Operations />);
    fireEvent.click(
      screen.getByRole("button", { name: /Quality assurance Checks the work/ })
    );
    expect(screen.getByText("Interaction reviews")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: /Client communication Keep you informed/,
      })
    );
    expect(
      screen.getByText(
        "Important issues, updates, and escalations move through the agreed channels."
      )
    ).toBeTruthy();
    fireEvent.keyDown(screen.getAllByRole("tab", { name: "Delivery" })[1], {
      key: "End",
    });
    expect(screen.getByText("Awaiting input")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" })
    ).toBeTruthy();
  });
});
