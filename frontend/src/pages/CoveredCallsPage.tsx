import { useEffect, useMemo, useState } from "react";

import { createWatchlistItem, deleteWatchlistItem, listWatchlistItems } from "../api/watchlist";
import { getApiErrorMessage } from "../api/errors";
import { useCoveredCalls } from "../api/hooks/useCoveredCalls";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";
import SavedScreenersPanel from "../components/SavedScreenersPanel";
import { EXCHANGES } from "../constants/exchanges";
import type { CoveredCall } from "../types/coveredCall";
import type { OptionsFilters as Filters } from "../types/filters";
import type { SavedScreenerConfig } from "../types/savedScreener";
import type { WatchlistItem } from "../types/watchlistItem";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";

const exchangeMap: Record<number, string> = Object.fromEntries(
  EXCHANGES.map((e) => [e.id, e.name])
);

export default function CoveredCallsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);
  const { data, isLoading, isFetching, error } = useCoveredCalls(stableFilters);

  const rows: CoveredCall[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setWatchlistError(null);
        const items = await listWatchlistItems("covered_calls");
        setWatchlistItems(items);
      } catch (err) {
        setWatchlistError(err instanceof Error ? err.message : "Failed to load watchlist");
      }
    }

    void loadWatchlist();
  }, []);

  async function handleAddToWatchlist(row: CoveredCall) {
    try {
      setWatchlistError(null);

      const created = await createWatchlistItem({
        strategy_type: "covered_calls",
        contract: row.contract,
        ticker: row.ticker,
        exchange: row.exchange,
      });

      setWatchlistItems((prev) => [created, ...prev]);
    } catch (err) {
      setWatchlistError(err instanceof Error ? err.message : "Failed to add to watchlist");
    }
  }

  async function handleRemoveFromWatchlist(itemId: number) {
    try {
      setWatchlistError(null);
      await deleteWatchlistItem(itemId);
      setWatchlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      setWatchlistError(err instanceof Error ? err.message : "Failed to remove from watchlist");
    }
  }

  function getCurrentScreenerConfig(): SavedScreenerConfig {
    return {
      filters,
      sort: null,
    };
  }

  function applySavedScreener(config: SavedScreenerConfig) {
    setFilters((config.filters as Filters) ?? {});
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader title="Best Covered Calls" lastUpdated={lastUpdated} />

      <div className="mb-4">
        <SavedScreenersPanel
          strategyType="covered_calls"
          getCurrentConfig={getCurrentScreenerConfig}
          onApply={applySavedScreener}
        />
      </div>

      <OptionsFilters filters={filters} onChange={setFilters} exchanges={EXCHANGES} />

      <ApiStatus
        loading={isLoading}
        error={error ? getApiErrorMessage(error, "Failed to load covered calls") : null}
        empty={!isLoading && !error && rows.length === 0}
      />

      {watchlistError && <div className="text-sm text-red-600 py-2">{watchlistError}</div>}

      {!isLoading && !error && rows.length > 0 && (
        <OptionsTable
          data={rows}
          exchangeMap={exchangeMap}
          strategyType="covered_calls"
          watchlistItems={watchlistItems}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}

      {isFetching && !isLoading && <div className="text-sm text-gray-500 py-3">Refreshing…</div>}
    </div>
  );
}
