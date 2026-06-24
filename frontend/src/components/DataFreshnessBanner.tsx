import { useEffect, useMemo, useState } from "react";

import { fetchDataFreshness } from "../api/dataFreshness";
import type {
  DataFreshness,
  StrategyFreshness,
  StrategyFreshnessKey,
} from "../types/dataFreshness";
import { cn } from "../lib/utils";

type Props = {
  strategyKey?: StrategyFreshnessKey;
};

const STRATEGY_LABELS: Record<StrategyFreshnessKey, string> = {
  covered_calls: "Covered Calls",
  put_options: "Put Options",
  spread_options: "Spread Options",
};

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getAgeInMinutes(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 60_000);
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

type FreshnessStatus = { label: string; badge: string; card: string; text: string };

function getFreshnessStatus(lastUpdated: string | null): FreshnessStatus {
  const ageMinutes = getAgeInMinutes(lastUpdated);

  if (ageMinutes === null) {
    return {
      label: "Unknown",
      badge: "bg-surface text-muted border border-border",
      card: "bg-surface border-border",
      text: "text-muted",
    };
  }

  if (ageMinutes <= 180) {
    return {
      label: "Fresh",
      badge: "bg-emerald-900/40 text-emerald-300 border border-emerald-700",
      card: "bg-emerald-950/20 border-emerald-800/60",
      text: "text-emerald-300",
    };
  }

  if (ageMinutes <= 1_440) {
    return {
      label: "Aging",
      badge: "bg-amber-900/40 text-amber-300 border border-amber-700",
      card: "bg-amber-950/20 border-amber-800/60",
      text: "text-amber-300",
    };
  }

  return {
    label: "Stale",
    badge: "bg-red-900/40 text-red-300 border border-red-700",
    card: "bg-red-950/20 border-red-800/60",
    text: "text-red-300",
  };
}

function FreshnessItem({ label, freshness }: { label: string; freshness: StrategyFreshness }) {
  const status = getFreshnessStatus(freshness.last_updated);
  const ageMinutes = getAgeInMinutes(freshness.last_updated);

  return (
    <div className={cn("rounded-xl border p-3", status.card)}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", status.badge)}>
          {status.label}
        </span>
      </div>
      <p className="text-xs text-muted">
        Last updated: {formatDateTime(freshness.last_updated)} ({formatAge(ageMinutes)})
      </p>
      <p className="text-xs text-subtle">
        Rows: {freshness.row_count.toLocaleString()}
      </p>
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
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data freshness");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadFreshness();
    return () => { cancelled = true; };
  }, []);

  const items = useMemo(() => {
    if (!data) return [];
    if (strategyKey) {
      return [[strategyKey, data[strategyKey]]] as [StrategyFreshnessKey, StrategyFreshness][];
    }
    return Object.entries(data) as [StrategyFreshnessKey, StrategyFreshness][];
  }, [data, strategyKey]);

  if (isLoading) {
    return (
      <div className="my-4 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-muted">
        Checking data freshness…
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="my-4 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-navy">Data freshness</h2>
        <p className="mt-0.5 text-xs text-muted">
          Check when the scanner data was last ingested before acting on an opportunity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map(([key, freshness]) => (
          <FreshnessItem key={key} label={STRATEGY_LABELS[key]} freshness={freshness} />
        ))}
      </div>
    </section>
  );
}
