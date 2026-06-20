import type {
  CoveredCallSortField,
  SortDirection,
  SortPreset,
} from "../types/discovery";

export const coveredCallSortPresets: SortPreset<CoveredCallSortField>[] = [
  {
    label: "Soonest expiration",
    sort_by: "expiry_date",
    sort_dir: "asc",
  },
  {
    label: "Shortest DTE",
    sort_by: "days_to_expiration",
    sort_dir: "asc",
  },
  {
    label: "Highest option yield",
    sort_by: "option_yield",
    sort_dir: "desc",
  },
  {
    label: "Highest ROC",
    sort_by: "roc",
    sort_dir: "desc",
  },
  {
    label: "Highest total return",
    sort_by: "tot_return",
    sort_dir: "desc",
  },
  {
    label: "Highest premium",
    sort_by: "premium_per_contract",
    sort_dir: "desc",
  },
  {
    label: "Highest open interest",
    sort_by: "open_interest",
    sort_dir: "desc",
  },
  {
    label: "Lowest bid/ask spread",
    sort_by: "spread_bid_ask",
    sort_dir: "asc",
  },
  {
    label: "Lowest moneyness",
    sort_by: "moneyness",
    sort_dir: "asc",
  },
  {
    label: "Highest implied volatility",
    sort_by: "impl_volatility",
    sort_dir: "desc",
  },
];

interface Props {
  sortBy?: CoveredCallSortField;
  sortDir?: SortDirection;
  onChange: (sort: {
    sort_by?: CoveredCallSortField;
    sort_dir?: SortDirection;
  }) => void;
}

function getPresetValue(sortBy?: CoveredCallSortField, sortDir?: SortDirection) {
  if (!sortBy) {
    return "";
  }

  return `${sortBy}:${sortDir ?? "desc"}`;
}

export default function SortPresetSelect({
  sortBy,
  sortDir,
  onChange,
}: Props) {
  return (
    <label style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Sort preset</span>

      <select
        value={getPresetValue(sortBy, sortDir)}
        onChange={(event) => {
          const value = event.target.value;

          if (!value) {
            onChange({
              sort_by: undefined,
              sort_dir: undefined,
            });
            return;
          }

          const [nextSortBy, nextSortDir] = value.split(":") as [
            CoveredCallSortField,
            SortDirection,
          ];

          onChange({
            sort_by: nextSortBy,
            sort_dir: nextSortDir,
          });
        }}
      >
        <option value="">Default sorting</option>

        {coveredCallSortPresets.map((preset) => (
          <option
            key={`${preset.sort_by}:${preset.sort_dir}`}
            value={`${preset.sort_by}:${preset.sort_dir}`}
          >
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
}
