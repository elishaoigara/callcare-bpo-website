# CallCare Supabase setup

The staging applicant-tracking UI expects two Vercel environment variables:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Use the Supabase Dashboard SQL Editor to run `supabase/schema.sql`. This creates the jobs, applications, notes, audit events, recruiter users, row-level-security policies, and private `candidate-cvs` storage bucket.

## Create the founder account

In Supabase Dashboard, open **Authentication → Users** and create or invite the founder’s company email. After the user exists, copy the user UUID and run:

```sql
insert into public.recruiter_users (user_id, role)
values ('FOUNDER_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update set role = excluded.role, active = true;
```

The founder can then open `/recruitment-preview`, enter the same email address, and use the magic link delivered by Supabase Auth.

## Security notes

Keep only the Supabase URL and anon key in the Vercel staging environment. Never expose a Supabase service-role key in browser code or commit it to Git. Candidate CVs are stored in a private bucket and opened through short-lived signed URLs for authenticated recruiters.

Before production launch, add email notifications, malware scanning for uploaded CVs, a retention/deletion process, a candidate privacy notice, and a second company-controlled administrator account.
