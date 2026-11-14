# Backend

FastAPI API with local SQLite persistence. No database server or Docker is required.

## Run

From the repository root:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The SQLite database is created automatically at `backend/data/samadhan.db`. Set `SAMADHAN_DB_PATH` to choose another location.

Interactive OpenAPI docs: http://127.0.0.1:8000/docs

Endpoints: health, categories, grievance create/list/detail, complaint draft update, citizen category correction, follow-up records and local analytics.

## Data handling

The local prototype stores descriptions, locations, optional name/contact, consent acknowledgement, complaint drafts and citizen-recorded follow-ups in SQLite. Do not enter Aadhaar numbers, bank credentials, passwords or unnecessary sensitive personal information. This build has no user authentication; do not expose it publicly with real personal data.
