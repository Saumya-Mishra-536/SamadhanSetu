# Architecture

## Current runnable architecture

```text
Browser
  |
React + TypeScript + Vite (localhost:5173)
  | Vite development proxy: /api -> localhost:8000
FastAPI (localhost:8000)
  |-- transparent keyword classifier (English + selected Hindi terms)
  |-- category-specific general guidance
  |-- editable complaint-draft generator
  |-- SQLite repository (backend/data/samadhan.db)
  |-- citizen-recorded follow-up history
```

SQLite is embedded and file-based. The app creates its schema automatically. No Docker, PostgreSQL service, API key or hosted AI model is required.

## Data model

- grievances: description, location, selected language, optional contact fields, consent acknowledgement, classification JSON, guidance JSON, complaint draft, status and timestamps.
- followups: grievance foreign key, note, optional reference number, citizen-entered status and timestamp.

## Trust boundaries

- Classification is a preliminary keyword suggestion, not an official decision or trained model output.
- Citizens can correct the category.
- Guidance is general; the app does not claim a named local authority without verified jurisdiction data.
- Complaint drafts are editable and are never submitted by the app.
- Follow-up records are citizen-entered, not live government status.
- Analytics are local database counts, not population-level governance statistics.

## Next increments

1. Add authentication and user-scoped data access before public deployment.
2. Add a verified authority directory with official source URL, jurisdiction, last-checked date and provenance.
3. Add source-grounded document retrieval and citations.
4. Add multilingual UX and evaluated language-specific classification.
5. Add secure evidence storage only when required.
