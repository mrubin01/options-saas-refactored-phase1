import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import SortPresetSelect from "./SortPresetSelect";

interface Props {
  filters: CoveredCallsDiscoveryFilters;
  onChange: (filters: CoveredCallsDiscoveryFilters) => void;
  sectorOptions: string[];
  industryOptions: string[];
}

type DiscoveryFilterKey = keyof CoveredCallsDiscoveryFilters;

type MetricHelp = {
  label: string;
  description: string;
};

const METRIC_HELP: Record<string, MetricHelp> = {
  expiry_date: {
    label: "Expiry",
    description:
      "The date when the option contract expires. Shorter expirations usually mean faster time decay and less time for the trade to recover.",
  },
  days_to_expiration: {
    label: "DTE",
    description:
      "Days to expiration. Lower DTE means the contract expires sooner; higher DTE gives the position more time.",
  },
  option_yield: {
    label: "Option yield",
    description:
      "Option premium expressed as a percentage yield. Useful for comparing income opportunities across different prices and strikes.",
  },
  roc: {
    label: "ROC",
    description:
      "Return on capital. Compare this with DTE, liquidity, and downside risk before judging an opportunity.",
  },
  tot_return: {
    label: "Total return",
    description:
      "Estimated total return for the opportunity. Useful as a broad comparison metric, but it should not be used alone.",
  },
  premium_per_contract: {
    label: "Premium",
    description:
      "Estimated option premium for one contract. Higher premium can mean more income, but often also more risk.",
  },
  open_interest: {
    label: "Open interest",
    description:
      "Number of outstanding option contracts. Higher open interest can indicate stronger market participation and better liquidity.",
  },
  impl_volatility: {
    label: "Implied volatility",
    description:
      "Market-implied expectation of future price movement. Higher IV often increases premiums but may indicate higher risk.",
  },
  delta: {
    label: "Delta",
    description:
      "Approximate option sensitivity to movement in the underlying price. It can also be used as a rough probability proxy.",
  },
  moneyness: {
    label: "Moneyness",
    description:
      "Relationship between the current price and the strike price. Helps show how close the option is to the money.",
  },
  spread_bid_ask: {
    label: "Bid/ask spread",
    description:
      "Difference between bid and ask. Lower spreads usually indicate better liquidity and lower execution friction.",
  },
  sector: {
    label: "Sector",
    description:
      "Broad market sector of the underlying company. Useful for diversification and avoiding overconcentration.",
  },
  industry: {
    label: "Industry",
    description:
      "More specific industry group of the underlying company.",
  },
};

