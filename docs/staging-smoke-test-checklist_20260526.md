# Staging Smoke Test Checklist

## Purpose

Use this checklist after every successful staging deployment.

Current staging URL:

- http://135.181.109.67

This checklist validates:

- infrastructure health
- authentication
- strategy pages
- Stage 5 discovery filters
- saved screeners
- watchlist
- dashboard
- glossary
- metric tooltips
- data freshness
- ingestion status
- staging ingestion workflow

---


## Feature availability note

Only test features that are included in the code currently deployed to staging.

At the time of writing, staging may not yet include every Stage 5 feature. If the latest Stage 5 frontend/backend code has not been deployed, skip the sections for:

- advanced discovery filters
- metric tooltips
- glossary page
- data freshness cards
- ingestion status banner
- new protected freshness/status endpoints

These sections become mandatory only after the relevant Stage 5 code has been deployed to staging.

Currently deployed features should still be tested normally, including:

- authentication
- strategy pages
- saved screeners
- watchlist
- dashboard


## Preconditions

Before running the checklist:

- CI completed successfully
- Build and Push Images completed successfully
- Deploy Staging completed successfully
- `BACKEND_IMAGE` and `FRONTEND_IMAGE` point to the intended SHA tags
- staging containers are running
- if strategy data was changed, staging `shared/data` was refreshed and ingestion was rerun
- browser cache was hard-refreshed if frontend assets look stale

If strategy data was changed, run:

```bash
STAGING_HOST=135.181.109.67 \
SSH_KEY=~/.ssh/key_rsa \
REMOTE_APP_DIR=/root/options-saas \
LOCAL_DATA_DIR=shared/data \
COMPOSE_FILE=deploy/docker-compose.remote.yml \
ENV_FILE=.env \
./scripts/staging-ingest-options-data.sh
