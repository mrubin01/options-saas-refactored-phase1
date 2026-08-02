import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "../api/errors";
import { useLongCalls } from "../api/hooks/useLongCalls";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import BuyingOptionsTable from "../components/BuyingOptionsTable";
import PageHeader from "../components/PageHeader";
import ActiveFilterChips from "../components/ActiveFilterChips";
import BuyingAdvancedFiltersPanel from "../components/BuyingAdvancedFiltersPanel";
import { useExchanges } from "../api/hooks/useExchanges";
import { useExpiryDates } from "../api/hooks/useExpiryDates";
import type { LongCall } from "../types/longCall";
import type { LongCallsDiscoveryFilters } from "../types/discovery";
import type { OptionsFilters as LegacyOptionsFilters } from "../types/filters";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  longCallsFiltersToSearchParams,
  parseLongCallsFiltersFromSearchParams,
} from "../utils/queryParams";
import StrategyHelpPanel from "../components/StrategyHelpPanel";
import DataFreshnessBanner from "../components/DataFreshnessBanner";
import Pagination from "../components/Pagination";

function toLegacyFilters(filters: LongCallsDiscoveryFilters): LegacyOptionsFilters {
  return {
    exchange: filters.exchange,
    ticker: filters.ticker,
    contract: filters.contract,
    expiry_date: filters.expiry_date ?? filters.expiry_date_min ?? filters.min_expiry,
  };
}

function mergeLegacyFilters(
  current: LongCallsDiscoveryFilters,
  nextLegacyFilters: LegacyOptionsFilters,
): LongCallsDiscoveryFilters {
  return {
    ...current,
    exchange: nextLegacyFilters.exchange,
    ticker: nextLegacyFilters.ticker,
    contract: nextLegacyFilters.contract,
    expiry_date: nextLegacyFilters.expiry_date,
    min_expiry: undefined,
    expiry_date_min: undefined,
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

export default function LongCallsPage() {
  const { data: exchanges = [] } = useExchanges();
  const { data: expiryOptions = [] } = useExpiryDates("long-calls");
  const exchangeMap: Record<number, string> = Object.fromEntries(exchanges.map((e) => [e.id, e.name]));

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<LongCallsDiscoveryFilters>(() =>
    parseLongCallsFiltersFromSearchParams(searchParams),
  );

  const legacyFilters = useMemo(() => toLegacyFilters(filters), [filters]);

  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);

  const { data, isLoading, isFetching, error } = useLongCalls(stableFilters);

  const rows: LongCall[] = data?.rows ?? [];
  const total = data?.pagination?.total ?? 0;
  const lastUpdated = getLastUpdated(rows);

  const tickerOptions = useMemo(() => getUniqueSortedValues(rows.map((row) => row.ticker)), [rows]);
  const contractOptions = useMemo(() => getUniqueSortedValues(rows.map((row) => row.contract)), [rows]);

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
    setSearchParams(longCallsFiltersToSearchParams(stableFilters), {
      replace: true,
    });
  }, [stableFilters, setSearchParams]);

  function handleLegacyFiltersChange(nextLegacyFilters: LegacyOptionsFilters) {
    setFilters((current) => mergeLegacyFilters(current, nextLegacyFilters));
  }

  function handleRemoveFilter(key: keyof LongCallsDiscoveryFilters) {
    setFilters((current) => {
      const next: LongCallsDiscoveryFilters = {
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

  return (
    <div>
      <PageHeader title="Best Long Calls" lastUpdated={lastUpdated} />

      <DataFreshnessBanner strategyKey="long_calls" />

      <StrategyHelpPanel title="How to read long calls">
        <p>
          Long calls give you the right to buy shares at the strike price before
          expiry. Compare by IV/HV ratio (lower means cheaper relative to realised
          volatility), expected return at 5%/10% move, DTE, and delta.
        </p>
        <p>
          A lower IV/HV ratio suggests the option may be underpriced relative to
          historical volatility — a potential edge for buyers.
        </p>
      </StrategyHelpPanel>

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
        onTrendChange={(v) => setFilters((f) => ({ ...f, main_trend: v, offset: 0 }))}
        trend={filters.main_trend}
        onReset={handleClearAllFilters}
      />

      <BuyingAdvancedFiltersPanel
        filters={filters}
        onChange={(newFilters) => setFilters({ ...newFilters, offset: 0 })}
      />

      <ActiveFilterChips
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      <ApiStatus
        loading={isLoading}
        error={error ? getApiErrorMessage(error, "Failed to load long calls") : null}
        empty={!isLoading && !error && rows.length === 0}
      />

      {!isLoading && !error && rows.length > 0 && (
        <>
          <BuyingOptionsTable
            data={rows}
            exchangeMap={exchangeMap}
          />
          <Pagination
            offset={filters.offset ?? 0}
            limit={filters.limit ?? 50}
            total={total}
            onChange={(newOffset) => setFilters((f) => ({ ...f, offset: newOffset }))}
          />
        </>
      )}

      {isFetching && !isLoading && (
        <div className="text-sm text-gray-500 py-3">Refreshing…</div>
      )}
    </div>
  );
}
