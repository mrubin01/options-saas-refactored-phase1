#!/bin/sh
set -eu

echo "Starting backend entrypoint..."

python - <<'PY'
import os
import sys
import time

import psycopg
import redis

DB_READY_RETRIES = int(os.environ.get("DB_READY_RETRIES", "30"))
DB_READY_DELAY_SECONDS = float(os.environ.get("DB_READY_DELAY_SECONDS", "2"))
REDIS_READY_RETRIES = int(os.environ.get("REDIS_READY_RETRIES", "30"))
REDIS_READY_DELAY_SECONDS = float(os.environ.get("REDIS_READY_DELAY_SECONDS", "2"))

db_url = os.environ.get("DATABASE_URL_APP")
redis_url = os.environ.get("REDIS_URL")

if db_url:
    db_url = db_url.replace("postgresql+psycopg://", "postgresql://", 1)

if not db_url:
    print("DATABASE_URL_APP is missing", file=sys.stderr)
    sys.exit(1)

if not redis_url:
    print("REDIS_URL is missing", file=sys.stderr)
    sys.exit(1)

print("Waiting for database...")
for attempt in range(DB_READY_RETRIES):
    try:
        conn = psycopg.connect(db_url)
        conn.close()
        print("Database is ready")
        break
    except Exception as exc:
        if attempt == DB_READY_RETRIES - 1:
            print(f"Database never became ready: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"Database not ready yet ({attempt + 1}/{DB_READY_RETRIES}): {exc}")
        time.sleep(DB_READY_DELAY_SECONDS)

print("Waiting for Redis...")
client = redis.Redis.from_url(redis_url)
for attempt in range(REDIS_READY_RETRIES):
    try:
        client.ping()
        print("Redis is ready")
        break
    except Exception as exc:
        if attempt == REDIS_READY_RETRIES - 1:
            print(f"Redis never became ready: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"Redis not ready yet ({attempt + 1}/{REDIS_READY_RETRIES}): {exc}")
        time.sleep(REDIS_READY_DELAY_SECONDS)
PY

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  alembic upgrade head
else
  echo "Skipping database migrations because RUN_MIGRATIONS=${RUN_MIGRATIONS:-false}"
fi

echo "Starting backend on port ${BACKEND_PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${BACKEND_PORT:-8000}"
