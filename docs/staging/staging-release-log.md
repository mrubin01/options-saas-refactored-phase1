# Staging Release Log

## Purpose

This log records every staging deployment and major staging-only operational action.

Use it to track:

- backend image tag deployed
- frontend image tag deployed
- deployment date and time
- whether staging ingestion was rerun
- whether smoke tests passed
- whether rollback was required
- which features first appeared in staging
- important issues discovered after deployment

This is especially useful while staging is the only live environment.

---

## How To Use This Log

Create one entry for each staging deployment.

Add an entry when you:

- deploy new backend and frontend images
- rerun ingestion after a meaningful data refresh
- rollback staging
- introduce a notable new feature in staging
- fix an operational issue affecting staging reliability

Newest entries should go at the top.

---

## Entry Template

```md
## YYYY-MM-DD HH:MM UTC — <short release title>

### Summary
- Brief description of what was deployed.

### Images
- This entry was created before the next formal staging deploy log was captured.
- Backend image: not recorded yet
- Frontend image: not recorded yet

### Deployment
- Deployment status: Passed / Failed / Rolled back
- Smoke test status: Passed / Failed / Partial
- Rollback required: Yes / No

### Data
- Shared data refreshed: Yes / No
- Ingestion rerun: Yes / No
- Data freshness status after deploy: Fresh / Aging / Stale / Not checked
- Ingestion status after deploy: Fresh / Aging / Stale / Empty / Not checked

### Features / Changes
- List the key features, fixes, or docs changes included.

### Issues Found
- List any bugs, regressions, warnings, or unexpected behavior.

### Follow-up Actions
- List anything that still needs to be done.

### Notes
- Any extra context, links, or observations.
