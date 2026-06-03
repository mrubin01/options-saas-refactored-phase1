# Production Readiness Checklist

## Purpose

Use this checklist to prepare the project for a first real production environment.

This checklist assumes:
- local Docker/container workflow is working
- CI is working
- image build/push is working
- staging deploy is working
- staging smoke tests are passing

Current reality:
- production is **not live yet**
- there is **no production domain yet**
- staging currently runs on Hetzner over HTTP
- production must be stricter than staging

---

## 1. Environment and Release Readiness

### Branch / release policy
- [ ] confirm which branch deploys production
- [ ] document release flow from `develop` to `main`
- [ ] require green CI before production deploy
- [ ] require reviewed PRs before merge to production branch
- [ ] define who is allowed to deploy production

### Image strategy
- [ ] deploy production only with SHA-tagged images
- [ ] avoid deploying mutable tags like `:latest`
- [ ] document how to identify the exact backend/frontend image for a release
- [ ] verify rollback can be done by switching back to previous SHA tags

### Version traceability
- [ ] record deployed backend image SHA
- [ ] record deployed frontend image SHA
- [ ] record deployment date/time
- [ ] record commit hash / PR number for each production release

---

## 2. Domain, HTTPS, and Public Access

### Domain
- [ ] choose production domain or subdomain
- [ ] configure DNS
- [ ] document DNS ownership and update process

### HTTPS / TLS
- [ ] enable HTTPS before production launch
- [ ] install and verify TLS certificates
- [ ] redirect HTTP to HTTPS
- [ ] verify frontend and backend URLs use HTTPS
- [ ] verify secure cookies work correctly over HTTPS

### Public exposure
- [ ] decide whether backend docs should be public in production
- [ ] disable or restrict `/docs` if not intended for public access
- [ ] review which ports are exposed externally
- [ ] consider placing frontend and backend behind one reverse proxy/origin

---

## 3. Authentication and Session Security

### Cookie and auth settings
- [ ] set `REFRESH_COOKIE_SECURE=true`
- [ ] set `REFRESH_COOKIE_SAMESITE` appropriately for production
- [ ] set `REFRESH_COOKIE_DOMAIN` to the real production domain if needed
- [ ] verify `FRONTEND_URL` uses HTTPS
- [ ] verify `CORS_ORIGINS` matches the real production frontend origin
- [ ] verify `ALGORITHM` is explicitly set and non-empty
- [ ] confirm `SECRET_KEY` is strong and production-specific

### Session behavior
- [ ] verify login works in production-like conditions
- [ ] verify logout works
- [ ] verify refresh flow works
- [ ] verify authenticated session survives page refresh correctly
- [ ] verify expired-session handling behaves cleanly

---

## 4. Database and Redis Readiness

### PostgreSQL
- [ ] provision production PostgreSQL
- [ ] use a dedicated production database
- [ ] confirm production DB credentials are not reused from staging
- [ ] split admin and app DB credentials if not already done
- [ ] verify migrations run successfully against production DB
- [ ] verify production DB backups are configured
- [ ] document backup retention policy
- [ ] document restore procedure

### Redis
- [ ] provision production Redis
- [ ] verify Redis auth / access policy if applicable
- [ ] confirm production Redis is separate from staging Redis
- [ ] verify cache/rate-limiting behavior in production config

### Least privilege
- [ ] ensure `DATABASE_URL_APP` uses least-privilege credentials
- [ ] ensure `DATABASE_URL_ADMIN` is used only for migrations/admin tasks

---

## 5. GitHub Secrets, Variables, and Deployment Safety

### Production environment secrets
- [ ] create a separate GitHub `production` environment
- [ ] add production-only SSH credentials
- [ ] add production-only DB/Redis credentials
- [ ] add production-only `SECRET_KEY`
- [ ] add production-only cookie/domain settings
- [ ] verify no staging secrets are reused accidentally

### Frontend build values
- [ ] set production `VITE_API_URL`
- [ ] set production `VITE_API_VERSION`
- [ ] confirm image build uses the correct production values

