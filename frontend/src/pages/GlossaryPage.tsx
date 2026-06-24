import PageHeader from "../components/PageHeader";
import { getMetricGlossaryEntry } from "../constants/metricGlossary";
import type { OptionContractField } from "../constants/optionContractFields";
import type { StrategyType } from "../types/metrics";

type GlossaryGroup = {
  title: string;
  description: string;
  metricKeys: OptionContractField[];
};

const GROUPS: GlossaryGroup[] = [
  {
    title: "Core contract metrics",
    description: "Basic fields that identify the option and underlying asset.",
    metricKeys: [
      "ticker",
      "contract",
      "exchange",
      "expiry_date",
      "days_to_expiration",
      "current_price",
      "strike_price",
    ],
  },
  {
    title: "Return metrics",
    description: "Metrics used to compare income, return, and payoff potential.",
    metricKeys: [
      "bid_per_share",
      "premium_per_contract",
      "option_yield",
      "roc",
      "tot_return",
      "max_profit",
      "max_profit_per_contract",
      "break_even",
    ],
  },
  {
    title: "Risk and distance metrics",
    description:
      "Metrics that help estimate how close the trade is to the strike and how sensitive it may be.",
    metricKeys: [
      "otm",
      "moneyness",
      "sigma_distance",
      "delta",
      "impl_volatility",
      "coeff_variation",
      "beta",
    ],
  },
  {
    title: "Liquidity metrics",
    description: "Metrics that help judge whether an option may be easier or harder to trade.",
    metricKeys: ["open_interest", "spread_bid_ask"],
  },
  {
    title: "Price history and profile",
    description: "Underlying stock or ETF context used by the scanner.",
    metricKeys: [
      "highest_price",
      "avg_price",
      "lowest_price",
      "sector",
      "industry",
      "main_trend",
    ],
  },
];

function getMetric(key: OptionContractField) {
  return getMetricGlossaryEntry(key);
}

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Metric Glossary" />

      <p className="mb-6 text-sm leading-relaxed text-muted">
        This glossary explains the main metrics used across Covered Calls, Put Options, and Spread
        Options. Use it as a reference when reading tables, filters, saved screeners, and watchlist
        items.
      </p>

      <div className="grid gap-4">
        {GROUPS.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-navy mb-0.5">{group.title}</h2>
            <p className="mb-4 text-xs text-muted leading-relaxed">{group.description}</p>

            <div className="grid gap-3">
              {group.metricKeys.map((key) => {
                const metric = getMetric(key);
                if (!metric) return null;

                return (
                  <article key={metric.key} className="rounded-lg border border-border bg-bg p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-navy">{metric.label}</h3>
                      <code className="rounded-full bg-border px-2 py-0.5 text-xs text-muted font-mono">
                        {metric.key}
                      </code>
                    </div>

                    <p className="text-sm text-text leading-relaxed">{metric.shortDefinition}</p>

                    {metric.interpretation && (
                      <p className="mt-2 text-sm text-muted leading-relaxed">
                        <span className="font-medium text-navy">How to read it:</span>{" "}
                        {metric.interpretation}
                      </p>
                    )}

                    {metric.caution && (
                      <p className="mt-2 text-sm leading-relaxed text-amber-800">
                        <span className="font-medium">Caution:</span> {metric.caution}
                      </p>
                    )}

                    {metric.appliesTo && metric.appliesTo.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {metric.appliesTo.map((strategy: StrategyType) => (
                          <span
                            key={strategy}
                            className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted"
                          >
                            {strategy.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
