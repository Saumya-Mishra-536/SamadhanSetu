# Samadhan Setu

AI-powered citizen grievance navigation and intelligence platform — prototype / hackathon MVP.

This repository is a monorepo containing a FastAPI backend and a React + TypeScript frontend.

Overview
- Backend: FastAPI (Python)
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL with pgvector extension for embeddings

This repository has been initialized with a minimal skeleton. Follow the instructions below to run the project locally.

Quickstart (development)

1. Install Docker and Docker Compose.
2. Create a local .env file based on .env.example.
3. Start Postgres and backend (docker-compose):

   docker-compose up --build

4. Backend will be available at http://localhost:8000 (health endpoint).

5. Frontend development server:

   cd frontend
   npm install
   npm run dev

Notes
- Do not commit API keys. Put secrets into .env and .env.local (see .env.example).
- This is an initial skeleton. Next steps will add DB models, migrations, AI adapters, and frontend pages.

Contributing
- Work in feature branches and make small, focused commits.
- Keep the application runnable throughout development.

License: MIT
