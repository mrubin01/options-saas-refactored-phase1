#!/usr/bin/env bash

set -euo pipefail

STAGING_HOST="${STAGING_HOST:-}"
STAGING_USER="${STAGING_USER:-root}"
SSH_KEY="${SSH_KEY:-}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-~/options-saas}"
LOCAL_DATA_DIR="${LOCAL_DATA_DIR:-shared/data}"
COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.remote.yml}"
ENV_FILE="${ENV_FILE:-.env}"

if [[ -z "$STAGING_HOST" ]]; then
  echo "Missing STAGING_HOST."
  echo "Example:"
  echo "  STAGING_HOST=135.181.109.67 SSH_KEY=~/.ssh/my-key ./scripts/staging-ingest-options-data.sh"
  exit 1
fi

if [[ -z "$SSH_KEY" ]]; then
  echo "Missing SSH_KEY."
  echo "Example:"
  echo "  STAGING_HOST=135.181.109.67 SSH_KEY=~/.ssh/my-key ./scripts/staging-ingest-options-data.sh"
  exit 1
fi

if [[ ! -d "$LOCAL_DATA_DIR" ]]; then
  echo "Local data directory not found: $LOCAL_DATA_DIR"
  exit 1
fi

if ! compgen -G "$LOCAL_DATA_DIR/*.json" > /dev/null; then
  echo "No JSON files found in $LOCAL_DATA_DIR"
  exit 1
fi

echo "Syncing local options data files to staging..."
ssh -i "$SSH_KEY" "$STAGING_USER@$STAGING_HOST" "mkdir -p $REMOTE_APP_DIR/shared/data"

scp -i "$SSH_KEY" "$LOCAL_DATA_DIR"/*.json \
  "$STAGING_USER@$STAGING_HOST:$REMOTE_APP_DIR/shared/data/"

echo "Running covered calls ingestion..."
ssh -i "$SSH_KEY" "$STAGING_USER@$STAGING_HOST" \
  "cd $REMOTE_APP_DIR && docker compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T backend python -m ingestion.covered_calls"

echo "Running put options ingestion..."
ssh -i "$SSH_KEY" "$STAGING_USER@$STAGING_HOST" \
  "cd $REMOTE_APP_DIR && docker compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T backend python -m ingestion.put_options"

echo "Running spread options ingestion..."
ssh -i "$SSH_KEY" "$STAGING_USER@$STAGING_HOST" \
  "cd $REMOTE_APP_DIR && docker compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T backend python -m ingestion.spread_options"

echo "Checking backend readiness..."
ssh -i "$SSH_KEY" "$STAGING_USER@$STAGING_HOST" \
  "cd $REMOTE_APP_DIR && docker compose --env-file $ENV_FILE -f $COMPOSE_FILE exec -T backend python - <<'PY'
import urllib.request
import sys

urls = [
    'http://127.0.0.1:8000/v1/internal/ready',
    'http://127.0.0.1:8000/v1/internal/health',
]

last_error = None

for url in urls:
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            body = response.read().decode('utf-8')
            print(f'{url} -> {response.status}')
            print(body)

            if response.status == 200:
                sys.exit(0)
    except Exception as exc:
        print(f'{url} failed: {exc}')
        last_error = exc

print(f'Backend readiness check failed. Last error: {last_error}')
sys.exit(1)
PY"
