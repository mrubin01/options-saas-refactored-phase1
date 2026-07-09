import type { CoveredCallsDiscoveryFilters } from "../types/discovery";

type FilterKey = keyof CoveredCallsDiscoveryFilters;

const FILTER_LABELS: Partial<Record<FilterKey, string>> = {
  ticker: "Ticker",
  contract: "Contract",
  exchange: "Exchange",
  expiry_date: "Expiry",
  min_expiry: "Expiry from",
  expiry_date_min: "Expiry from",
  expiry_date_max: "Expiry to",
  days_to_expiration_min: "DTE min",
  days_to_expiration_max: "DTE max",
  option_yield_min: "Yield min",
  option_yield_max: "Yield max",
  roc_min: "ROC min",
  roc_max: "ROC max",
  tot_return_min: "Total return min",
  tot_return_max: "Total return max",
  premium_per_contract_min: "Premium min",
  premium_per_contract_max: "Premium max",
  open_interest_min: "OI min",
  open_interest_max: "OI max",
  impl_volatility_min: "IV min",
  impl_volatility_max: "IV max",
  delta_min: "Delta min",
  delta_max: "Delta max",
  moneyness_min: "Moneyness min",
  moneyness_max: "Moneyness max",
  spread_bid_ask_min: "Spread min",
  spread_bid_ask_max: "Spread max",
  sector: "Sector",
  industry: "Industry",
  sort_by: "Sort",
  sort_dir: "Direction",
};

const SORT_FIELD_LABELS: Record<string, string> = {
  ticker: "Ticker",
  expiry_date: "Expiry",
  days_to_expiration: "DTE",
  premium_per_contract: "Premium",
  option_yield: "Yield",
  roc: "ROC",
  tot_return: "Total return",
  open_interest: "Open interest",
  impl_volatility: "IV",
  delta: "Delta",
  moneyness: "Moneyness",
  spread_bid_ask: "Spread",
};

const HIDDEN_KEYS = new Set<FilterKey>(["limit", "offset"]);

function formatKey(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(key: FilterKey, value: unknown) {
  if (value === undefined || value === null || value === "") return "";
  if (key === "sort_by") return SORT_FIELD_LABELS[String(value)] ?? formatKey(String(value));
  if (key === "sort_dir") return String(value).toUpperCase();
  return String(value);
}

interface Props {
  filters: CoveredCallsDiscoveryFilters;
  onRemove: (key: keyof CoveredCallsDiscoveryFilters) => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({ filters, onRemove, onClearAll }: Props) {
  const activeEntries = Object.entries(filters).filter(([key, value]) => {
    const typedKey = key as FilterKey;
    if (HIDDEN_KEYS.has(typedKey)) return false;
    if (typedKey === "min_expiry" && (filters.expiry_date_min || filters.expiry_date)) return false;
    return value !== undefined && value !== null && value !== "";
  }) as [FilterKey, CoveredCallsDiscoveryFilters[FilterKey]][];

  if (activeEntries.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {activeEntries.map(([key, value]) => {
        const label = FILTER_LABELS[key] ?? formatKey(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onRemove(key)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-navy hover:bg-border/40 transition-colors"
            title="Remove filter"
          >
            <span className="text-muted">{label}:</span>
            <span>{formatValue(key, value)}</span>
            <span className="text-subtle ml-0.5">×</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-primary hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
