import { useQuery } from "@tanstack/react-query";
import { fetchLongCalls } from "../longCalls";
import { queryKeys } from "../queryKeys";
import type { PagedResult } from "../http";
import type { LongCall } from "../../types/longCall";
import type { LongCallsDiscoveryFilters } from "../../types/discovery";

export function useLongCalls(filters: LongCallsDiscoveryFilters) {
  return useQuery<PagedResult<LongCall[]>, Error>({
    queryKey: queryKeys.longCalls(filters),
    queryFn: () => fetchLongCalls(filters),
    placeholderData: (previous) => previous,
  });
}
