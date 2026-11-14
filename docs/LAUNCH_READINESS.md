# Samadhan Setu launch readiness

Samadhan Setu is an independent civic-assistance platform. It is not a government website, does not use the MyGov identity, and must not imply government endorsement.

## Implemented in this foundation branch
- Supabase browser client configured only from public Vite environment variables.
- Email/password sign-up, sign-in, email confirmation flow and password reset request UI.
- Account profile editing and image upload UI (JPG/PNG/WebP, 2 MB).
- English/Hindi language context and translated primary navigation/account/scheme copy.
- Supabase SQL migration for profiles, grievances and follow-ups with row-level security.
- Private avatar bucket policies scoped to the authenticated user's folder.

## Required operator setup
1. Create a Supabase project.
2. Apply `supabase/migrations/202611140001_initial_security.sql` and then `supabase/migrations/202611140002_server_taxonomy_and_hardening.sql` in the Supabase SQL editor.
3. Configure the project's Auth URL allowlist and email confirmation settings.
4. Add Vercel environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Preview and Production.
5. Configure redirect URLs for the deployed domain and local development.
6. Test sign-up, email confirmation, sign-in, password reset, profile update, avatar upload and cross-user access denial.

## Not yet launch-ready
- React grievance pages now use Supabase tables with row-level security. The legacy FastAPI + SQLite API remains in the repository for local reference only; do not expose it publicly or connect the hosted frontend to it.
- Both hosted schema migrations and the Edge Function must be applied/deployed and tested in a real Supabase project before use.
- The hosted classification trigger and taxonomy are server-side deterministic keyword rules, not an LLM or a trained model. Citizens can correct the broad category through an ownership-checked database function.
- The authority directory is seeded with unverified navigation entries. Do not display them as verified until a human records the source check.
- Evidence metadata and a private storage bucket are prepared, but evidence upload UI is not implemented.
- The Insights page shows only the signed-in user's own records. It is not a population-level dashboard.
- The account UI is a first implementation and requires end-to-end testing against a real Supabase project.
- Scheme catalogue ingestion, source freshness checks and scheme-specific eligibility rules are not yet implemented.
- The assistant has JWT verification, a per-user quota and sensitive-identifier screening, but no live retrieval, document RAG or guaranteed citations. Model-provider secrets and exact origin must be configured by the operator; a formal privacy review is outstanding.
- No independent security assessment, accessibility audit, screen-reader test, load test or production monitoring has been completed.
- A JSON export of the signed-in user's grievance records is available in profile settings. Full account deletion and automated retention enforcement remain outstanding.

## Required secrets
Never commit service-role keys, database passwords, email-provider secrets or AI-provider API keys. Only the Supabase anon key is intended for browser use, and only with correctly configured RLS.

## Assistant deployment

Deploy the Edge Function after linking the Supabase project:

```bash
supabase functions deploy citizen-assistant
supabase secrets set OPENAI_API_KEY=...
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
supabase secrets set APP_ORIGIN=https://your-real-domain.example
```

The current assistant is an authenticated, guarded conversational helper. It has a fixed list of official starting links but no live scheme crawler, retrieval index or eligibility engine. It must not be marketed as a live scheme-fetching agent until an official data source, ingestion schedule, source-level freshness metadata and scheme-specific eligibility rules have been implemented and tested.

## Important migration boundary

The legacy FastAPI + SQLite grievance API is retained for local development and backend tests only. The hosted React grievance workflows query Supabase directly and rely on per-user RLS. Keep the public Vercel deployment as a non-sensitive preview until the Supabase migration is applied, Auth is configured, the Edge Function is deployed and end-to-end access-isolation tests pass. Do not expose the legacy API or accept real citizen data in it.


## Scheme data integration boundary

The current build links to the official myScheme directory and official eligibility engine. It does not scrape myScheme. The myScheme Terms of Use prohibit unauthorised bots/scrapers; API Setu integration requires partner registration, provider approval and issued credentials. If in-app live scheme search is required, obtain an authorised API subscription first, then implement an adapter with source timestamps and per-scheme provenance. Do not reverse-engineer private endpoints or scrape the site.
