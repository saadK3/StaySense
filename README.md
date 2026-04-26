# StaySense AI

StaySense AI helps users search for hotels with natural language and view structured recommendation results.

## Tech stack

- Frontend: Next.js (App Router) + TypeScript
- Backend: FastAPI + Pydantic

## Local setup

### 1) Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 2) Backend

From the `backend/` directory:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`.

## Environment variables

Create `.env.local` for frontend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Optional backend environment variable:

```bash
FRONTEND_ORIGINS=http://localhost:3000
```

## API endpoints

- `GET /health`
- `POST /api/recommendations/search`
