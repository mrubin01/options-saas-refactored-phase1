import { apiGet } from "./client";

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
): Promise<SpreadOption[]> {
  const qs = buildSpreadOptionsQuery(params);
  return apiGet<SpreadOption[]>(
    qs ? `/spread-options${qs}` : "/spread-options",
  );
}
