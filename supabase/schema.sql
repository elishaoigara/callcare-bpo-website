-- Safe to run on the existing database or a fresh Supabase project.
begin;

do $$ begin
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
exception when duplicate_object then null;
end $$;

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

alter table public.applications add column if not exists submission_token_hash text;
alter table public.applications add column if not exists cv_upload_path text;
update public.applications set introduction = '' where introduction is null;
alter table public.applications alter column introduction set default '';
alter table public.applications alter column introduction set not null;

create schema if not exists recruitment_private;
grant usage on schema recruitment_private to anon, authenticated;

create or replace function recruitment_private.is_recruiter()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.recruiter_users r join auth.users u on u.id = r.user_id
    where r.user_id = auth.uid() and r.active
      and lower(u.email) in ('info@callcarebpo.com', 'lambertelisha732@gmail.com') and u.email_confirmed_at is not null
  );
$$;

create or replace function public.is_recruiter()
returns boolean language sql security invoker set search_path = '' as $$
  select recruitment_private.is_recruiter();
$$;

create or replace function recruitment_private.is_recruiter_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_recruiter() and exists (
    select 1 from public.recruiter_users where user_id = auth.uid() and role = 'admin' and active
  );
$$;

create or replace function public.is_recruiter_admin()
returns boolean language sql security invoker set search_path = '' as $$
  select recruitment_private.is_recruiter_admin();
$$;
revoke all on function public.is_recruiter(), public.is_recruiter_admin() from public, anon, authenticated;
grant execute on function public.is_recruiter(), public.is_recruiter_admin() to anon, authenticated;

alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_events enable row level security;
alter table public.recruiter_users enable row level security;

drop policy if exists "Published jobs are public" on public.jobs;
create policy "Published jobs are public" on public.jobs for select to anon, authenticated using (status = 'published');
drop policy if exists "Recruiters manage jobs" on public.jobs;
create policy "Recruiters manage jobs" on public.jobs for all to authenticated using (public.is_recruiter_admin()) with check (public.is_recruiter_admin());

drop policy if exists "Anyone can submit applications" on public.applications;
-- All new applications go through the validated RPC; no direct public INSERT.
revoke insert, update, delete on public.applications from anon;
revoke insert, delete on public.applications from authenticated;
grant select, update on public.applications to authenticated;
drop policy if exists "Recruiters view applications" on public.applications;
create policy "Recruiters view applications" on public.applications for select to authenticated using (public.is_recruiter());
drop policy if exists "Recruiters update applications" on public.applications;
create policy "Recruiters update applications" on public.applications for update to authenticated using (public.is_recruiter()) with check (public.is_recruiter());

drop policy if exists "Recruiters manage notes" on public.application_notes;
create policy "Recruiters manage notes" on public.application_notes for all to authenticated using (public.is_recruiter()) with check (public.is_recruiter() and author_id = auth.uid());
drop policy if exists "Recruiters view events" on public.application_events;
create policy "Recruiters view events" on public.application_events for select to authenticated using (public.is_recruiter());
drop policy if exists "Recruiters manage recruiter users" on public.recruiter_users;
create policy "Recruiters manage recruiter users" on public.recruiter_users for all to authenticated using (public.is_recruiter_admin()) with check (public.is_recruiter_admin());

insert into public.recruiter_users (user_id, role, active)
select id, 'admin', true from auth.users where lower(email) = 'info@callcarebpo.com'
on conflict (user_id) do update set role = excluded.role, active = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-cvs', 'candidate-cvs', false, 10485760, array[
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]) on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- The unguessable upload path is returned only to the submitting browser.
-- Each path is bound to a saved application and expires for new uploads after 24h.
create or replace function recruitment_private.can_upload_candidate_cv(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.applications
    where cv_upload_path = object_name and submission_token_hash is not null
      and cv_storage_path is null and created_at > now() - interval '24 hours');
$$;

create or replace function public.can_upload_candidate_cv(object_name text)
returns boolean language sql security invoker set search_path = '' as $$
  select recruitment_private.can_upload_candidate_cv(object_name);
$$;
revoke all on function public.can_upload_candidate_cv(text) from public, anon, authenticated;
grant execute on function public.can_upload_candidate_cv(text) to anon, authenticated;
drop policy if exists "Public can upload candidate CVs" on storage.objects;
create policy "Public can upload candidate CVs" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'candidate-cvs' and public.can_upload_candidate_cv(name));
drop policy if exists "Recruiters can read candidate CVs" on storage.objects;
create policy "Recruiters can read candidate CVs" on storage.objects for select to authenticated
using (bucket_id = 'candidate-cvs' and public.is_recruiter());

