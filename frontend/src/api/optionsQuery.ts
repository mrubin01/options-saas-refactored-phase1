import type { OptionsFilters } from "../types/filters";

export function buildOptionsQuery(params: OptionsFilters & { limit?: number; offset?: number } = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key === "expiry_date" ? "min_expiry" : key, String(value));
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}
