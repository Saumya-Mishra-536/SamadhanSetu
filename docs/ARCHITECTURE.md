# Architecture

## Hosted architecture (current target)

```text
Citizen browser
  |
Vercel: React + TypeScript + Vite
  |-- Supabase Auth (email/password)
  |-- Supabase Postgres + Row Level Security
  |     |-- profiles
  |     |-- grievances + followups
  |     |-- service_taxonomy (server-side deterministic classification)
  |     |-- authority_directory (entries default to unverified)
  |     |-- grievance_audit_log
  |-- Supabase Storage (private avatars; private evidence bucket prepared)
  |-- Supabase Edge Function (optional citizen assistant)
        |-- JWT verification
        |-- per-user quota RPC
        |-- OpenAI-compatible provider, secret stored server-side
```

The Vercel frontend reads and writes user-owned records through Supabase with RLS. The legacy FastAPI + SQLite implementation is retained for local/offline prototype work and backend tests; it is not called by the hosted Vercel frontend and must not be exposed as a public multi-user API.

## Classification and taxonomy

The hosted insert path supplies only citizen-entered fields. A PostgreSQL trigger classifies the text against service_taxonomy on the server and stores category/subcategory, confidence label, explanation and a jurisdiction hint. This is a deterministic keyword taxonomy, not an LLM, trained model or official decision. Citizens can correct the broad category through an ownership-checked RPC.

Taxonomy entries include pension, scholarship, public distribution/ration, solid waste, drainage, roads, street lighting, water supply, electricity, public health facilities and certificates/citizen services. Jurisdiction hints are guidance to verify, not an authority assignment.

## Authority directory and evidence

The authority_directory table stores name, jurisdiction, category IDs, official URL, source URL and verification status. Seed entries are explicitly unverified until a human checks them. No authority match is automatically asserted from a grievance description.

The private evidence bucket and metadata table are prepared in the hosted migration. The upload UI is not yet implemented. Evidence files must never be made public.

## Analytics

The current Insights page counts only the signed-in user's own records under RLS. These are personal workspace metrics, not government or population-level aggregates. No global public aggregate is exposed.

## Trust boundaries

- The platform is independent and is not a government website or MyGov service.
- Classification and guidance are preliminary informational suggestions.
- Official portal links are navigation only; no grievance is submitted by the app.
- Follow-up notes are citizen-entered, not government-confirmed status.
- The assistant has no live scheme retrieval or eligibility engine; it links users to official sources and must not invent rules or outcomes.
- The Supabase project must be configured and RLS tested before real data is accepted.

## Local prototype

```text
React + TypeScript + Vite
  | Vite development proxy
FastAPI
  | transparent classifier and local CRUD
SQLite (backend/data/samadhan.db)
```

This path is for local demo/testing only. It has no hosted multi-user authorisation. Keep it off the public internet.