create or replace function recruitment_private.submit_application(
  p_id uuid, p_token uuid, p_job_slug text, p_details jsonb, p_cv jsonb default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing public.applications%rowtype;
  job public.jobs%rowtype;
  token_hash text;
  upload_path text;
  cv_name text;
  cv_mime text;
  cv_size integer;
begin
  -- Anonymous candidates use a per-submission capability token; authenticated
  -- callers must also retain a real Auth identity. No user metadata is trusted.
  if auth.uid() is not null and not exists (select 1 from auth.users where id = auth.uid()) then
    raise exception 'Invalid authenticated identity';
  end if;
  if p_id is null or p_token is null then raise exception 'Missing submission identity'; end if;
  token_hash := encode(sha256(convert_to(p_token::text, 'UTF8')), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  select * into existing from public.applications where id = p_id;
  if found then
    if existing.submission_token_hash is distinct from token_hash then raise exception 'Invalid submission identity'; end if;
    return jsonb_build_object('application_id', existing.id, 'upload_path', existing.cv_upload_path);
  end if;
  select * into job from public.jobs where slug = p_job_slug and status = 'published';
  if not found then raise exception 'This role is not accepting applications'; end if;
  if p_details is null or jsonb_typeof(p_details) <> 'object' then raise exception 'Invalid application'; end if;
  if exists (select 1 from jsonb_object_keys(p_details) key where key not in (
    'full_name', 'email', 'phone', 'location', 'years_experience', 'availability', 'linkedin_url', 'portfolio_url', 'introduction', 'consent'
  )) then raise exception 'Unsupported application fields'; end if;
  if (p_details->'consent') is distinct from 'true'::jsonb then raise exception 'Recruitment consent is required'; end if;
  if length(btrim(coalesce(p_details->>'full_name', ''))) not between 1 and 200
    or length(btrim(coalesce(p_details->>'introduction', ''))) not between 1 and 10000
    or length(coalesce(p_details->>'email', '')) > 320
    or coalesce(p_details->>'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    then raise exception 'Please provide a valid name, email and introduction'; end if;
  if length(p_details::text) > 16000 then raise exception 'Application is too long'; end if;
  if (nullif(p_details->>'linkedin_url', '') is not null and p_details->>'linkedin_url' !~* '^https?://[^[:space:]/]+')
    or (nullif(p_details->>'portfolio_url', '') is not null and p_details->>'portfolio_url' !~* '^https?://[^[:space:]/]+')
    then raise exception 'Links must be HTTP or HTTPS URLs'; end if;
  if job.portfolio_required and nullif(btrim(p_details->>'portfolio_url'), '') is null then raise exception 'A portfolio URL is required for this role'; end if;

  if p_cv is not null and p_cv <> 'null'::jsonb then
    cv_name := p_cv->>'name'; cv_mime := p_cv->>'mime'; cv_size := (p_cv->>'size')::integer;
    if cv_size is null or cv_size not between 1 and 10485760 or cv_name is null or length(cv_name) not between 1 and 240
      or not ((cv_mime = 'application/pdf' and cv_name ~* '\.pdf$')
        or (cv_mime = 'application/msword' and cv_name ~* '\.doc$')
        or (cv_mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' and cv_name ~* '\.docx$'))
      or cv_mime is null then raise exception 'Choose a PDF or Word CV up to 10 MB'; end if;
    upload_path := 'applications/' || p_id::text || '/' || p_token::text || '/' || regexp_replace(cv_name, '[^a-zA-Z0-9._-]', '-', 'g');
  end if;

  insert into public.applications (id, job_id, application_type, full_name, email, phone, location,
    years_experience, availability, linkedin_url, portfolio_url, introduction, consent_at, status,
    cv_original_name, cv_mime_type, cv_size_bytes, cv_upload_path, submission_token_hash)
  values (p_id, job.id, case when job.talent_pool then 'talent_pool' else 'job_application' end,
    btrim(p_details->>'full_name'), lower(btrim(p_details->>'email')), nullif(p_details->>'phone', ''),
    nullif(p_details->>'location', ''), nullif(p_details->>'years_experience', ''), nullif(p_details->>'availability', ''),
    nullif(p_details->>'linkedin_url', ''), nullif(p_details->>'portfolio_url', ''), btrim(p_details->>'introduction'),
    now(), 'new', cv_name, cv_mime, cv_size, upload_path, token_hash);
  return jsonb_build_object('application_id', p_id, 'upload_path', upload_path);
end;
$$;

create or replace function public.submit_application(p_id uuid, p_token uuid, p_job_slug text, p_details jsonb, p_cv jsonb default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select recruitment_private.submit_application(p_id,p_token,p_job_slug,p_details,p_cv);
$$;
revoke all on function public.submit_application(uuid, uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.submit_application(uuid, uuid, text, jsonb, jsonb) to anon, authenticated;

create or replace function recruitment_private.complete_application_cv(p_id uuid, p_token uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare candidate public.applications%rowtype;
begin
  -- Anonymous candidates use a per-submission capability token; authenticated
  -- callers must also retain a real Auth identity. No user metadata is trusted.
  if auth.uid() is not null and not exists (select 1 from auth.users where id = auth.uid()) then
    raise exception 'Invalid authenticated identity';
  end if;
  select * into candidate from public.applications where id = p_id for update;
  if not found or candidate.submission_token_hash is null or candidate.submission_token_hash is distinct from
    encode(sha256(convert_to(p_token::text, 'UTF8')), 'hex') then raise exception 'Invalid submission identity'; end if;
  if candidate.cv_storage_path is not null then return true; end if;
  if candidate.cv_upload_path is null then return false; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'candidate-cvs' and name = candidate.cv_upload_path
    and (metadata->>'size')::bigint = candidate.cv_size_bytes and metadata->>'mimetype' = candidate.cv_mime_type)
    then return false; end if;
  update public.applications set cv_storage_path = cv_upload_path, updated_at = now() where id = p_id;
  return true;
end;
$$;

create or replace function public.complete_application_cv(p_id uuid, p_token uuid)
returns boolean language sql security invoker set search_path = '' as $$
  select recruitment_private.complete_application_cv(p_id,p_token);
$$;
revoke all on function public.complete_application_cv(uuid, uuid) from public, anon, authenticated;
grant execute on function public.complete_application_cv(uuid, uuid) to anon, authenticated;

create or replace function public.record_application_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status is distinct from new.status then
    insert into public.application_events(application_id, actor_id, from_status, to_status)
    values (new.id, auth.uid(), old.status, new.status);
  end if;
  return new;
end;
$$;
revoke all on function public.record_application_status() from public, anon, authenticated;
drop trigger if exists application_status_audit on public.applications;
create trigger application_status_audit after update of status on public.applications for each row execute function public.record_application_status();

revoke all on all functions in schema recruitment_private from public, anon, authenticated;
grant execute on function recruitment_private.is_recruiter(), recruitment_private.is_recruiter_admin(),
  recruitment_private.can_upload_candidate_cv(text), recruitment_private.submit_application(uuid,uuid,text,jsonb,jsonb),
  recruitment_private.complete_application_cv(uuid,uuid) to anon, authenticated;

-- Explicit grants work even on projects with opt-in Data API exposure.
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.recruiter_users, public.application_notes to authenticated;
grant select on public.application_events to authenticated;
create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_created_id_idx on public.applications(created_at desc, id);
create index if not exists applications_cv_upload_path_idx on public.applications(cv_upload_path) where cv_upload_path is not null;
create index if not exists application_notes_application_idx on public.application_notes(application_id);
create index if not exists application_notes_author_idx on public.application_notes(author_id);
create index if not exists application_events_application_idx on public.application_events(application_id);
create index if not exists application_events_actor_idx on public.application_events(actor_id);

-- Job seeds below preserve existing UUIDs and any recruiter-managed closed/draft status.
insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('executive-assistant', 'Executive Assistant', 'Administrative & Executive Support', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Bring structure, foresight, and dependable support to the work behind ambitious leaders.', 'CallCare is building a talent pool of highly organized, proactive, and dependable Executive Assistants to support executives, founders, and growing businesses across industries and time zones.', '["Manage calendars, meetings, appointments, and schedules across time zones.", "Manage inboxes, correspondence, action items, tasks, deadlines, and follow-ups.", "Conduct research and prepare reports, presentations, documents, and business materials.", "Coordinate travel, reservations, clients, teams, and external stakeholders.", "Maintain CRM and project-management systems while handling confidential information professionally.", "Identify problems proactively and provide general administrative and operational support."]'::jsonb, '["Previous experience as an Executive Assistant, Virtual Assistant, Administrative Assistant, or similar.", "Excellent written and verbal communication, organization, and time management.", "Strong attention to detail, problem-solving ability, and confidence managing multiple priorities.", "Ability to work independently, learn software and processes quickly, and communicate professionally.", "Reliable computer and internet connection with flexibility for international clients and time zones."]'::jsonb, '["Proactive", "Organized", "Reliable", "Resourceful", "Discreet", "Detail-oriented"]'::jsonb, '["Proactive, organized, reliable, resourceful, discreet, and detail-oriented."]'::jsonb, false, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;

insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('customer-service-representative', 'Customer Service Representative', 'Customer Experience', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Be the calm, capable voice behind customer experiences that make people feel heard and valued.', 'CallCare is building a talent pool of customer service professionals who understand that excellent service goes beyond answering questions. Our representatives help customers feel supported while representing clients with professionalism.', '["Handle inbound and outbound customer interactions across phone, email, chat, and other channels.", "Respond to questions, resolve issues, provide accurate information, and handle complaints professionally.", "Document interactions accurately, update CRM and customer records, and follow client processes.", "Escalate complex issues appropriately and meet quality, productivity, and satisfaction targets."]'::jsonb, '["Previous customer service or call-center experience is preferred.", "Excellent spoken and written English with strong communication and listening skills.", "Patience, empathy, problem-solving ability, and the ability to remain calm under pressure.", "Comfort using computers, CRM systems, customer-support tools, and structured processes.", "Reliable computer and internet connection with flexibility for client shifts."]'::jsonb, '["Empathetic", "Patient", "Professional", "Clear", "Resilient", "Solution-oriented"]'::jsonb, '["Empathetic, patient, professional, clear, resilient, and solution-oriented."]'::jsonb, false, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;

insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('customer-success-manager', 'Customer Success Manager', 'Customer Success & Account Management', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Help businesses build lasting customer relationships, improve retention, and find room to grow.', 'CallCare is building a talent pool of Customer Success professionals who understand customer needs, improve the experience, reduce churn, and identify opportunities for sustainable growth.', '["Manage customer relationships and serve as a primary point of contact for assigned accounts.", "Monitor satisfaction, engagement, account health, customer activity, and performance.", "Conduct customer check-ins and business reviews while identifying opportunities to add value.", "Identify retention risks, resolve escalated concerns, and coordinate with sales, support, and operations.", "Analyze feedback, prepare reports, and develop strategies to improve retention and satisfaction.", "Identify appropriate upselling and cross-selling opportunities."]'::jsonb, '["Previous experience in Customer Success, Account Management, Client Services, or a related role.", "Strong relationship-management, communication, organization, and problem-solving skills.", "Customer-focused mindset, commercial awareness, and ability to manage multiple priorities.", "Comfort working with CRM and reporting tools and independently supporting international clients."]'::jsonb, '["Relationship-driven", "Strategic", "Proactive", "Commercially aware", "Customer-focused", "Analytical"]'::jsonb, '["Relationship-driven, strategic, proactive, commercially aware, customer-focused, and analytical.", "Experience working with international clients is an advantage."]'::jsonb, false, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;

insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('web-graphic-designer', 'Web & Graphic Designer', 'Creative & Digital', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Turn brands, products, and ideas into compelling digital experiences and visual content.', 'CallCare is building a creative talent pool of Web and Graphic Designers. We are interested in both specialists and versatile creatives who can work across web, branding, marketing, and digital design.', '["Design responsive websites, landing pages, UI/UX experiences, and digital interfaces.", "Maintain and update websites and create e-commerce experiences where required.", "Create brand identities, social graphics, digital advertisements, presentations, and marketing materials.", "Design brochures, flyers, email assets, and other visual content while maintaining brand consistency.", "Collaborate with developers and marketing teams, interpret creative briefs, and implement feedback."]'::jsonb, '["Proven experience in web design, graphic design, or a related field.", "Strong portfolio demonstrating your work, with a good understanding of design principles.", "Strong visual thinking, attention to detail, deadline management, and communication skills.", "Ability to work independently, collaborate well, and receive and implement feedback."]'::jsonb, '["Creative", "Detail-oriented", "Adaptable", "Curious", "Innovative", "Deadline-driven"]'::jsonb, '["Experience with Figma, Adobe Creative Suite, Photoshop, Illustrator, Canva, Webflow, WordPress, HTML/CSS, JavaScript, or React.", "Web professionals should understand responsive design, UX/UI principles, and different screen sizes."]'::jsonb, true, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;

insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('sales-development-representative', 'Sales Development Representative', 'Sales & Business Development', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Create meaningful sales opportunities by reaching the right prospects, qualifying genuine needs, and booking quality meetings.', 'CallCare is building a talent pool of motivated Sales Development Representatives who can help businesses identify, engage, and qualify potential customers. SDRs will support clients through outbound prospecting, relationship-building, and qualified meeting generation for sales teams.', '["Research and identify potential prospects through client-approved channels.", "Conduct outbound calls and send personalized email and LinkedIn outreach.", "Qualify leads using client-defined criteria and identify customer needs, pain points, and buying signals.", "Schedule qualified appointments and sales meetings and follow up consistently with prospects.", "Maintain accurate lead, activity, and prospect records in CRM systems.", "Meet daily and weekly activity targets while tracking outreach and appointment-setting performance.", "Work closely with Account Executives and sales teams while following client scripts, processes, and messaging.", "Handle objections professionally and confidently."]'::jsonb, '["Previous experience in SDR, BDR, appointment setting, inside sales, or outbound sales is preferred.", "Excellent spoken and written English with strong communication and interpersonal skills.", "Comfort making outbound calls and confidence speaking with decision-makers and prospects.", "Strong listening, questioning, research, prospecting, organization, and follow-up skills.", "Ability to handle rejection, remain persistent, work independently, and stay target-driven.", "Good CRM and computer skills with a reliable computer and internet connection.", "Flexibility to work with international clients and time zones."]'::jsonb, '["Confident", "Persistent", "Curious", "Persuasive", "Resilient", "Results-driven"]'::jsonb, '["Experience with HubSpot, Salesforce, Pipedrive, LinkedIn Sales Navigator, Apollo, ZoomInfo, Google Workspace, Slack, dialers, or client-specific sales platforms.", "Confident, persistent, curious, persuasive, resilient, and results-driven.", "Success means consistently reaching the right prospects, having meaningful conversations, qualifying genuine opportunities, booking quality meetings, maintaining accurate CRM records, and meeting or exceeding performance targets."]'::jsonb, false, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;

insert into public.jobs (slug, title, department, location, employment_type, work_arrangement, summary, description, responsibilities, requirements, standout_qualities, preferred_qualifications, portfolio_required, talent_pool, status)
values ('data-analytics-professional', 'Data & Analytics Professional', 'Data & Analytics', 'Kenya', 'Full-time / Contract opportunities', 'Remote', 'Turn accurate records and meaningful analysis into better business decisions.', 'CallCare is building a talent pool of detail-oriented data professionals across data entry, processing, cleaning, validation, research, analysis, reporting, business intelligence, visualization, and operations analytics.', '["Enter, maintain, clean, organize, validate, and quality-check data.", "Conduct data research and collection while maintaining spreadsheets and databases.", "Create reports and dashboards, analyze trends, and prepare regular operational updates.", "Extract insights from datasets and support business decision-making through data.", "Document processes and findings and work with teams to improve accuracy and reporting."]'::jsonb, '["Strong attention to detail, organization, analytical thinking, and problem-solving ability.", "Good Excel and/or Google Sheets skills with strong numerical and logical reasoning.", "Ability to work with large amounts of information, identify inconsistencies, and meet deadlines.", "Good written communication and ability to work independently."]'::jsonb, '["Accurate", "Analytical", "Curious", "Methodical", "Detail-oriented", "Data-driven"]'::jsonb, '["Experience with Excel, Google Sheets, SQL, Power BI, Tableau, Looker Studio, Python, or client databases.", "Accurate, analytical, curious, methodical, detail-oriented, and data-driven."]'::jsonb, false, true, 'published')
on conflict (slug) do update set title = excluded.title, department = excluded.department, location = excluded.location, employment_type = excluded.employment_type, work_arrangement = excluded.work_arrangement, summary = excluded.summary, description = excluded.description, responsibilities = excluded.responsibilities, requirements = excluded.requirements, standout_qualities = excluded.standout_qualities, preferred_qualifications = excluded.preferred_qualifications, portfolio_required = excluded.portfolio_required, talent_pool = excluded.talent_pool;


-- Link old applications without losing their introduction or recruitment history.
update public.applications a set job_id = j.id,
  introduction = ltrim(substr(a.introduction, length(j.title) + 1), E'\n\r ')
from public.jobs j where a.job_id is null and split_part(a.introduction, E'\n', 1) = j.title;
create or replace function public.recruitment_schema_version()
returns integer language sql immutable set search_path = '' as $$ select 2; $$;
revoke all on function public.recruitment_schema_version() from public, anon, authenticated;
grant execute on function public.recruitment_schema_version() to anon, authenticated;
commit;
