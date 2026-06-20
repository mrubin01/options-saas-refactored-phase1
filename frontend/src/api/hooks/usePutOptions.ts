import { useQuery } from "@tanstack/react-query";
import { fetchPutOptions } from "../putOptions";
import { queryKeys } from "../queryKeys";
import type { PutOption } from "../../types/putOption";
import type { PutOptionsDiscoveryFilters } from "../../types/discovery";

export function usePutOptions(filters: PutOptionsDiscoveryFilters) {
  return useQuery<PutOption[], Error>({
    queryKey: queryKeys.putOptions(filters),
    queryFn: () => fetchPutOptions(filters),
    placeholderData: (previous) => previous,
  });
}
