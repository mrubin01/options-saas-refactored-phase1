Staging Backup and Restore Check
================================

Purpose
-------

This runbook verifies that staging data can be backed up and restored into a temporary database.

Use this before risky staging changes, major migrations, production rehearsal work, or anything that may affect database state.

Current staging server:

```
135.181.109.67

```

Current staging app directory:

```
/root/options-saas

```

Current Docker Compose file:

```
deploy/docker-compose.remote.yml

```

* * * * *

What This Protects
------------------

The database backup protects:

-   users

-   refresh sessions

-   saved screeners

-   watchlist items

-   covered calls rows

-   put options rows

-   spread options rows

-   account lifecycle tables

-   any other Postgres-backed staging state

The shared data backup protects:

-   staged options input files under `/root/options-saas/shared/data`

* * * * *

Important Safety Rule
---------------------

Never restore directly into the active staging database unless you intentionally want to overwrite staging.

Restore checks should use a temporary database:

```
<POSTGRES_DB>_restore_check

```

The active database name and database user are read from staging `.env`:

```
POSTGRES_DB
POSTGRES_USER

```

Do not hardcode a database user such as `options_admin`.

* * * * *

1\. Check Staging Containers
----------------------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'cd /root/options-saas &&
docker compose --env-file .env -f deploy/docker-compose.remote.yml ps'

```

Expected services:

```
backend
frontend
db
redis

```

* * * * *

2\. Confirm Database User and Database Name
-------------------------------------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'cd /root/options-saas &&
grep -E "^(POSTGRES_USER|POSTGRES_DB)=" .env'

```

Expected:

```
POSTGRES_USER=<real staging postgres user>
POSTGRES_DB=<real staging database name>

```

* * * * *

3\. Test Database Access
------------------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'cd /root/options-saas &&
DB_USER=$(grep "^POSTGRES_USER=" .env | cut -d= -f2-) &&
DB_NAME=$(grep "^POSTGRES_DB=" .env | cut -d= -f2-) &&
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  psql -U "$DB_USER" -d "$DB_NAME" -c "\dt"'

```

Expected:

-   command exits successfully

-   staging tables are listed

* * * * *

4\. Create Database Backup
--------------------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'cd /root/options-saas &&
DB_USER=$(grep "^POSTGRES_USER=" .env | cut -d= -f2-) &&
DB_NAME=$(grep "^POSTGRES_DB=" .env | cut -d= -f2-) &&
mkdir -p backups &&
timestamp=$(date -u +%Y%m%dT%H%M%SZ) &&
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --no-owner --no-acl\
  > "backups/${DB_NAME}_staging_${timestamp}.dump" &&
ls -lh "backups/${DB_NAME}_staging_${timestamp}.dump"'

```

Expected:

-   command exits with no error

-   backup file is created under:

```
/root/options-saas/backups/

```

Example filename:

```
options_saas_staging_20260615T120000Z.dump

```

* * * * *

5\. Create Shared Data Backup
-----------------------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'cd /root/options-saas &&
mkdir -p backups &&
timestamp=$(date -u +%Y%m%dT%H%M%SZ) &&
tar -czf "backups/shared_data_staging_${timestamp}.tar.gz" shared/data &&
ls -lh "backups/shared_data_staging_${timestamp}.tar.gz"'

```

Expected:

-   archive is created successfully

-   archive includes staged JSON files from:

```
/root/options-saas/shared/data

```

* * * * *

6\. List Backups
----------------

From your local machine:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'ls -lh /root/options-saas/backups'

```

Expected:

-   at least one `.dump` database backup

-   at least one `.tar.gz` shared data backup

* * * * *

7\. Restore Database Backup Into Temporary Database
---------------------------------------------------

SSH into staging:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67

```

Then:

```
cd /root/options-saas

```

Load the real database variables:

```
DB_USER=$(grep "^POSTGRES_USER=" .env | cut -d= -f2-)
DB_NAME=$(grep "^POSTGRES_DB=" .env | cut -d= -f2-)
RESTORE_DB="${DB_NAME}_restore_check"

