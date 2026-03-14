from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
# backend/app/core/paths.py → backend/app → backend → options-saas

SHARED_DIR = PROJECT_ROOT / "shared"
DATA_DIR = SHARED_DIR / "data"
