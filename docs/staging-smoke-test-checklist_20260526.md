# Staging Smoke Test Checklist

## Purpose

Use this checklist after every successful staging deployment.

Current staging URL:
- http://135.181.109.67

## Preconditions

Before running the checklist:
- CI completed successfully
- Build and Push Images completed successfully
- Deploy Staging completed successfully
- BACKEND_IMAGE and FRONTEND_IMAGE point to the intended SHA tags
- if strategy data was changed, staging `shared/data` was refreshed and ingestion was rerun

## 1. Infrastructure Health

From a local machine:

```bash
curl http://135.181.109.67
curl http://135.181.109.67:8000/v1/internal/health
curl http://135.181.109.67:8000/v1/internal/ready
```

Expected:
- root URL returns HTML
- /health returns OK
- /ready returns DB and Redis healthy

## 2. Frontend Load

In a browser:
- open http://135.181.109.67

Verify:
- page loads without fatal UI errors
- current frontend version appears
- there are no immediate network/CORS failures in DevTools

## 3. Register New User

In browser:
- open the registration flow
- create a brand new user

Verify:
- registration succeeds
- no API/network/CORS errors
- user flow behaves as expected

## 4. Login

Use the newly created user to log in.

Verify:
- login succeeds
- user lands on the dashboard or current authenticated landing page
- no browser network failures occur
- no backend 500 occurs

## 5. Refresh Session Behavior

After login:
- refresh the browser page

Verify:
- user remains authenticated if expected by the current auth/session model
- no forced redirect loop
- no `/auth/refresh` failure in DevTools

## 6. Logout

Trigger logout in the UI.

Verify:
- user is logged out cleanly
- navigation updates correctly
- protected pages are no longer accessible without auth

## 7. Protected Route Check

After logout:
- try to open a protected route directly

Verify:
- app redirects or blocks access correctly

## 8. API Docs Reachability

Open:
- http://135.181.109.67:8000/docs

Verify:
- backend docs load if intentionally exposed

## 9. Backend Log Sanity

If anything looked suspicious, SSH into staging and inspect:

```bash
cd ~/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 backend
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 frontend
```

Verify:
- no crashing backend loop
- no repeated authentication exceptions
- no repeated CORS-related misconfiguration symptoms

## 10. Core Data Pages

Open the strategy pages after login.

Verify:
- Covered Calls loads
- Put Options loads
- Spread Options loads
- tables render without crashing
- expected rows are visible if staging data was ingested
- empty results are acceptable only if there is intentionally no staged options data

## 11. Saved Screeners Flow

On at least one strategy page:
- save a new screener
- apply the screener
- rename the screener
- update / overwrite its config
- attempt to save another screener with the same name and verify overwrite handling
- delete the screener if desired

Verify:
- all actions succeed without browser/network errors
- no backend 500 occurs
- UI feedback/messages behave correctly

## 12. Watchlist Flow

On strategy pages:
- add at least one item to watchlist
- remove at least one item from watchlist

Then open:
- `/watchlist`

Verify:
- added items appear in the watchlist page
- filter by strategy behaves correctly
- remove works from the watchlist page too

## 13. Dashboard Flow

Open:
- `/dashboard`

Verify:
- dashboard loads successfully
- saved screener counts render
- watchlist counts render
- recent saved screeners section renders
- recent watchlist items section renders
- quick links work

## Quick Fail / Pass Summary

### Pass
- frontend loads
- health OK
- ready OK
- register works
- login works
- logout works
- protected routes behave correctly
- strategy tables load
- saved screener actions work
- watchlist actions work
- dashboard loads
- no blocking browser errors
- no backend crash loops

### Investigate
- frontend loads old bundle first
- requests target localhost:8000
- login/register returns 500
- repeated backend restarts
- `/ready` fails
- staging works only after multiple refreshes
- strategy tables are unexpectedly empty after a deploy
- dashboard sections mismatch obvious backend state

## Notes

For every staging deploy, record:
- deployed backend SHA image
- deployed frontend SHA image
- date/time of deployment
- whether smoke test passed
- whether `shared/data` was refreshed
- whether ingestion was rerun
- any anomalies observed

## Monitoring

http://135.181.109.67
http://135.181.109.67:8000/v1/internal/health
http://135.181.109.67:8000/v1/internal/ready
