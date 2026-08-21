# Vercel deployment and configuration

Vercel is LearnIt's primary deployment target. `netlify.toml` and `docs/deployment-netlify.md` remain only as a temporary fallback reference and must not become a divergent configuration source.

## Runtime validation

Run the validation before a deployment:

```bash
npm run config:check
npm run typecheck
npm run build
```

`config:check` loads Next environment files, validates values without printing them, and exits with code `1` for a missing, empty, or invalid required value. It permits absent optional features: Supabase is required only when `NEXT_PUBLIC_DATA_SOURCE=supabase`; an AI key and model are required only when `AI_PROVIDER` is not `mock`.

`lib/config/runtime.ts` is the only runtime configuration resolver. Empty values are invalid. `NEXT_PUBLIC_DATA_SOURCE` accepts only `mock` or `supabase`; public booleans accept only `true` or `false`; public and provider URLs must be absolute HTTP(S) URLs; timeout, input/output limits, and AI rate limit must be positive integers.

## Variable audit

| Variable | Consumed by | Scope | Sensitive | Required when | Expected value / default |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `lib/config/runtime.ts`, Auth actions, SEO | Public | No | Production and Preview recommended | Absolute canonical URL; falls back to `https://${VERCEL_URL}`, localhost only in development. |
| `NEXT_PUBLIC_SITE_URL` | `lib/config/runtime.ts` | Public legacy alias | No | Existing deployments only | Deprecated fallback; do not configure for new deployments. |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/config/runtime.ts`, Supabase clients | Public | No | `DATA_SOURCE=supabase` | Absolute `https://<project>.supabase.co` URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `lib/config/runtime.ts`, Supabase clients | Public | No | `DATA_SOURCE=supabase` | Supabase publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/config/runtime.ts`, `lib/supabase/admin.ts` | Server-only | Yes | Account deletion only | Optional; never use to bypass RLS. |
| `NEXT_PUBLIC_DATA_SOURCE` | `lib/config/runtime.ts`, `lib/lms.ts` | Public | No | Optional | `mock` default, or `supabase`. |
| `NEXT_PUBLIC_DEMO_MODE` | `lib/config/runtime.ts`, UI features | Public | No | Optional | `true` or `false`; default `false`. |
| `NEXT_PUBLIC_ENABLE_AUTH` | `lib/config/runtime.ts` | Public | No | Optional | `true` or `false`; default `true`. |
| `NEXT_PUBLIC_ENABLE_ADMIN` | `lib/config/runtime.ts` | Public | No | Optional | `true` or `false`; default `true`; not an authorization control. |
| `AI_PROVIDER` | `lib/config/runtime.ts`, `lib/forge-ai/config.ts` | Server-only | No | Optional | `mock` default, `openai`, or `openai-compatible`. |
| `OPENAI_MODEL` | `lib/config/runtime.ts`, Forge provider | Server-only | No | Real AI provider | Canonical model identifier such as `gpt-5-mini`. |
| `OPENAI_API_KEY` | `lib/config/runtime.ts`, Forge provider | Server-only | Yes | Real AI provider | Canonical provider secret. |
| `AI_MODEL` | `lib/config/runtime.ts` | Server-only legacy alias | No | Existing deployments only | Deprecated fallback for `OPENAI_MODEL`; do not configure for new deployments. |
| `AI_API_KEY` | `lib/config/runtime.ts` | Server-only legacy alias | Yes | Existing deployments only | Deprecated fallback for `OPENAI_API_KEY`; do not configure for new deployments. |
| `AI_BASE_URL` | `lib/config/runtime.ts`, Forge provider | Server-only | No | Optional | Absolute API base URL; default `https://api.openai.com/v1`. |
| `AI_TIMEOUT_MS` | `lib/config/runtime.ts`, Forge provider | Server-only | No | Optional | Positive integer; default `25000`. |
| `FORGE_AI_MAX_INPUT_CHARS` | `lib/config/runtime.ts`, Forge service | Server-only | No | Optional | Positive integer; default `3000`. |
| `FORGE_AI_MAX_OUTPUT_TOKENS` | `lib/config/runtime.ts`, Forge provider | Server-only | No | Optional | Global output-token cap; default and maximum `4000`. |
| `FORGE_AI_RATE_LIMIT_PER_HOUR` | `lib/config/runtime.ts`, `lib/forge-ai/rate-limit.ts` | Server-only | No | Optional | Positive integer; default `8`. |
| `VERCEL_URL` | `lib/config/runtime.ts` | Vercel system | No | Optional | Hostname fallback; resolver adds `https://`. |
| `VERCEL_ENV` | `lib/config/runtime.ts` | Vercel system | No | Optional | `development`, `preview`, or `production`; prevents localhost in hosted environments. |

