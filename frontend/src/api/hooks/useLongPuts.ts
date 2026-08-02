import { useQuery } from "@tanstack/react-query";
import { fetchLongPuts } from "../longPuts";
import { queryKeys } from "../queryKeys";
import type { PagedResult } from "../http";
import type { LongPut } from "../../types/longPut";
import type { LongPutsDiscoveryFilters } from "../../types/discovery";

export function useLongPuts(filters: LongPutsDiscoveryFilters) {
  return useQuery<PagedResult<LongPut[]>, Error>({
    queryKey: queryKeys.longPuts(filters),
    queryFn: () => fetchLongPuts(filters),
    placeholderData: (previous) => previous,
  });
}
