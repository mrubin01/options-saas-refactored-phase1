import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listSavedScreeners } from "../api/savedScreeners";
import { listWatchlistItems } from "../api/watchlist";
import PageHeader from "../components/PageHeader";
import type { CoveredCallsDiscoveryFilters } from "../types/discovery";
import type { SavedScreener } from "../types/savedScreener";
import type { WatchlistItem } from "../types/watchlistItem";
import { coveredCallsFiltersToSearchParams } from "../utils/queryParams";
import { strategyLabelMap, strategyPathMap } from "../utils/strategyLabels";
import IngestionStatusBanner from "../components/IngestionStatusBanner";

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function DashboardCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs font-medium text-muted mb-1.5">{title}</div>
      <div className="text-3xl font-bold text-navy">{value}</div>
      {subtitle && (
        <div className="mt-1.5 text-xs text-subtle">{subtitle}</div>
      )}
    </div>
  );
}

function getSavedScreenerPath(item: SavedScreener) {
  if (item.strategy_type !== "covered_calls") {
    return strategyPathMap[item.strategy_type];
  }

  const filters =
    (item.config_json?.filters as CoveredCallsDiscoveryFilters | undefined) ??
    {};

  const sort = item.config_json?.sort;

  const normalizedFilters: CoveredCallsDiscoveryFilters = {
    ...filters,
    sort_by: filters.sort_by ?? sort?.sort_by,
    sort_dir: filters.sort_dir ?? sort?.sort_dir,
  } as CoveredCallsDiscoveryFilters;

  const searchParams = coveredCallsFiltersToSearchParams(normalizedFilters);
  const queryString = searchParams.toString();

  return queryString ? `/covered-calls?${queryString}` : "/covered-calls";
}

export default function DashboardPage() {
  const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const [screeners, watchlist] = await Promise.all([
          listSavedScreeners(),
          listWatchlistItems(),
        ]);

        setSavedScreeners(screeners);
        setWatchlistItems(watchlist);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const screenerCounts = useMemo(() => {
    return {
      total: savedScreeners.length,
      covered_calls: savedScreeners.filter(
        (item) => item.strategy_type === "covered_calls",
      ).length,
      put_options: savedScreeners.filter(
        (item) => item.strategy_type === "put_options",
      ).length,
      spread_options: savedScreeners.filter(
        (item) => item.strategy_type === "spread_options",
      ).length,
    };
  }, [savedScreeners]);

  const watchlistCounts = useMemo(() => {
    return {
      total: watchlistItems.length,
      covered_calls: watchlistItems.filter(
        (item) => item.strategy_type === "covered_calls",
      ).length,
      put_options: watchlistItems.filter(
        (item) => item.strategy_type === "put_options",
      ).length,
      spread_options: watchlistItems.filter(
        (item) => item.strategy_type === "spread_options",
      ).length,
    };
  }, [watchlistItems]);

  const recentScreeners = useMemo(
    () => savedScreeners.slice(0, 5),
    [savedScreeners],
  );

  const recentWatchlist = useMemo(
    () => watchlistItems.slice(0, 5),
    [watchlistItems],
  );

  return (
    <div>
      <PageHeader title="Dashboard" />

      <IngestionStatusBanner />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted">Loading dashboard…</div>
      ) : (
        <>
          <p className="mb-5 text-sm text-muted">
            You have{" "}
            <span className="font-medium text-navy">{screenerCounts.total}</span> saved screener
            {screenerCounts.total === 1 ? "" : "s"} and{" "}
            <span className="font-medium text-navy">{watchlistCounts.total}</span> watchlist item
            {watchlistCounts.total === 1 ? "" : "s"}.
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DashboardCard
              title="Saved Screeners"
              value={screenerCounts.total}
              subtitle="Your saved filter setups"
            />
            <DashboardCard
              title="Watchlist Items"
              value={watchlistCounts.total}
              subtitle="Tracked option opportunities"
            />
            <DashboardCard
              title="Covered Calls Screeners"
              value={screenerCounts.covered_calls}
            />
            <DashboardCard
              title="Put Options Screeners"
              value={screenerCounts.put_options}
            />
            <DashboardCard
              title="Spread Options Screeners"
              value={screenerCounts.spread_options}
            />
            <DashboardCard
              title="Covered Calls Watchlist"
              value={watchlistCounts.covered_calls}
            />
            <DashboardCard
              title="Put Options Watchlist"
              value={watchlistCounts.put_options}
            />
            <DashboardCard
              title="Spread Options Watchlist"
              value={watchlistCounts.spread_options}
            />
          </div>

          <div className="mb-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-navy">Recent Saved Screeners</h2>
                <Link to="/covered-calls" className="text-xs font-medium text-primary hover:underline">
                  Open strategies
                </Link>
              </div>

              {recentScreeners.length === 0 ? (
                <p className="text-sm text-muted">
                  You have not saved any screeners yet. Start from one of the strategy pages.
                </p>
              ) : (
                <div className="grid gap-2.5">
                  {recentScreeners.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-bg p-3">
                      <div className="font-medium text-navy text-sm">{item.name}</div>
                      <div className="mt-0.5 text-xs text-muted">{strategyLabelMap[item.strategy_type]}</div>
                      <div className="mt-1 text-xs text-subtle">Updated {formatDateTime(item.updated_at)}</div>
                      <Link
                        to={getSavedScreenerPath(item)}
                        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Open screener →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-navy">Recent Watchlist Items</h2>
                <Link to="/watchlist" className="text-xs font-medium text-primary hover:underline">
                  Open watchlist
                </Link>
              </div>

              {recentWatchlist.length === 0 ? (
                <p className="text-sm text-muted">
                  Your watchlist is empty. Add opportunities from Covered Calls, Put Options, or Spread Options.
                </p>
              ) : (
                <div className="grid gap-2.5">
                  {recentWatchlist.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-bg p-3">
                      <div className="font-medium text-navy text-sm">
                        {item.ticker} — {item.contract}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">{strategyLabelMap[item.strategy_type]}</div>
                      <div className="mt-1 text-xs text-subtle">Added {formatDateTime(item.created_at)}</div>
                      <Link
                        to={strategyPathMap[item.strategy_type]}
                        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Open strategy →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-base font-semibold text-navy">Quick Links</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { to: "/covered-calls", label: "Covered Calls" },
                { to: "/put-options", label: "Put Options" },
                { to: "/spread-options", label: "Spread Options" },
                { to: "/watchlist", label: "Watchlist" },
                { to: "/glossary", label: "Glossary" },
                { to: "/account", label: "Account" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm font-medium text-navy hover:bg-border transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
