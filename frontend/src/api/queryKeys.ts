import type { OptionsFilters } from "../types/filters";
import type { CoveredCallsDiscoveryFilters } from "../types/discovery";

export const queryKeys = {
  coveredCalls: (filters: CoveredCallsDiscoveryFilters) =>
    ["coveredCalls", filters] as const,

  putOptions: (filters: OptionsFilters) =>
    ["putOptions", filters] as const,

  spreadOptions: (filters: OptionsFilters) =>
    ["spreadOptions", filters] as const,
};
