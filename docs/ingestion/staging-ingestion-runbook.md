# Staging Options Data Ingestion Runbook

This runbook describes how to sync local scanner output JSON files to the staging server and run the backend ingestion commands.

Use this when you have generated fresh options data locally and want staging to reflect the latest scanner output.

---

## Purpose

The staging ingestion helper script automates the manual process of:

1. copying local JSON files from `shared/data/` to the staging server;
2. running Covered Calls ingestion;
3. running Put Options ingestion;
4. running Spread Options ingestion;
5. checking backend readiness after ingestion.

Script:

```text
scripts/staging-ingest-options-data.sh
