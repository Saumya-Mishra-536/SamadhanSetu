# Samadhan Setu 🇮🇳
### Awaaz se Samadhan tak.

**A citizen-first public grievance navigation prototype.**

Samadhan Setu helps people organise a public-service concern, understand a preliminary category suggestion, prepare an editable complaint draft, and record their own follow-up notes. It is an assistance layer—not a government complaint portal.

> **Honest MVP scope:** The current build uses transparent keyword-based categorisation (English and selected Hindi terms), general checklists, editable complaint drafts and citizen-entered follow-ups. It does not submit complaints, verify live government status, guarantee resolution, or claim to be a trained AI system.

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

## What works

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

SQLite is embedded and created automatically at `backend/data/samadhan.db`. No PostgreSQL server, Docker, API key or external database is needed. The database is ignored by Git.

This is a single-user local prototype with no authentication or user-scoped access control. Do not enter Aadhaar numbers, bank details, passwords, OTPs or unnecessary sensitive information. Do not expose this build publicly with real personal data.

## What is not implemented

- No trained LLM/agent or claim of AI-powered reasoning.
- No verified local authority directory or official portal recommendations.
- No live government API, complaint submission or status tracking.
- No user authentication, multi-user isolation or production security controls.
- No evidence upload or official-document RAG.
- Language selection is recorded, but the interface and complaint generator are not fully multilingual.

## Architecture

```text
React + TypeScript + Vite (5173)
          | Vite proxy /api
FastAPI (8000)
   | classifier + guidance + draft
SQLite file (backend/data/samadhan.db)
```

See [architecture](docs/ARCHITECTURE.md), [privacy and safety](docs/PRIVACY_AND_SAFETY.md), and [demo script](docs/DEMO_SCRIPT.md).

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/categories` | Categories |\n| GET | `/api/v1/resources` | Source-linked official grievance channels |
| POST | `/api/v1/grievances` | Create grievance |
| GET | `/api/v1/grievances` | List saved grievances |
| GET | `/api/v1/grievances/{id}` | Grievance details |
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
- [x] Citizen category correction\n- [x] Source-linked official grievance resources for Bihar and central-government channels\n- [x] Local record deletion
- [x] Complaint draft and follow-up workflow
- [x] API tests and CI
- [ ] Authentication and multi-user authorisation
- [ ] Verified authority directory with source provenance
- [ ] Official-source retrieval with citations
- [ ] Fully multilingual interface and evaluation
- [ ] Security review and hosted deployment

## License

MIT. See [LICENSE](LICENSE).
