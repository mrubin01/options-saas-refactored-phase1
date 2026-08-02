import { apiGetPaged } from "./client";
import type { PagedResult } from "./http";
import type { LongPut } from "../types/longPut";
import type { LongPutsDiscoveryFilters } from "../types/discovery";
import { longPutsFiltersToSearchParams } from "../utils/queryParams";

function buildLongPutsQuery(params: LongPutsDiscoveryFilters = {}) {
  const searchParams = longPutsFiltersToSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function fetchLongPuts(
  params: LongPutsDiscoveryFilters = {},
): Promise<PagedResult<LongPut[]>> {
  const qs = buildLongPutsQuery(params);
  return apiGetPaged<LongPut[]>(qs ? `/long-puts${qs}` : "/long-puts");
}
