export type StrategyType = "covered_calls" | "put_options" | "spread_options";

export type SavedScreenerConfig = {
  filters: object;
  sort: Record<string, unknown> | null;
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
