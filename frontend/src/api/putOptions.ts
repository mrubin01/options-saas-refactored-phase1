import { apiGetPaged } from "./client";
import type { PagedResult } from "./http";
import type { PutOption } from "../types/putOption";
import type { PutOptionsDiscoveryFilters } from "../types/discovery";
import { putOptionsFiltersToSearchParams } from "../utils/queryParams";

function buildPutOptionsQuery(params: PutOptionsDiscoveryFilters = {}) {
  const searchParams = putOptionsFiltersToSearchParams(params);
  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function fetchPutOptions(
  params: PutOptionsDiscoveryFilters = {},
): Promise<PagedResult<PutOption[]>> {
  const qs = buildPutOptionsQuery(params);
  return apiGetPaged<PutOption[]>(qs ? `/put-options${qs}` : "/put-options");
}
