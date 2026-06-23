import { useEffect, useMemo, useState } from "react";

import { fetchIngestionStatus } from "../api/ingestionStatus";
import type {
  IngestionStatus,
  IngestionStatusValue,
  StrategyIngestionStatus,
  StrategyIngestionStatusKey,
} from "../types/ingestionStatus";
import { cn } from "../lib/utils";

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

const STATUS_BADGE: Record<IngestionStatusValue, string> = {
  fresh: "bg-green-100 text-green-800 border border-green-200",
  aging: "bg-amber-100 text-amber-800 border border-amber-200",
  stale: "bg-red-100 text-red-800 border border-red-200",
  empty: "bg-slate-100 text-slate-600 border border-slate-200",
  unknown: "bg-slate-100 text-slate-600 border border-slate-200",
};

const STATUS_CARD: Record<IngestionStatusValue, string> = {
  fresh: "bg-green-50 border-green-200",
  aging: "bg-amber-50 border-amber-200",
  stale: "bg-red-50 border-red-200",
  empty: "bg-slate-50 border-slate-200",
  unknown: "bg-slate-50 border-slate-200",
};

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatAge(minutes: number | null) {
  if (minutes === null) return "unknown age";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatThresholds(data: IngestionStatus) {
  const freshHours = Math.round(data.thresholds.fresh_minutes / 60);
  const agingHours = Math.round(data.thresholds.aging_minutes / 60);
  return `Fresh ≤ ${freshHours}h · Aging ≤ ${agingHours}h · Stale after that`;
}

function StatusBadge({ status }: { status: IngestionStatusValue }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_BADGE[status])}>
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
  return (
    <div className={cn("rounded-xl border p-3", STATUS_CARD[status.status])}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <StatusBadge status={status.status} />
      </div>
      <p className="text-xs text-muted">
        Last updated: {formatDateTime(status.last_updated)} ({formatAge(status.age_minutes)})
      </p>
      <p className="text-xs text-subtle">
        Rows: {status.row_count.toLocaleString()}
      </p>
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
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load ingestion status");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadIngestionStatus();
    return () => { cancelled = true; };
  }, []);

  const strategyEntries = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.strategies) as [StrategyIngestionStatusKey, StrategyIngestionStatus][];
  }, [data]);

  if (isLoading) {
    return (
      <div className="my-4 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-muted">
        Checking ingestion status…
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="my-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <h2 className="text-sm font-semibold text-navy">Ingestion status</h2>
          <p className="mt-0.5 text-xs text-muted">
            {formatThresholds(data)}
          </p>
        </div>
        <StatusBadge status={data.overall_status} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {strategyEntries.map(([key, status]) => (
          <StrategyStatusItem key={key} label={STRATEGY_LABELS[key]} status={status} />
        ))}
      </div>
    </section>
  );
}
