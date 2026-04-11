# Staging Deployment Runbook

## Purpose

This document explains how the staging environment is built, deployed, verified, and debugged.

Current staging target:
- Hetzner server
- Docker + Docker Compose
- GitHub Actions for CI, image build/push, and staging deploy

## Staging Architecture

The staging stack currently consists of:
- frontend → Nginx serving the built Vite app
- backend → FastAPI app
- db → PostgreSQL
- redis → Redis

Current access model:
- frontend exposed on port 80
- backend exposed on port 8000

Current staging base URL:
- http://135.181.109.67

Important note:
- staging is currently running over HTTP, not HTTPS
- this is acceptable temporarily for staging
- production must use HTTPS and secure cookies

## Branch and Image Policy

Use these rules consistently:
- develop → staging branch
- main → future production branch

Recommended image policy for staging:
- use SHA-tagged images
- do not rely on mutable tags like :develop once deploying a specific tested build

Examples:
- ghcr.io/<owner>/<repo>/frontend:<sha>
- ghcr.io/<owner>/<repo>/backend:<sha>

## Required GitHub Workflows

The following workflows are involved:
- CI
- Build and Push Images
- Deploy Staging

Expected sequence:
1. push branch
2. open PR
3. CI passes
4. merge into develop
5. Build and Push Images completes
6. update staging image secrets to the new SHA tags
7. run Deploy Staging

## Required GitHub Staging Secrets

Configured under:
- GitHub → Settings → Environments → staging

### Deploy access
- SSH_HOST
- SSH_USER
- SSH_PRIVATE_KEY
- GHCR_USERNAME
- GHCR_TOKEN

### Database / Redis
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- DATABASE_URL_ADMIN
- DATABASE_URL_APP
- REDIS_URL

### Auth / app config
- SECRET_KEY
- ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES
- REFRESH_TOKEN_EXPIRE_DAYS
- REFRESH_COOKIE_NAME
- REFRESH_COOKIE_SECURE
- REFRESH_COOKIE_SAMESITE
- REFRESH_COOKIE_DOMAIN
- REFRESH_COOKIE_PATH
- FRONTEND_URL
- CORS_ORIGINS
- RESET_PASSWORD_TOKEN_EXPIRE_MINUTES
- VERIFY_EMAIL_TOKEN_EXPIRE_MINUTES
- SENTRY_DSN
- SENTRY_TRACES_SAMPLE_RATE

### Image references
- BACKEND_IMAGE
- FRONTEND_IMAGE

## Required GitHub Variables

Configured under:
- GitHub → Settings → Secrets and variables → Actions → Variables

Current frontend build variables:
- VITE_API_URL
- VITE_API_VERSION

For current staging:
- VITE_API_URL=http://135.181.109.67:8000
- VITE_API_VERSION=v1

Important:
- these must exist at the repository Actions variable level for the image build workflow
- environment-only variables are not enough unless the build job explicitly runs in that environment

## Hetzner Server Prerequisites

The Hetzner server must have:
- Docker installed
- Docker Compose available
- SSH access working
- deploy directories present

Verified directories:
- ~/options-saas/deploy
- ~/options-saas/shared

For current staging:
- deploy user is root
- paths therefore resolve under /root/options-saas/

## Standard Staging Deployment Procedure

### 1. Merge validated changes into develop

Only deploy staging from develop.

### 2. Ensure CI is green

Before deployment:
- backend tests pass
- frontend build passes
- Docker image builds pass

### 3. Ensure image workflow completed successfully

Open:
- GitHub Actions → Build and Push Images

Find the latest successful run for develop.

### 4. Copy the new SHA-tagged images

From the Docker Build summary, capture:
- backend image SHA tag
- frontend image SHA tag

Examples:
- ghcr.io/<owner>/<repo>/backend:<sha>
- ghcr.io/<owner>/<repo>/frontend:<sha>

### 5. Update staging secrets

Set:
- BACKEND_IMAGE
- FRONTEND_IMAGE

to those exact SHA-tagged images.

### 6. Run Deploy Staging

Open:
- GitHub Actions → Deploy Staging
- choose branch develop
- run the workflow

### 7. Verify external health

From a local machine:

```bash
curl http://135.181.109.67
curl http://135.181.109.67:8000/v1/internal/health
curl http://135.181.109.67:8000/v1/internal/ready
```

Expected:
- frontend root returns HTML
- /health returns OK
- /ready returns DB and Redis healthy

## Manual Server Checks

SSH into the staging server if needed:

```bash
ssh -i ~/.ssh/<your-key> root@135.181.109.67
```

Common checks:

```bash
docker --version
docker compose version
cd ~/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml ps
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 backend
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 frontend
```

## Common Failure Modes

### 1. Port already allocated
Symptom:
- deploy fails because 8000 or 80 is already bound

Cause:
- old containers still running on the server

Fix:
```bash
cd ~/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml down
docker ps
```

### 2. Backend unhealthy at startup
Symptom:
- staging deploy fails because backend is unhealthy

Common causes:
- invalid env validation
- missing required secret
- bad DB credentials
- JWT config issue
- HTTP staging rejected by production-only checks

Fix:
```bash
cd ~/options-saas
docker compose --env-file .env -f deploy/docker-compose.remote.yml logs --tail=200 backend
```

Look for the final exception, not just the middleware stack frames.

### 3. Frontend still points to localhost API
Symptom:
- browser calls http://localhost:8000/...
- CORS errors appear immediately

Cause:
- frontend image built without the correct VITE_API_URL

Fix:
- verify repository Actions variables
- rebuild images
- update SHA-tagged FRONTEND_IMAGE
- redeploy staging

Server confirmation:
```bash
docker exec -it options-saas-staging-frontend-1 sh -lc "grep -R \"localhost:8000\\|127.0.0.1:8000\" /usr/share/nginx/html/assets || true"
```

This should return no matches after a correct rebuild.

### 4. Login returns HTTP 500
Symptom:
- register may work
- login crashes in staging

Common causes encountered:
- empty ALGORITHM
- invalid staging auth env values
- earlier HTTPS-only enforcement blocking temporary HTTP staging

Fix:
- inspect backend logs
- correct the relevant staging secret
- rebuild/redeploy if code changed

## Rollback Procedure

If the latest deploy is bad:
1. find the previous known-good backend/frontend SHA image tags
2. update:
   - BACKEND_IMAGE
   - FRONTEND_IMAGE
3. rerun Deploy Staging

That is the safest rollback path.

## Staging Security Notes

Current staging is intentionally less strict than production because:
- there is no custom domain yet
- there is no HTTPS yet

Current temporary staging posture:
- FRONTEND_URL=http://135.181.109.67
- CORS_ORIGINS=http://135.181.109.67
- REFRESH_COOKIE_SECURE=false

Production requirements later:
- HTTPS
- secure cookies
- domain-aware cookie configuration
- tighter external exposure rules

## Recommended Next Improvements

1. add HTTPS to staging
2. add a domain or subdomain
3. add uptime monitoring
4. add Sentry in staging
5. optionally put frontend and backend behind one origin with a reverse proxy
