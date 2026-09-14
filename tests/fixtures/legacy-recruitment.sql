create extension if not exists pgcrypto;

create type public.application_status as enum (
  'new',
  'screening',
  'shortlisted',
  'interview',
  'assessment',
  'selected',
  'hired',
  'rejected'
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  department text not null,
  location text not null default 'Kenya',
  employment_type text not null,
  work_arrangement text not null,
  summary text not null,
  description text not null,
  responsibilities jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  standout_qualities jsonb not null default '[]'::jsonb,
  preferred_qualifications jsonb not null default '[]'::jsonb,
  portfolio_required boolean not null default false,
  talent_pool boolean not null default true,
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  application_type text not null default 'talent_pool' check (application_type in ('talent_pool', 'job_application')),
  full_name text not null,
  email text not null,
  phone text,
  location text,
  years_experience text,
  availability text,
  linkedin_url text,
  portfolio_url text,
  introduction text,
  consent_at timestamptz not null,
  status public.application_status not null default 'new',
  cv_storage_path text,
  cv_original_name text,
  cv_mime_type text,
  cv_size_bytes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  from_status public.application_status,
  to_status public.application_status,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.recruiter_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'recruiter' check (role in ('admin', 'recruiter')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_recruiter()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.recruiter_users
    where user_id = auth.uid() and active = true
  );
$$;

alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_events enable row level security;
alter table public.recruiter_users enable row level security;

drop policy if exists "Published jobs are public" on public.jobs;
create policy "Published jobs are public" on public.jobs
  for select using (status = 'published');

drop policy if exists "Recruiters manage jobs" on public.jobs;
create policy "Recruiters manage jobs" on public.jobs
  for all using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Anyone can submit applications" on public.applications;
create policy "Anyone can submit applications" on public.applications
  for insert with check (consent_at is not null);

drop policy if exists "Recruiters view applications" on public.applications;
create policy "Recruiters view applications" on public.applications
  for select using (public.is_recruiter());

drop policy if exists "Recruiters update applications" on public.applications;
create policy "Recruiters update applications" on public.applications
  for update using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Recruiters manage notes" on public.application_notes;
create policy "Recruiters manage notes" on public.application_notes
  for all using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Recruiters view events" on public.application_events;
create policy "Recruiters view events" on public.application_events
  for select using (public.is_recruiter());

drop policy if exists "Recruiters manage recruiter users" on public.recruiter_users;
create policy "Recruiters manage recruiter users" on public.recruiter_users
  for all using (public.is_recruiter()) with check (public.is_recruiter());

insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do nothing;

drop policy if exists "Recruiters can read candidate CVs" on storage.objects;
create policy "Recruiters can read candidate CVs" on storage.objects
  for select using (bucket_id = 'candidate-cvs' and public.is_recruiter());

drop policy if exists "Public can upload candidate CVs" on storage.objects;
create policy "Public can upload candidate CVs" on storage.objects
  for insert with check (bucket_id = 'candidate-cvs');
