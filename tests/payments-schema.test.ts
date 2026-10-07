import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, expect, it } from "vitest";
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role; alter default privileges in schema public grant all on tables to anon, authenticated;"
  );
  const sql = readFileSync("supabase/payments.sql", "utf8");
  await db.exec(sql);
  await db.exec(sql);
  await db.exec(`set role service_role; insert into public.payment_orders(access_hash,order_number,customer_email,title,scope,terms,amount_minor,currency,mode,reference,expires_at,initialization_started_at)
    values(repeat('a',64),'CC-TEST','test@example.invalid','Pilot','Scope','Terms',25000,'KES','test','cc-ref',now()+interval '7 days',now()); reset role;`);
});
afterAll(async () => {
  await db?.close();
});
it("denies direct reads, writes and payment RPCs to anonymous and signed-in recruitment users", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    await expect(
      db.query("select * from public.payment_orders")
    ).rejects.toThrow("permission denied");
    await expect(
      db.query("update public.payment_orders set status='paid'")
    ).rejects.toThrow("permission denied");
    await expect(
      db.query(
        "select public.record_order_payment('cc-ref','123',25000,'KES','test',now())"
      )
    ).rejects.toThrow("permission denied");
    await db.exec("reset role");
  }
});
it("protects initialized amounts and atomically records verified payments once", async () => {
  await db.exec("set role service_role");
  await expect(
    db.exec(
      "update public.payment_orders set amount_minor=1 where reference='cc-ref'"
    )
  ).rejects.toThrow();
  await expect(
    db.exec(
      "select public.record_order_payment('cc-ref','123',1,'KES','test',now())"
    )
  ).rejects.toThrow("does not match");
  await db.exec(
    "select public.record_order_payment('cc-ref','123',25000,'KES','test',now())"
  );
  await db.exec(
    "select public.record_order_payment('cc-ref','123',25000,'KES','test',now())"
  );
  await expect(
    db.exec(
      "select public.record_order_payment('cc-ref','456',25000,'KES','test',now())"
    )
  ).rejects.toThrow("Conflicting");
  await expect(
    db.exec(
      "update public.payment_orders set status='awaiting_payment',paid_at=null,transaction_id=null"
    )
  ).rejects.toThrow("immutable");
  const rows = await db.query<{ status: string }>(
    "select status from public.payment_orders"
  );
  expect(rows.rows).toEqual([{ status: "paid" }]);
  await db.exec("reset role");
});
