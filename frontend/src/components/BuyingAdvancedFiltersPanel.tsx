import { useState } from "react";
import type { LongCallsDiscoveryFilters } from "../types/discovery";
import SortPresetSelect, { longOptionSortPresets } from "./SortPresetSelect";
import { metricGlossary } from "../constants/metricGlossary";

interface Props {
  filters: LongCallsDiscoveryFilters;
  onChange: (filters: LongCallsDiscoveryFilters) => void;
}

type FilterKey = keyof LongCallsDiscoveryFilters;
type MetricKey = keyof typeof metricGlossary;

function getMetricTooltip(metricKey: string) {
  const metric = metricGlossary[metricKey as MetricKey];
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
  const tooltip = metricKey ? getMetricTooltip(metricKey) : undefined;
  return (
    <span className={labelClass}>
      {label}
      {tooltip && (
        <span
          title={tooltip}
          aria-label={`Explanation for ${label}`}
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
  step,
}: {
  label: string;
  metricKey?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col">
      <FieldLabel label={label} metricKey={metricKey} />
      <input
        type="number"
        value={value ?? ""}
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

export default function BuyingAdvancedFiltersPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function setNumberFilter(key: FilterKey, value: number | undefined) {
    onChange({ ...filters, [key]: value, offset: 0 });
  }

  function setStringFilter(key: FilterKey, value: string | undefined) {
    onChange({ ...filters, [key]: value, offset: 0 });
  }

  return (
    <section className="my-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-border/30 transition-colors"
        >
          Advanced filters
          <span className="text-subtle">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <SortPresetSelect
            sortBy={filters.sort_by}
            sortDir={filters.sort_dir}
            presets={longOptionSortPresets}
            onChange={(sort) =>
              onChange({ ...filters, sort_by: sort.sort_by, sort_dir: sort.sort_dir, offset: 0 })
            }
          />
        )}
      </div>

      {open && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="grid grid-cols-4 gap-3">
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
            <NumberInput label="DTE min" metricKey="days_to_expiration" value={filters.days_to_expiration_min} step={1} onChange={(v) => setNumberFilter("days_to_expiration_min", v)} />
            <NumberInput label="DTE max" metricKey="days_to_expiration" value={filters.days_to_expiration_max} step={1} onChange={(v) => setNumberFilter("days_to_expiration_max", v)} />

            <NumberInput label="Profit 5% min" value={filters.profit_5pct_min} step={0.01} onChange={(v) => setNumberFilter("profit_5pct_min", v)} />
            <NumberInput label="Profit 5% max" value={filters.profit_5pct_max} step={0.01} onChange={(v) => setNumberFilter("profit_5pct_max", v)} />
            <NumberInput label="Return 5% min" value={filters.return_5pct_min} step={0.01} onChange={(v) => setNumberFilter("return_5pct_min", v)} />
            <NumberInput label="Return 5% max" value={filters.return_5pct_max} step={0.01} onChange={(v) => setNumberFilter("return_5pct_max", v)} />

            <NumberInput label="Profit 10% min" value={filters.profit_10pct_min} step={0.01} onChange={(v) => setNumberFilter("profit_10pct_min", v)} />
            <NumberInput label="Profit 10% max" value={filters.profit_10pct_max} step={0.01} onChange={(v) => setNumberFilter("profit_10pct_max", v)} />
            <NumberInput label="Return 10% min" value={filters.return_10pct_min} step={0.01} onChange={(v) => setNumberFilter("return_10pct_min", v)} />
            <NumberInput label="Return 10% max" value={filters.return_10pct_max} step={0.01} onChange={(v) => setNumberFilter("return_10pct_max", v)} />

            <NumberInput label="IV min" metricKey="impl_volatility" value={filters.impl_volatility_min} step={0.01} onChange={(v) => setNumberFilter("impl_volatility_min", v)} />
            <NumberInput label="IV max" metricKey="impl_volatility" value={filters.impl_volatility_max} step={0.01} onChange={(v) => setNumberFilter("impl_volatility_max", v)} />
            <NumberInput label="Delta min" metricKey="delta" value={filters.delta_min} step={0.01} onChange={(v) => setNumberFilter("delta_min", v)} />
            <NumberInput label="Delta max" metricKey="delta" value={filters.delta_max} step={0.01} onChange={(v) => setNumberFilter("delta_max", v)} />

            <NumberInput label="Moneyness min" metricKey="moneyness" value={filters.moneyness_min} step={0.01} onChange={(v) => setNumberFilter("moneyness_min", v)} />
            <NumberInput label="Moneyness max" metricKey="moneyness" value={filters.moneyness_max} step={0.01} onChange={(v) => setNumberFilter("moneyness_max", v)} />
          </div>
        </div>
      )}
    </section>
  );
}
