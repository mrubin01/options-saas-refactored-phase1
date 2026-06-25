import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createWatchlistItem,
  deleteWatchlistItem,
  listWatchlistItems,
} from "../api/watchlist";
import { getApiErrorMessage } from "../api/errors";
import { usePutOptions } from "../api/hooks/usePutOptions";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";
import SavedScreenersPanel from "../components/SavedScreenersPanel";
import ActiveFilterChips from "../components/ActiveFilterChips";
import AdvancedFiltersPanel from "../components/AdvancedFiltersPanel";
import { useExchanges } from "../api/hooks/useExchanges";
import type { PutOption } from "../types/putOption";
import type {
  PutOptionSortField,
  PutOptionsDiscoveryFilters,
} from "../types/discovery";
import type { OptionsFilters as LegacyOptionsFilters } from "../types/filters";
import type { SavedScreenerConfig } from "../types/savedScreener";
import type { WatchlistItem } from "../types/watchlistItem";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  putOptionsFiltersToSearchParams,
  parsePutOptionsFiltersFromSearchParams,
} from "../utils/queryParams";
import StrategyHelpPanel from "../components/StrategyHelpPanel";
import DataFreshnessBanner from "../components/DataFreshnessBanner";


function toLegacyFilters(
  filters: PutOptionsDiscoveryFilters,
): LegacyOptionsFilters {
  return {
    exchange: filters.exchange,
    ticker: filters.ticker,
    contract: filters.contract,
    expiry_date: filters.expiry_date_min ?? filters.min_expiry,
  };
}

function mergeLegacyFilters(
  current: PutOptionsDiscoveryFilters,
  nextLegacyFilters: LegacyOptionsFilters,
): PutOptionsDiscoveryFilters {
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

function normalizeSavedScreenerFilters(
  config: SavedScreenerConfig,
): PutOptionsDiscoveryFilters {
  const rawFilters =
    (config.filters as
      | (PutOptionsDiscoveryFilters & { expiry_date?: string })
      | undefined) ?? {};

  const expiryDateMin =
    rawFilters.expiry_date_min ?? rawFilters.min_expiry ?? rawFilters.expiry_date;

  return {
    ...rawFilters,
    min_expiry: expiryDateMin,
    expiry_date_min: expiryDateMin,
    sort_by: rawFilters.sort_by ?? (config.sort?.sort_by as PutOptionSortField | undefined),
    sort_dir: rawFilters.sort_dir ?? config.sort?.sort_dir,
    offset: 0,
  };
}

export default function PutOptionsPage() {
  const { data: exchanges = [] } = useExchanges();
  const exchangeMap: Record<number, string> = Object.fromEntries(exchanges.map((e) => [e.id, e.name]));

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<PutOptionsDiscoveryFilters>(() =>
    parsePutOptionsFiltersFromSearchParams(searchParams),
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

  const { data, isLoading, isFetching, error } = usePutOptions(stableFilters);

  const rows: PutOption[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

  const tickerOptions = useMemo(() => getUniqueSortedValues(rows.map((row) => row.ticker)), [rows]);
  const contractOptions = useMemo(() => getUniqueSortedValues(rows.map((row) => row.contract)), [rows]);
  const expiryOptions = useMemo(() => getUniqueSortedValues(rows.map((row) => row.expiry_date)), [rows]);

  const sectorOptions = useMemo(() => {
    return getUniqueSortedValues(rows.map((row) => row.sector));
  }, [rows]);

  const industryOptions = useMemo(() => {
    const rowsForSelectedSector = filters.sector
      ? rows.filter((row) => row.sector === filters.sector)
      : rows;

    return getUniqueSortedValues(
      rowsForSelectedSector.map((row) => row.industry),
    );
  }, [rows, filters.sector]);

  useEffect(() => {
    setSearchParams(putOptionsFiltersToSearchParams(stableFilters), {
      replace: true,
    });
  }, [stableFilters, setSearchParams]);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setWatchlistError(null);
        const items = await listWatchlistItems("put_options");
        setWatchlistItems(items);
      } catch (err) {
        setWatchlistError(
          err instanceof Error ? err.message : "Failed to load watchlist",
        );
      }
    }

    void loadWatchlist();
  }, []);

  async function handleAddToWatchlist(row: PutOption) {
    try {
      setWatchlistError(null);
      setWatchlistSuccess(null);
      setPendingWatchlistContracts((prev) => [...prev, row.contract]);

      const created = await createWatchlistItem({
        strategy_type: "put_options",
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

  function handleRemoveFilter(key: keyof PutOptionsDiscoveryFilters) {
    setFilters((current) => {
      const next: PutOptionsDiscoveryFilters = {
        ...current,
        [key]: undefined,
        offset: 0,
      };

      if (key === "expiry_date_min" || key === "min_expiry") {
        next.expiry_date_min = undefined;
        next.min_expiry = undefined;
      }

      if (key === "sector") {
        next.industry = undefined;
      }

      return next;
    });
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
    setFilters(normalizeSavedScreenerFilters(config));
  }

  return (
    <div>
      <PageHeader title="Best Put Options" lastUpdated={lastUpdated} />

      <DataFreshnessBanner strategyKey="put_options" />

      <StrategyHelpPanel title="How to read cash-secured puts">
        <p>
          Cash-secured puts should be compared by premium, return on capital,
          break-even price, DTE, liquidity, and downside risk.
        </p>
        <p>
          Higher premium may mean the market is pricing in greater uncertainty or a
          higher chance that the stock falls below the strike.
        </p>
      </StrategyHelpPanel>

      <div className="mb-4">
        <SavedScreenersPanel
          strategyType="put_options"
          getCurrentConfig={getCurrentScreenerConfig}
          onApply={applySavedScreener}
        />
      </div>

      <OptionsFilters
        filters={legacyFilters}
        onChange={handleLegacyFiltersChange}
        exchanges={exchanges}
        tickerOptions={tickerOptions}
        contractOptions={contractOptions}
        expiryOptions={expiryOptions}
        sector={filters.sector}
        industry={filters.industry}
        spreadMax={filters.spread_bid_ask_max}
        sectorOptions={sectorOptions}
        industryOptions={industryOptions}
        onSectorChange={(v) => setFilters((f) => ({ ...f, sector: v, industry: undefined, offset: 0 }))}
        onIndustryChange={(v) => setFilters((f) => ({ ...f, industry: v, offset: 0 }))}
        onSpreadMaxChange={(v) => setFilters((f) => ({ ...f, spread_bid_ask_max: v, offset: 0 }))}
        onTrendChange={(v) => setFilters((f) => ({ ...f, main_trend_min: v, main_trend_max: v, offset: 0 }))}
        trend={filters.main_trend_min}
        onReset={handleClearAllFilters}
      />

      <AdvancedFiltersPanel
        filters={filters}
        onChange={setFilters}
      />

      <ActiveFilterChips
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      <ApiStatus
        loading={isLoading}
        error={
          error ? getApiErrorMessage(error, "Failed to load put options") : null
        }
        empty={!isLoading && !error && rows.length === 0}
      />

      {watchlistError && (
        <div className="text-sm text-red-400 py-2">{watchlistError}</div>
      )}

      {watchlistSuccess && (
        <div className="text-sm text-emerald-400 py-2">{watchlistSuccess}</div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <OptionsTable
          data={rows}
          exchangeMap={exchangeMap}
          strategyType="put_options"
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