function toOptionalNumber(value: string) {
  if (value === "") {
    return undefined;
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function FieldLabel({
  label,
  metricKey,
}: {
  label: string;
  metricKey?: keyof typeof METRIC_HELP;
}) {
  const help = metricKey ? METRIC_HELP[metricKey] : undefined;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.85rem",
        fontWeight: 600,
      }}
    >
      {label}
      {help && (
        <span
          title={help.description}
          aria-label={`Explanation for ${help.label}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "1px solid #94a3b8",
            color: "#475569",
            fontSize: 11,
            lineHeight: 1,
            cursor: "help",
          }}
        >
          ?
        </span>
      )}
    </span>
  );
}

function NumberInput({
  label,
  metricKey,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  metricKey?: keyof typeof METRIC_HELP;
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FieldLabel label={label} metricKey={metricKey} />
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
  metricKey,
  value,
  onChange,
}: {
  label: string;
  metricKey?: keyof typeof METRIC_HELP;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FieldLabel label={label} metricKey={metricKey} />
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
  metricKey,
  value,
  options,
  onChange,
}: {
  label: string;
  metricKey?: keyof typeof METRIC_HELP;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FieldLabel label={label} metricKey={metricKey} />
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
            Refine opportunities by expiration, return, liquidity, volatility,
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
          metricKey="expiry_date"
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
          metricKey="expiry_date"
          value={filters.expiry_date_max}
          onChange={(value) => setStringFilter("expiry_date_max", value)}
        />

        <NumberInput
          label="DTE min"
          metricKey="days_to_expiration"
          value={filters.days_to_expiration_min}
          min={0}
          step={1}
          onChange={(value) =>
            setNumberFilter("days_to_expiration_min", value)
          }
        />

        <NumberInput
          label="DTE max"
          metricKey="days_to_expiration"
          value={filters.days_to_expiration_max}
          min={0}
          step={1}
          onChange={(value) =>
            setNumberFilter("days_to_expiration_max", value)
          }
        />

        <NumberInput
          label="Option yield min"
          metricKey="option_yield"
          value={filters.option_yield_min}
          step={0.01}
          onChange={(value) => setNumberFilter("option_yield_min", value)}
        />

        <NumberInput
          label="Option yield max"
          metricKey="option_yield"
          value={filters.option_yield_max}
          step={0.01}
          onChange={(value) => setNumberFilter("option_yield_max", value)}
        />

        <NumberInput
          label="ROC min"
          metricKey="roc"
          value={filters.roc_min}
          step={0.01}
          onChange={(value) => setNumberFilter("roc_min", value)}
        />

        <NumberInput
          label="ROC max"
          metricKey="roc"
          value={filters.roc_max}
          step={0.01}
          onChange={(value) => setNumberFilter("roc_max", value)}
        />

        <NumberInput
          label="Total return min"
          metricKey="tot_return"
          value={filters.tot_return_min}
          step={0.01}
          onChange={(value) => setNumberFilter("tot_return_min", value)}
        />

        <NumberInput
          label="Total return max"
          metricKey="tot_return"
          value={filters.tot_return_max}
          step={0.01}
          onChange={(value) => setNumberFilter("tot_return_max", value)}
        />

        <NumberInput
          label="Premium min"
          metricKey="premium_per_contract"
          value={filters.premium_per_contract_min}
          min={0}
          step={0.01}
          onChange={(value) =>
            setNumberFilter("premium_per_contract_min", value)
          }
        />

        <NumberInput
          label="Premium max"
          metricKey="premium_per_contract"
          value={filters.premium_per_contract_max}
          min={0}
          step={0.01}
          onChange={(value) =>
            setNumberFilter("premium_per_contract_max", value)
          }
        />

        <NumberInput
          label="Open interest min"
          metricKey="open_interest"
          value={filters.open_interest_min}
          min={0}
          step={1}
          onChange={(value) => setNumberFilter("open_interest_min", value)}
        />

        <NumberInput
          label="Open interest max"
          metricKey="open_interest"
          value={filters.open_interest_max}
          min={0}
          step={1}
          onChange={(value) => setNumberFilter("open_interest_max", value)}
        />

        <NumberInput
          label="IV min"
          metricKey="impl_volatility"
          value={filters.impl_volatility_min}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("impl_volatility_min", value)}
        />

        <NumberInput
          label="IV max"
          metricKey="impl_volatility"
          value={filters.impl_volatility_max}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("impl_volatility_max", value)}
        />

        <NumberInput
          label="Delta min"
          metricKey="delta"
          value={filters.delta_min}
          step={0.01}
          onChange={(value) => setNumberFilter("delta_min", value)}
        />

        <NumberInput
          label="Delta max"
          metricKey="delta"
          value={filters.delta_max}
          step={0.01}
          onChange={(value) => setNumberFilter("delta_max", value)}
        />

        <NumberInput
          label="Moneyness min"
          metricKey="moneyness"
          value={filters.moneyness_min}
          step={0.01}
          onChange={(value) => setNumberFilter("moneyness_min", value)}
        />

        <NumberInput
          label="Moneyness max"
          metricKey="moneyness"
          value={filters.moneyness_max}
          step={0.01}
          onChange={(value) => setNumberFilter("moneyness_max", value)}
        />

        <NumberInput
          label="Bid/ask spread max"
          metricKey="spread_bid_ask"
          value={filters.spread_bid_ask_max}
          min={0}
          step={0.01}
          onChange={(value) => setNumberFilter("spread_bid_ask_max", value)}
        />

        <SelectInput
          label="Sector"
          metricKey="sector"
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
          metricKey="industry"
          value={filters.industry}
          options={industryOptions}
          onChange={(value) => setStringFilter("industry", value)}
        />
      </div>
    </section>
  );
}
