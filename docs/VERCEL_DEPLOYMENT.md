# Vercel deployment notes

## Frontend preview

The React/Vite frontend is configured as a Vercel static site.

1. Import `Saumya-Mishra-536/SamadhanSetu` in the Vercel dashboard.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy a Preview first and inspect the pages on desktop and mobile.

If the API is deployed on a separate origin, set the frontend environment variable:

- `VITE_API_BASE_URL` = the backend origin, for example `https://your-api.example` (no trailing slash).

The frontend expects API routes under `/api/v1`.

## Backend and data safety — deployment blocker

The current backend stores grievance records in a local SQLite file. Vercel Functions are serverless and do not provide a durable writable application filesystem. A local SQLite file must **not** be treated as persistent storage on Vercel. The current API also has no authentication or per-user authorisation; publishing it as-is would allow one visitor to read or alter another visitor's grievance records.

Therefore, do not connect a public frontend to the current write-enabled API and do not use real personal information in a hosted demo.

Before enabling public submissions, complete all of the following:

1. Move grievance and follow-up storage to a managed persistent database (for example, managed Postgres).
2. Add authentication and enforce record ownership on every read, update and delete endpoint.
3. Configure the backend's CORS allowlist for the exact deployed frontend origin.
4. Add rate limiting, request-size limits, secret management, retention/deletion policy and a privacy notice.
5. Deploy the FastAPI backend to a Vercel Python Function (or another suitable API host), set the database connection as a server-side environment variable, and test create/read/update/delete flows with two separate test accounts.

A Vercel deployment of the frontend alone is a **visual preview**, not a fully working hosted grievance service. No government submission, live status integration or official affiliation is implied.

## Local validation

From the repository root:

```bash
cd frontend
npm ci
npm run build
```

Vercel's current FastAPI deployment guide: https://vercel.com/kb/guide/ship-a-fastapi-app-on-vercel
