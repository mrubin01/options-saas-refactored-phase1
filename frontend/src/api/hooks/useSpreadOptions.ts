import { useQuery } from "@tanstack/react-query";
import { fetchSpreadOptions } from "../spreadOptions";
import type { PagedResult } from "../http";
import type { SpreadOption } from "../../types/spreadOption";
import type { SpreadOptionsDiscoveryFilters } from "../../types/discovery";

export function useSpreadOptions(filters: SpreadOptionsDiscoveryFilters) {
  return useQuery<PagedResult<SpreadOption[]>, Error>({
    queryKey: ["spreadOptions", filters] as const,
    queryFn: () => fetchSpreadOptions(filters),
    placeholderData: (previous) => previous,
  });
}