echo "$DB_USER"
echo "$DB_NAME"
echo "$RESTORE_DB"

```

Choose the latest database backup:

```
latest_backup=$(ls -t backups/${DB_NAME}_staging_*.dump | head -1)
echo "$latest_backup"

```

Drop any old temporary restore-check database:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  dropdb -U "$DB_USER" --if-exists "$RESTORE_DB"

```

Create a fresh temporary restore-check database:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  createdb -U "$DB_USER" "$RESTORE_DB"

```

Restore into the temporary database:

```
cat "$latest_backup" | docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  pg_restore -U "$DB_USER" -d "$RESTORE_DB" --no-owner --no-acl

```

Expected:

-   restore completes without fatal errors

-   active staging data is not overwritten

-   active database remains untouched

* * * * *

8\. Verify Restored Tables
--------------------------

Check restored table list:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  psql -U "$DB_USER" -d "$RESTORE_DB" -c '\dt'

```

Check important restored row counts:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  psql -U "$DB_USER" -d "$RESTORE_DB" -c '
SELECT COUNT(*) AS covered_calls_rows FROM "BEST_COVERED_CALLS";
SELECT COUNT(*) AS put_options_rows FROM "BEST_PUT_OPTIONS";
SELECT COUNT(*) AS spread_options_rows FROM "BEST_SPREAD_OPTIONS";
'

```

Optional saved screener and watchlist check:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  psql -U "$DB_USER" -d "$RESTORE_DB" -c '
SELECT COUNT(*) AS saved_screeners_rows FROM saved_screeners;
SELECT COUNT(*) AS watchlist_rows FROM watchlist_items;
'

```

If table names differ, inspect the table list from the `\dt` command and adjust the table names.

* * * * *

9\. Clean Up Temporary Restore Database
---------------------------------------

After verification:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  dropdb -U "$DB_USER" --if-exists "$RESTORE_DB"

```

Verify it was removed:

```
docker compose --env-file .env -f deploy/docker-compose.remote.yml exec -T db\
  psql -U "$DB_USER" -d "$DB_NAME" -c '\l'

```

Expected:

```
<POSTGRES_DB>_restore_check

```

should no longer be listed.

* * * * *

10\. Optional: Download Backup Locally
--------------------------------------

List backups:

```
ssh -i ~/.ssh/key_rsa root@135.181.109.67\
'ls -t /root/options-saas/backups'

```

Download a chosen database backup:

```
scp -i ~/.ssh/key_rsa\
root@135.181.109.67:/root/options-saas/backups/<backup-file-name>.dump\
./

```

Download a chosen shared data backup:

```
scp -i ~/.ssh/key_rsa\
root@135.181.109.67:/root/options-saas/backups/<shared-data-backup-file-name>.tar.gz\
./

```

Do not commit downloaded backups to Git.

* * * * *

11\. Backup Pass Criteria
-------------------------

Backup/restore check passes if:

-   database backup file is created

-   shared data archive is created

-   backup can be restored into the temporary restore-check database

-   important restored tables exist

-   important restored tables have expected row counts

-   temporary restore database is removed after the test

-   active staging database remains untouched

-   staging app still works after the check

* * * * *

12\. When to Run This
---------------------

Run this before:

-   risky staging deployments

-   Alembic migration changes

-   database model changes

-   ingestion logic changes

-   saved screener schema changes

-   watchlist schema changes

-   staging-to-production rehearsal work

Run this after:

-   major staging data refresh

-   major ingestion run

-   introducing new persistent user-facing features

* * * * *

Notes
-----

Current active staging database:

```
Read from `.env` using `POSTGRES_DB`.

```

Current database user used by checks:

```
Read from `.env` using `POSTGRES_USER`.

```

Temporary restore-check database:

```
<POSTGRES_DB>_restore_check

```

Never restore directly into the active staging database unless intentionally recovering staging.
