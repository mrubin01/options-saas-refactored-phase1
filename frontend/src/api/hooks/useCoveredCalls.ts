import { useQuery } from "@tanstack/react-query";
import { fetchCoveredCalls } from "../coveredCalls";
import type { OptionsFilters } from "../../types/filters";
import type { CoveredCall } from "../../types/coveredCall";
import { queryKeys } from "../queryKeys";

export function useCoveredCalls(filters: OptionsFilters) {
  return useQuery<CoveredCall[], Error>({
    queryKey: queryKeys.coveredCalls(filters),
    queryFn: () => fetchCoveredCalls(filters),
    placeholderData: (previous) => previous,
  });
}
