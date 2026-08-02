import { apiGetPaged } from "./client";
import type { PagedResult } from "./http";
import type { LongCall } from "../types/longCall";
import type { LongCallsDiscoveryFilters } from "../types/discovery";
import { longCallsFiltersToSearchParams } from "../utils/queryParams";

function buildLongCallsQuery(params: LongCallsDiscoveryFilters = {}) {
  const searchParams = longCallsFiltersToSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function fetchLongCalls(
  params: LongCallsDiscoveryFilters = {},
): Promise<PagedResult<LongCall[]>> {
  const qs = buildLongCallsQuery(params);
  return apiGetPaged<LongCall[]>(qs ? `/long-calls${qs}` : "/long-calls");
}
