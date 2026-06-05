import { useQuery } from "@tanstack/react-query";
import { fetchCoveredCalls } from "../coveredCalls";
import { queryKeys } from "../queryKeys";
import type { CoveredCall } from "../../types/coveredCall";
import type { CoveredCallsDiscoveryFilters } from "../../types/discovery";

export function useCoveredCalls(filters: CoveredCallsDiscoveryFilters) {
  return useQuery<CoveredCall[], Error>({
    queryKey: queryKeys.coveredCalls(filters),
    queryFn: () => fetchCoveredCalls(filters),
    placeholderData: (previous) => previous,
  });
}
