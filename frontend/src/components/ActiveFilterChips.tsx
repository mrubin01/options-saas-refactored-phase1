import type { CoveredCallsDiscoveryFilters } from "../types/discovery";

type FilterKey = keyof CoveredCallsDiscoveryFilters;

const FILTER_LABELS: Partial<Record<FilterKey, string>> = {
  ticker: "Ticker",
  contract: "Contract",
  exchange: "Exchange",
  min_expiry: "Min expiry",
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
  open_interest_min: "Open interest min",
  open_interest_max: "Open interest max",
  impl_volatility_min: "IV min",
  impl_volatility_max: "IV max",
  delta_min: "Delta min",
  delta_max: "Delta max",
  moneyness_min: "Moneyness min",
  moneyness_max: "Moneyness max",
  spread_bid_ask_min: "Bid/ask spread min",
  spread_bid_ask_max: "Bid/ask spread max",
  sector: "Sector",
  industry: "Industry",
  sort_by: "Sort by",
  sort_dir: "Sort direction",
};

const SORT_FIELD_LABELS: Record<string, string> = {
  ticker: "Ticker",
  expiry_date: "Expiry date",
  days_to_expiration: "DTE",
  premium_per_contract: "Premium",
  option_yield: "Option yield",
  roc: "ROC",
  tot_return: "Total return",
  open_interest: "Open interest",
  impl_volatility: "Implied volatility",
  delta: "Delta",
  moneyness: "Moneyness",
  spread_bid_ask: "Bid/ask spread",
};

const HIDDEN_KEYS = new Set<FilterKey>(["limit", "offset"]);

function formatKey(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(key: FilterKey, value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (key === "sort_by") {
    return SORT_FIELD_LABELS[String(value)] ?? formatKey(String(value));
  }

  if (key === "sort_dir") {
    return String(value).toUpperCase();
  }

  return String(value);
}

interface Props {
  filters: CoveredCallsDiscoveryFilters;
  onRemove: (key: keyof CoveredCallsDiscoveryFilters) => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: Props) {
  const activeEntries = Object.entries(filters).filter(([key, value]) => {
    const typedKey = key as FilterKey;

    if (HIDDEN_KEYS.has(typedKey)) {
      return false;
    }

    // Avoid showing two chips for the same effective expiry lower-bound.
    if (typedKey === "min_expiry" && filters.expiry_date_min) {
      return false;
    }

    return value !== undefined && value !== null && value !== "";
  }) as [FilterKey, CoveredCallsDiscoveryFilters[FilterKey]][];

  if (activeEntries.length === 0) {
    return null;
  }

  return (
    <div style={{ margin: "0.75rem 0" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {activeEntries.map(([key, value]) => {
          const label = FILTER_LABELS[key] ?? formatKey(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onRemove(key)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "999px",
                padding: "0.25rem 0.6rem",
                background: "#f9fafb",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
              title="Remove filter"
            >
              {label}: {formatValue(key, value)} ×
            </button>
          );
        })}

        <button
          type="button"
          onClick={onClearAll}
          style={{
            border: "none",
            background: "transparent",
            color: "#2563eb",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
