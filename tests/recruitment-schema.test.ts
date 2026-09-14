import { beforeAll, afterAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { jobs } from "../client/src/data/careers";
let db: PGlite;
const founder = "00000000-0000-4000-8000-000000000001";
const outsider = "00000000-0000-4000-8000-000000000002";
const details = {
  full_name: "Test Candidate",
  email: "candidate@example.invalid",
  introduction: "Experience in customer support",
  consent: true,
};
async function asRole(role: string, id = "") {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub', '${id}', false); set role ${role};`
  );
}
async function submit(
  extra = {},
  cv: object | null = null,
  slug = "sales-development-representative",
  id = randomUUID(),
  token = randomUUID()
) {
  const result = await db.query<{
    result: { application_id: string; upload_path: string | null };
  }>("select public.submit_application($1,$2,$3,$4::jsonb,$5::jsonb) result", [
    id,
    token,
    slug,
    JSON.stringify({ ...details, ...extra }),
    cv ? JSON.stringify(cv) : null,
  ]);
  return { ...result.rows[0].result, token };
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text, metadata jsonb, unique(bucket_id,name));
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant insert, select, update, delete on storage.objects to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    insert into auth.users values ('${founder}', 'info@callcarebpo.com', now()), ('${outsider}', 'other@example.invalid', now());
  `);
  await db.exec(
    readFileSync("tests/fixtures/legacy-recruitment.sql", "utf8").replace(
      "create extension if not exists pgcrypto;",
      ""
    )
  );
  await db.exec(`insert into public.applications(full_name,email,introduction,consent_at)
    values ('Legacy null','legacy@example.invalid',null,now()),
           ('Legacy SDR','legacy-sdr@example.invalid',E'Sales Development Representative\\n\\nExisting experience',now());`);
  const schema = readFileSync("supabase/schema.sql", "utf8");
  await db.exec(schema);
  // Applying the same upgrade a second time must preserve rows and succeed.
  await db.exec(schema);
});
afterAll(async () => {
  await db?.close();
});
it("seeds every public role and bootstraps only the designated founder", async () => {
  await asRole("postgres");
  const result = await db.query<{ slug: string }>(
    "select slug from public.jobs order by slug"
  );
  expect(result.rows.map(r => r.slug)).toEqual(jobs.map(j => j.slug).sort());
  const users = await db.query<{ user_id: string }>(
    "select user_id from public.recruiter_users"
  );
  expect(users.rows).toEqual([{ user_id: founder }]);
});
it("upgrades legacy rows without losing introductions", async () => {
  await asRole("postgres");
  const legacy = await db.query<{
    introduction: string;
    job_id: string | null;
  }>(
    "select introduction,job_id from public.applications where full_name='Legacy SDR'"
  );
  expect(legacy.rows[0].introduction).toBe("Existing experience");
  expect(legacy.rows[0].job_id).not.toBeNull();
  const empty = await db.query<{ introduction: string }>(
    "select introduction from public.applications where full_name='Legacy null'"
  );
  expect(empty.rows[0].introduction).toBe("");
});
it("blocks forged statuses, direct inserts, missing consent and required portfolios", async () => {
  await asRole("anon");
  await expect(submit({ status: "hired" })).rejects.toThrow(
    "Unsupported application fields"
  );
  await expect(
    db.exec(
      "insert into public.applications(full_name,email,consent_at,status) values('Fake','f@x.com',now(),'hired')"
    )
  ).rejects.toThrow();
  await expect(submit({ consent: false })).rejects.toThrow("consent");
  await expect(submit({}, null, "web-graphic-designer")).rejects.toThrow(
    "portfolio"
  );
  await expect(
    submit({ portfolio_url: "javascript:alert(1)" })
  ).rejects.toThrow("HTTP");
});
it("saves linked new applications idempotently without exposing other records", async () => {
  await asRole("anon");
  const id = randomUUID(),
    token = randomUUID();
  const first = await submit(
    {},
    null,
    "sales-development-representative",
    id,
    token
  );
  const retry = await submit(
    {},
    null,
    "sales-development-representative",
    id,
    token
  );
  expect(first.application_id).toBe(retry.application_id);
  await expect(
    submit({}, null, "sales-development-representative", id, randomUUID())
  ).rejects.toThrow("identity");
  expect((await db.query("select * from public.applications")).rows).toEqual(
    []
  );
  await asRole("postgres");
  const result = await db.query<{ status: string; slug: string }>(
    "select a.status,j.slug from public.applications a join public.jobs j on a.job_id=j.id where a.id=$1",
    [id]
  );
  expect(result.rows).toEqual([
    { status: "new", slug: "sales-development-representative" },
  ]);
});
it("binds CV uploads to saved records, enforces metadata and completes safely on retry", async () => {
  await asRole("anon");
  await expect(
    submit({}, { name: "large.pdf", mime: "application/pdf", size: 10485761 })
  ).rejects.toThrow("10 MB");
  await expect(
    submit({}, { name: "bad.exe", mime: "application/octet-stream", size: 20 })
  ).rejects.toThrow("PDF");
  await expect(
    db.exec(
      "insert into storage.objects(bucket_id,name) values ('candidate-cvs','random.pdf')"
    )
  ).rejects.toThrow();
  const saved = await submit(
    {},
    { name: "cv.pdf", mime: "application/pdf", size: 20 }
  );
  const complete = () =>
    db.query<{ done: boolean }>(
      "select public.complete_application_cv($1,$2) done",
      [saved.application_id, saved.token]
    );
  expect((await complete()).rows[0].done).toBe(false);
  await db.query(
    "insert into storage.objects(bucket_id,name,metadata) values ('candidate-cvs',$1,$2::jsonb)",
    [
      saved.upload_path,
      JSON.stringify({ size: 20, mimetype: "application/pdf" }),
    ]
  );
  expect((await complete()).rows[0].done).toBe(true);
  expect((await complete()).rows[0].done).toBe(true);
  await expect(
    db.query("select public.complete_application_cv($1,$2)", [
      saved.application_id,
      randomUUID(),
    ])
  ).rejects.toThrow("identity");
  await asRole("postgres");
  const bucket = await db.query<{
    public: boolean;
    file_size_limit: number;
    allowed_mime_types: string[];
  }>(
    "select public,file_size_limit,allowed_mime_types from storage.buckets where id='candidate-cvs'"
  );
  expect(bucket.rows[0].public).toBe(false);
  expect(Number(bucket.rows[0].file_size_limit)).toBe(10485760);
  expect(bucket.rows[0].allowed_mime_types).toHaveLength(3);
});
it("denies outsiders, prevents recruiter privilege escalation, and audits status changes", async () => {
  await asRole("postgres");
  await db.query(
    "insert into public.recruiter_users(user_id,role) values ($1,'admin')",
    [outsider]
  );
  await asRole("authenticated", outsider);
  expect(
    (
      await db.query<{ allowed: boolean }>(
        "select public.is_recruiter() allowed"
      )
    ).rows[0].allowed
  ).toBe(false);
  expect((await db.query("select * from public.applications")).rows).toEqual(
    []
  );
  await asRole("postgres");
  await db.query(
    "update public.recruiter_users set role='recruiter' where user_id=$1",
    [founder]
  );
  await asRole("authenticated", founder);
  expect(
    (
      await db.query<{ allowed: boolean }>(
        "select public.is_recruiter_admin() allowed"
      )
    ).rows[0].allowed
  ).toBe(false);
  await expect(
    db.query(
      "insert into public.recruiter_users(user_id,role) values ($1,'admin') on conflict(user_id) do update set role='admin'",
      [founder]
    )
  ).rejects.toThrow();
  const updated = await db.query(
    "update public.applications set status='screening' where status='new' returning id"
  );
  expect(updated.rows.length).toBeGreaterThan(0);
  expect(
    (await db.query("select * from public.application_events")).rows.length
  ).toBeGreaterThan(0);
});
