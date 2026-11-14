# Samadhan Setu 🇮🇳
### Awaaz se Samadhan tak.

**An independent citizen-first public grievance navigation prototype.**

Samadhan Setu helps people organise a public-service concern, review a preliminary category suggestion, prepare an editable complaint draft, and record their own follow-up notes. It is not a government complaint portal and is not affiliated with or endorsed by any government department.

> **Honest MVP scope:** Classification is deterministic keyword matching. The hosted version runs its taxonomy in PostgreSQL; the local prototype has its own rule-based classifier. There is no trained LLM classifier, agent orchestrator, official-document RAG, live scheme-data integration, eligibility engine, verified jurisdiction router, government complaint submission, or live grievance-status tracking. The current pilot is focused on Bihar navigation, with a small number of central-government starting links; this is not comprehensive coverage of Bihar or India.

## Current repository status

The hosted application foundation is on the default `main` branch. It uses:
- React + TypeScript + Vite for the frontend.
- Supabase Auth and PostgreSQL with row-level security for hosted accounts and grievance records.
- Private Supabase Storage buckets for profile photos and a prepared evidence-storage foundation.
- A guarded Supabase Edge Function for an authenticated conversational assistant.

The hosted foundation is **not production-ready until an operator configures a real Supabase project, applies both migrations, configures Auth and Vercel, deploys the Edge Function if it will be used, and completes live end-to-end and account-isolation testing**. A successful frontend build does not prove the live database policies or deployment work.

See [launch readiness](docs/LAUNCH_READINESS.md), [Vercel deployment notes](docs/VERCEL_DEPLOYMENT.md), and [privacy and safety](docs/PRIVACY_AND_SAFETY.md).

## What the hosted foundation contains

- Email/password sign-up and sign-in, email confirmation and password-reset UI.
- Profile editing and private profile-photo upload UI.
- English/Hindi language selection with partial translations; this is not a complete Hindi translation.
- User-scoped grievance records and follow-up notes protected by Supabase RLS.
- Server-side PostgreSQL keyword taxonomy and citizen category correction.
- Preliminary jurisdiction hints only; these are not authority determinations.
- An authority directory whose seeded entries are marked unverified until a human checks and records their provenance.
- Bilingual privacy, terms, accessibility, disclaimer and help pages.
- Keyboard skip navigation, visible focus styles, text-size and contrast controls.
- JSON export of the signed-in user's grievance records.
- A guarded assistant Edge Function. It has no live retrieval, RAG, guaranteed source citations or scheme eligibility engine.

The evidence bucket and metadata table are prepared, but there is no evidence-upload UI. Full account deletion and automatic retention enforcement are not implemented. The Insights page displays only the signed-in user's own records; it is not a population-level dashboard.

## Run the local prototype

Requirements: Python 3.11+ and Node.js 20+.

### Quick start (Mac/Linux)

From the repository root:

```bash
bash start.sh
```

The script creates a Python virtual environment, installs backend dependencies, installs frontend dependencies if needed, and starts both servers.

- Frontend: http://localhost:5173
- API: http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

### Manual start

Terminal 1:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

## Local prototype capabilities

The legacy FastAPI + SQLite prototype supports:
- Grievance draft creation with description, location and language.
- Rule-based preliminary categorisation, including selected Hindi keywords.
- Citizen category correction and general next-step/document checklists.
- Editable complaint drafts and copy support.
- SQLite persistence, citizen-entered follow-up notes and reference numbers.
- Local analytics with explicit scope caveats.
- OpenAPI documentation and automated backend API tests.

The local SQLite app has no authentication or multi-user isolation. Keep it local; **do not expose the FastAPI/SQLite API as a public multi-user service**. The hosted Vercel frontend talks directly to Supabase and does not use this API.

## Privacy and safety

Do not enter Aadhaar/PAN numbers, bank details, passwords, OTPs or unnecessary sensitive information. Do not use this prototype for emergencies or legal decisions. A saved grievance is a private draft, not an officially submitted complaint. Users must verify the correct department, current process, eligibility and jurisdiction through official sources and submit any complaint themselves.

