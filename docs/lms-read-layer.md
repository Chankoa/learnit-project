# LMS Supabase read layer

`NEXT_PUBLIC_DATA_SOURCE` selects the read-only LMS backend:

- `mock`: the historical TypeScript datasets remain the source for public catalogue pages.
- `supabase`: public catalogue, domain, course and curriculum pages read from Supabase through `lib/lms.ts`.

Only `mock` and `supabase` are accepted. Any other value raises an explicit configuration error. The Supabase repository uses the session-aware server client and the public publishable key; it never uses `SUPABASE_SERVICE_ROLE_KEY`.

## Mapping and relations

`lib/repositories/supabase/courseRepository.ts` maps database rows to application types. It converts snake_case fields such as `cover_image`, `duration_minutes`, `display_order` and `published_at` to their camelCase equivalents. A course is reconstructed with its domain, ordered modules, ordered lessons and course/module/lesson resources.

The current database schema does not store the UI-only `featured`, `faq`, `instructors`, `audience`, `objectives`, `requirements`, or `method` fields. They remain absent when Supabase is selected, and components render their existing empty states.

## RLS and seed limits

The existing RLS policies allow anonymous and authenticated reads of active domains plus published public courses and their modules, lessons and resources. No policy change is required for the catalogue.

Resources are public only when they are associated with a published public course. The current `supabase/seed.sql` does not insert any `resources` rows, so Supabase course resource sections are empty until resource seed data is added.

Learner enrollment, progress, notes, favorites, certificates and `/learn` continue to use their existing mock/local data in this sprint. They are deliberately not mixed with Supabase LMS data because their migration requires a separate enrollment and progress read layer.