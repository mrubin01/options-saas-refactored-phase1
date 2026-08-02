import type {
  CoveredCallSortField,
  SortDirection,
  SortPreset,
} from "../types/discovery";

export const coveredCallSortPresets: SortPreset<CoveredCallSortField>[] = [
  { label: "Soonest expiration", sort_by: "expiry_date", sort_dir: "asc" },
  { label: "Shortest DTE", sort_by: "days_to_expiration", sort_dir: "asc" },
  { label: "Highest option yield", sort_by: "option_yield", sort_dir: "desc" },
  { label: "Highest ROC", sort_by: "roc", sort_dir: "desc" },
  { label: "Highest total return", sort_by: "tot_return", sort_dir: "desc" },
  { label: "Lowest bid/ask spread", sort_by: "spread_bid_ask", sort_dir: "asc" },
  { label: "Lowest moneyness", sort_by: "moneyness", sort_dir: "asc" },
  { label: "Highest implied volatility", sort_by: "impl_volatility", sort_dir: "desc" },
  { label: "Lowest IV", sort_by: "impl_volatility", sort_dir: "asc" },
  { label: "Highest OTM", sort_by: "otm", sort_dir: "desc" },
  { label: "Lowest Delta", sort_by: "delta", sort_dir: "asc" },
];

export const longOptionSortPresets: SortPreset<CoveredCallSortField>[] = [
  { label: "Soonest expiration", sort_by: "expiry_date", sort_dir: "asc" },
  { label: "Shortest DTE", sort_by: "days_to_expiration", sort_dir: "asc" },
  { label: "Lowest bid/ask spread", sort_by: "spread_bid_ask", sort_dir: "asc" },
  { label: "Lowest moneyness", sort_by: "moneyness", sort_dir: "asc" },
  { label: "Highest implied volatility", sort_by: "impl_volatility", sort_dir: "desc" },
  { label: "Lowest IV", sort_by: "impl_volatility", sort_dir: "asc" },
  { label: "Highest Delta", sort_by: "delta", sort_dir: "desc" },
  { label: "Lowest Delta", sort_by: "delta", sort_dir: "asc" },
  { label: "Highest OTM", sort_by: "otm", sort_dir: "desc" },
];

interface Props {
  sortBy?: string;
  sortDir?: SortDirection;
  presets?: SortPreset<string>[];
  onChange: (sort: { sort_by?: CoveredCallSortField; sort_dir?: SortDirection }) => void;
}

function getPresetValue(sortBy?: string, sortDir?: SortDirection) {
  if (!sortBy) return "";
  return `${sortBy}:${sortDir ?? "desc"}`;
}

export default function SortPresetSelect({ sortBy, sortDir, presets = coveredCallSortPresets, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">Sort preset</label>
      <select
        value={getPresetValue(sortBy, sortDir)}
        onChange={(event) => {
          const value = event.target.value;
          if (!value) {
            onChange({ sort_by: undefined, sort_dir: undefined });
            return;
          }
          const [nextSortBy, nextSortDir] = value.split(":") as [CoveredCallSortField, SortDirection];
          onChange({ sort_by: nextSortBy, sort_dir: nextSortDir });
        }}
        className="rounded-md border border-border-dark bg-surface px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Default sorting</option>
        {presets.map((preset) => (
          <option
            key={`${preset.sort_by}:${preset.sort_dir}`}
            value={`${preset.sort_by}:${preset.sort_dir}`}
          >
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}
