# React + Vite

## Supabase

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
For a new database, run `supabase_schema.sql` and then
`supabase_appointment_availability.sql` in the Supabase SQL Editor.
For an existing database, back it up and run these scripts in order:

1. `supabase_appointments_migration.sql` migrates the old booking schema. It
   keeps rows only when all required booking fields can be mapped, and stops if
   data is incomplete or a legacy table has an external foreign-key dependency.
2. `supabase_admin_cms.sql` applies administrator-only access, creates the
   `contact_messages` table and configures the public image bucket.
3. `supabase_appointment_availability.sql` enables 30-minute availability,
   exposes only reserved times publicly, and prevents duplicate bookings.

If the admin appointment page reports `permission denied for table
appointments`, run `supabase_appointments_admin_read.sql` in the SQL Editor for
that same Supabase project. It grants table access to authenticated users while
the row-level security policy continues to limit appointment data to admins.

The public booking and contact forms write directly to Supabase. Only
authenticated users with `public.users.role = 'admin'` can read bookings and
messages or modify site content. Public users can read `site_content`, reserved
time slots, and public site images, but cannot read submitted contact or booking
details.
After the scripts, promote the trusted administrator account in the SQL Editor:

```sql
INSERT INTO public.users (id, nome, email, role)
SELECT
  id,
  COALESCE(NULLIF(raw_user_meta_data->>'nome', ''), split_part(email, '@', 1)),
  email,
  'admin'
FROM auth.users
WHERE lower(email) = lower('SEU_EMAIL_ADMIN')
ON CONFLICT (id) DO UPDATE SET role = 'admin'
RETURNING id, email, role;
```

Users sign in at `/login`; administrators use `/admin/login` with the same
Supabase Auth email and password. The administrator login additionally checks
that `public.users.role = 'admin'`. Unauthenticated users opening the admin
panel are redirected to `/admin/login`. The frontend uses only the anon key
from `.env.local`, never the `service_role` key; database row-level security
remains enabled.

The schema does not seed placeholder site content. Enter the real content in
the admin editor after promoting the administrator account.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
