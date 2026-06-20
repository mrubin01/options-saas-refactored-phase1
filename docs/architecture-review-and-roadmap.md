# Options SaaS — Architecture Review & Production Roadmap

**Reviewed:** develop branch (repomix export, June 2026)  
**Reviewer:** Claude (Anthropic) — Software Architect perspective  
**Purpose:** Actionable reference for Claude Code-assisted development  

---

## Project State Summary

A full-stack SaaS for U.S. equity options analytics. FastAPI + PostgreSQL + Redis backend, React (Vite) + TypeScript frontend, Docker-based deployment on Hetzner, staging live and smoke-tested, production not yet launched.

**Stages completed through Stage 4:**
- JWT auth with httpOnly refresh-token cookie rotation
- Password reset and email verification (hashed one-time tokens)
- Saved screeners, watchlist, dashboard
- Advanced filtering and sorting (Stage 5.1 filters complete on backend)
- Ingestion-freshness observability (`/ingestion-status`, `IngestionStatusBanner`)
- CI with real Postgres + Redis service containers, actual test suite
- Sentry, Prometheus metrics, structured JSON logging
- Staging environment with smoke-test runbook

---

## What Is Already Solid (Do Not Rework Pre-Launch)

- Refresh-token rotation: hashed tokens, jti tracking, revocation, replay protection
- Password reset / email verification: single-use tokens hashed with `secrets.token_urlsafe`
- Rate limiting: per-endpoint policies (`5/min` login, `3/min` register, etc.)
- Watchlist: unique constraint on `(user_id, strategy_type, contract)`, always scoped to user
- Saved screeners: always filtered by `user_id`, conflict-safe upsert
- Sorting: allowlisted via a dict-lookup pattern — not raw string interpolation, so no SQL injection risk
- Security validators: pydantic validators enforce strong `SECRET_KEY`, `REFRESH_COOKIE_SECURE=true`, `HTTPS` FRONTEND_URL in production; `validate_security_settings()` is called at app startup
- CI: full real migrations + pytest run; no more `pytest || true`
- In-memory access token: frontend uses `tokenStore.ts` (module-level variable, not `localStorage`); single-flight refresh promise prevents thundering herd on 401

---

## Issues To Fix Before Going Live

### 🔴 CRITICAL — LAUNCH BLOCKERS

---

#### 1. No HTTPS / TLS anywhere

**Location:** `frontend/nginx.conf`, `docker-compose.remote.yml` (deploy workflow)  
**What:** Nginx only listens on port 80. No certificate. No HTTP→HTTPS redirect. No TLS termination anywhere in the stack.  
**Why it matters:** The app's own pydantic validators will **refuse to start** in `ENVIRONMENT=production` without HTTPS (`REFRESH_COOKIE_SECURE=true` required, `FRONTEND_URL` must be `https://`). Nothing works until this is done. Also, passwords and tokens travel in plaintext without it.

**Fix:** Add Caddy as a reverse proxy in front of the Nginx frontend. It handles Let's Encrypt automatically.

Add to `docker-compose.remote.yml`:
```yaml
caddy:
  image: caddy:2-alpine
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
    - caddy_config:/config
  depends_on:
    - frontend
```

Create `Caddyfile` on the server:
```
yourdomain.com {
    reverse_proxy frontend:80
}
```

Remove the `ports: - "80:80"` from the `frontend` service (Caddy handles it instead).

