# Vercel deployment notes

## Hosted frontend

The hosted frontend is a React + TypeScript + Vite single-page application. It uses Supabase directly for authentication and hosted grievance data; it does **not** call the legacy FastAPI + SQLite API.

In Vercel, import `Saumya-Mishra-536/SamadhanSetu` and configure:

1. **Root Directory:** `frontend`
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment variables** for Preview and Production:
   - `VITE_SUPABASE_URL` — Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase publishable/anon key

The repository's `frontend/vercel.json` also declares the Vite framework, build command, output directory and SPA fallback rewrite. Vercel project settings still need to be checked against these values. Vercel applies changed build settings on the next deployment; trigger a redeploy after changing environment variables or project settings. See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build) and [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Supabase setup — required before hosted user testing

Apply these migrations to the intended Supabase project, in this exact order:

1. `supabase/migrations/202611140001_initial_security.sql`
2. `supabase/migrations/202611140002_server_taxonomy_and_hardening.sql`

Then verify in the Supabase dashboard:
- Tables exist: `profiles`, `grievances`, `followups`, `assistant_rate_limits`, `service_taxonomy`, `authority_directory`, `grievance_audit_log`, and `grievance_evidence`.
- RLS is enabled and policies are present for user-owned records.
- Private Storage buckets exist: `avatars` and `grievance-evidence`.
- Storage object policies restrict each user's objects to their own user-ID folder.
- Seeded authority directory records remain `unverified` until a human has checked the current official source and recorded provenance.

Configure Supabase Auth Site URL and redirect allowlist for the real production domain and local development. Test email confirmation and password reset with real test inboxes. Do not use production citizen data for these checks.

## Optional assistant Edge Function

The frontend assistant calls the Supabase function `citizen-assistant`. If you intend to show this feature in the deployed demo:

1. Link the Supabase CLI to the intended project.
2. Deploy the function:
   ```bash
   supabase functions deploy citizen-assistant
   ```
3. Configure these Supabase function secrets:
   ```bash
   supabase secrets set OPENAI_API_KEY=...
   supabase secrets set OPENAI_MODEL=gpt-4.1-mini
   supabase secrets set APP_ORIGIN=https://your-real-production-host
   ```
4. Set `APP_ORIGIN` to the exact browser origin, including scheme and any required port; do not include a path or trailing slash.
5. Test assistant requests from the actual deployed site, including a request from a deliberately different origin.

The function has no live web retrieval, official-document RAG, guaranteed citations, scheme eligibility engine or government status access. Do not describe it as a live government-data agent.

## Mandatory live verification

Use fictional test data only. Before accepting any real citizen information, complete all of the following:

- [ ] Sign up and receive/complete email confirmation.
- [ ] Sign in, sign out and password reset.
- [ ] Update profile details and upload/read/replace/delete a profile photo.
- [ ] Create a grievance draft in English and Hindi.
- [ ] Confirm server-side keyword classification and the `needs_review` fallback.
- [ ] Correct the category and confirm the change persists after refresh.
- [ ] Edit and save the complaint draft.
- [ ] Add and view a citizen-entered follow-up note.
- [ ] Export the signed-in user's records as JSON.
- [ ] Delete an individual grievance and confirm its follow-ups are removed.
- [ ] Test account isolation with two separate users: account B must not read, update or delete account A's grievance, follow-ups, profile or Storage objects.
- [ ] Confirm assistant requests work from the production origin and are rejected from a different origin.
- [ ] Confirm no seeded authority entry is displayed as verified without documented human review.

A successful Vite build or GitHub Actions run does not validate the live Supabase migration, Auth configuration, Storage policies, Edge Function secrets or RLS isolation.

## Legacy local backend — do not deploy publicly

The repository retains a FastAPI + SQLite service for local development and backend tests. It has no multi-user authentication and the SQLite database is local-file storage. It is **not** the hosted backend and must not be exposed as a public service or connected to the public Vercel frontend.

## Public launch blockers

Before a public pilot with real citizen data:
- Complete the live two-account security and Storage isolation checks.
- Complete qualified legal review of the privacy notice, consent and applicable DPDP requirements.
- Publish a named platform grievance contact and monitored email address.
- Establish a lawful retention, deletion, backup and incident-response process.
- Human-verify every authority link and its scope; retain provenance and a real check date.
- Complete accessibility and screen-reader testing; do not claim WCAG/GIGW certification without an audit.
- Use a clear public disclaimer and do not imply official government affiliation.

The current build is a limited Bihar-focused navigation prototype with a few central-government starting links, not a comprehensive grievance service.
