import { useEffect, useMemo, useState } from "react";

import { deleteWatchlistItem, listWatchlistItems } from "../api/watchlist";
import { EXCHANGES } from "../constants/exchanges";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";
import PageHeader from "../components/PageHeader";

const exchangeMap: Record<number, string> = Object.fromEntries(
  EXCHANGES.map((e) => [e.id, e.name])
);

const strategyOptions: Array<{ value: "all" | WatchlistStrategyType; label: string }> = [
  { value: "all", label: "All" },
  { value: "covered_calls", label: "Covered Calls" },
  { value: "put_options", label: "Put Options" },
  { value: "spread_options", label: "Spread Options" },
];

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      await deleteWatchlistItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove watchlist item");
    }
  }

  const filteredItems = useMemo(() => {
    if (filterStrategy === "all") {
      return items;
    }

    return items.filter((item) => item.strategy_type === filterStrategy);
  }, [items, filterStrategy]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader title="Watchlist" />

      <div className="mb-4">
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

      {error && <div className="text-sm text-red-600 py-2">{error}</div>}

      {isLoading ? (
        <div className="text-sm text-gray-500 py-3">Loading watchlist…</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-sm text-gray-500 py-3">No watchlist items yet.</div>
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
                <td>{item.strategy_type}</td>
                <td>{item.ticker}</td>
                <td>{item.contract}</td>
                <td>{exchangeMap[item.exchange] ?? item.exchange}</td>
                <td>{formatDateTime(item.created_at)}</td>
                <td>
                  <button type="button" onClick={() => void handleRemove(item.id)}>
                    Remove
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
