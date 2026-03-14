import { useQuery } from "@tanstack/react-query";
import { fetchSpreadOptions } from "../spreadOptions";
import { queryKeys } from "../queryKeys";
import type { OptionsFilters } from "../../types/filters";
import type { SpreadOption } from "../../types/spreadOption";

export function useSpreadOptions(filters: OptionsFilters) {
  return useQuery<SpreadOption[]>({
    queryKey: queryKeys.spreadOptions(filters),
    queryFn: () => fetchSpreadOptions(filters),
    placeholderData: (previous) => previous,
  });
}
