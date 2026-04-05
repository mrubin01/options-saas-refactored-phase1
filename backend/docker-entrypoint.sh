#!/bin/sh
set -eu

echo "Waiting for database and Redis..."

python - <<'PY'
import os
import sys
import time

import psycopg
import redis

db_url = os.environ.get("DATABASE_URL_ADMIN")
redis_url = os.environ.get("REDIS_URL")

if db_url:
    db_url = db_url.replace("postgresql+psycopg://", "postgresql://", 1)

if not db_url:
    print("DATABASE_URL_ADMIN is missing", file=sys.stderr)
    sys.exit(1)

if not redis_url:
    print("REDIS_URL is missing", file=sys.stderr)
    sys.exit(1)

for attempt in range(30):
    try:
        conn = psycopg.connect(db_url)
        conn.close()
        print("Database is ready")
        break
    except Exception as exc:
        if attempt == 29:
            print(f"Database never became ready: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"Database not ready yet ({attempt + 1}/30): {exc}")
        time.sleep(2)

client = redis.Redis.from_url(redis_url)
for attempt in range(30):
    try:
        client.ping()
        print("Redis is ready")
        break
    except Exception as exc:
        if attempt == 29:
            print(f"Redis never became ready: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"Redis not ready yet ({attempt + 1}/30): {exc}")
        time.sleep(2)
PY

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  alembic upgrade head
fi

echo "Starting backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${BACKEND_PORT:-8000}"
