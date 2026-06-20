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
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 4,
      }}
      title={[
        entry.shortDefinition,
        entry.interpretation ? `\n\n${entry.interpretation}` : "",
        entry.caution ? `\n\nCaution: ${entry.caution}` : "",
      ].join("")}
      aria-label={`Explanation for ${entry.label}`}
      data-metric-key={metricKey ?? entry.key}
    >
      <span
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
    </span>
  );
}
