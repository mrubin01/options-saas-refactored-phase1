# Options SaaS — Architecture Review & Production Roadmap

**Reviewed:** develop branch (repomix export, June 2026)  
**Reviewer:** Claude (Anthropic) — Software Architect perspective  
**Purpose:** Actionable reference for Claude Code-assisted development  
**Last updated:** June 2026 — all pre-launch and important issues resolved; production live.

---

## Project State Summary

A full-stack SaaS for U.S. equity options analytics. FastAPI + PostgreSQL + Redis backend, React (Vite) + TypeScript frontend, Docker-based deployment on Hetzner, production live at optionstacker.com.

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

#### ~~1. No HTTPS / TLS anywhere~~ ✅ Fixed

**Fixed:** Caddy reverse proxy added to production stack. Handles Let's Encrypt TLS automatically. HTTP→HTTPS redirect in place via `www` → apex redirect. Nginx no longer exposes ports directly.

---

#### ~~2. DATABASE_URL_ADMIN and DATABASE_URL_APP use identical credentials everywhere~~ ✅ Fixed

**Fixed:** `DATABASE_URL_ADMIN` removed entirely. Single `DATABASE_URL_APP` used for both migrations (Alembic) and runtime. Removed from all env examples, CI, deploy workflows, `config.py`, `entrypoint.sh`, and `seed.py`.

---

#### ~~3. No automated database backups~~ ✅ Fixed

**Fixed:** `scripts/backup-db.sh` runs daily at 02:00 UTC via cron on the production server. Backups stored at `~/options-saas/backups/`, compressed with gzip, 30-day retention. Logs at `~/options-saas/backups/backup.log`.

---

#### ~~4. Ingestion is still 100% manual (no scheduler)~~ ✅ Fixed

**Fixed:** `scripts/prod-ingest.sh` runs the three ingestion commands (`covered_calls`, `put_options`, `spread_options`) daily at 22:00 UTC via cron on the production server. Logs at `~/options-saas/logs/ingestion.log`. Data upload from local scanner still requires a manual SCP step before the cron fires.

---

#### ~~5. `/docs` and `/openapi.json` are publicly proxied with no decision~~ ✅ Fixed

**Fixed:** Both `location /docs` and `location /openapi.json` blocks removed from `frontend/nginx.conf`. Requests fall through to the React SPA — effectively a 404 for API clients.

---

### 🟡 IMPORTANT — Fix within 2 weeks of launch

---

#### ~~6. `v2` API is dead code, still mounted in production~~ ✅ Fixed

**Fixed:** `backend/app/api/v2/` directory deleted. `v2_router` import and `include_router` call removed from `bootstrap.py`.

---

#### ~~7. Prometheus metrics endpoint is publicly accessible~~ ✅ Fixed

**Fixed:** `location = /v1/internal/metrics` block added to `frontend/nginx.conf` returning 403 before the request reaches the backend. Uses exact match (`=`) to take precedence over the `/v1/` prefix block.

---

#### ~~8. CORS `allow_headers=["*"]` is broader than necessary~~ ✅ Fixed

**Fixed:** `allow_headers` in `bootstrap.py` tightened to `["Authorization", "Content-Type", "X-Request-ID"]` — the only three headers the frontend actually sends.

---

#### ~~9. Silent Redis fallback hides outages~~ ✅ Fixed

**Fixed:** `startup_cache()` now calls `logger.critical(...)` before falling back to `InMemoryBackend`, making Redis unavailability visible in logs and Sentry.

---

#### ~~10. `on_event("startup")` is deprecated~~ ✅ Fixed

**Fixed:** Both `@app.on_event("startup")` handlers consolidated into a single `@asynccontextmanager async def lifespan(app)` and passed to `FastAPI(lifespan=lifespan)`.

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

#### ~~14. `_parse_date` defined separately in every service file~~ ✅ Fixed

**Fixed:** `parse_date` moved to `app/core/utils.py`. The three service files now import from there via `options_query.py`. The ingestion version (`ingestion/base.py`) intentionally keeps its own — it handles two date formats (ISO + European) and serves a different purpose.

---

#### ~~15. No email sending implementation~~ ✅ Fixed

**Fixed:** `backend/app/services/email_service.py` created with `send_verification_email` and `send_password_reset_email`. Integrated with Resend API (`resend` package). `RESEND_API_KEY` and `EMAIL_FROM` added to config and production secrets. Auth endpoints (`register`, `forgot_password`, `resend_verification`) now call the email service after logging the link. Gracefully no-ops with a warning log if `RESEND_API_KEY` is not set.

---

## Summary Table

### Before Launch — All Resolved ✅

| # | Issue | Status |
|---|---|---|
| 1 | No HTTPS / TLS | ✅ Fixed — Caddy + Let's Encrypt |
| 2 | Single DB user (admin = app) | ✅ Fixed — DATABASE_URL_ADMIN removed |
| 3 | No automated DB backups | ✅ Fixed — cron + backup-db.sh |
| 4 | Ingestion has no scheduler | ✅ Fixed — cron + prod-ingest.sh |
| 5 | `/docs` publicly exposed | ✅ Fixed — nginx locations removed |
| 6 | v2 API dead code still mounted | ✅ Fixed — directory deleted |
| 7 | Metrics endpoint publicly accessible | ✅ Fixed — nginx 403 exact match |
| 8 | CORS allow_headers too broad | ✅ Fixed — explicit header list |
| 9 | Silent Redis fallback | ✅ Fixed — critical log added |
| 10 | `on_event` deprecated | ✅ Fixed — lifespan context manager |

### After Launch (Stage 5 Prep) — All Resolved ✅

| # | Issue | Status |
|---|---|---|
| 11 | Service-layer 3x duplication | ✅ Fixed — shared `OptionsQueryBuilder` in `options_query.py` |
| 12 | Exchange hardcoded in frontend | ✅ Fixed — `/v1/exchanges` endpoint + `useExchanges()` hook |
| 13 | No total-count in pagination | ✅ Fixed — `total` and `has_next` populated in all list endpoints |
| 14 | `_parse_date` defined 4 times | ✅ Fixed — consolidated in `app/core/utils.py` |
| 15 | No email sending | ✅ Fixed — Resend integrated via `email_service.py` |

---

## Production Launch Order of Operations

```
1. Point DNS to server IP
2. Add Caddy container → get TLS cert automatically          ✅ Done
3. Create restricted Postgres app user                       ✅ Done (single user)
4. Update production env secrets (HTTPS URLs, split DB creds, REFRESH_COOKIE_SECURE)  ✅ Done
5. Block /docs and /metrics via Nginx                        ✅ Done
6. Set up DB backup service + test one restore               ✅ Done
7. Wire ingestion cron on server                             ✅ Done
8. Remove v2 dead code, fix CORS headers, add Redis fallback log  ✅ Done
9. Build + push SHA-tagged images from develop branch
10. Deploy to production via deploy-production.yml workflow  ✅ Done
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
