import { useEffect, useMemo, useState } from "react";

import { deleteWatchlistItem, listWatchlistItems } from "../api/watchlist";
import { useExchanges } from "../api/hooks/useExchanges";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";
import PageHeader from "../components/PageHeader";


const strategyOptions: Array<{ value: "all" | WatchlistStrategyType; label: string }> = [
  { value: "all", label: "All" },
  { value: "covered_calls", label: "Covered Calls" },
  { value: "put_options", label: "Put Options" },
  { value: "spread_options", label: "Spread Options" },
];

const strategyLabelMap: Record<WatchlistStrategyType, string> = {
  covered_calls: "Covered Calls",
  put_options: "Put Options",
  spread_options: "Spread Options",
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function WatchlistPage() {
  const { data: exchanges = [] } = useExchanges();
  const exchangeMap: Record<number, string> = Object.fromEntries(exchanges.map((e) => [e.id, e.name]));

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingItemIds, setPendingItemIds] = useState<number[]>([]);
  const [filterStrategy, setFilterStrategy] = useState<"all" | WatchlistStrategyType>("all");

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await listWatchlistItems();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load watchlist");
      } finally {
        setIsLoading(false);
      }
    }

    void loadWatchlist();
  }, []);

  async function handleRemove(itemId: number) {
    try {
      setError(null);
      setSuccess(null);
      setPendingItemIds((prev) => [...prev, itemId]);

      await deleteWatchlistItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setSuccess("Removed item from watchlist.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove watchlist item");
    } finally {
      setPendingItemIds((prev) => prev.filter((id) => id !== itemId));
    }
  }

  const filteredItems = useMemo(() => {
    if (filterStrategy === "all") {
      return items;
    }

    return items.filter((item) => item.strategy_type === filterStrategy);
  }, [items, filterStrategy]);

  function isPending(itemId: number) {
    return pendingItemIds.includes(itemId);
  }

  return (
    <div>
      <PageHeader title="Watchlist" />

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Strategy</label>
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value as "all" | WatchlistStrategyType)}
            className="rounded-md border border-border-dark bg-white px-3 py-2 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {strategyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-muted mt-4">
          {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} shown
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted">Loading watchlist…</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted">
          Your watchlist is empty. Add opportunities from Covered Calls, Put Options, or Spread Options.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-bg">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Strategy</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Ticker</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Contract</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Exchange</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Added At</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-bg/80 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-bg/40"}`}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted text-xs">
                    {strategyLabelMap[item.strategy_type]}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-navy whitespace-nowrap">
                    {item.ticker}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted whitespace-nowrap">
                    {item.contract}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {exchangeMap[item.exchange] ?? item.exchange}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted text-xs">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isPending(item.id)}
                      onClick={() => void handleRemove(item.id)}
                      className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      {isPending(item.id) ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
