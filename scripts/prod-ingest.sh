#!/bin/bash
set -euo pipefail

APP_DIR="$HOME/options-saas"
COMPOSE="docker compose --env-file $APP_DIR/.env -f $APP_DIR/deploy/docker-compose.remote.yml"
LOG_DIR="$APP_DIR/logs"

mkdir -p "$LOG_DIR"

echo "[$(date)] Starting ingestion"

$COMPOSE exec -T backend python -m ingestion.covered_calls
$COMPOSE exec -T backend python -m ingestion.put_options
$COMPOSE exec -T backend python -m ingestion.spread_options

echo "[$(date)] Ingestion completed"
