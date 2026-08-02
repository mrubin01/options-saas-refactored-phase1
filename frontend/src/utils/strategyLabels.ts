import type { StrategyType } from "../types/savedScreener";
import type { WatchlistStrategyType } from "../types/watchlistItem";

export type AnyStrategyType = StrategyType | WatchlistStrategyType;

export const strategyLabelMap: Record<AnyStrategyType, string> = {
  covered_calls: "Sell Calls",
  put_options: "Sell Puts",
  long_calls: "Buy Calls",
  long_puts: "Buy Puts",
  spread_options: "Spread Options",
};

export const strategyPathMap: Record<AnyStrategyType, string> = {
  covered_calls: "/covered-calls",
  put_options: "/put-options",
  long_calls: "/long-calls",
  long_puts: "/long-puts",
  spread_options: "/spread-options",
};
