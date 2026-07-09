import { useQuery } from "@tanstack/react-query";
import { fetchSpreadOptions } from "../spreadOptions";
import { queryKeys } from "../queryKeys";
import type { PagedResult } from "../http";
import type { SpreadOption } from "../../types/spreadOption";
import type { SpreadOptionsDiscoveryFilters } from "../../types/discovery";

export function useSpreadOptions(filters: SpreadOptionsDiscoveryFilters) {
  return useQuery<PagedResult<SpreadOption[]>, Error>({
    queryKey: queryKeys.spreadOptions(filters),
    queryFn: () => fetchSpreadOptions(filters),
    placeholderData: (previous) => previous,
  });
}
