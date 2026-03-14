# Deployment

## Local
1. Copy `.env.example` to `.env`
2. Fill in values
3. Run `docker compose up --build -d`

## GitHub Actions
Create these GitHub environments:
- `staging`
- `production`

Add required reviewers to both for manual approval.

## Required environment secrets
- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL_ADMIN`
- `DATABASE_URL_APP`
- `REDIS_URL`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS`
- `BACKEND_IMAGE`
- `FRONTEND_IMAGE`

## Build flow
- `ci.yml` runs on PRs and pushes to `main`
- `build-and-push-images.yml` builds and pushes images to GHCR on `main`

## Deploy flow
- `deploy-staging.yml` is run manually and waits for approval through the `staging` environment
- `deploy-production.yml` is run manually and waits for approval through the `production` environment
