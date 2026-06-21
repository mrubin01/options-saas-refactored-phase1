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
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader title="Watchlist" />

      <div className="mb-4 flex items-center gap-4">
        <div>
          <label className="mr-2 text-sm font-medium">Strategy:</label>
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value as "all" | WatchlistStrategyType)}
            className="border rounded px-3 py-2 text-sm"
          >
            {strategyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} shown
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500 py-3">Loading watchlist…</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-sm text-gray-500 py-3">
          Your watchlist is empty. Add opportunities from Covered Calls, Put Options, or Spread Options.
        </div>
      ) : (
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Ticker</th>
              <th>Contract</th>
              <th>Exchange</th>
              <th>Added At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{strategyLabelMap[item.strategy_type]}</td>
                <td>{item.ticker}</td>
                <td>{item.contract}</td>
                <td>{exchangeMap[item.exchange] ?? item.exchange}</td>
                <td>{formatDateTime(item.created_at)}</td>
                <td>
                  <button
                    type="button"
                    disabled={isPending(item.id)}
                    onClick={() => void handleRemove(item.id)}
                  >
                    {isPending(item.id) ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
