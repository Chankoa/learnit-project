# Supabase project setup

Project URL:

```txt
https://ncpksogybugetwozbjmj.supabase.co
```

Local environment is configured in `.env.local` with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Apply SQL

The publishable key cannot run database migrations. Apply the SQL in the Supabase Dashboard SQL Editor, in this order:

1. `supabase/migrations/202606220001_profiles.sql`
2. `supabase/migrations/202606220002_lms_core.sql`
3. `supabase/seed.sql`

Run the seed after creating at least one teacher or admin profile if seeded courses should receive a `teacher_id`.

## Netlify variables

Add these variables in Netlify before deploying auth:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=https://ncpksogybugetwozbjmj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

Use the production site URL for `NEXT_PUBLIC_APP_URL`.