Then set in production env secrets:
```
REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_SAMESITE=lax
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

---

#### 2. DATABASE_URL_ADMIN and DATABASE_URL_APP use identical credentials everywhere

**Location:** All `.env.example` files, `production.env.example`, `staging.env.example`  
**What:** Both admin (migration) and app (runtime) URLs point to the same Postgres role. The production checklist already flags this but it remains unresolved in all example files.  
**Why it matters:** If the app is ever compromised or a query goes wrong, it has DDL-level access — it can DROP tables. This is the principle of least privilege, and it's standard for any production database.

**Fix:** Create a restricted runtime role in Postgres before provisioning production:
```sql
-- run as postgres superuser
CREATE ROLE options_app_user WITH LOGIN PASSWORD 'strong-password-here';
GRANT CONNECT ON DATABASE options_saas TO options_app_user;
GRANT USAGE ON SCHEMA public TO options_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO options_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO options_app_user;
-- no CREATE, DROP, ALTER, TRUNCATE
```

Then in production env:
```
DATABASE_URL_ADMIN=postgresql+psycopg://options_admin_user:admin-password@db:5432/options_saas
DATABASE_URL_APP=postgresql+psycopg://options_app_user:app-password@db:5432/options_saas
```

`database.py` already uses `DATABASE_URL_APP` only — the separation is already wired in code. You only need to create the actual Postgres roles.

---

#### 3. No automated database backups

**Location:** `docker-compose.remote.yml`, no backup service exists  
**What:** No automated `pg_dump`, no retention policy, no tested restore path. The staging runbook has a manual restore check but no automation. Production user data (screeners, watchlist, accounts) is unprotected.  
**Why it matters:** One failed migration, one `docker volume prune`, one server incident = total data loss.

**Fix (minimal viable backup):** Add a daily backup container to `docker-compose.remote.yml`:
```yaml
db-backup:
  image: postgres:16-alpine
  restart: unless-stopped
  environment:
    PGPASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - ~/options-saas/backups:/backups
  entrypoint: >
    sh -c "while true; do
      pg_dump -h db -U ${POSTGRES_USER} ${POSTGRES_DB} |
      gzip > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql.gz;
      find /backups -name '*.sql.gz' -mtime +7 -delete;
      sleep 86400;
    done"
  depends_on:
    db:
      condition: service_healthy
