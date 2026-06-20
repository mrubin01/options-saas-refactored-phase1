import type { StrategyType } from "../types/savedScreener";
import type { WatchlistStrategyType } from "../types/watchlistItem";

export type AnyStrategyType = StrategyType | WatchlistStrategyType;

export const strategyLabelMap: Record<AnyStrategyType, string> = {
  covered_calls: "Covered Calls",
  put_options: "Put Options",
  spread_options: "Spread Options",
};

export const strategyPathMap: Record<AnyStrategyType, string> = {
  covered_calls: "/covered-calls",
  put_options: "/put-options",
  spread_options: "/spread-options",
};
