export type StrategyType =
  | "covered_calls"
  | "put_options"
  | "spread_options";

export type MetricImportance = "core" | "supporting" | "advanced";

export type MetricGlossaryEntry = {
  key: string;
  label: string;
  shortDefinition: string;
  interpretation?: string;
  caution?: string;
  appliesTo: StrategyType[];
  importance: MetricImportance;
};
