import { apiGet } from "./client";
import { buildOptionsQuery } from "./optionsQuery";
import type { PutOption } from "../types/putOption";
import type { OptionsFilters } from "../types/filters";

export type PutOptionsQuery = OptionsFilters & {
  limit?: number;
  offset?: number;
};

export function fetchPutOptions(params: PutOptionsQuery = {}): Promise<PutOption[]> {
  const qs = buildOptionsQuery(params);
  return apiGet<PutOption[]>(qs ? `/put-options${qs}` : "/put-options");
}
