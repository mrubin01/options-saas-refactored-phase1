import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import SortPresetSelect from "./SortPresetSelect";

interface Props {
  filters: CoveredCallsDiscoveryFilters;
  onChange: (filters: CoveredCallsDiscoveryFilters) => void;
  sectorOptions: string[];
  industryOptions: string[];
}

type DiscoveryFilterKey = keyof CoveredCallsDiscoveryFilters;

function toOptionalNumber(value: string) {
  if (value === "") {
    return undefined;
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        step={step}
        onChange={(event) => onChange(toOptionalNumber(event.target.value))}
      />
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdvancedFiltersPanel({
  filters,
  onChange,
  sectorOptions,
  industryOptions,
}: Props) {
  function setNumberFilter(
    key: DiscoveryFilterKey,
    value: number | undefined,
  ) {
    onChange({
      ...filters,
      [key]: value,
      offset: 0,
    });
  }

  function setStringFilter(
    key: DiscoveryFilterKey,
    value: string | undefined,
  ) {
    onChange({
      ...filters,
      [key]: value,
      offset: 0,
    });
  }

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1rem",
        margin: "1rem 0",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Advanced discovery</h2>
          <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>
            Refine covered calls by expiration, return, liquidity, volatility,
            and risk metrics.
          </p>
        </div>

        <SortPresetSelect
          sortBy={filters.sort_by}
          sortDir={filters.sort_dir}
          onChange={(sort) =>
            onChange({
              ...filters,
              sort_by: sort.sort_by,
              sort_dir: sort.sort_dir,
              offset: 0,
            })
          }
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <DateInput
          label="Expiry from"
          value={filters.expiry_date_min ?? filters.min_expiry}
          onChange={(value) => {
            onChange({
              ...filters,
              expiry_date_min: value,
              min_expiry: value,
              offset: 0,
            });
          }}
        />

        <DateInput
          label="Expiry to"
          value={filters.expiry_date_max}
          onChange={(value) => setStringFilter("expiry_date_max", value)}
        />

        <NumberInput
          label="DTE min"
          value={filters.days_to_expiration_min}
          min={0}
          step={1}
          onChange={(value) =>
            setNumberFilter("days_to_expiration_min", value)
          }
        />

        <NumberInput
          label="DTE max"
          value={filters.days_to_expiration_max}
          min={0}
          step={1}
          onChange={(value) =>
            setNumberFilter("days_to_expiration_max", value)
          }
        />

        <NumberInput
          label="Option yield min"
          value={filters.option_yield_min}
          step={0.01}
          onChange={(value) => setNumberFilter("option_yield_min", value)}
        />

        <NumberInput
          label="Option yield max"
          value={filters.option_yield_max}
          step={0.01}
          onChange={(value) => setNumberFilter("option_yield_max", value)}
        />

        <NumberInput
          label="ROC min"
          value={filters.roc_min}
          step={0.01}
          onChange={(value) => setNumberFilter("roc_min", value)}
        />

        <NumberInput
          label="ROC max"
          value={filters.roc_max}
          step={0.01}
          onChange={(value) => setNumberFilter("roc_max", value)}
        />

        <NumberInput
          label="Total return min"
          value={filters.tot_return_min}
          step={0.01}
          onChange={(value) => setNumberFilter("tot_return_min", value)}
        />

        <NumberInput
          label="Total return max"
          value={filters.tot_return_max}
          step={0.01}
          onChange={(value) => setNumberFilter("tot_return_max", value)}
        />

        <NumberInput
          label="Premium min"
          value={filters.premium_per_contract_min}
          min={0}
          step={0.01}
          onChange={(value) =>
            setNumberFilter("premium_per_contract_min", value)
          }
        />

        <NumberInput
          label="Premium max"
          value={filters.premium_per_contract_max}
          min={0}
          step={0.01}
          onChange={(value) =>
            setNumberFilter("premium_per_contract_max", value)
          }
        />

        <NumberInput
          label="Open interest min"
          value={filters.open_interest_min}
          min={0}
          step={1}
          onChange={(value) => setNumberFilter("open_interest_min", value)}
        />

        <NumberInput
          label="Open interest max"
          value={filters.open_interest_max}
          min={0}
          step={1}
          onChange={(value) => setNumberFilter("open_interest_max", value)}
        />

        <NumberInput
          label="IV min"
          value={filters.impl_volatility_min}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("impl_volatility_min", value)}
        />

        <NumberInput
          label="IV max"
          value={filters.impl_volatility_max}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("impl_volatility_max", value)}
        />

        <NumberInput
          label="Delta min"
          value={filters.delta_min}
          step={0.01}
          onChange={(value) => setNumberFilter("delta_min", value)}
        />

        <NumberInput
          label="Delta max"
          value={filters.delta_max}
          step={0.01}
          onChange={(value) => setNumberFilter("delta_max", value)}
        />

        <NumberInput
          label="Moneyness min"
          value={filters.moneyness_min}
          step={0.01}
          onChange={(value) => setNumberFilter("moneyness_min", value)}
        />

        <NumberInput
          label="Moneyness max"
          value={filters.moneyness_max}
          step={0.01}
          onChange={(value) => setNumberFilter("moneyness_max", value)}
        />

        <NumberInput
          label="Bid/ask spread max"
          value={filters.spread_bid_ask_max}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("spread_bid_ask_max", value)}
        />

        <SelectInput
          label="Sector"
          value={filters.sector}
          options={sectorOptions}
          onChange={(value) => {
            onChange({
              ...filters,
              sector: value,
              industry: undefined,
              offset: 0,
            });
          }}
        />

        <SelectInput
          label="Industry"
          value={filters.industry}
          options={industryOptions}
          onChange={(value) => setStringFilter("industry", value)}
        />
      </div>
    </section>
  );
}
