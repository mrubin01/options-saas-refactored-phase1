import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import type { PutOptionsDiscoveryFilters } from "../types/discovery";
import type { LongCallsDiscoveryFilters } from "../types/discovery";
import type { LongPutsDiscoveryFilters } from "../types/discovery";

export const queryKeys = {
  coveredCalls: (filters: CoveredCallsDiscoveryFilters) =>
    ["coveredCalls", filters] as const,

  putOptions: (filters: PutOptionsDiscoveryFilters) =>
    ["putOptions", filters] as const,

  longCalls: (filters: LongCallsDiscoveryFilters) =>
    ["longCalls", filters] as const,

  longPuts: (filters: LongPutsDiscoveryFilters) =>
    ["longPuts", filters] as const,

  exchanges: () => ["exchanges"] as const,
};
