import { apiGet } from "./client";

import type { DataFreshness } from "../types/dataFreshness";

export function fetchDataFreshness(): Promise<DataFreshness> {
  return apiGet<DataFreshness>("/data-freshness");
}
