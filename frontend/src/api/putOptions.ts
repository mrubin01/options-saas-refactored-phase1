import { apiGet } from "./client";

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
): Promise<PutOption[]> {
  const qs = buildPutOptionsQuery(params);
  return apiGet<PutOption[]>(qs ? `/put-options${qs}` : "/put-options");
}