```

For production, copy backups to off-server storage (Hetzner Storage Box, Backblaze B2, or an S3-compatible bucket). Test restore before launch using the `staging-backup-restore-check.md` runbook.

---

#### 4. Ingestion is still 100% manual (no scheduler)

**Location:** `scripts/staging-ingest-options-data.sh`, `backend/ingestion/`  
**What:** Data is ingested by manually running a shell script from a developer's machine over SSH. No cron, no scheduler, no automated trigger.  
**Why it matters:** Options data has a freshness window. If nobody runs the script, data goes stale silently. The `IngestionStatusBanner` correctly shows "stale" — but users see it and lose trust.

**Fix (immediate — cron on server):**
SSH into the production server and add a crontab entry:
```bash
# edit with: crontab -e
# Run ingestion every day at 6:30 AM UTC (adjust to match your data source refresh time)
30 6 * * * cd ~/options-saas && docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T backend python -m ingestion.covered_calls >> ~/options-saas/logs/ingestion.log 2>&1
35 6 * * * cd ~/options-saas && docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T backend python -m ingestion.put_options >> ~/options-saas/logs/ingestion.log 2>&1
40 6 * * * cd ~/options-saas && docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T backend python -m ingestion.spread_options >> ~/options-saas/logs/ingestion.log 2>&1
```

Note: The current ingestion workflow expects JSON files to already be in `shared/data/`. The data copy step (SCP from laptop) still needs to happen separately. If you control the data source, automate the file generation + copy as well.

---

#### 5. `/docs` and `/openapi.json` are publicly proxied with no decision

**Location:** `frontend/nginx.conf` lines proxying `/docs` and `/openapi.json`  
**What:** Your full API schema — all routes, parameters, schemas, auth flows — is publicly accessible at `yourdomain.com/docs` with no auth gate. This was flagged as "undecided" in the production checklist.

**Fix (recommended for early SaaS):** Block it at the Nginx layer until you deliberately want to expose it:
```nginx
location /docs {
    return 403;
}
location /openapi.json {
    return 403;
}
```
Or restrict to your own IP:
```nginx
location /docs {
    allow YOUR.IP.ADDRESS.HERE;
    deny all;
    proxy_pass http://backend:8000/docs;
    ...
}
```

---

### 🟡 IMPORTANT — Fix within 2 weeks of launch

---

#### 6. `v2` API is dead code, still mounted in production

**Location:** `backend/app/api/v2/`, `backend/app/bootstrap.py`  
**What:** All v2 files are empty. `v2_router` is still registered in `bootstrap.py` and imports from v1. It does nothing, but it's noise in every deploy and creates confusion.

**Fix:**
```python
# In bootstrap.py, remove:
from app.api.v2.router import router as v2_router
# and:
app.include_router(v2_router, prefix="/v2")
```
Delete `backend/app/api/v2/` entirely. Recreate it when v2 is actually needed.

---

#### 7. Prometheus metrics endpoint is publicly accessible

**Location:** `backend/app/api/v1/metrics.py` → `/v1/internal/metrics`  
**What:** Prometheus data (request counts, latency histograms, paths, error rates) is publicly reachable. No auth, no IP restriction.

**Fix:** Restrict at the Nginx level (add to `nginx.conf` before your Caddy/HTTPS proxy reads it, or handle at the Caddy layer):
```nginx
location /v1/internal/metrics {
    allow 127.0.0.1;
    allow YOUR.MONITORING.IP;
    deny all;
    proxy_pass http://backend:8000/v1/internal/metrics;
}
```
Or simply block it entirely until you set up a Prometheus scraper:
```nginx
location /v1/internal/metrics {
    return 403;
}
```

---

#### 8. CORS `allow_headers=["*"]` is broader than necessary

**Location:** `backend/app/bootstrap.py` → `register_middleware()`  
**What:** `allow_headers=["*"]` combined with `allow_credentials=True` is wider than needed.

**Fix:**
```python
allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
```

---

#### 9. Silent Redis fallback hides outages

**Location:** `backend/app/main.py` → `startup_cache()`  
**What:** If Redis is unreachable at startup, the app silently falls back to in-memory cache with no log warning beyond a bare `except Exception`. Each worker caches independently; cache-based rate limiting may break silently.

**Fix:** Log a critical warning before falling back:
```python
except Exception as e:
    logger.critical(
        "Redis unavailable at startup — falling back to InMemoryBackend. "
        "Rate limiting and cache consistency may be degraded.",
        extra={"error": str(e)},
    )
    FastAPICache.init(InMemoryBackend(), prefix="options-saas")
```

---

#### 10. `on_event("startup")` is deprecated

**Location:** `backend/app/main.py`  
**What:** FastAPI replaced `@app.on_event("startup")` with `lifespan` context managers. Not broken yet, but will emit deprecation warnings and will eventually be removed.

**Fix:** Migrate to the `lifespan` pattern:
```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await startup_cache()
    startup_checks()
    yield
    # shutdown (add cleanup here if needed)

app = configure_app(FastAPI(title="Options Analytics API", version="1.0.0", lifespan=lifespan))
```

---

## Issues To Fix After Launch (Stage 5 Prep)

### 🟠 ARCHITECTURE — Fix before Stage 5.1 filtering grows further

---

#### 11. Service-layer duplication — three copies of the same filter/sort logic

**Location:** `backend/app/services/covered_calls.py`, `put_options.py`, `spread_options.py`  
**What:** Each service is ~150+ lines of nearly identical range-filter and sort logic. Every new filter added in Stage 5 must be hand-copied three times. `_apply_min_filter` and `_apply_max_filter` are defined separately in each file.

**Why fix it now:** Stage 5.1 plans to add more advanced filters. Doing that before this refactor will triple the duplication again.

**Recommended fix:** Extract a shared `OptionsQueryBuilder`:
```python
# backend/app/services/query_builder.py
from typing import TypeVar, Type
from sqlalchemy.orm import Session, Query

