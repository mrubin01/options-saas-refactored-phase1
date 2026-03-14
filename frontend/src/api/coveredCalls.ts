import { apiGet } from "./client";
import { buildOptionsQuery } from "./optionsQuery";
import type { CoveredCall } from "../types/coveredCall";
import type { OptionsFilters } from "../types/filters";

export type CoveredCallsQuery = OptionsFilters & {
  limit?: number;
  offset?: number;
};

export function fetchCoveredCalls(params: CoveredCallsQuery = {}): Promise<CoveredCall[]> {
  const qs = buildOptionsQuery(params);
  return apiGet<CoveredCall[]>(qs ? `/covered-calls${qs}` : "/covered-calls");
}
