# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev          # dev server on :5173, targets API v1
npm run dev:v2       # dev server in v2 mode (VITE_API_VERSION=v2)
npm run build        # type-check + vite build
npm run lint         # eslint
```

### Backend (`cd backend`)
```bash
uvicorn app.main:app --reload --port 8000   # local dev server
pytest                                       # all tests
pytest tests/test_contracts.py              # single test file
pytest tests/test_contracts.py::test_name  # single test
alembic upgrade head                        # run pending migrations
alembic revision --autogenerate -m "msg"   # generate new migration
```

### Full stack
```bash
docker-compose up --build   # brings up postgres, redis, backend, frontend
```

Backend expects `backend/.env` for local dev; Docker reads `backend/.env.docker`. Key env vars are documented in `backend/app/core/config.py`.

## Architecture

### Stack
- **Backend**: FastAPI (Python), PostgreSQL via SQLAlchemy 2, Redis for response caching (falls back to in-memory), Alembic migrations, slowapi rate limiting, Sentry, Prometheus metrics.
- **Frontend**: React 19, TypeScript, Vite, TanStack Query v5, React Router v7.
- **Shared data**: `shared/data/*.json` — pre-computed options data files written by the ingestion pipeline and read by the backend.

### Backend layout
`backend/app/` is organized as:
- `api/v1/` — active API routes (auth, covered-calls, put-options, spread-options, watchlist, saved-screeners, health, metrics, data-freshness, ingestion-status)
- `api/v2/` — stub router (prefix `/v2`), not yet implemented
- `auth/` — JWT decode, bearer dependency (`deps.py`), password hashing
- `core/` — config, middleware stack, exception handlers, rate limiting, Sentry, response helpers
- `db/` — SQLAlchemy engine/session, `get_db` dependency, seed/reset scripts
- `models/` — SQLAlchemy ORM models
- `schemas/` — Pydantic schemas; `schemas/api.py` defines the universal response envelope
- `services/` — business logic that routes delegate to

**App wiring**: `bootstrap.py` registers middleware, exception handlers, and routers onto the FastAPI instance created in `main.py`.

### API response envelope
All endpoints return:
```json
{ "success": bool, "data": ..., "error": {...} | null, "meta": { "request_id", "version", "pagination" } }
```
Use `response.ok(data=..., request=request)` and `response.fail(code=..., message=..., request=request)` from `app.core.response`.

### Authentication flow
- **Access token**: short-lived JWT, stored in memory in the frontend (`auth/tokenStore.ts`).
- **Refresh token**: long-lived JWT, stored in an httpOnly cookie scoped to `/v1/auth`.
- On startup, `AuthContext` calls `/v1/auth/refresh` to restore an existing session.
- `http.ts` transparently retries a 401 once after refreshing the access token; concurrent refresh calls are deduplicated via a shared `refreshPromise`.
- Backend dependency: `get_current_user` in `app/auth/deps.py`.

### Frontend data layer
- `api/http.ts` — base fetch wrapper (`apiFetch`), handles auth headers, token refresh, and maps the envelope to `data` or throws `ApiClientError`.
- `api/client.ts` — thin typed wrappers (`apiGet`, `apiPost`, etc.).
- `api/hooks/` — TanStack Query hooks per resource (`useCoveredCalls`, `usePutOptions`, `useSpreadOptions`).
- `api/queryKeys.ts` — centralised query key factory.

### Database
Two connection strings are configured: `DATABASE_URL_ADMIN` (for migrations/admin ops) and `DATABASE_URL_APP` (runtime). The app engine uses only `DATABASE_URL_APP`. Alembic reads `DATABASE_URL` from the environment (see `alembic.ini`).

### API versioning
`VITE_API_URL` and `VITE_API_VERSION` build-time env vars control which backend the frontend calls. Default is `v1`. The `dev:v2` npm script sets `v2` mode for frontend testing against the v2 router.
