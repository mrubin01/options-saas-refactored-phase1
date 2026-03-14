import { useMemo, useState } from "react";
import type { SpreadOption } from "../types/spreadOption";
import type { OptionsFilters as Filters } from "../types/filters";
import { EXCHANGES } from "../constants/exchanges";
import { getLastUpdated } from "../utils/lastUpdated";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import { getApiErrorMessage } from "../api/errors";
import { useSpreadOptions } from "../api/hooks/useSpreadOptions";
import ApiStatus from "../components/ApiStatus";
import OptionsFilters from "../components/OptionsFilters";
import OptionsTable from "../components/OptionsTable";
import PageHeader from "../components/PageHeader";

const exchangeMap: Record<number, string> = Object.fromEntries(EXCHANGES.map((e) => [e.id, e.name]));

export default function SpreadOptionsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const debouncedFilters = useDebouncedValue(filters, 300);
  const stableFilters = useMemo(() => debouncedFilters, [debouncedFilters]);
  const { data, isLoading, isFetching, error } = useSpreadOptions(stableFilters);
  const rows: SpreadOption[] = data ?? [];
  const lastUpdated = getLastUpdated(rows);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader title="Best Spread Options" lastUpdated={lastUpdated} />
      <OptionsFilters filters={filters} onChange={setFilters} exchanges={EXCHANGES} />
      <ApiStatus loading={isLoading} error={error ? getApiErrorMessage(error, "Failed to load spread options") : null} empty={!isLoading && !error && rows.length === 0} />
      {!isLoading && !error && rows.length > 0 && <OptionsTable data={rows} exchangeMap={exchangeMap} />}
      {isFetching && !isLoading && <div className="text-sm text-gray-500 py-3">Refreshing…</div>}
    </div>
  );
}
