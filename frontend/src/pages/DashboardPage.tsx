import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listSavedScreeners } from "../api/savedScreeners";
import { listWatchlistItems } from "../api/watchlist";
import DataFreshnessBanner from "../components/DataFreshnessBanner";
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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: "#777", marginTop: 6 }}>
          {subtitle}
        </div>
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
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader title="Dashboard" />

      <IngestionStatusBanner />

      {error && <div className="text-sm text-red-600 py-2">{error}</div>}

      {isLoading ? (
        <div className="text-sm text-gray-500 py-3">Loading dashboard…</div>
      ) : (
        <>
          <div className="text-sm text-gray-600" style={{ marginBottom: 20 }}>
            You currently have {screenerCounts.total} saved screener
            {screenerCounts.total === 1 ? "" : "s"} and{" "}
            {watchlistCounts.total} watchlist item
            {watchlistCounts.total === 1 ? "" : "s"}.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  Recent Saved Screeners
                </h2>
                <Link to="/covered-calls">Open strategies</Link>
              </div>

              {recentScreeners.length === 0 ? (
                <div className="text-sm text-gray-500">
                  You have not saved any screeners yet. Start from one of the
                  strategy pages.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {recentScreeners.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {strategyLabelMap[item.strategy_type]}
                      </div>
                      <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                        Updated {formatDateTime(item.updated_at)}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Link to={getSavedScreenerPath(item)}>
                          Open screener
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  Recent Watchlist Items
                </h2>
                <Link to="/watchlist">Open watchlist</Link>
              </div>

              {recentWatchlist.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Your watchlist is empty. Add opportunities from Covered Calls,
                  Put Options, or Spread Options.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {recentWatchlist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 6,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {item.ticker} — {item.contract}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {strategyLabelMap[item.strategy_type]}
                      </div>
                      <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                        Added {formatDateTime(item.created_at)}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Link to={strategyPathMap[item.strategy_type]}>
                          Open strategy
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Quick Links</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link to="/covered-calls">Covered Calls</Link>
              <Link to="/put-options">Put Options</Link>
              <Link to="/spread-options">Spread Options</Link>
              <Link to="/watchlist">Watchlist</Link>
              <Link to="/glossary">Glossary</Link>
              <Link to="/account">Account</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