`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `AI_API_KEY`, and `AI_MODEL` are migration aliases. New environments must use the canonical variables in `.env.example`: `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. Netlify `URL` and `DEPLOY_PRIME_URL` are no longer read by the runtime.

## Environment policy

| Environment | App URL | Data and secrets |
| --- | --- | --- |
| Local | `http://localhost:3000` in ignored `.env.local` | Use mock data or a dedicated local/test Supabase project. |
| Preview | Explicit Preview URL or `VERCEL_URL` fallback | Recommended policy: separate Supabase project and AI key; until provisioned, restrict Preview access and do not enable sensitive production workflows. |
| Production | Canonical Vercel/custom HTTPS URL | Production Supabase and production AI key only. |

Preview deployments currently require an explicit decision before granting access to production data. The recommended policy is a separate Supabase project and restricted Preview deployments; this sprint does not migrate data.

## Supabase Auth and RLS

Set the Supabase Auth Site URL to the production canonical URL. Add:

```txt
http://localhost:3000/auth/callback
https://learnit-project.vercel.app/auth/callback
https://<custom-domain>/auth/callback
```

Add a constrained Vercel preview wildcard only if Preview email authentication is required. `/auth/callback` exchanges the code server-side and only accepts safe relative `next` paths. Vercel does not alter Supabase cookies, RLS, Storage, Teacher ownership, or Learner isolation because all ordinary clients use the publishable key and session-aware server client.

## Vercel CLI workflow

```bash
npx vercel link
npx vercel env ls
npx vercel env pull .env.vercel --environment=production
npx vercel env pull .env.vercel.preview --environment=preview
npm run config:check
```

Pulled files are ignored by Git. Use the Vercel dashboard or CLI to set a variable separately for Development, Preview, and Production, then redeploy because `NEXT_PUBLIC_*` values are compiled into the client bundle.

## Canonical environment migration

Do not copy secrets through chat, source files, or logs. In each Vercel environment, first create `OPENAI_API_KEY` and `OPENAI_MODEL`, then verify `NEXT_PUBLIC_APP_URL` points to the intended HTTPS host. Deploy and confirm `npm run config:check` reports the canonical names and Forge AI works. Only then remove `AI_API_KEY`, `AI_MODEL`, and `NEXT_PUBLIC_SITE_URL`. The runtime keeps these aliases temporarily and emits a warning whenever one is detected.

## Secrets, logging, and rotation

No secret may use the `NEXT_PUBLIC_` prefix. `config:check` emits only presence/status. Server logs may record provider, model, duration, status, and redacted key presence; they must not record API keys, Authorization headers, service-role keys, tokens, full prompts, or complete source documents.

On suspected exposure, revoke the key at OpenAI or Supabase first, create a replacement, update only the intended Vercel environments, redeploy, and re-run `npm run config:check`. Treat a removed committed secret as compromised even after it is deleted.

## Headers and CSP

`next.config.mjs` sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, and a restrictive `Permissions-Policy`. A broad CSP is intentionally deferred: Next development assets, Supabase Auth, and future Forge integrations require a tested policy rather than an unverified restrictive header.

## Forge safety

Forge constrains input size, output tokens, request timeout, and per-process hourly rate. It has no infinite retry loop. Generation metadata already records action, model, provider, status, duration, and error code; token usage and estimated cost remain future work. The in-memory rate limiter is appropriate for development and test only, not distributed Vercel production; replace it later with persistent storage.