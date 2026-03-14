#!/bin/sh
set -e

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

db_ok = False
for attempt in range(30):
    try:
        conn = psycopg.connect(db_url)
        conn.close()
        db_ok = True
        print("Database is ready")
        break
    except Exception as e:
        print(f"Database not ready yet ({attempt + 1}/30): {e}")
        time.sleep(2)

if not db_ok:
    print("Database never became ready", file=sys.stderr)
    sys.exit(1)

redis_ok = False
client = redis.Redis.from_url(redis_url)
for attempt in range(30):
    try:
        client.ping()
        redis_ok = True
        print("Redis is ready")
        break
    except Exception as e:
        print(f"Redis not ready yet ({attempt + 1}/30): {e}")
        time.sleep(2)

if not redis_ok:
    print("Redis never became ready", file=sys.stderr)
    sys.exit(1)
PY

echo "Running database migrations..."
alembic upgrade head

echo "Starting backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
