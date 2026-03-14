import { useQuery } from "@tanstack/react-query";
import { fetchPutOptions } from "../putOptions";
import { queryKeys } from "../queryKeys";
import type { OptionsFilters } from "../../types/filters";
import type { PutOption } from "../../types/putOption";

export function usePutOptions(filters: OptionsFilters) {
  return useQuery<PutOption[]>({
    queryKey: queryKeys.putOptions(filters),
    queryFn: () => fetchPutOptions(filters),
    placeholderData: (previous) => previous,
  });
}
