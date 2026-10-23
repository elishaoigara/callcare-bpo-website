import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
let db: PGlite;
const founder = "00000000-0000-4000-8000-000000000001";
const recruiter = "00000000-0000-4000-8000-000000000002";
const id = "00000000-0000-4000-8000-000000000003";
const create = (actor = founder, amount = 250000) =>
  db.query(
    "select public.billing_create_order($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
    [
      id,
      actor,
      "a".repeat(64),
      "client@example.invalid",
      "Pilot",
      "Scope",
      "Terms",
      amount,
      "USD",
      "test",
      "2099-01-01T00:00:00Z",
    ]
  );
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values('${founder}'),('${recruiter}');
    grant usage on schema public to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to anon,authenticated;`);
  await db.exec(readFileSync("supabase/payments.sql", "utf8"));
  await db.exec(readFileSync("supabase/billing.sql", "utf8"));
  await db.exec(readFileSync("supabase/billing.sql", "utf8"));
  await db.exec(
    `insert into public.billing_users(user_id) values('${founder}')`
  );
});
afterAll(async () => db?.close());
it("keeps billing tables, permissions and RPCs closed to client roles", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    for (const table of [
      "billing_users",
      "billing_order_events",
      "payment_orders",
    ])
      await expect(db.query(`select * from public.${table}`)).rejects.toThrow(
        "permission denied"
      );
    await expect(create()).rejects.toThrow("permission denied");
    await expect(
      db.query("insert into public.billing_users(user_id) values($1)", [
        recruiter,
      ])
    ).rejects.toThrow("permission denied");
    await db.exec("reset role");
  }
});
it("requires explicit active billing permission even for privileged operations", async () => {
  await db.exec("set role service_role");
  await expect(create(recruiter)).rejects.toThrow("Billing access");
  await create();
  await create();
  await expect(create(founder, 250001)).rejects.toThrow("different details");
  const events = await db.query("select * from public.billing_order_events");
  expect(events.rows).toHaveLength(1);
  await db.exec("reset role");
});
it("audits delivery changes, rejects stale updates and never changes payment", async () => {
  await db.exec("set role service_role");
  await db.query(
    "select public.billing_update_delivery($1,$2,'in_progress',0,'Team assigned')",
    [id, founder]
  );
  await expect(
    db.query(
      "select public.billing_update_delivery($1,$2,'completed',0,'Old screen')",
      [id, founder]
    )
  ).rejects.toThrow("refresh");
  await db.query(
    "select public.billing_set_review($1,$2,true,'Customer reports a debit')",
    [id, founder]
  );
  const data = await db.query(
    "select status,delivery_status,payment_review from public.payment_orders"
  );
  expect(data.rows).toEqual([
    {
      status: "awaiting_payment",
      delivery_status: "in_progress",
      payment_review: true,
    },
  ]);
  const events = await db.query("select * from public.billing_order_events");
  expect(events.rows).toHaveLength(3);
  await db.exec("reset role");
});
it("records a verified payment once and keeps the delivery status independent", async () => {
  await db.exec("set role service_role");
  await db.query(
    "update public.payment_orders set initialization_started_at=now() where id=$1",
    [id]
  );
  const args = [
    `cc-test-${id}`,
    "123",
    250000,
    "USD",
    "test",
    "2026-10-07T00:00:00Z",
  ];
  await db.query("select public.record_order_payment($1,$2,$3,$4,$5,$6)", args);
  await db.query("select public.record_order_payment($1,$2,$3,$4,$5,$6)", args);
  const events = await db.query(
    "select * from public.billing_order_events where action='Payment confirmed'"
  );
  expect(events.rows).toHaveLength(1);
  const result = await db.query(
    "select delivery_status from public.payment_orders"
  );
  expect(result.rows[0]).toEqual({ delivery_status: "in_progress" });
  await db.exec("reset role");
});
it("revokes staff mutation access immediately when billing membership is disabled", async () => {
  await db.query(
    "update public.billing_users set active=false where user_id=$1",
    [founder]
  );
  await db.exec("set role service_role");
  await expect(
    db.query(
      "select public.billing_update_delivery($1,$2,'completed',1,'Done')",
      [id, founder]
    )
  ).rejects.toThrow("Billing access");
  await db.exec("reset role");
});
