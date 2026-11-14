# Samadhan Setu 🇮🇳
### Awaaz se Samadhan tak.

**A citizen-first public grievance navigation prototype.**

Samadhan Setu is an independent civic-assistance and navigation platform. It helps people organise a public-service concern, understand a preliminary category suggestion, prepare an editable complaint draft, and record their own follow-up notes. It is not a government complaint portal.

> **Honest MVP scope:** The local prototype uses deterministic keyword categorisation and general checklists. The hosted branch now runs a more specific deterministic taxonomy in PostgreSQL. Neither path is a trained LLM classifier, authority determination or official grievance channel. The app does not submit complaints, verify live government status or guarantee resolution.


## Hosted platform foundation (in progress)

The `feat/launch-platform-foundation` branch adds a Supabase-backed account and citizen-record foundation:
- Email/password authentication, email confirmation and password reset request.
- Profile settings and private profile-photo uploads.
- English/Hindi language preference and partial bilingual screens (not yet a full translation of every control and message).
- User-scoped grievance, follow-up and profile tables protected by Supabase row-level security.
- Server-side PostgreSQL taxonomy and deterministic categorisation with broad citizen correction, jurisdiction hints and unverified authority-directory entries.
- Bilingual privacy, terms, accessibility, disclaimer and help pages; skip navigation, focus styles, text-size/contrast controls and JSON data export.
- Scheme discovery links to the official myScheme directory and its official eligibility engine.
- An authenticated AI assistant Edge Function with strict limits against invented eligibility decisions or government status.

See [launch readiness](docs/LAUNCH_READINESS.md) for setup and remaining work. This branch is not production-ready until a real Supabase project is configured, migrations and Edge Function are deployed, full interface translations are completed, and end-to-end security/accessibility testing passes. The assistant does not yet perform live scheme retrieval; official myScheme is the current source of scheme discovery and eligibility results. The new second migration must be applied after the initial security migration.

## Run without Docker

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

## Current hosted branch status

The hosted UI in `feat/launch-platform-foundation` uses Supabase Auth and Supabase Postgres for user-scoped grievance records. The FastAPI + SQLite app remains a local prototype and is not part of the Vercel hosted path. Do not expose the SQLite API to the public internet.

## What works in the local prototype

- Grievance submission with description, location, language selection and prototype acknowledgement.
- Preliminary classification across six public-service categories, including selected Hindi keywords.
- Citizen correction of the suggested category.
- Category-specific general next-step and document checklists.
- Editable complaint draft and copy support.
- SQLite persistence: records survive browser refreshes and backend restarts.
- Citizen-recorded follow-up notes and reference numbers.
- Local database analytics with explicit scope caveats.
- Interactive OpenAPI documentation and automated API tests.

## Storage and privacy

The local prototype stores data in `backend/data/samadhan.db` and has no authentication or multi-user isolation. The hosted branch uses Supabase with row-level security, but must not accept real citizen data until the migration, storage policies, Auth redirects and cross-account isolation have been tested in the deployed project. Do not enter Aadhaar numbers, bank details, passwords, OTPs or unnecessary sensitive information.

## What is not implemented

- No trained LLM/agent or claim of AI-powered reasoning.
- No verified local authority directory or official portal recommendations.
- No live government API, complaint submission or status tracking.
- No verified authority assignment engine or live source retrieval; jurisdiction hints are not authority determinations.
- No evidence upload or official-document RAG.
- Hindi/English support is partial; some detail labels, help text and assistant responses still need a complete language QA pass.

## Vercel preview

The Vite frontend is configured for Vercel with the project root set to `frontend`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel and apply both Supabase migrations before testing hosted sign-in and records. The hosted frontend talks directly to Supabase; it does not use the local SQLite API. Do not deploy or expose the legacy FastAPI/SQLite service as a public multi-user backend. Deployment instructions and safety checklist are in [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md).

## Architecture

Hosted UI: React + TypeScript + Vite on Vercel → Supabase Auth + Postgres/RLS + private Storage. The assistant Edge Function is optional and requires separate deployment/secrets.

Local prototype only: React + TypeScript + Vite → FastAPI → SQLite. It is retained for offline development and tests; do not connect it to a public deployment.

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

## Development

Backend tests:

```bash
cd backend
PYTHONPATH=. pytest -q
```

Frontend production build:

```bash
cd frontend
npm install
npm run build
```

GitHub Actions runs both checks on pushes and pull requests to main.

## Roadmap

- [x] Standalone local setup without Docker or a database server
- [x] SQLite persistence
- [x] Six-category rule-based classification and selected Hindi keywords
- [x] Citizen category correction
- [x] Source-linked official grievance resources for Bihar and central-government channels
- [x] Local record deletion
- [x] Complaint draft and follow-up workflow
- [x] API tests and CI
- [x] Email/password authentication and user-scoped hosted records with RLS (requires operator setup and deployment tests)
- [ ] Human-verified authority directory with source provenance
- [ ] Official-source retrieval with citations
- [ ] Full Hindi/English translation and language-specific evaluation
- [x] Supabase hosted database schema and RLS foundation (operator must apply migrations and verify)
- [ ] Security review, accessibility audit and fully functional hosted deployment

## License

MIT. See [LICENSE](LICENSE).
