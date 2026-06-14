export type StrategyFreshness = {
  last_updated: string | null;
  row_count: number;
};

export type DataFreshness = {
  covered_calls: StrategyFreshness;
  put_options: StrategyFreshness;
  spread_options: StrategyFreshness;
};

export type StrategyFreshnessKey = keyof DataFreshness;
