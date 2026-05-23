import { useMemo, useState } from "react";
import type { CoveredCall } from "../types/coveredCall";
import type { OptionsFilters as Filters } from "../types/filters";
import type { SavedScreenerConfig } from "../types/savedScreener";
import { EXCHANGES } from "../constants/exchanges";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import { getApiErrorMessage } from "../api/errors";
import { useCoveredCalls } from "../api/hooks/useCoveredCalls";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";
import SavedScreenersPanel from "../components/SavedScreenersPanel";

const exchangeMap: Record<number, string> = Object.fromEntries(EXCHANGES.map((e) => [e.id, e.name]));

export default function CoveredCallsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);
  const { data, isLoading, isFetching, error } = useCoveredCalls(stableFilters);
  const rows: CoveredCall[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

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

      {!isLoading && !error && rows.length > 0 && <OptionsTable data={rows} exchangeMap={exchangeMap} />}

      {isFetching && !isLoading && <div className="text-sm text-gray-500 py-3">Refreshing…</div>}
    </div>
  );
}
