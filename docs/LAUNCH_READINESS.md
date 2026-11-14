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
- Existing grievance pages still call the legacy SQLite API. They must be migrated to authenticated Supabase queries before public use; do not expose the SQLite API.
- The account UI is a first implementation and requires end-to-end testing against a real Supabase project.
- Scheme catalogue ingestion, source freshness checks and scheme-specific eligibility rules are not yet implemented.
- AI assistant retrieval, citations, abuse controls, privacy review and model-provider configuration are not yet implemented.
- No independent security assessment, accessibility audit, load test or production monitoring has been completed.

## Required secrets
Never commit service-role keys, database passwords, email-provider secrets or AI-provider API keys. Only the Supabase anon key is intended for browser use, and only with correctly configured RLS.
