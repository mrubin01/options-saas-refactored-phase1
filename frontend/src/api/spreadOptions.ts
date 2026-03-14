import { apiGet } from "./client";
import { buildOptionsQuery } from "./optionsQuery";
import type { SpreadOption } from "../types/spreadOption";
import type { OptionsFilters } from "../types/filters";

export type SpreadOptionsQuery = OptionsFilters & {
  limit?: number;
  offset?: number;
};

export function fetchSpreadOptions(params: SpreadOptionsQuery = {}): Promise<SpreadOption[]> {
  const qs = buildOptionsQuery(params);
  return apiGet<SpreadOption[]>(qs ? `/spread-options${qs}` : "/spread-options");
}
