import PageHeader from "../components/PageHeader";
import { metricGlossary } from "../constants/metricGlossary";

type GlossaryGroup = {
  title: string;
  description: string;
  metricKeys: string[];
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

function getMetric(key: string) {
  return metricGlossary[key];
}

export default function GlossaryPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <PageHeader title="Metric Glossary" />

      <p
        style={{
          color: "#475569",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        This glossary explains the main metrics used across Covered Calls, Put
        Options, and Spread Options. Use it as a reference when reading tables,
        filters, saved screeners, and watchlist items.
      </p>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {GROUPS.map((group) => (
          <section
            key={group.title}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "1rem",
              background: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "0.25rem", fontSize: "1.15rem" }}>
              {group.title}
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "1rem",
                color: "#64748b",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {group.description}
            </p>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              {group.metricKeys.map((key) => {
                const metric = getMetric(key);

                if (!metric) {
                  return null;
                }

                return (
                  <article
                    key={metric.key}
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                        }}
                      >
                        {metric.label}
                      </h3>

                      <code
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          background: "#e2e8f0",
                          borderRadius: "999px",
                          padding: "0.15rem 0.5rem",
                        }}
                      >
                        {metric.key}
                      </code>
                    </div>

                    <p
                      style={{
                        margin: "0.5rem 0 0",
                        color: "#334155",
                        lineHeight: 1.5,
                      }}
                    >
                      {metric.shortDefinition}
                    </p>

                    {metric.interpretation && (
                      <p
                        style={{
                          margin: "0.5rem 0 0",
                          color: "#475569",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>How to read it:</strong> {metric.interpretation}
                      </p>
                    )}

                    {metric.caution && (
                      <p
                        style={{
                          margin: "0.5rem 0 0",
                          color: "#92400e",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Caution:</strong> {metric.caution}
                      </p>
                    )}

                    {metric.appliesTo && metric.appliesTo.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          flexWrap: "wrap",
                          marginTop: "0.65rem",
                        }}
                      >
                        {metric.appliesTo.map((strategy) => (
                          <span
                            key={strategy}
                            style={{
                              fontSize: "0.75rem",
                              color: "#475569",
                              background: "#e2e8f0",
                              borderRadius: "999px",
                              padding: "0.15rem 0.5rem",
                            }}
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
