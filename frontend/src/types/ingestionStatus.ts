export type IngestionStatusValue =
  | "fresh"
  | "aging"
  | "stale"
  | "empty"
  | "unknown";

export type StrategyIngestionStatus = {
  status: IngestionStatusValue;
  last_updated: string | null;
  age_minutes: number | null;
  row_count: number;
};

export type IngestionStatusThresholds = {
  fresh_minutes: number;
  aging_minutes: number;
};

export type IngestionStatus = {
  overall_status: IngestionStatusValue;
  thresholds: IngestionStatusThresholds;
  strategies: {
    covered_calls: StrategyIngestionStatus;
    put_options: StrategyIngestionStatus;
    spread_options: StrategyIngestionStatus;
  };
};

export type StrategyIngestionStatusKey = keyof IngestionStatus["strategies"];
