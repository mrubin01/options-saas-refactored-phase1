import type { OptionRow } from "../types/optionRow";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";

type OptionsTableProps = {
  data: OptionRow[];
  exchangeMap: Record<number, string>;
  strategyType?: WatchlistStrategyType;
  watchlistItems?: WatchlistItem[];
  pendingWatchlistContracts?: string[];
  onAddToWatchlist?: (row: OptionRow) => void;
  onRemoveFromWatchlist?: (itemId: number, contract: string) => void;
};

type MetricHelp = {
  label: string;
  description: string;
};

const METRIC_HELP: Record<string, MetricHelp> = {
  ticker: {
    label: "Ticker",
    description: "The stock symbol of the underlying security.",
  },
  contract: {
    label: "Contract",
    description: "The option contract identifier.",
  },
  exchange: {
    label: "Exchange",
    description: "The exchange where the underlying security is listed.",
  },
  expiry_date: {
    label: "Expiry Date",
    description: "The date when the option contract expires.",
  },
  days_to_expiration: {
    label: "DTE",
    description:
      "Days to expiration. Lower DTE means the contract expires sooner; higher DTE gives the position more time.",
  },
  current_price: {
    label: "Current Price",
    description: "The latest available price of the underlying stock or ETF.",
  },
  strike_price: {
    label: "Strike Price",
    description:
      "The price at which the option can be exercised. Compare this with current price to understand moneyness.",
  },
  highest_price: {
    label: "Highest Price",
    description: "The highest observed price in the reference lookback period used by the scanner.",
  },
  avg_price: {
    label: "Avg. Price",
    description: "The average observed price in the reference lookback period used by the scanner.",
  },
  lowest_price: {
    label: "Lowest Price",
    description: "The lowest observed price in the reference lookback period used by the scanner.",
  },
  coeff_variation: {
    label: "Coeff Variation %",
    description:
      "Coefficient of variation. A relative measure of price variability. Higher values indicate more variability.",
  },
  bid_per_share: {
    label: "Bid per Share ($)",
    description:
      "The quoted option bid per share. This is often used as a conservative estimate of received premium.",
  },
  premium_per_contract: {
    label: "Premium per Contract ($)",
    description:
      "Estimated option premium for one contract. Higher premium can mean more income, but often also more risk.",
  },
  option_yield: {
    label: "Option Yield %",
    description:
      "Option premium expressed as a percentage yield. Useful for comparing opportunities across different prices.",
  },
  max_profit: {
    label: "Max Profit ($)",
    description: "Estimated maximum profit for the opportunity.",
  },
  max_profit_per_contract: {
    label: "Max Profit per Contract ($)",
    description: "Estimated maximum profit for one option contract.",
  },
  otm: {
    label: "OTM ($)",
    description:
      "Out-of-the-money distance. For income strategies, farther OTM usually means more cushion but lower premium.",
  },
  moneyness: {
    label: "Moneyness %",
    description:
      "Relationship between the current price and the strike price. Helps show how close the option is to the money.",
  },
  sigma_distance: {
    label: "Sigma Distance",
    description:
      "Strike distance expressed in volatility-adjusted terms. Higher values usually mean the strike is farther away relative to volatility.",
  },
  break_even: {
    label: "Break-Even ($)",
    description:
      "Approximate underlying price where the trade breaks even.",
  },
  roc: {
    label: "ROC %",
    description:
      "Return on capital. Compare this with DTE, liquidity, and risk before judging an opportunity.",
  },
  tot_return: {
    label: "Tot Return %",
    description:
      "Estimated total return for the opportunity. Useful as a broad comparison metric.",
  },
  delta: {
    label: "Delta %",
    description:
      "Approximate option sensitivity to movement in the underlying price. It can also be used as a rough probability proxy.",
  },
  spread_bid_ask: {
    label: "Spread Bid - Ask",
    description:
      "Difference between bid and ask. Lower spreads usually indicate better liquidity and lower execution friction.",
  },
  open_interest: {
    label: "Open Interest",
    description:
      "Number of outstanding option contracts. Higher open interest can indicate stronger market participation.",
  },
  impl_volatility: {
    label: "Implied Volatility",
    description:
      "Market-implied expectation of future price movement. Higher IV often increases premiums but may indicate higher risk.",
  },
  sector: {
    label: "Sector",
    description: "Broad market sector of the underlying company.",
  },
  industry: {
    label: "Industry",
    description: "More specific industry group of the underlying company.",
  },
  main_trend: {
    label: "Trend",
    description: "Scanner-derived trend measure for the underlying price.",
  },
  beta: {
    label: "Beta",
    description:
      "Measure of how much the underlying tends to move relative to the broader market.",
  },
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

function HeaderCell({ metricKey }: { metricKey: keyof typeof METRIC_HELP }) {
  const metric = METRIC_HELP[metricKey];

  return (
    <th>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {metric.label}
        <span
          title={metric.description}
          aria-label={`Explanation for ${metric.label}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "1px solid #94a3b8",
            color: "#475569",
            fontSize: 11,
            lineHeight: 1,
            cursor: "help",
          }}
        >
          ?
        </span>
      </span>
    </th>
  );
}

export default function OptionsTable({
  data,
  exchangeMap,
  strategyType,
  watchlistItems = [],
  pendingWatchlistContracts = [],
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
        (item) => item.contract === row.contract && item.strategy_type === strategyType,
      ) ?? null
    );
  }

  function isPending(contract: string) {
    return pendingWatchlistContracts.includes(contract);
  }

  return (
    <table border={1} cellPadding={6} cellSpacing={0}>
      <thead>
        <tr>
          <th>Watchlist</th>
          <HeaderCell metricKey="ticker" />
          <HeaderCell metricKey="contract" />
          <HeaderCell metricKey="exchange" />

          <HeaderCell metricKey="expiry_date" />
          <HeaderCell metricKey="days_to_expiration" />
          <HeaderCell metricKey="current_price" />

          <HeaderCell metricKey="strike_price" />
          <HeaderCell metricKey="highest_price" />
          <HeaderCell metricKey="avg_price" />

          <HeaderCell metricKey="lowest_price" />
          <HeaderCell metricKey="coeff_variation" />
          <HeaderCell metricKey="bid_per_share" />

          <HeaderCell metricKey="premium_per_contract" />
          <HeaderCell metricKey="option_yield" />
          <HeaderCell metricKey="max_profit" />

          <HeaderCell metricKey="max_profit_per_contract" />
          <HeaderCell metricKey="otm" />
          <HeaderCell metricKey="moneyness" />

          <HeaderCell metricKey="sigma_distance" />
          <HeaderCell metricKey="break_even" />
          <HeaderCell metricKey="roc" />

          <HeaderCell metricKey="tot_return" />
          <HeaderCell metricKey="delta" />
          <HeaderCell metricKey="spread_bid_ask" />

          <HeaderCell metricKey="open_interest" />
          <HeaderCell metricKey="impl_volatility" />
          <HeaderCell metricKey="sector" />

          <HeaderCell metricKey="industry" />
          <HeaderCell metricKey="main_trend" />
          <HeaderCell metricKey="beta" />
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const savedItem = getWatchlistItemForRow(row);
          const rowPending = isPending(row.contract);

          return (
            <tr key={row.contract}>
              <td>
                {savedItem ? (
                  <button
                    type="button"
                    disabled={rowPending}
                    onClick={() => onRemoveFromWatchlist?.(savedItem.id, row.contract)}
                  >
                    {rowPending ? "Removing..." : "Remove"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={rowPending}
                    onClick={() => onAddToWatchlist?.(row)}
                  >
                    {rowPending ? "Saving..." : "Add to watchlist"}
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
