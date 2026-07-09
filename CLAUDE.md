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
docker compose --env-file .env.docker up --build   # brings up all services
docker compose --env-file .env.docker up --build -d scanner    # scanner only
docker compose --env-file .env.docker up -d ingester           # ingester only
docker compose --env-file .env.docker logs -f <service>        # follow logs
```

Backend expects `backend/.env` for local dev; Docker reads `backend/.env.docker`. Key env vars are documented in `backend/app/core/config.py`.

> **Important (Hetzner servers):** always pass `--env-file .env.docker` explicitly — `docker compose` does not pick it up automatically on those servers.

### Scanner (local, one-off)
```bash
cd scanner
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py   # runs all 9 exchange/option-type combinations
```
Ticker files must be present in `scanner/tickers/` (gitignored). Output is written to `shared/data/*.json`.

## Architecture

### Stack
- **Backend**: FastAPI (Python), PostgreSQL via SQLAlchemy 2, Redis for response caching (falls back to in-memory), Alembic migrations, slowapi rate limiting, Sentry, Prometheus metrics.
- **Frontend**: React 19, TypeScript, Vite, TanStack Query v5, React Router v7.
- **Scanner**: Python service (`scanner/`) — Alpaca-powered options screener. Writes JSON files to `shared/data/`. Scheduled Mon–Fri 14:30–19:30 BST (up to 3 full runs/day, ~2h each). Uses its own venv; runs as a Docker service via `scheduler.py`.
- **Ingester**: Python service (`backend/ingestion/watcher.py`) — polls `shared/data/` every 5 min during 14:30–21:00 BST. Loads non-empty JSON files into PostgreSQL via upsert; skips empty files to preserve existing data.
- **Shared data**: `shared/data/*.json` — written by the scanner, read by the ingester, which loads them into PostgreSQL. The backend serves data from the database, not directly from JSON.

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
- `api/http.ts` — base fetch wrapper (`apiFetch`), handles auth headers, token refresh, and maps the envelope to `data` or throws `ApiClientError`. Also exports `apiFetchPaged<T>` which returns `PagedResult<T>` (wraps `{ rows, pagination }`).
- `api/client.ts` — thin typed wrappers (`apiGet`, `apiGetPaged`, `apiPost`, etc.).
- `api/hooks/` — TanStack Query hooks per resource (`useCoveredCalls`, `usePutOptions`, `useSpreadOptions`, `useExpiryDates`).
- `api/queryKeys.ts` — centralised query key factory.

### Pagination
All three strategy endpoints support `limit` / `offset` query params and return `meta.pagination` (`{ limit, offset, total, has_next }`). The frontend uses `apiFetchPaged` / `apiGetPaged` to unwrap this into `PagedResult<T[]>`, and each page renders a `<Pagination>` component (`frontend/src/components/Pagination.tsx`). Changing any filter resets `offset` to 0.

### Expiry date filtering
Each strategy route exposes two expiry params:
- `expiry_date` — exact match (used by the "Expiry Date" dropdown in the basic filter bar).
- `min_expiry` — range (≥), used by the "Expiry from" field in the advanced filters panel.

`expiry_date` takes priority over `min_expiry` in `backend/app/services/options_query.py`. Each strategy also has a `GET /expiry-dates` sub-route that returns all distinct expiry dates from the full table (used to populate the dropdown independently of pagination).

### Scanner expiry dates
`scanner/config.py` uses `_next_n_fridays(4)` to compute target expiry dates (4 Fridays for a buffer). Not all stocks list options for every Friday — coverage depends on what Alpaca/yfinance returns for each ticker.

### Database
Two connection strings are configured: `DATABASE_URL_ADMIN` (for migrations/admin ops) and `DATABASE_URL_APP` (runtime). The app engine uses only `DATABASE_URL_APP`. Alembic reads `DATABASE_URL` from the environment (see `alembic.ini`).

On a fresh server, run migrations and seed lookup tables:
```bash
docker compose --env-file .env.docker exec backend python -m app.db.seed
```

### Ingestion pipeline
`backend/ingestion/` contains per-strategy scripts (`covered_calls.py`, `put_options.py`, `spread_options.py`) and `watcher.py` which orchestrates them. Each strategy deletes existing rows and re-inserts from all three exchange files (NYSE, NASDAQ, ARCA). The watcher only ingests a strategy when all three files are non-empty.

JSON file naming: `best_cov_calls_{exchange}.json`, `best_put_options_{exchange}.json`, `best_spreads_{exchange}.json`.

### API versioning
`VITE_API_URL` and `VITE_API_VERSION` build-time env vars control which backend the frontend calls. Default is `v1`. The `dev:v2` npm script sets `v2` mode for frontend testing against the v2 router.
