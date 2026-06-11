import type { OptionRow } from "../types/optionRow";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";
import { metricGlossary } from "../constants/metricGlossary";

type OptionsTableProps = {
  data: OptionRow[];
  exchangeMap: Record<number, string>;
  strategyType?: WatchlistStrategyType;
  watchlistItems?: WatchlistItem[];
  pendingWatchlistContracts?: string[];
  onAddToWatchlist?: (row: OptionRow) => void;
  onRemoveFromWatchlist?: (itemId: number, contract: string) => void;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

const HEADER_LABELS: Record<string, string> = {
  ticker: "Ticker",
  contract: "Contract",
  exchange: "Exchange",
  expiry_date: "Expiry Date",
  days_to_expiration: "DTE",
  current_price: "Current Price",
  strike_price: "Strike Price",
  highest_price: "Highest Price",
  avg_price: "Avg. Price",
  lowest_price: "Lowest Price",
  coeff_variation: "Coeff Variation %",
  bid_per_share: "Bid per Share ($)",
  premium_per_contract: "Premium per Contract ($)",
  option_yield: "Option Yield %",
  max_profit: "Max Profit ($)",
  max_profit_per_contract: "Max Profit per Contract ($)",
  otm: "OTM ($)",
  moneyness: "Moneyness %",
  sigma_distance: "Sigma Distance",
  break_even: "Break-Even ($)",
  roc: "ROC %",
  tot_return: "Tot Return %",
  delta: "Delta %",
  spread_bid_ask: "Spread Bid - Ask",
  open_interest: "Open Interest",
  impl_volatility: "Implied Volatility",
  sector: "Sector",
  industry: "Industry",
  main_trend: "Trend",
  beta: "Beta",
};

type MetricKey = keyof typeof metricGlossary;

function getMetricEntry(metricKey: string) {
  return metricGlossary[metricKey as MetricKey];
}

function getMetricTooltip(metricKey: string) {
  const metric = getMetricEntry(metricKey);

  if (!metric) {
    return undefined;
  }

  return [
    metric.shortDefinition,
    metric.interpretation ? `\n\nHow to read it: ${metric.interpretation}` : "",
    metric.caution ? `\n\nCaution: ${metric.caution}` : "",
  ].join("");
}

function HeaderCell({ metricKey }: { metricKey: string }) {
  const metric = getMetricEntry(metricKey);
  const label = HEADER_LABELS[metricKey] ?? metric?.label ?? metricKey;
  const tooltip = getMetricTooltip(metricKey);

  return (
    <th>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {tooltip && (
          <span
            title={tooltip}
            aria-label={`Explanation for ${label}`}
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
        )}
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
