import { apiGetPaged } from "./client";
import type { PagedResult } from "./http";
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
): Promise<PagedResult<CoveredCall[]>> {
  const qs = buildCoveredCallsQuery(params);
  return apiGetPaged<CoveredCall[]>(qs ? `/covered-calls${qs}` : "/covered-calls");
}
