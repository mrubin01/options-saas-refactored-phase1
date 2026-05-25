import { apiFetch } from "./http";
import type { CreateWatchlistItemPayload, WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";

export function listWatchlistItems(strategyType?: WatchlistStrategyType) {
  const query = strategyType ? `?strategy_type=${strategyType}` : "";
  return apiFetch<WatchlistItem[]>(`/watchlist${query}`);
}

export function createWatchlistItem(payload: CreateWatchlistItemPayload) {
  return apiFetch<WatchlistItem>("/watchlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteWatchlistItem(id: number) {
  return apiFetch<null>(`/watchlist/${id}`, {
    method: "DELETE",
  });
}
