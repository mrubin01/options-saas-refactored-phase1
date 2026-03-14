import type { OptionsFilters } from "../types/filters";

export const queryKeys = {
  coveredCalls: (filters: OptionsFilters) => ["coveredCalls", filters] as const,
  putOptions: (filters: OptionsFilters) => ["putOptions", filters] as const,
  spreadOptions: (filters: OptionsFilters) => ["spreadOptions", filters] as const,
};
