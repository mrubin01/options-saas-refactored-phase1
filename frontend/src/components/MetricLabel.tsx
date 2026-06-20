import { getMetricGlossaryEntry } from "../constants/metricGlossary";
import MetricTooltip from "./MetricTooltip";

type Props = {
  metricKey: string;
  label?: string;
};

export default function MetricLabel({ metricKey, label }: Props) {
  const entry = getMetricGlossaryEntry(metricKey);

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {label ?? entry?.label ?? metricKey}
      <MetricTooltip entry={entry} metricKey={metricKey} />
    </span>
  );
}
