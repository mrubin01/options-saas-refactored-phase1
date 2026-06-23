import type { OptionsFilters } from "../types/filters";

const inputClass =
  "rounded-md border border-border-dark bg-white px-3 py-2 text-sm text-navy placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  filters: OptionsFilters;
  onChange: (filters: OptionsFilters) => void;
  exchanges: { id: number; name: string }[];
}

export default function OptionsFilters({ filters, onChange, exchanges }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Ticker</label>
        <input
          placeholder="Ticker"
          value={filters.ticker || ""}
          onChange={(e) => onChange({ ...filters, ticker: e.target.value || undefined })}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Contract</label>
        <input
          placeholder="e.g. AAPL240119C00150000"
          value={filters.contract || ""}
          onChange={(e) => onChange({ ...filters, contract: e.target.value || undefined })}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Exchange</label>
        <select
          value={filters.exchange ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              exchange: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={inputClass}
        >
          <option value="">All Exchanges</option>
          {exchanges.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Min Expiry</label>
        <input
          type="date"
          value={filters.expiry_date || ""}
          onChange={(e) =>
            onChange({ ...filters, expiry_date: e.target.value || undefined })
          }
          className={inputClass}
        />
      </div>
    </div>
  );
}