T = TypeVar("T")

class OptionsQueryBuilder:
    def __init__(self, db: Session, model: Type[T]):
        self.query: Query = db.query(model)
        self.model = model

    def filter_eq(self, column, value):
        if value is not None:
            self.query = self.query.filter(column == value)
        return self

    def filter_range(self, column, min_val=None, max_val=None):
        if min_val is not None:
            self.query = self.query.filter(column >= min_val)
        if max_val is not None:
            self.query = self.query.filter(column <= max_val)
        return self

    def sort(self, sort_fields: dict, sort_by, sort_dir, default_order):
        if sort_by and sort_by in sort_fields:
            col = sort_fields[sort_by]
            order = col.asc() if sort_dir == "asc" else col.desc()
            self.query = self.query.order_by(order)
        else:
            self.query = self.query.order_by(*default_order)
        return self

    def paginate(self, offset: int, limit: int):
        return self.query.offset(offset).limit(limit).all()
```

---

#### 12. Exchange list hardcoded in frontend

**Location:** `frontend/src/constants/exchanges.ts`  
**What:** `NYSE=0, NASDAQ=1, ARCA=2` are hardcoded as a static TypeScript array, duplicating the `EXCHANGE` database table. The backend already has the data and the seed script.

**Fix:** Add a `/v1/exchanges` endpoint (no auth required, cacheable), replace the frontend constant with a `useExchanges()` query hook.

---

#### 13. API responses lack total-count pagination metadata

**Location:** All three strategy-list endpoints, `backend/app/services/`  
**What:** List endpoints return data arrays but no `total` row count, so the frontend cannot build "Page X of Y" UI or know if there are more pages beyond the current `limit`.

**Fix:** Add a `count()` query alongside the data query and return it in `PaginationMeta`:
```python
# In each service, alongside the .all() call:
total = query.count()
data = query.offset(offset).limit(limit).all()
# Return both; update PaginationMeta in response envelope
```

The `PaginationMeta` model already exists in `backend/app/schemas/api.py` — it just isn't populated yet.

---

#### 14. `_parse_date` defined separately in every service file

**Location:** `services/covered_calls.py`, `put_options.py`, `spread_options.py`, `ingestion/base.py`  
**What:** `_parse_date` / `parse_date` is defined at least 4 times across the codebase.

**Fix:** Move to `app/core/utils.py` or `app/core/dates.py` and import from there.

---

#### 15. No email sending implementation

**Location:** `backend/app/api/v1/auth.py` — `register`, `forgot_password`, `resend_verification`  
**What:** These endpoints generate verification/reset links but only `log` them (`log_email_link` writes the URL to the application logs). No email is actually sent. This is fine for development but means the entire password reset and email verification flow is broken for real users in production.

**Fix:** Integrate a transactional email provider before launch if you intend to use email verification/reset. Options: SendGrid, Resend, Mailgun, AWS SES. Create an `email_service.py` abstraction and call it from the auth endpoints.

Example abstraction:
```python
# backend/app/services/email_service.py
async def send_verification_email(to_email: str, link: str) -> None: ...
async def send_password_reset_email(to_email: str, link: str) -> None: ...
```

> ⚠️ **This may be a launch blocker depending on your registration model.** If users register themselves and must verify email before accessing the app, and no emails are sent, registration is effectively broken. If you're manually managing users for now (no self-registration), it's not blocking.

---

## Summary Table

### Before Launch

| # | Issue | Severity | Effort |
|---|---|---|---|
| 1 | No HTTPS / TLS | 🔴 Blocker | Medium (Caddy config) |
| 2 | Single DB user (admin = app) | 🔴 Blocker | Low (SQL + env vars) |
| 3 | No automated DB backups | 🔴 Blocker | Low (docker service) |
| 4 | Ingestion has no scheduler | 🔴 Blocker | Low (cron) |
| 5 | `/docs` publicly exposed | 🔴 Blocker | Low (nginx config) |
| 6 | v2 API dead code still mounted | 🟡 Important | Trivial (delete) |
| 7 | Metrics endpoint publicly accessible | 🟡 Important | Low (nginx restrict) |
| 8 | CORS allow_headers too broad | 🟡 Important | Trivial (one line) |
| 9 | Silent Redis fallback | 🟡 Important | Trivial (add log) |
| 10 | `on_event` deprecated | 🟡 Important | Low (lifespan refactor) |
| 15 | No email sending (if self-registration) | ⚠️ Context-dependent | Medium |

### After Launch (Stage 5 Prep)

| # | Issue | Severity | Effort |
|---|---|---|---|
| 11 | Service-layer 3x duplication | 🟠 High | Medium (query builder) |
| 12 | Exchange hardcoded in frontend | 🟠 Medium | Low |
| 13 | No total-count in pagination | 🟠 Medium | Low |
| 14 | `_parse_date` defined 4 times | 🟠 Low | Trivial |

---

## Production Launch Order of Operations

```
1. Point DNS to server IP
2. Add Caddy container → get TLS cert automatically
3. Create restricted Postgres app user
4. Update production env secrets (HTTPS URLs, split DB creds, REFRESH_COOKIE_SECURE)
5. Block /docs and /metrics via Nginx
6. Set up DB backup service + test one restore
7. Wire ingestion cron on server
8. Remove v2 dead code, fix CORS headers, add Redis fallback log
9. Build + push SHA-tagged images from develop branch
10. Deploy to production via deploy-production.yml workflow
11. Run full smoke test checklist (docs/staging-smoke-test-checklist_20260526.md)
12. Monitor Sentry + /v1/internal/ready + ingestion-status for 48h
```

---

## Stage 5 Recommended Work Order

1. **Refactor service layer** (issue #11) — do this *before* adding more filters
2. **Add total-count pagination** (issue #13) — unblocks frontend pagination UI
3. **Add email sending** (issue #15) — required for real self-service signups
4. **Advanced filtering UI** (Stage 5.1) — backend already done; build frontend
5. **Metric glossary / tooltips** (Stage 5.2) — low-risk, can ship anytime
6. **Exchange endpoint** (issue #12) — small cleanup, do during 5.1 or 5.2
7. **Ingestion automation hardening** (Stage 5.3) — go beyond cron (scheduled workflow or Celery Beat)
8. **Data-contract hardening** (Stage 5.3) — generate Pydantic + TS types from one canonical source to prevent field drift
9. **E2E test coverage** (Stage 5.4) — add Playwright for login → screener → watchlist → dashboard smoke flow

---

## Notes for Claude Code Usage

When working with Claude Code on this project, provide this context at the start of sessions:

- **Backend:** FastAPI, SQLAlchemy (sync), Pydantic v1 (`orm_mode`, `BaseSettings`), Alembic migrations, pytest
- **Frontend:** React 19, TypeScript strict mode, TanStack Query v5, React Router v7
- **Auth:** Access token in memory (`tokenStore.ts`), refresh token in httpOnly cookie at `/v1/auth/refresh`
- **API envelope:** All responses use `ApiResponse[T]` — `{success, data, error, meta}`
- **Rate limiting:** SlowAPI — use `@limiter.limit(...)` decorator on all public endpoints
- **Caching:** `@cache(expire=30, key_builder=cache_key_builder, namespace="v1:...")` on list endpoints
- **Error handling:** Raise `AppException(code=ErrorCode.X, message="...", status_code=N)` — never raise bare HTTPException
- **Migrations:** Always create an Alembic migration for schema changes — never use `create_all()` in production
- **Naming:** Follow `options-contract-fields.md` exactly — `days_to_expiration` not `dte`, `impl_volatility` not `iv`, etc.
- **Ingestion:** JSON files land in `shared/data/`, ingested via `python -m ingestion.<strategy>` inside the backend container