Do not accept real citizen data in a hosted deployment until both migrations are applied, Auth and Storage are configured, and cross-account read/update/delete tests pass. The privacy notice and terms are prototype disclosures, not a legal compliance certification. A qualified DPDP review and a named, monitored platform grievance contact are still required before public launch.

## What is not implemented

- LLM-based classification, agent orchestration or trace logging.
- Official-document RAG, retrieval evaluation or guaranteed citations.
- Live scheme data, scheme-specific eligibility calculation or authorised government API integration.
- Deterministic district/urban-rural/department jurisdiction routing.
- Automatic government complaint submission or live status tracking.
- Human-verified comprehensive authority directory.
- Evidence upload, complete account deletion or automatic retention enforcement.
- Full Hindi translation and language-specific evaluation.
- Population-level insights with privacy-preserving minimum group sizes.
- Frontend end-to-end tests, production monitoring or independent security/accessibility audits.

## Vercel deployment

The frontend is configured for Vercel with the project **Root Directory** set to `frontend`, build command `npm run build`, and output directory `dist`.

Set these Vercel environment variables for the relevant Preview/Production environments:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Apply the Supabase migrations in order:
1. `supabase/migrations/202611140001_initial_security.sql`
2. `supabase/migrations/202611140002_server_taxonomy_and_hardening.sql`

Configure Supabase Auth redirect URLs for the real deployed domain. If enabling the assistant, deploy `supabase/functions/citizen-assistant` and configure `OPENAI_API_KEY`, `OPENAI_MODEL`, and the exact `APP_ORIGIN` as Supabase function secrets. Never put service-role keys or provider secrets in Vite variables or commit them to Git.

A frontend deployment without a configured Supabase project is only a non-sensitive preview. Follow [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) and [docs/LAUNCH_READINESS.md](docs/LAUNCH_READINESS.md).

## Architecture

**Hosted:** React + TypeScript + Vite on Vercel → Supabase Auth + PostgreSQL/RLS + private Storage. Optional assistant: Supabase Edge Function → configured model provider.

**Local prototype only:** React + TypeScript + Vite → FastAPI → SQLite.

See [architecture](docs/ARCHITECTURE.md), [privacy and safety](docs/PRIVACY_AND_SAFETY.md), and [demo script](docs/DEMO_SCRIPT.md).

## Local prototype API (not used by hosted Vercel frontend)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/categories` | Categories |
| POST | `/api/v1/grievances` | Create grievance |
| GET | `/api/v1/grievances` | List saved grievances |
| GET | `/api/v1/grievances/{id}` | Grievance details |
| DELETE | `/api/v1/grievances/{id}` | Delete a local record and its follow-ups |
| PATCH | `/api/v1/grievances/{id}/complaint` | Update draft |
| PATCH | `/api/v1/grievances/{id}/classification` | Citizen category correction |
| POST | `/api/v1/grievances/{id}/followups` | Add citizen follow-up |
| GET | `/api/v1/analytics/overview` | Local analytics |

## Development and validation

Backend tests:

```bash
cd backend
PYTHONPATH=. pytest -q
```

Frontend production build:

```bash
cd frontend
npm ci
npm run build
```

The current frontend package does not include a browser-test framework. CI build success is not a substitute for live Auth, RLS, Storage, or browser-flow tests.

## Roadmap

- [x] Local FastAPI + SQLite prototype and backend API tests
- [x] Hosted Supabase schema and RLS foundation (operator setup and live verification still required)
- [x] Email/password authentication and user-scoped hosted records (live deployment tests still required)
- [ ] Apply migrations and verify RLS/Storage in a real Supabase project
- [ ] Deploy and test the hosted frontend and optional assistant
- [ ] Human-verified authority directory with source provenance
- [ ] Full Hindi/English translation and language-specific evaluation
- [ ] Official-source retrieval/RAG with citations and evaluation
- [ ] Scheme data integration through authorised APIs
- [ ] Security review, accessibility audit, frontend tests and production monitoring
- [ ] Complete account deletion and retention enforcement

## License

MIT. See [LICENSE](LICENSE).
