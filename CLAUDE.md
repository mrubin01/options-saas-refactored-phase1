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

### Production scanner/ingester
Both `scanner` and `ingester` run as Docker services in production (added to `deploy-production.yml`). The scanner image is built and pushed to GHCR by `build-and-push-images.yml` alongside backend and frontend.

Ticker files are gitignored and must be copied to the production server manually once:
```bash
ssh -i ~/.ssh/key_rsa root@95.216.153.97 'mkdir -p ~/options-saas/scanner/tickers'
scp -i ~/.ssh/key_rsa scanner/tickers/*.txt root@95.216.153.97:~/options-saas/scanner/tickers/
```

Follow live logs on production:
```bash
ssh -i ~/.ssh/key_rsa root@95.216.153.97 'docker compose --env-file ~/options-saas/.env -f ~/options-saas/deploy/docker-compose.remote.yml logs -f scanner ingester'
```

> **Important:** only one environment should run the scanner at a time — running both staging and production scanners simultaneously hits Alpaca API rate limits. Stop staging scanner when production is scanning:
> ```bash
> ssh -i ~/.ssh/key_rsa root@135.181.109.67 'cd options-saas-refactored-phase1 && docker compose --env-file .env.docker stop scanner'
> ```

### Data redistribution compliance
The scanner fetches options data from Alpaca using `feed=OptionsFeed.INDICATIVE` (set explicitly in `scanner/functions.py`). This uses Alpaca's proprietary indicative feed rather than OPRA data, which avoids OPRA redistribution licensing requirements.

Alpaca's ToS requires 30 days written notice before making a User Application available to others. Pending their response, the following price/quote fields are intentionally **hidden from all strategy tables** (`frontend/src/components/OptionsTable.tsx`) to avoid displaying raw market data:

- `current_price` — underlying stock price
- `bid_per_share`, `premium_per_contract` — option bid/premium values
- `max_profit`, `max_profit_per_contract` — derived dollar profit figures
- `break_even` — derived break-even price
- `open_interest` — always 0 because `OptionsSnapshot` (returned by `get_option_chain`) has no OI field; fetching it from `TradingClient.get_option_contracts` would add hundreds of extra API calls per scan run and Alpaca's indicative feed likely doesn't include it anyway

`strike_price` is displayed — it is already embedded in the option contract name, so it adds no additional raw market data exposure.

These fields remain in the database and API response — only the frontend display is suppressed. Do not re-add the hidden fields to `COLUMNS` or the table `<td>` cells until legal/licensing is resolved.

A "data delayed ≥15 minutes" banner is shown above every strategy table (`OptionsTable.tsx`) to warn users not to rely on the data for live trading decisions.

Registration is also disabled in production (`VITE_REGISTRATION_ENABLED=false` GitHub variable + `REGISTRATION_ENABLED=false` secret) so there are no active users during the Alpaca notice period.

### Manual user creation (beta testers)
Registration is disabled in production. To create tester accounts without exposing an email address, the login field was changed from "Email" to "Username" (`type="text"`) in `frontend/src/pages/LoginPage.tsx`. The backend stores the username in the `email` column (plain VARCHAR, no format constraint enforced at DB level).

Create a tester account on production:
```bash
ssh -i ~/.ssh/key_rsa root@95.216.153.97 'docker compose --env-file ~/options-saas/.env -f ~/options-saas/deploy/docker-compose.remote.yml exec -T backend python -c "
from app.db.database import SessionLocal
from app.models.user import User
from app.auth.security import hash_password
from datetime import datetime, timezone
db = SessionLocal()
user = User(email=\"tester1\", password_hash=hash_password(\"TempPass123!\"), is_email_verified=True, email_verified_at=datetime.now(timezone.utc))
db.add(user)
db.commit()
print(\"Created:\", user.email)
db.close()
"'
```

Delete a tester account:
```bash
ssh -i ~/.ssh/key_rsa root@95.216.153.97 'docker compose --env-file ~/options-saas/.env -f ~/options-saas/deploy/docker-compose.remote.yml exec -T backend python -c "
from app.db.database import SessionLocal
from app.models.user import User
db = SessionLocal()
user = db.query(User).filter(User.email == \"tester1\").first()
if user: db.delete(user); db.commit(); print(\"Deleted\")
else: print(\"Not found\")
db.close()
"'
```

### API versioning
`VITE_API_URL` and `VITE_API_VERSION` build-time env vars control which backend the frontend calls. Default is `v1`. The `dev:v2` npm script sets `v2` mode for frontend testing against the v2 router.
