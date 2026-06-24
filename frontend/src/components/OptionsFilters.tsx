import type { OptionsFilters } from "../types/filters";

const selectClass =
  "rounded-md border border-border-dark bg-surface px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  filters: OptionsFilters;
  onChange: (filters: OptionsFilters) => void;
  exchanges: { id: number; name: string }[];
  tickerOptions?: string[];
  contractOptions?: string[];
}

export default function OptionsFilters({ filters, onChange, exchanges, tickerOptions = [], contractOptions = [] }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Ticker</label>
        <select
          value={filters.ticker || ""}
          onChange={(e) => onChange({ ...filters, ticker: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All Tickers</option>
          {tickerOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Contract</label>
        <select
          value={filters.contract || ""}
          onChange={(e) => onChange({ ...filters, contract: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All Contracts</option>
          {contractOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
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
          className={selectClass}
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
          className={selectClass}
        />
      </div>
    </div>
  );
}
