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
2. Apply `supabase/migrations/202611140001_initial_security.sql` in the Supabase SQL editor.
3. Configure the project's Auth URL allowlist and email confirmation settings.
4. Add Vercel environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Preview and Production.
5. Configure redirect URLs for the deployed domain and local development.
6. Test sign-up, email confirmation, sign-in, password reset, profile update, avatar upload and cross-user access denial.

## Not yet launch-ready
- React grievance pages now use Supabase tables with row-level security. The legacy FastAPI + SQLite API remains in the repository for local reference only; do not expose it publicly or connect the hosted frontend to it.
- The hosted schema migration and Edge Function must be applied/deployed and tested in a real Supabase project before use.
- The account UI is a first implementation and requires end-to-end testing against a real Supabase project.
- Scheme catalogue ingestion, source freshness checks and scheme-specific eligibility rules are not yet implemented.
- AI assistant retrieval, citations, abuse controls, privacy review and model-provider configuration are not yet implemented.
- No independent security assessment, accessibility audit, load test or production monitoring has been completed.

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

The legacy FastAPI + SQLite grievance API is still used by the original grievance pages. The new React grievance workflows now query Supabase directly and rely on per-user RLS. Keep the public Vercel deployment as a non-sensitive preview until the Supabase migration is applied, Auth is configured, the Edge Function is deployed and end-to-end access-isolation tests pass. Do not expose the legacy API or accept real citizen data in it.


## Scheme data integration boundary

The current build links to the official myScheme directory and official eligibility engine. It does not scrape myScheme. The myScheme Terms of Use prohibit unauthorised bots/scrapers; API Setu integration requires partner registration, provider approval and issued credentials. If in-app live scheme search is required, obtain an authorised API subscription first, then implement an adapter with source timestamps and per-scheme provenance. Do not reverse-engineer private endpoints or scrape the site.
