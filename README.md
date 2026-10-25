# TaskBoard

A small task tracker: projects, members, tasks, comments and in-app notifications.

- `api/`: FastAPI + SQLAlchemy (Postgres in compose, SQLite for tests)
- `web/`: React + Vite + TypeScript, served by nginx, which proxies `/api` to the backend

## Run it

```bash
docker compose up --build
```

Open http://localhost:3000. The API is on http://localhost:8000 (docs at `/docs`).

## Develop

```bash
cd api
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
DATABASE_URL=sqlite:///./dev.db .venv/bin/uvicorn app.main:app --reload
.venv/bin/pytest
```

```bash
cd web
npm install
npm run dev   # proxies /api to localhost:8000
```
