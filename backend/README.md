Backend FastAPI app for Samadhan Setu.

Run locally (development):

1. Create a Python virtual environment and install dependencies:
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

2. Run Uvicorn:
   uvicorn app.main:app --reload

Note: Docker Compose will run the backend and database together.
