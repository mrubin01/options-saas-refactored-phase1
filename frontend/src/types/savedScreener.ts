export type StrategyType = "covered_calls" | "put_options" | "spread_options";
import type { CoveredCallsDiscoveryFilters } from "./discovery";
import type { OptionsFilters } from "./filters";

export type SavedScreenerConfig = {
  filters?: OptionsFilters | CoveredCallsDiscoveryFilters;
  sort?: {
    sort_by?: string;
    sort_dir?: "asc" | "desc";
  } | null;
};

export type SavedScreener = {
  id: number;
  user_id: number;
  name: string;
  strategy_type: StrategyType;
  config_json: SavedScreenerConfig;
  created_at: string;
  updated_at: string;
};

export type CreateSavedScreenerPayload = {
  name: string;
  strategy_type: StrategyType;
  config_json: SavedScreenerConfig;
};

export type UpdateSavedScreenerPayload = {
  name?: string;
  config_json?: SavedScreenerConfig;
};
