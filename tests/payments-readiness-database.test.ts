import { afterEach, expect, it, vi } from "vitest";
import { paymentDatabaseChecks } from "../server/payments/readiness-database";

afterEach(() => vi.unstubAllGlobals());
it("checks installed columns and founder membership using only HEAD requests to Supabase", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(null, {
        status: 200,
        headers: { "content-range": "0-0/1" },
      })
  );
  vi.stubGlobal("fetch", fetchMock);
  const result = await paymentDatabaseChecks(
    "https://db.example.com",
    "sb_secret_fixture"
  );
  expect(result.every(check => check.ok)).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(3);
  for (const [url, init] of fetchMock.mock.calls as unknown as [
    string,
    RequestInit,
  ][]) {
    expect(new URL(url).origin).toBe("https://db.example.com");
    expect(init.method).toBe("HEAD");
    expect(init.body).toBeUndefined();
  }
  expect(String(fetchMock.mock.calls[2][0])).toContain("active=eq.true");
});
it("fails missing tables/access and empty founder membership without returning provider details", async () => {
  const fetchMock = vi.fn(
    async (url: string) =>
      new Response(null, {
        status: url.includes("billing_users") ? 200 : 403,
        headers: { "content-range": "*/0" },
      })
  );
  vi.stubGlobal("fetch", fetchMock);
  const result = await paymentDatabaseChecks(
    "https://db.example.com",
    "sb_secret_fixture"
  );
  expect(result.every(check => !check.ok)).toBe(true);
  expect(JSON.stringify(result)).not.toContain("sb_secret_fixture");
});
