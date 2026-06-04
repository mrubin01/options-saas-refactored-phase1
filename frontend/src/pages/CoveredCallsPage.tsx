import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createWatchlistItem,
  deleteWatchlistItem,
  listWatchlistItems,
} from "../api/watchlist";
import { getApiErrorMessage } from "../api/errors";
import { useCoveredCalls } from "../api/hooks/useCoveredCalls";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";
import SavedScreenersPanel from "../components/SavedScreenersPanel";
import ActiveFilterChips from "../components/ActiveFilterChips";
import AdvancedFiltersPanel from "../components/AdvancedFiltersPanel";
import { EXCHANGES } from "../constants/exchanges";
import type { CoveredCall } from "../types/coveredCall";
import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import type { OptionsFilters as LegacyOptionsFilters } from "../types/filters";
import type { SavedScreenerConfig } from "../types/savedScreener";
import type { WatchlistItem } from "../types/watchlistItem";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  coveredCallsFiltersToSearchParams,
  parseCoveredCallsFiltersFromSearchParams,
} from "../utils/queryParams";

const exchangeMap: Record<number, string> = Object.fromEntries(
  EXCHANGES.map((e) => [e.id, e.name]),
);

function toLegacyFilters(
  filters: CoveredCallsDiscoveryFilters,
): LegacyOptionsFilters {
  return {
    exchange: filters.exchange,
    ticker: filters.ticker,
    contract: filters.contract,
    expiry_date: filters.expiry_date_min ?? filters.min_expiry,
  };
}

function mergeLegacyFilters(
  current: CoveredCallsDiscoveryFilters,
  nextLegacyFilters: LegacyOptionsFilters,
): CoveredCallsDiscoveryFilters {
  return {
    ...current,
    exchange: nextLegacyFilters.exchange,
    ticker: nextLegacyFilters.ticker,
    contract: nextLegacyFilters.contract,
    min_expiry: nextLegacyFilters.expiry_date,
    expiry_date_min: nextLegacyFilters.expiry_date,
    offset: 0,
  };
}

function getUniqueSortedValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export default function CoveredCallsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<CoveredCallsDiscoveryFilters>(() =>
    parseCoveredCallsFiltersFromSearchParams(searchParams),
  );

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [watchlistSuccess, setWatchlistSuccess] = useState<string | null>(null);
  const [pendingWatchlistContracts, setPendingWatchlistContracts] = useState<
    string[]
  >([]);

  const legacyFilters = useMemo(() => toLegacyFilters(filters), [filters]);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);

  const { data, isLoading, isFetching, error } = useCoveredCalls(stableFilters);

  const rows: CoveredCall[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

  const sectorOptions = useMemo(() => {
    return getUniqueSortedValues(rows.map((row) => row.sector));
  }, [rows]);

  const industryOptions = useMemo(() => {
    const rowsForSelectedSector = filters.sector
      ? rows.filter((row) => row.sector === filters.sector)
      : rows;

    return getUniqueSortedValues(rowsForSelectedSector.map((row) => row.industry));
  }, [rows, filters.sector]);

  useEffect(() => {
    setSearchParams(coveredCallsFiltersToSearchParams(stableFilters), {
      replace: true,
    });
  }, [stableFilters, setSearchParams]);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setWatchlistError(null);
        const items = await listWatchlistItems("covered_calls");
        setWatchlistItems(items);
      } catch (err) {
        setWatchlistError(
          err instanceof Error ? err.message : "Failed to load watchlist",
        );
      }
    }

    void loadWatchlist();
  }, []);

  async function handleAddToWatchlist(row: CoveredCall) {
    try {
      setWatchlistError(null);
      setWatchlistSuccess(null);
      setPendingWatchlistContracts((prev) => [...prev, row.contract]);

      const created = await createWatchlistItem({
        strategy_type: "covered_calls",
        contract: row.contract,
        ticker: row.ticker,
        exchange: row.exchange,
      });

      setWatchlistItems((prev) => [created, ...prev]);
      setWatchlistSuccess(`Added ${row.ticker} to watchlist`);
    } catch (err) {
      setWatchlistError(
        err instanceof Error ? err.message : "Failed to add to watchlist",
      );
    } finally {
      setPendingWatchlistContracts((prev) =>
        prev.filter((contract) => contract !== row.contract),
      );
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
      setWatchlistError(
        err instanceof Error ? err.message : "Failed to remove from watchlist",
      );
    } finally {
      setPendingWatchlistContracts((prev) =>
        prev.filter((itemContract) => itemContract !== contract),
      );
    }
  }

  function handleLegacyFiltersChange(nextLegacyFilters: LegacyOptionsFilters) {
    setFilters((current) => mergeLegacyFilters(current, nextLegacyFilters));
  }

  function handleRemoveFilter(key: keyof CoveredCallsDiscoveryFilters) {
    setFilters((current) => ({
      ...current,
      [key]: undefined,
      offset: 0,
    }));
  }

  function handleClearAllFilters() {
    setFilters({});
  }

  function getCurrentScreenerConfig(): SavedScreenerConfig {
    return {
      filters,
      sort: filters.sort_by
        ? {
            sort_by: filters.sort_by,
            sort_dir: filters.sort_dir ?? "desc",
          }
        : null,
    };
  }

  function applySavedScreener(config: SavedScreenerConfig) {
    const nextFilters =
      (config.filters as CoveredCallsDiscoveryFilters | undefined) ?? {};

    setFilters({
      ...nextFilters,
      offset: 0,
    });
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

      <OptionsFilters
        filters={legacyFilters}
        onChange={handleLegacyFiltersChange}
        exchanges={EXCHANGES}
      />

      <AdvancedFiltersPanel
        filters={filters}
        onChange={setFilters}
        sectorOptions={sectorOptions}
        industryOptions={industryOptions}
      />

      <ActiveFilterChips
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      <ApiStatus
        loading={isLoading}
        error={
          error ? getApiErrorMessage(error, "Failed to load covered calls") : null
        }
        empty={!isLoading && !error && rows.length === 0}
      />

      {watchlistError && (
        <div className="text-sm text-red-600 py-2">{watchlistError}</div>
      )}

      {watchlistSuccess && (
        <div className="text-sm text-green-600 py-2">{watchlistSuccess}</div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <OptionsTable
          data={rows}
          exchangeMap={exchangeMap}
          strategyType="covered_calls"
          watchlistItems={watchlistItems}
          pendingWatchlistContracts={pendingWatchlistContracts}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}

      {isFetching && !isLoading && (
        <div className="text-sm text-gray-500 py-3">Refreshing…</div>
      )}
    </div>
  );
}
