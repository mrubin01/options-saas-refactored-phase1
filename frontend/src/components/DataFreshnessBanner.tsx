import { useEffect, useMemo, useState } from "react";

import { fetchDataFreshness } from "../api/dataFreshness";
import type {
  DataFreshness,
  StrategyFreshness,
  StrategyFreshnessKey,
} from "../types/dataFreshness";

type Props = {
  strategyKey?: StrategyFreshnessKey;
};

const STRATEGY_LABELS: Record<StrategyFreshnessKey, string> = {
  covered_calls: "Covered Calls",
  put_options: "Put Options",
  spread_options: "Spread Options",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getAgeInMinutes(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.floor((Date.now() - date.getTime()) / 60_000);
}

function formatAge(minutes: number | null) {
  if (minutes === null) {
    return "unknown age";
  }

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getFreshnessStatus(lastUpdated: string | null) {
  const ageMinutes = getAgeInMinutes(lastUpdated);

  if (ageMinutes === null) {
    return {
      label: "Unknown",
      background: "#f8fafc",
      border: "#cbd5e1",
      text: "#475569",
    };
  }

  if (ageMinutes <= 180) {
    return {
      label: "Fresh",
      background: "#ecfdf5",
      border: "#86efac",
      text: "#166534",
    };
  }

  if (ageMinutes <= 1_440) {
    return {
      label: "Aging",
      background: "#fffbeb",
      border: "#fcd34d",
      text: "#92400e",
    };
  }

  return {
    label: "Stale",
    background: "#fef2f2",
    border: "#fca5a5",
    text: "#991b1b",
  };
}

function FreshnessItem({
  label,
  freshness,
}: {
  label: string;
  freshness: StrategyFreshness;
}) {
  const status = getFreshnessStatus(freshness.last_updated);
  const ageMinutes = getAgeInMinutes(freshness.last_updated);

  return (
    <div
      style={{
        border: `1px solid ${status.border}`,
        borderRadius: "0.65rem",
        padding: "0.75rem",
        background: status.background,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <strong>{label}</strong>

        <span
          style={{
            color: status.text,
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          {status.label}
        </span>
      </div>

      <div style={{ marginTop: "0.35rem", color: "#475569", fontSize: "0.9rem" }}>
        Last updated: {formatDateTime(freshness.last_updated)} (
        {formatAge(ageMinutes)})
      </div>

      <div style={{ marginTop: "0.25rem", color: "#64748b", fontSize: "0.85rem" }}>
        Rows available: {freshness.row_count.toLocaleString()}
      </div>
    </div>
  );
}

export default function DataFreshnessBanner({ strategyKey }: Props) {
  const [data, setData] = useState<DataFreshness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFreshness() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await fetchDataFreshness();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load data freshness",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadFreshness();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    if (strategyKey) {
      return [[strategyKey, data[strategyKey]]] as [
        StrategyFreshnessKey,
        StrategyFreshness,
      ][];
    }

    return Object.entries(data) as [StrategyFreshnessKey, StrategyFreshness][];
  }, [data, strategyKey]);

  if (isLoading) {
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          margin: "1rem 0",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "0.9rem",
        }}
      >
        Checking data freshness…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          border: "1px solid #fecaca",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          margin: "1rem 0",
          background: "#fef2f2",
          color: "#991b1b",
          fontSize: "0.9rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
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
      <div style={{ marginBottom: "0.75rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Data freshness</h2>
        <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
          Check when the scanner data was last ingested before relying on an
          opportunity.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {items.map(([key, freshness]) => (
          <FreshnessItem
            key={key}
            label={STRATEGY_LABELS[key]}
            freshness={freshness}
          />
        ))}
      </div>
    </section>
  );
}
