# Phase 1 containerization baseline

This repo now includes a first-pass container setup for local development and staging parity.

## What was added

- `backend/Dockerfile`
- `backend/docker-entrypoint.sh`
- `backend/requirements.txt`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `docker-compose.yml`
- `.dockerignore` files for frontend and backend
- `.env.docker.example`

## How to run locally

From the repo root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`

## Notes

- The backend entrypoint waits for Postgres and Redis, then runs `alembic upgrade head` before starting Uvicorn.
- The frontend is built as a static site and served by Nginx.
- For local compose, both `DATABASE_URL_ADMIN` and `DATABASE_URL_APP` point to the same DB user.
- For production, separate migration/admin credentials from runtime app credentials.
- Replace `SECRET_KEY` before deploying anywhere public.

## Recommended next cleanup

1. Move the compose environment values into a dedicated `.env.docker` file.
2. Split backend runtime DB access from migration DB access.
3. Add a staging compose override or cloud deployment manifests.
4. Add CI steps for `docker compose build`, frontend build, backend tests, and smoke checks.
