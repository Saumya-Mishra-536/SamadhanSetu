# Samadhan Setu 🇮🇳
### Awaaz se Samadhan tak.

**A citizen-first public grievance navigation prototype.**

Samadhan Setu helps people organise a public-service concern, understand a preliminary category suggestion, prepare an editable complaint draft, and record their own follow-up notes.

> **Important:** This repository currently provides a hackathon MVP/prototype. It does not submit complaints to government systems, verify live grievance status, or guarantee action or resolution. Category suggestions use transparent keyword rules, not a trained model. Guidance is general and must be checked against official sources for the user's jurisdiction.

## What works in this MVP

- Grievance submission with description, location, language and consent acknowledgement.
- Preliminary keyword-based classification across six public-service categories.
- Category-specific general next-step and document checklists.
- Editable complaint draft with copy support.
- Session-level grievance list and citizen-recorded follow-up notes.
- Basic session analytics with a clear warning that these are not population statistics.
- OpenAPI documentation at `/docs`.

## Current limitations

- Records are held in backend memory and are lost when the API restarts.
- PostgreSQL + pgvector service is included in Docker Compose for the next persistence/RAG phase, but the current MVP API does not yet persist to it.
- No live authority directory, official-source retrieval, government portal integration, authentication, file upload, or LLM agent is implemented.
- The demo uses English interface text; the language field records the user's selection but does not yet translate or process all Indian languages.
- Do not enter Aadhaar, bank details, passwords or unnecessary sensitive information.

## Run locally with Docker

Prerequisites: Docker Desktop running.

From the repository root:

```bash
docker compose up --build
```

- API: http://localhost:8000
- Health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

The database container starts with pgvector enabled, but current API data remains in memory. Docker Compose uses development-only credentials; replace them and use secrets management before any public deployment.

## Run the frontend locally

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` and `/health` requests to the backend on port 8000.

To create a production frontend build:

```bash
npm run build
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/categories` | Available categories |
| POST | `/api/v1/grievances` | Create and analyse a grievance |
| GET | `/api/v1/grievances` | List session grievances |
| GET | `/api/v1/grievances/{id}` | Get a grievance |
| PATCH | `/api/v1/grievances/{id}/complaint` | Save edited complaint draft |
| POST | `/api/v1/grievances/{id}/followups` | Add citizen-recorded follow-up |
| GET | `/api/v1/analytics/overview` | Session analytics |

## Architecture

```text
React + TypeScript + Vite
          |
     Vite API proxy
          |
 FastAPI REST API
   |      |       |
rules  draft   guidance
          |
in-memory prototype store

Docker Compose also starts PostgreSQL + pgvector
(reserved for the persistence / retrieval phase)
```

## Safety and trust

- Distinguish citizen-recorded information from government-confirmed status.
- Do not invent officials, phone numbers, portals, deadlines or statutory procedures.
- Verify jurisdiction and official source information before recommending a specific authority.
- Obtain informed consent before storing or sharing personal data.
- Never publish personal data in analytics or sample datasets.
- Complaint drafts must be reviewed and submitted by the citizen through an independently verified official channel.

## Development roadmap

- [x] Runnable FastAPI and React/Vite application skeleton
- [x] Grievance submission and preliminary rule-based categorisation
- [x] Editable complaint draft and citizen follow-up notes
- [x] Basic session analytics and API documentation
- [ ] Persistent PostgreSQL models and migrations
- [ ] Verified jurisdiction-to-authority directory with source citations
- [ ] Official-document ingestion and cited retrieval
- [ ] Multilingual classification and interface
- [ ] Authentication, consent management and retention controls
- [ ] Automated tests, CI and deployment
- [ ] User testing and measured evaluation

## Contributing

Please open an issue before large changes. Keep personal information and secrets out of commits.

## License

MIT
