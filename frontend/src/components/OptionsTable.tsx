import type { OptionRow } from "../types/optionRow";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";

type OptionsTableProps = {
  data: OptionRow[];
  exchangeMap: Record<number, string>;
  strategyType?: WatchlistStrategyType;
  watchlistItems?: WatchlistItem[];
  onAddToWatchlist?: (row: OptionRow) => void;
  onRemoveFromWatchlist?: (itemId: number) => void;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

export default function OptionsTable({
  data,
  exchangeMap,
  strategyType,
  watchlistItems = [],
  onAddToWatchlist,
  onRemoveFromWatchlist,
}: OptionsTableProps) {
  if (data.length === 0) {
    return <p>No results found.</p>;
  }

  function getWatchlistItemForRow(row: OptionRow) {
    if (!strategyType) {
      return null;
    }

    return (
      watchlistItems.find(
        (item) => item.contract === row.contract && item.strategy_type === strategyType
      ) ?? null
    );
  }

  return (
    <table border={1} cellPadding={6} cellSpacing={0}>
      <thead>
        <tr>
          <th>Watchlist</th>
          <th>Ticker</th>
          <th>Contract</th>
          <th>Exchange</th>

          <th>Expiry Date</th>
          <th>DTE</th>
          <th>Current Price</th>

          <th>Strike Price</th>
          <th>Highest Price</th>
          <th>Avg. Price</th>

          <th>Lowest Price</th>
          <th>Coeff Variation %</th>
          <th>Bid per Share ($)</th>

          <th>Premium per Contract ($)</th>
          <th>Option Yield %</th>
          <th>Max Profit ($)</th>

          <th>Max Profit per Contract ($)</th>
          <th>OTM ($)</th>
          <th>Moneyness %</th>

          <th>Sigma Distance</th>
          <th>Break-Even ($)</th>
          <th>ROC %</th>

          <th>Tot Return %</th>
          <th>Delta %</th>
          <th>Spread Bid - Ask</th>

          <th>Open Interest</th>
          <th>Implied Volatility</th>
          <th>Sector</th>

          <th>Industry</th>
          <th>Trend</th>
          <th>Beta</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const savedItem = getWatchlistItemForRow(row);

          return (
            <tr key={row.contract}>
              <td>
                {savedItem ? (
                  <button
                    type="button"
                    onClick={() => onRemoveFromWatchlist?.(savedItem.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddToWatchlist?.(row)}
                  >
                    Watch
                  </button>
                )}
              </td>

              <td>{formatValue(row.ticker)}</td>
              <td>{formatValue(row.contract)}</td>
              <td>{formatValue(exchangeMap[row.exchange] ?? row.exchange)}</td>

              <td>{formatValue(row.expiry_date)}</td>
              <td>{formatValue(row.days_to_expiration)}</td>
              <td>{formatValue(row.current_price)}</td>

              <td>{formatValue(row.strike_price)}</td>
              <td>{formatValue(row.highest_price)}</td>
              <td>{formatValue(row.avg_price)}</td>

              <td>{formatValue(row.lowest_price)}</td>
              <td>{formatValue(row.coeff_variation)}</td>
              <td>{formatValue(row.bid_per_share)}</td>

              <td>{formatValue(row.premium_per_contract)}</td>
              <td>{formatValue(row.option_yield)}</td>
              <td>{formatValue(row.max_profit)}</td>

              <td>{formatValue(row.max_profit_per_contract)}</td>
              <td>{formatValue(row.otm)}</td>
              <td>{formatValue(row.moneyness)}</td>

              <td>{formatValue(row.sigma_distance)}</td>
              <td>{formatValue(row.break_even)}</td>
              <td>{formatValue(row.roc)}</td>

              <td>{formatValue(row.tot_return)}</td>
              <td>{formatValue(row.delta)}</td>
              <td>{formatValue(row.spread_bid_ask)}</td>

              <td>{formatValue(row.open_interest)}</td>
              <td>{formatValue(row.impl_volatility)}</td>
              <td>{formatValue(row.sector)}</td>

              <td>{formatValue(row.industry)}</td>
              <td>{formatValue(row.main_trend)}</td>
              <td>{formatValue(row.beta)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
