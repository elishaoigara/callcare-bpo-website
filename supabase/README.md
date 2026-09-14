# CallCare recruitment setup and upgrade

## Apply the database upgrade

Run the entire `supabase/schema.sql` file in the **existing CallCare Supabase project's SQL Editor**. It is transactional and rerunnable, supports both the original applicant-tracking schema and a fresh database, and preserves existing applications and job IDs. Do not create another project or delete candidate data.

The upgrade:

- Restricts candidate access to the confirmed `info@callcarebpo.com` Auth user with an active `recruiter_users` row. The script grants that existing user the admin role. Other email accounts cannot review candidates, even if they have an old recruiter row.
- Restricts recruiter-user management to admins.
- Seeds all six careers roles, including SDR, and links legacy applications using their old role-title prefix. Existing closed/draft job statuses are preserved.
- Keeps privileged helpers in the non-exposed `recruitment_private` schema, behind narrowly granted, input-validated RPC wrappers.
- Replaces direct public application inserts with the validated `submit_application` RPC. The server assigns the initial `new` status and consent time and enforces required portfolio links.
- Enforces PDF/Word MIME types and the 10 MB limit on the private `candidate-cvs` bucket.
- Saves each application first. A random submission token authorizes only that application's upload path for 24 hours. Retries reuse the same ID/token. `complete_application_cv` verifies the uploaded file's metadata before attaching it. No files are uploaded for failed application inserts.
- Preserves historical CV paths. Existing unreferenced files from the old flow are not deleted automatically; inspect them before performing any cleanup.
- Records future recruitment status changes in `application_events`.

The website checks `recruitment_schema_version()`. Before this upgrade is applied (or if it cannot be reached), careers pages offer applications by email instead of attempting the old insecure submission flow. The new online form becomes available automatically after the upgrade, on the next page load.

## Vercel environment

Keep the existing environment variables in the production environment, then redeploy if you change them:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Only the public anon/publishable key belongs in the frontend. No service-role key or account password is needed in Vercel or Git.

## Founder account and first password

1. In Supabase **Authentication → Users**, confirm `info@callcarebpo.com` exists. If not, create/invite that company account through Supabase and rerun the SQL after it exists. The website does not create new users through its magic-link form.
2. In **Authentication → URL Configuration**, set the Site URL to `https://www.callcarebpo.com` and allow the exact redirect `https://www.callcarebpo.com/recruitment-preview`. Add exact staging URLs separately only if you use them.
3. Visit `https://www.callcarebpo.com/recruitment-preview`. If she already has a password, sign in with it.
4. Otherwise choose **Forgot or haven't set a password? Use an email link**. After following that link, open **Account settings**, enter a new password (at least 12 characters), and confirm it. Future visits can use email/password.
5. Keep normal Supabase refresh-token/session security enabled. The browser persists the session and refreshes it through Supabase; this code does not override configured expiration limits or create a permanent bypass. Shared-device users should use **Sign out**.

Passwords are entered only in the website and sent directly to Supabase Auth. Do not paste passwords into chat, SQL, commits, or environment files.

## Verification

`pnpm test` covers password and magic-link behavior, restored/revoked/switched sessions, upload retries, nullable legacy data, and PostgreSQL policies/migration behavior in a local PGlite database. The SQL tests model Supabase Auth/Storage schemas; they do not contact the production project or send emails. `pnpm build` includes TypeScript validation.

After applying the migration, verify one authorized sign-in and a controlled application/CV upload in your own staging environment. Storage service file validation, email delivery and production Auth configuration still depend on the real Supabase project.
