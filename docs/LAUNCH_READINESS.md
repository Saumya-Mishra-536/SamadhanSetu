# Samadhan Setu launch readiness

Samadhan Setu is an independent civic-assistance and navigation prototype. It is not a government website, does not use the MyGov identity, and must not imply government endorsement. The current pilot is focused on Bihar navigation with a small number of central-government starting links; it is not comprehensive geographic or department coverage.

## Implemented in the repository (not proof of live deployment)
- React + TypeScript + Vite hosted frontend.
- Supabase browser client configured from public Vite environment variables.
- Email/password sign-up, sign-in, email confirmation flow and password-reset UI.
- Profile editing and private avatar upload UI (JPG/PNG/WebP, 2 MB).
- English/Hindi language context with partial translations; full interface translation is not complete.
- Supabase migrations for profiles, grievances, follow-ups, taxonomy, audit metadata, authority directory and private evidence metadata.
- RLS policies for user-owned records and private avatar/evidence Storage objects.
- Server-side deterministic keyword classification and citizen category correction through an ownership-checked RPC.
- Bilingual privacy, terms, accessibility, disclaimer and help pages.
- JSON export of the signed-in user's grievance records.
- Guarded assistant Edge Function with JWT validation, origin restriction, per-user quota and sensitive-identifier screening.

These items are code present in the repository. They must still be configured and tested in the actual Supabase and Vercel projects.

## Required operator setup

1. Create or select the intended Supabase project.
2. Apply `supabase/migrations/202611140001_initial_security.sql`, then `supabase/migrations/202611140002_server_taxonomy_and_hardening.sql`.
3. Confirm all expected tables, RLS policies and the private `avatars` and `grievance-evidence` buckets exist.
4. Configure Supabase Auth Site URL, redirect allowlist and email confirmation settings.
5. Configure Vercel with Root Directory `frontend`, Vite build command `npm run build`, output directory `dist`, and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for Preview and Production.
6. Redeploy after setting environment variables.
7. If the assistant is part of the demo, deploy `supabase/functions/citizen-assistant` and set `OPENAI_API_KEY`, `OPENAI_MODEL`, and exact `APP_ORIGIN` as Supabase function secrets.
8. Test every flow using fictional data and two separate accounts before any real citizen information is accepted.

## Live acceptance checklist

- [ ] Sign-up and email confirmation.
- [ ] Sign-in, sign-out and password reset.
- [ ] Profile edit and avatar upload/read (avatar-object cleanup is not exposed in the UI).
- [ ] Grievance creation in English and Hindi.
- [ ] Server-side keyword classification, including the no-match fallback.
- [ ] Category correction and persistence after refresh.
- [ ] Complaint-draft editing and persistence.
- [ ] Follow-up note creation and retrieval.
- [ ] JSON export.
- [ ] Individual grievance deletion.
- [ ] Account A cannot read, update or delete account B's grievance, follow-up, profile or Storage objects.
- [ ] Assistant works from the exact deployed origin and rejects a different origin.
- [ ] Human review of every authority entry, with source provenance and an actual check date.

A green CI run or successful frontend build does not complete these live checks.

## Not yet implemented / not yet proven

- A live Supabase project with both migrations applied and verified.
- A Vercel deployment with correct environment variables and Auth redirects.
- A deployed and live-tested assistant Edge Function.
- LLM-based understanding, agent orchestration or trace logging.
- Official-document RAG, retrieval evaluation or guaranteed citations.
- Live scheme-data retrieval, scheme-specific eligibility calculation or authorised API integration.
- Deterministic district, urban/rural and department jurisdiction routing.
- Comprehensive, human-verified authority directory; seeded entries are unverified.
- Evidence-upload UI (only private bucket and metadata foundation exist).
- Complete account deletion and automated retention enforcement.
- Full Hindi translation and language-specific evaluation.
- Population-level insights; current Insights is scoped to the signed-in user's records.
- A labelled evaluation set of 30–50 scenarios and evaluation metrics.
- Frontend browser tests, Sentry/error monitoring, uptime checks, independent security review or accessibility audit.
- Qualified DPDP/legal review and a named platform grievance officer with monitored contact email.

## Assistant deployment

After linking the Supabase CLI to the intended project:

```bash
supabase functions deploy citizen-assistant
supabase secrets set OPENAI_API_KEY=...
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
supabase secrets set APP_ORIGIN=https://your-real-production-host
```

Use the exact deployed browser origin for `APP_ORIGIN`. The assistant has no live retrieval, official-document index, guaranteed citations, eligibility engine or government status access. Do not market it as a live scheme-fetching agent.

## Data and safety boundary

Do not accept real citizen data until the live migration, Auth, Storage and two-account isolation checks pass. Do not expose the legacy FastAPI + SQLite API publicly; it has no multi-user authentication and is for local development/tests only.

The Insights page shows only the signed-in user's own records; it is not an aggregate public dashboard. Seeded authority directory entries default to `unverified`; do not claim that they have been human-verified. The 365-day timestamp in the grievance schema is a review marker, not automatic deletion.

The privacy notice and terms are prototype disclosures, not legal advice or a DPDP compliance certification. Obtain qualified review, publish a named platform grievance contact, and establish retention, deletion, backup and incident-response processes before public launch.
