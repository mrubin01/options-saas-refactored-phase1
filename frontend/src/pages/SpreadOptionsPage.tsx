import { useEffect, useMemo, useState } from "react";

import { createWatchlistItem, deleteWatchlistItem, listWatchlistItems } from "../api/watchlist";
import { getApiErrorMessage } from "../api/errors";
import { useSpreadOptions } from "../api/hooks/useSpreadOptions";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";
import SavedScreenersPanel from "../components/SavedScreenersPanel";
import { EXCHANGES } from "../constants/exchanges";
import type { SpreadOption } from "../types/spreadOption";
import type { OptionsFilters as Filters } from "../types/filters";
import type { SavedScreenerConfig } from "../types/savedScreener";
import type { WatchlistItem } from "../types/watchlistItem";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";

const exchangeMap: Record<number, string> = Object.fromEntries(
  EXCHANGES.map((e) => [e.id, e.name])
);

export default function SpreadOptionsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [watchlistSuccess, setWatchlistSuccess] = useState<string | null>(null);
  const [pendingWatchlistContracts, setPendingWatchlistContracts] = useState<string[]>([]);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);
  const { data, isLoading, isFetching, error } = useSpreadOptions(stableFilters);

  const rows: SpreadOption[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setWatchlistError(null);
        const items = await listWatchlistItems("spread_options");
        setWatchlistItems(items);
      } catch (err) {
        setWatchlistError(err instanceof Error ? err.message : "Failed to load watchlist");
      }
    }

    void loadWatchlist();
  }, []);

  async function handleAddToWatchlist(row: SpreadOption) {
    try {
      setWatchlistError(null);
      setWatchlistSuccess(null);
      setPendingWatchlistContracts((prev) => [...prev, row.contract]);

      const created = await createWatchlistItem({
        strategy_type: "spread_options",
        contract: row.contract,
        ticker: row.ticker,
        exchange: row.exchange,
      });

      setWatchlistItems((prev) => [created, ...prev]);
      setWatchlistSuccess(`Added ${row.ticker} to watchlist`);
    } catch (err) {
      setWatchlistError(err instanceof Error ? err.message : "Failed to add to watchlist");
    } finally {
      setPendingWatchlistContracts((prev) => prev.filter((contract) => contract !== row.contract));
    }
  }

  async function handleRemoveFromWatchlist(itemId: number, contract: string) {
    try {
      setWatchlistError(null);
      setWatchlistSuccess(null);
      setPendingWatchlistContracts((prev) => [...prev, contract]);

      await deleteWatchlistItem(itemId);
      setWatchlistItems((prev) => prev.filter((item) => item.id !== itemId));
      setWatchlistSuccess("Removed item from watchlist");
    } catch (err) {
      setWatchlistError(err instanceof Error ? err.message : "Failed to remove from watchlist");
    } finally {
      setPendingWatchlistContracts((prev) => prev.filter((itemContract) => itemContract !== contract));
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
      <PageHeader title="Best Spread Options" lastUpdated={lastUpdated} />

      <div className="mb-4">
        <SavedScreenersPanel
          strategyType="spread_options"
          getCurrentConfig={getCurrentScreenerConfig}
          onApply={applySavedScreener}
        />
      </div>

      <OptionsFilters filters={filters} onChange={setFilters} exchanges={EXCHANGES} />

      <ApiStatus
        loading={isLoading}
        error={error ? getApiErrorMessage(error, "Failed to load spread options") : null}
        empty={!isLoading && !error && rows.length === 0}
      />

      {watchlistError && <div className="text-sm text-red-600 py-2">{watchlistError}</div>}
      {watchlistSuccess && <div className="text-sm text-green-600 py-2">{watchlistSuccess}</div>}

      {!isLoading && !error && rows.length > 0 && (
        <OptionsTable
          data={rows}
          exchangeMap={exchangeMap}
          strategyType="spread_options"
          watchlistItems={watchlistItems}
          pendingWatchlistContracts={pendingWatchlistContracts}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}

      {isFetching && !isLoading && <div className="text-sm text-gray-500 py-3">Refreshing…</div>}
    </div>
  );
}
