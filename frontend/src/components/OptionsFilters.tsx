import type { OptionsFilters } from "../types/filters";

const selectClass =
  "rounded-md border border-border-dark bg-surface px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

interface Props {
  filters: OptionsFilters;
  onChange: (filters: OptionsFilters) => void;
  exchanges: { id: number; name: string }[];
  tickerOptions?: string[];
  contractOptions?: string[];
  expiryOptions?: string[];
  sector?: string;
  industry?: string;
  spreadMax?: number;
  sectorOptions?: string[];
  industryOptions?: string[];
  onSectorChange: (v: string | undefined) => void;
  onIndustryChange: (v: string | undefined) => void;
  onSpreadMaxChange: (v: number | undefined) => void;
  onReset: () => void;
}

export default function OptionsFilters({
  filters,
  onChange,
  exchanges,
  tickerOptions = [],
  contractOptions = [],
  expiryOptions = [],
  sector,
  industry,
  spreadMax,
  sectorOptions = [],
  industryOptions = [],
  onSectorChange,
  onIndustryChange,
  onSpreadMaxChange,
  onReset,
}: Props) {
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
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Expiry Date</label>
        <select
          value={filters.expiry_date || ""}
          onChange={(e) => onChange({ ...filters, expiry_date: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All Dates</option>
          {expiryOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Sector</label>
        <select
          value={sector || ""}
          onChange={(e) => onSectorChange(e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">All Sectors</option>
          {sectorOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Industry</label>
        <select
          value={industry || ""}
          onChange={(e) => onIndustryChange(e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">All Industries</option>
          {industryOptions.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Spread max</label>
        <input
          type="number"
          value={spreadMax ?? ""}
          min={0}
          step={0.01}
          placeholder="—"
          onChange={(e) =>
            onSpreadMaxChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
          className={`${selectClass} w-24`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted invisible">Reset</label>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-border/30 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
