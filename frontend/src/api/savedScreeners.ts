import { apiFetch } from "./http";
import type {
  SavedScreener,
  CreateSavedScreenerPayload,
  UpdateSavedScreenerPayload,
  StrategyType,
} from "../types/savedScreener";

export function listSavedScreeners(strategyType?: StrategyType) {
  const query = strategyType
    ? `?strategy_type=${encodeURIComponent(strategyType)}`
    : "";

  return apiFetch<SavedScreener[]>(`/saved-screeners${query}`);
}

export function getSavedScreener(id: number) {
  return apiFetch<SavedScreener>(`/saved-screeners/${id}`);
}

export function createSavedScreener(payload: CreateSavedScreenerPayload) {
  return apiFetch<SavedScreener>("/saved-screeners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSavedScreener(
  id: number,
  payload: UpdateSavedScreenerPayload,
) {
  return apiFetch<SavedScreener>(`/saved-screeners/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSavedScreener(id: number) {
  return apiFetch<null>(`/saved-screeners/${id}`, {
    method: "DELETE",
  });
}
