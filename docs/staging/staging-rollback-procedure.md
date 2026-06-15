# Staging Rollback Procedure

## Purpose

This runbook describes how to roll staging back to the previous known-good application images if a deployment introduces regressions.

Use this when a staging deploy causes problems such as:

* login failures
* protected route failures
* strategy pages not loading
* saved screener regressions
* watchlist regressions
* missing glossary or discovery UI after deploy
* broken data freshness or ingestion status UI
* backend startup failures
* frontend bundle or runtime failures

Current staging server:

```text
135.181.109.67
```

Current staging app directory:

```text
/root/options-saas
```

Current Docker Compose file:

```text
deploy/docker-compose.remote.yml
```

---

## Rollback Principle

A rollback should restore the previously known-good backend and frontend image tags.

A rollback should **not**:

* modify the database unless absolutely necessary
* delete staged JSON files
* rerun ingestion unless the rollback specifically requires it
* overwrite data blindly

Rollback should be limited to application images first.

---

## Prerequisites

Before rolling back, you should have:

* SSH access to staging
* the previous known-good backend image tag
* the previous known-good frontend image tag
* the latest deployment SHA or image tag that failed
* the staging smoke test checklist
* optionally, a recent backup if the failed deploy involved risky data or migration changes

Helpful docs:

```text
staging-deploy.md
staging-smoke-test-checklist.md
docs/staging/staging-backup-restore-check.md
```

---

## 1. Confirm Staging Problem

From your local machine, confirm the failure is real and reproducible.

Basic checks:

```bash
curl http://135.181.109.67
curl http://135.181.109.67:8000/v1/internal/health
curl http://135.181.109.67:8000/v1/internal/ready
```

Then verify in the browser:

* login
* dashboard
* covered calls
* put options
* spread options
* watchlist
* saved screeners
* glossary if deployed
* data freshness and ingestion status if deployed

If the deploy is clearly broken, proceed to rollback.

---

## 2. Inspect Current Staging Images

SSH into staging:

```bash
ssh -i ~/.ssh/key_rsa root@135.181.109.67
```

Then:

```bash
cd /root/options-saas
```

Inspect current image variables:

```bash
grep -E "^(BACKEND_IMAGE|FRONTEND_IMAGE)=" .env
```

This shows the currently deployed backend and frontend image tags.

Also inspect running containers:

```bash
docker compose --env-file .env -f deploy/docker-compose.remote.yml ps
```

Optional:

```bash
docker compose --env-file .env -f deploy/docker-compose.remote.yml images
```

---

## 3. Identify Previous Known-Good Images

Find the previous known-good image tags from:

* previous deployment notes
* GitHub Actions build and push history
* GHCR image tags
* your own deployment records

You need:

```text
BACKEND_IMAGE=<previous known-good backend image>
FRONTEND_IMAGE=<previous known-good frontend image>
```

Example shape only:

```text
BACKEND_IMAGE=ghcr.io/<owner>/<repo>-backend:<old-sha>
FRONTEND_IMAGE=ghcr.io/<owner>/<repo>-frontend:<old-sha>
```

Do not guess image tags. Use the last known-good deployment.

---

## 4. Update Staging `.env` With Previous Image Tags

Edit `.env` on the staging server:

```bash
nano /root/options-saas/.env
```

Update:

```text
BACKEND_IMAGE=...
FRONTEND_IMAGE=...
```

Save the file.

Confirm the new values:

```bash
grep -E "^(BACKEND_IMAGE|FRONTEND_IMAGE)=" /root/options-saas/.env
```

Expected:

* `.env` now points to the previous known-good image tags

---

## 5. Pull Previous Images

From the staging server:

```bash
cd /root/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml pull
```

Expected:

* backend image is pulled
* frontend image is pulled
* no registry or auth failure

If needed, inspect pulled images:

```bash
docker compose --env-file .env -f deploy/docker-compose.remote.yml images
```

---

## 6. Restart Staging With Rolled-Back Images

From the staging server:

```bash
cd /root/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml up -d
```

Expected:

* containers restart successfully
* no immediate crash loop

Check service state:

```bash
docker compose --env-file .env -f deploy/docker-compose.remote.yml ps
```

Expected services:

```text
backend
frontend
db
redis
```

---

## 7. Check Backend Health After Rollback

From your local machine:

```bash
curl http://135.181.109.67:8000/v1/internal/health
curl http://135.181.109.67:8000/v1/internal/ready
```

Expected:

* health returns OK
* readiness returns OK

Optional remote log check:

```bash
ssh -i ~/.ssh/key_rsa root@135.181.109.67 \
'cd /root/options-saas &&
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 backend'
```

Look for:

* startup success
* no repeated exceptions
* no DB connection failures
* no Redis failures

---

## 8. Rerun Staging Smoke Tests

After rollback, rerun the checklist from:

```text
staging-smoke-test-checklist.md
```

At minimum verify:

* login works
* dashboard works
* covered calls works
* put options works
* spread options works
* saved screeners work
* watchlist works
* glossary works if part of the rolled-back version
* data freshness and ingestion status work if part of the rolled-back version

Rollback is only considered successful if smoke tests pass.

---

## 9. Decide Whether Data Ingestion Must Be Rerun

Usually rollback of frontend and backend images does **not** require rerunning ingestion.

Rerun ingestion only if:

* the failed deploy changed ingestion logic
* the failed deploy changed DB expectations for ingested fields
* strategy tables are unexpectedly empty after rollback
* data freshness shows stale or empty state after rollback and you know local JSON is newer

If rerun is needed, use:

```bash
STAGING_HOST=135.181.109.67 \
SSH_KEY=~/.ssh/key_rsa \
REMOTE_APP_DIR=/root/options-saas \
LOCAL_DATA_DIR=shared/data \
COMPOSE_FILE=deploy/docker-compose.remote.yml \
ENV_FILE=.env \
./scripts/staging-ingest-options-data.sh
```

---

## 10. If Rollback Fails

If rolling back images does not fix staging:

1. inspect backend logs
2. inspect frontend logs
3. confirm the previous images are truly known-good
4. confirm `.env` was updated correctly
5. confirm the containers are actually running the expected images
6. consider whether a migration or data change also needs reversal
7. if necessary, use the backup and restore runbook:

```text
docs/staging/staging-backup-restore-check.md
```

Do **not** restore the active staging database unless you intentionally want to revert data.

---

## 11. What To Record After Rollback

After a rollback, record:

* date and time of rollback
* failed backend image tag
* failed frontend image tag
* restored backend image tag
* restored frontend image tag
* reason for rollback
* whether smoke tests passed after rollback
* whether ingestion had to be rerun
* whether any data issue remained after rollback

This should be added to your deployment notes or project log.

---

## 12. Rollback Pass Criteria

Rollback is successful if:

* previous known-good backend image is deployed
* previous known-good frontend image is deployed
* containers are healthy
* `/v1/internal/health` returns OK
* `/v1/internal/ready` returns OK
* smoke tests pass
* staging is usable again

---

## Notes

Rollback should normally be:

```text
image rollback first
data restore only if truly necessary
```

Avoid mixing:

* image rollback
* DB restore
* new ingestion run
* unrelated config edits

in the same recovery step unless you clearly know why each is needed.
