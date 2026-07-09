import { apiGetPaged } from "./client";
import type { PagedResult } from "./http";
import type { SpreadOption } from "../types/spreadOption";
import type { SpreadOptionsDiscoveryFilters } from "../types/discovery";
import { spreadOptionsFiltersToSearchParams } from "../utils/queryParams";

function buildSpreadOptionsQuery(params: SpreadOptionsDiscoveryFilters = {}) {
  const searchParams = spreadOptionsFiltersToSearchParams(params);
  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function fetchSpreadOptions(
  params: SpreadOptionsDiscoveryFilters = {},
): Promise<PagedResult<SpreadOption[]>> {
  const qs = buildSpreadOptionsQuery(params);
  return apiGetPaged<SpreadOption[]>(
    qs ? `/spread-options${qs}` : "/spread-options",
  );
}
