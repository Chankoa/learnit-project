# Netlify production audit

This checklist keeps LearnIt aligned between local production mode and Netlify.

## Effective routes

Public and auth routes:

- `/`
- `/login`
- `/register`
- `/logout`
- `/auth/callback`
- `/access-denied`
- `/dashboard` redirects to `/app/learner`
- `/demo`
- `/case-study`
- `/formations`
- `/formations/[slug]`
- `/formations/[slug]/curriculum`
- `/domaines/[slug]`
- `/learn/[courseSlug]`
- `/learn/[courseSlug]/[lessonSlug]`

App routes:

- `/app`
- `/app/profile`
- `/app/learner`
- `/app/learner/courses`
- `/app/learner/progress`
- `/app/learner/resources`
- `/app/learner/certificates`
- `/app/teacher`
- `/app/teacher/courses`
- `/app/teacher/courses/new`
- `/app/teacher/courses/[courseId]/edit`
- `/app/teacher/courses/[courseId]/builder`
- `/app/teacher/resources`
- `/app/teacher/students`
- `/app/admin`
- `/app/admin/users`
- `/app/admin/courses`
- `/app/admin/domains`
- `/app/admin/settings`

The dynamic folder names `[courseSlug]`, `[lessonSlug]`, and `[courseId]` are parameter names only. They do not create uppercase URL segments on Linux.

## Netlify configuration

`netlify.toml` uses:

- build command: `npm run build`
- publish directory: `.next`
- Node version: `22`

There is no `_redirects` file and no SPA catch-all such as `/* /index.html 200`. Do not add one for a Next.js App Router deployment. A technical 404 should be fixed by correcting the route or link; a business 404 should come from `notFound()` only when the resource does not exist.

## Environment matrix

| Variable | Local | Production | Scope | Default | Impact if absent |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Recommended | Required | Public/server | `URL`, then `DEPLOY_PRIME_URL`, then `http://localhost:3000` | Auth emails may redirect to the wrong host if no provider fallback exists. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Recommended | Public/server | `https://learnit.dev` in SEO helper | Metadata/canonical URLs can be wrong. |
| `NEXT_PUBLIC_SUPABASE_URL` | Required for real Auth | Required | Public | none | Supabase clients are disabled; protected routes redirect to login and forms show config errors. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Required for real Auth | Required | Public | legacy anon key fallback | Supabase clients are disabled if no fallback exists. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional legacy fallback | Optional legacy fallback | Public | none | Only used if publishable key is absent. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Optional for account deletion | Server-only | none | Account deletion fails safely; route access must not depend on this key. |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` or `supabase` | `mock` or `supabase` | Public/server | `mock` | Invalid values throw an explicit config error. |
| `NEXT_PUBLIC_DEMO_MODE` | Usually `true` | Usually `false` | Public | false unless set to `true` | Controls demo banner and RoleSwitcher visibility only. |
| `NEXT_PUBLIC_ENABLE_AUTH` | Optional | Optional | Public | true in runtime config | Informational feature flag; routes still use Supabase session checks. |
| `NEXT_PUBLIC_ENABLE_ADMIN` | Optional | Optional | Public | true in runtime config | Does not hide `/app/admin`; access is governed by `profiles.role = admin`. |

## Auth and RBAC

`profiles.role` is the source of truth for connected spaces:

- `learner` -> `/app/learner`
- `teacher` -> `/app/teacher`
- `admin` -> `/app/admin`

`proxy.ts` protects `/app/profile`, `/app/learner`, `/app/teacher`, and `/app/admin`. The role policy is exact-match for app spaces. The layouts call `requireRole()` or `requireAdmin()` again as defense in depth.

`RoleSwitcher` remains visible only when `NEXT_PUBLIC_DEMO_MODE=true`. It does not grant access to protected routes.

## Supabase Auth production checklist

In Supabase Dashboard > Authentication > URL Configuration, allow:

- `http://localhost:3000/auth/callback`
- `https://<your-site>.netlify.app/auth/callback`
- `https://<your-custom-domain>/auth/callback`, when a custom domain exists
- `https://**--<your-site>.netlify.app/auth/callback`, if deploy previews need email login

Password recovery uses the same callback route with `next=/auth/reset-password`; do not add a SPA catch-all or a separate Netlify rewrite for this flow.

The production Site URL must not be localhost. Prefer setting `NEXT_PUBLIC_APP_URL` to the same canonical production URL.

## 404 diagnostics

1. Confirm the path exists in the route map above.
2. Check case exactly; Netlify/Linux is case-sensitive.
3. Search `href=`, `router.push`, `router.replace`, `redirect(`, `NextResponse.redirect`, and `window.location`.
4. For `/resources/*` and `/images/*`, confirm the file exists under `public/`.
5. For dynamic pages, separate route existence from business existence:
   - unknown course/domain/lesson -> `notFound()`
   - valid route but wrong role/session -> `/login` or `/access-denied`
   - valid lesson but no enrollment -> `/access-denied?reason=resource`

## Admin diagnostics

If `/app/admin` works locally but not on Netlify, verify:

1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set in Netlify.
2. Supabase Auth redirect URLs include the Netlify production callback.
3. The authenticated user has one `profiles` row where `id = auth.users.id`.
4. `profiles.role = 'admin'`.
5. `profiles.status = 'active'`.
6. RLS allows the authenticated user to read its own profile.
7. `NEXT_PUBLIC_ENABLE_ADMIN` is not being used as an access gate in the app.

## Production parity procedure

Run:

```bash
npm run build
npm run start
```

Then test, in a browser or with HTTP requests:

- `/`, `/formations`, `/formations/formation-creation-web`, `/login`, `/register`
- `/app/profile`, `/app/learner`, `/app/teacher`, `/app/admin` without a session: redirect to `/login`
- login with learner, teacher, and admin users: each should land on the role home route
- direct wrong-role URLs: should return `/access-denied`, not a 404
- logout and login again with another account: no app-level email prefill should remain

## Current corrective findings

- `/app/profile` was a real linked route but was missing from `proxy.ts`; it is now protected by session/profile checks.
- The proxy allowed `admin` into every app space while server layouts required exact roles; the policy is now aligned.
- Several mock resource URLs pointed to missing PDF/ZIP files; they now point to real text resources under `public/resources`.
- Mock avatar image paths referenced missing files; the optional fields were removed.
- Auth email callbacks previously depended on `NEXT_PUBLIC_APP_URL` or the SEO fallback; `lib/config/runtime.ts` now falls back to Netlify `URL`/`DEPLOY_PRIME_URL` server variables.
