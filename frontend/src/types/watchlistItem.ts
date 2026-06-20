export type WatchlistStrategyType = "covered_calls" | "put_options" | "spread_options";

export type WatchlistItem = {
  id: number;
  user_id: number;
  strategy_type: WatchlistStrategyType;
  contract: string;
  ticker: string;
  exchange: number;
  created_at: string;
};

export type CreateWatchlistItemPayload = {
  strategy_type: WatchlistStrategyType;
  contract: string;
  ticker: string;
  exchange: number;
};
