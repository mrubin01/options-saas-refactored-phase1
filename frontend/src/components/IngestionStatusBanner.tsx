import { useEffect, useMemo, useState } from "react";

import { fetchIngestionStatus } from "../api/ingestionStatus";
import type {
  IngestionStatus,
  IngestionStatusValue,
  StrategyIngestionStatus,
  StrategyIngestionStatusKey,
} from "../types/ingestionStatus";

const STRATEGY_LABELS: Record<StrategyIngestionStatusKey, string> = {
  covered_calls: "Covered Calls",
  put_options: "Put Options",
  spread_options: "Spread Options",
};

const STATUS_LABELS: Record<IngestionStatusValue, string> = {
  fresh: "Fresh",
  aging: "Aging",
  stale: "Stale",
  empty: "Empty",
  unknown: "Unknown",
};

const STATUS_STYLES: Record<
  IngestionStatusValue,
  {
    background: string;
    border: string;
    text: string;
  }
> = {
  fresh: {
    background: "#ecfdf5",
    border: "#86efac",
    text: "#166534",
  },
  aging: {
    background: "#fffbeb",
    border: "#fcd34d",
    text: "#92400e",
  },
  stale: {
    background: "#fef2f2",
    border: "#fca5a5",
    text: "#991b1b",
  },
  empty: {
    background: "#f8fafc",
    border: "#cbd5e1",
    text: "#475569",
  },
  unknown: {
    background: "#f8fafc",
    border: "#cbd5e1",
    text: "#475569",
  },
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

function formatThresholds(data: IngestionStatus) {
  const freshHours = Math.round(data.thresholds.fresh_minutes / 60);
  const agingHours = Math.round(data.thresholds.aging_minutes / 60);

  return `Fresh ≤ ${freshHours}h, aging ≤ ${agingHours}h, stale after that.`;
}

function StatusBadge({ status }: { status: IngestionStatusValue }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      style={{
        color: style.text,
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: "999px",
        padding: "0.15rem 0.55rem",
        fontSize: "0.8rem",
        fontWeight: 700,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function StrategyStatusItem({
  label,
  status,
}: {
  label: string;
  status: StrategyIngestionStatus;
}) {
  const style = STATUS_STYLES[status.status];

  return (
    <div
      style={{
        border: `1px solid ${style.border}`,
        borderRadius: "0.65rem",
        padding: "0.75rem",
        background: style.background,
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
        <StatusBadge status={status.status} />
      </div>

      <div style={{ marginTop: "0.35rem", color: "#475569", fontSize: "0.9rem" }}>
        Last updated: {formatDateTime(status.last_updated)} (
        {formatAge(status.age_minutes)})
      </div>

      <div style={{ marginTop: "0.25rem", color: "#64748b", fontSize: "0.85rem" }}>
        Rows available: {status.row_count.toLocaleString()}
      </div>
    </div>
  );
}

export default function IngestionStatusBanner() {
  const [data, setData] = useState<IngestionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadIngestionStatus() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await fetchIngestionStatus();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load ingestion status",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadIngestionStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const strategyEntries = useMemo(() => {
    if (!data) {
      return [];
    }

    return Object.entries(data.strategies) as [
      StrategyIngestionStatusKey,
      StrategyIngestionStatus,
    ][];
  }, [data]);

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
        Checking ingestion status…
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Ingestion status</h2>
          <p
            style={{
              margin: "0.25rem 0 0",
              color: "#64748b",
              fontSize: "0.9rem",
            }}
          >
            Shows whether the latest scanner ingestion looks healthy across all
            strategy datasets.
          </p>
          <p
            style={{
              margin: "0.25rem 0 0",
              color: "#64748b",
              fontSize: "0.8rem",
            }}
          >
            {formatThresholds(data)}
          </p>
        </div>

        <StatusBadge status={data.overall_status} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {strategyEntries.map(([key, status]) => (
          <StrategyStatusItem
            key={key}
            label={STRATEGY_LABELS[key]}
            status={status}
          />
        ))}
      </div>
    </section>
  );
}
