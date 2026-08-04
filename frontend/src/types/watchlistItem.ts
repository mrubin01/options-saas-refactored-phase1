export type WatchlistStrategyType = "covered_calls" | "put_options" | "long_calls" | "long_puts";

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
