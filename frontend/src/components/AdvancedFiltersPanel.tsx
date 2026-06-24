import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import SortPresetSelect from "./SortPresetSelect";
import { metricGlossary } from "../constants/metricGlossary";

interface Props {
  filters: CoveredCallsDiscoveryFilters;
  onChange: (filters: CoveredCallsDiscoveryFilters) => void;
  sectorOptions: string[];
  industryOptions: string[];
}

type DiscoveryFilterKey = keyof CoveredCallsDiscoveryFilters;
type MetricKey = keyof typeof metricGlossary;

function getMetricEntry(metricKey: string) {
  return metricGlossary[metricKey as MetricKey];
}

function getMetricTooltip(metricKey: string) {
  const metric = getMetricEntry(metricKey);
  if (!metric) return undefined;
  return [
    metric.shortDefinition,
    metric.interpretation ? `\n\nHow to read it: ${metric.interpretation}` : "",
    metric.caution ? `\n\nCaution: ${metric.caution}` : "",
  ].join("");
}

function toOptionalNumber(value: string) {
  if (value === "") return undefined;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

const labelClass = "flex items-center gap-1 text-xs font-medium text-muted mb-1";
const inputClass =
  "w-full rounded-md border border-border-dark bg-surface px-2.5 py-1.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20";

function FieldLabel({ label, metricKey }: { label: string; metricKey?: string }) {
  const metric = metricKey ? getMetricEntry(metricKey) : undefined;
  const tooltip = metricKey ? getMetricTooltip(metricKey) : undefined;
  const accessibleLabel = metric?.label ?? label;

  return (
    <span className={labelClass}>
      {label}
      {tooltip && (
        <span
          title={tooltip}
          aria-label={`Explanation for ${accessibleLabel}`}
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border text-subtle cursor-help"
          style={{ fontSize: 9 }}
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
  metricKey?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col">
      <FieldLabel label={label} metricKey={metricKey} />
      <input
        type="number"
        value={value ?? ""}
        min={min}
        step={step}
        onChange={(event) => onChange(toOptionalNumber(event.target.value))}
        className={inputClass}
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
  metricKey?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="flex flex-col">
      <FieldLabel label={label} metricKey={metricKey} />
      <input
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className={inputClass}
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
  metricKey?: string;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="flex flex-col">
      <FieldLabel label={label} metricKey={metricKey} />
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className={inputClass}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
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
  function setNumberFilter(key: DiscoveryFilterKey, value: number | undefined) {
    onChange({ ...filters, [key]: value, offset: 0 });
  }

  function setStringFilter(key: DiscoveryFilterKey, value: string | undefined) {
    onChange({ ...filters, [key]: value, offset: 0 });
  }

  return (
    <section className="my-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-sm font-semibold text-navy">Advanced filters</h2>
          <p className="mt-0.5 text-xs text-muted">
            Refine by expiration, return, liquidity, volatility, and risk.
          </p>
        </div>
        <SortPresetSelect
          sortBy={filters.sort_by}
          sortDir={filters.sort_dir}
          onChange={(sort) =>
            onChange({ ...filters, sort_by: sort.sort_by, sort_dir: sort.sort_dir, offset: 0 })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <DateInput
          label="Expiry from"
          metricKey="expiry_date"
          value={filters.expiry_date_min ?? filters.min_expiry}
          onChange={(value) => onChange({ ...filters, expiry_date_min: value, min_expiry: value, offset: 0 })}
        />
        <DateInput
          label="Expiry to"
          metricKey="expiry_date"
          value={filters.expiry_date_max}
          onChange={(value) => setStringFilter("expiry_date_max", value)}
        />
        <NumberInput label="DTE min" metricKey="days_to_expiration" value={filters.days_to_expiration_min} min={0} step={1} onChange={(v) => setNumberFilter("days_to_expiration_min", v)} />
        <NumberInput label="DTE max" metricKey="days_to_expiration" value={filters.days_to_expiration_max} min={0} step={1} onChange={(v) => setNumberFilter("days_to_expiration_max", v)} />
        <NumberInput label="Yield min" metricKey="option_yield" value={filters.option_yield_min} step={0.01} onChange={(v) => setNumberFilter("option_yield_min", v)} />
        <NumberInput label="Yield max" metricKey="option_yield" value={filters.option_yield_max} step={0.01} onChange={(v) => setNumberFilter("option_yield_max", v)} />
        <NumberInput label="ROC min" metricKey="roc" value={filters.roc_min} step={0.01} onChange={(v) => setNumberFilter("roc_min", v)} />
        <NumberInput label="ROC max" metricKey="roc" value={filters.roc_max} step={0.01} onChange={(v) => setNumberFilter("roc_max", v)} />
        <NumberInput label="Total return min" metricKey="tot_return" value={filters.tot_return_min} step={0.01} onChange={(v) => setNumberFilter("tot_return_min", v)} />
        <NumberInput label="Total return max" metricKey="tot_return" value={filters.tot_return_max} step={0.01} onChange={(v) => setNumberFilter("tot_return_max", v)} />
        <NumberInput label="Premium min" metricKey="premium_per_contract" value={filters.premium_per_contract_min} min={0} step={0.01} onChange={(v) => setNumberFilter("premium_per_contract_min", v)} />
        <NumberInput label="Premium max" metricKey="premium_per_contract" value={filters.premium_per_contract_max} min={0} step={0.01} onChange={(v) => setNumberFilter("premium_per_contract_max", v)} />
        <NumberInput label="OI min" metricKey="open_interest" value={filters.open_interest_min} min={0} step={1} onChange={(v) => setNumberFilter("open_interest_min", v)} />
        <NumberInput label="OI max" metricKey="open_interest" value={filters.open_interest_max} min={0} step={1} onChange={(v) => setNumberFilter("open_interest_max", v)} />
        <NumberInput label="IV min" metricKey="impl_volatility" value={filters.impl_volatility_min} min={0} step={0.01} onChange={(v) => setNumberFilter("impl_volatility_min", v)} />
        <NumberInput label="IV max" metricKey="impl_volatility" value={filters.impl_volatility_max} min={0} step={0.01} onChange={(v) => setNumberFilter("impl_volatility_max", v)} />
        <NumberInput label="Delta min" metricKey="delta" value={filters.delta_min} step={0.01} onChange={(v) => setNumberFilter("delta_min", v)} />
        <NumberInput label="Delta max" metricKey="delta" value={filters.delta_max} step={0.01} onChange={(v) => setNumberFilter("delta_max", v)} />
        <NumberInput label="Moneyness min" metricKey="moneyness" value={filters.moneyness_min} step={0.01} onChange={(v) => setNumberFilter("moneyness_min", v)} />
        <NumberInput label="Moneyness max" metricKey="moneyness" value={filters.moneyness_max} step={0.01} onChange={(v) => setNumberFilter("moneyness_max", v)} />
        <NumberInput label="Spread max" metricKey="spread_bid_ask" value={filters.spread_bid_ask_max} min={0} step={0.01} onChange={(v) => setNumberFilter("spread_bid_ask_max", v)} />
        <SelectInput label="Sector" metricKey="sector" value={filters.sector} options={sectorOptions} onChange={(value) => onChange({ ...filters, sector: value, industry: undefined, offset: 0 })} />
        <SelectInput label="Industry" metricKey="industry" value={filters.industry} options={industryOptions} onChange={(value) => setStringFilter("industry", value)} />
      </div>
    </section>
  );
}
