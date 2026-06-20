import { apiGet } from "./client";

import type { CoveredCall } from "../types/coveredCall";
import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import { coveredCallsFiltersToSearchParams } from "../utils/queryParams";

function buildCoveredCallsQuery(params: CoveredCallsDiscoveryFilters = {}) {
  const searchParams = coveredCallsFiltersToSearchParams(params);
  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function fetchCoveredCalls(
  params: CoveredCallsDiscoveryFilters = {},
): Promise<CoveredCall[]> {
  const qs = buildCoveredCallsQuery(params);
  return apiGet<CoveredCall[]>(qs ? `/covered-calls${qs}` : "/covered-calls");
}
