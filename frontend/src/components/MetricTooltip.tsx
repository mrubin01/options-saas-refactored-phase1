import type { MetricGlossaryEntry } from "../types/metrics";

type Props = {
  entry?: MetricGlossaryEntry;
  metricKey?: string;
};

export default function MetricTooltip({ entry, metricKey }: Props) {
  if (!entry) {
    return null;
  }

  return (
    <span
      className="relative inline-flex items-center ml-1"
      title={[
        entry.shortDefinition,
        entry.interpretation ? `\n\n${entry.interpretation}` : "",
        entry.caution ? `\n\nCaution: ${entry.caution}` : "",
      ].join("")}
      aria-label={`Explanation for ${entry.label}`}
      data-metric-key={metricKey ?? entry.key}
    >
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-300 text-subtle cursor-help"
        style={{ fontSize: 9 }}
      >
        ?
      </span>
    </span>
  );
}