### Protection rules
- [ ] add required reviewers for the production environment if desired
- [ ] require manual approval before production deploy if desired
- [ ] confirm only authorized maintainers can run production deploys

---

## 6. Observability and Monitoring

### Logging
- [ ] confirm backend structured logs are available in production
- [ ] confirm logs can be accessed during incidents
- [ ] confirm deployment logs are retained long enough for debugging

### Error tracking
- [ ] configure `SENTRY_DSN` for production
- [ ] set an appropriate `SENTRY_TRACES_SAMPLE_RATE`
- [ ] verify backend errors appear in Sentry
- [ ] verify frontend errors appear in monitoring if applicable

### Uptime / health monitoring
- [ ] monitor frontend availability
- [ ] monitor backend `/v1/internal/health`
- [ ] monitor backend `/v1/internal/ready`
- [ ] create alerts for repeated backend restart loops
- [ ] create alerts for failed deploys if available

---

## 7. Application-Level Smoke Tests Before Launch

### Basic UI
- [ ] homepage loads
- [ ] current production frontend version is visible
- [ ] no immediate browser console/network errors

### Auth
- [ ] register works if public registration is enabled
- [ ] login works
- [ ] logout works
- [ ] protected routes are protected
- [ ] session refresh works

### Core pages
- [ ] covered calls page loads
- [ ] put options page loads
- [ ] spread options page loads
- [ ] empty states render cleanly if no data is present
- [ ] frontend handles API errors gracefully

### API
- [ ] `/v1/internal/health` returns OK
- [ ] `/v1/internal/ready` returns OK
- [ ] key auth endpoints behave correctly
- [ ] rate limiting still behaves as expected

---

## 8. Data and Ingestion Readiness

### Market data availability
- [ ] confirm production has the expected options data
- [ ] confirm ingestion path is ready for production
- [ ] confirm empty tables are understood if data is intentionally absent

### Background / ingestion operations
- [ ] document how ingestion is started and monitored
- [ ] document how to detect ingestion failures
- [ ] document recovery steps if production data stops updating

---

## 9. Operational Runbooks

### Deployment runbook
- [ ] document exact production deploy steps
- [ ] document how to update image tags
- [ ] document how to verify a successful production deployment

### Rollback runbook
- [ ] document how to roll back to previous SHA-tagged images
- [ ] test rollback at least once before launch if possible
- [ ] document how to verify system health after rollback

### Incident response
- [ ] document how to inspect backend logs
- [ ] document how to inspect frontend logs/behavior
- [ ] document how to check DB/Redis/container status on the server
- [ ] document who to contact / who owns production deploys

---

## 10. Security Review Before Production

### Secrets
- [ ] confirm no real secrets are committed to the repo
- [ ] confirm `.env` files with secrets are ignored
- [ ] rotate any secret that may have been exposed during setup/testing

### Public endpoints
- [ ] review exposed endpoints
- [ ] review whether debug/admin endpoints are public
- [ ] review CORS policy
- [ ] review cookie settings

### Staging-to-production differences
- [ ] remove any temporary staging-only relaxations that should not exist in production
- [ ] confirm production HTTPS enforcement is active
- [ ] confirm secure cookie enforcement is active
- [ ] confirm production-only validators are correct

---

## 11. Final Go/No-Go Checklist

Before first production launch:
- [ ] domain and HTTPS are working
- [ ] production secrets are set
- [ ] production DB and Redis are provisioned
- [ ] CI is green
- [ ] images built successfully
- [ ] deployment runbook exists
- [ ] rollback runbook exists
- [ ] smoke tests pass
- [ ] monitoring is in place
- [ ] backup/restore approach is documented
- [ ] release owner approves launch

---

## Notes

Current highest-priority production gaps, based on present project state:
- no production environment yet
- no production domain yet
- no HTTPS yet
- temporary staging HTTP/auth relaxations must not be carried into production
- production monitoring/alerting still needs to be finalized
