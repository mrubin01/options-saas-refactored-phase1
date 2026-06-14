import { apiGet } from "./client";

import type { IngestionStatus } from "../types/ingestionStatus";

export function fetchIngestionStatus(): Promise<IngestionStatus> {
  return apiGet<IngestionStatus>("/ingestion-status");
}
