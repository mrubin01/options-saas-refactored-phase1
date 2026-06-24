import type { OptionRow } from "../types/optionRow";
import type { WatchlistItem, WatchlistStrategyType } from "../types/watchlistItem";
import { metricGlossary } from "../constants/metricGlossary";
import { cn } from "../lib/utils";

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
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

const RETURN_COLS = new Set([
  "option_yield", "roc", "tot_return",
  "max_profit", "max_profit_per_contract",
  "premium_per_contract", "bid_per_share",
]);

function getValueColorClass(colKey: string, value: string | number | null | undefined): string {
  if (!RETURN_COLS.has(colKey) || value === null || value === undefined || value === "") return "";
  const num = parseFloat(String(value));
  if (isNaN(num)) return "";
  return num > 0 ? "text-emerald-400" : num < 0 ? "text-red-400" : "";
}

const HEADER_LABELS: Record<string, string> = {
  ticker: "Ticker",
  contract: "Contract",
  exchange: "Exchange",
  expiry_date: "Expiry",
  days_to_expiration: "DTE",
  current_price: "Price",
  strike_price: "Strike",
  highest_price: "High",
  avg_price: "Avg",
  lowest_price: "Low",
  coeff_variation: "CV%",
  bid_per_share: "Bid/Share",
  premium_per_contract: "Premium",
  option_yield: "Yield%",
  max_profit: "Max Profit",
  max_profit_per_contract: "Max P/C",
  otm: "OTM",
  moneyness: "Moneyness%",
  sigma_distance: "Sigma Dist",
  break_even: "Break-Even",
  roc: "ROC%",
  tot_return: "Tot Return%",
  delta: "Delta%",
  spread_bid_ask: "Spread",
  open_interest: "OI",
  impl_volatility: "IV",
  sector: "Sector",
  industry: "Industry",
  main_trend: "Trend",
  beta: "Beta",
};

type MetricKey = keyof typeof metricGlossary;

function getMetricTooltip(metricKey: string) {
  const metric = metricGlossary[metricKey as MetricKey];
  if (!metric) return undefined;
  return [
    metric.shortDefinition,
    metric.interpretation ? `\n\nHow to read it: ${metric.interpretation}` : "",
    metric.caution ? `\n\nCaution: ${metric.caution}` : "",
  ].join("");
}

function HeaderCell({ metricKey }: { metricKey: string }) {
  const label = HEADER_LABELS[metricKey] ?? metricKey;
  const tooltip = getMetricTooltip(metricKey);

  return (
    <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">
      <span className="inline-flex items-center gap-1">
        {label}
        {tooltip && (
          <span
            title={tooltip}
            aria-label={`Explanation for ${label}`}
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border text-subtle cursor-help shrink-0"
            style={{ fontSize: 9 }}
          >
            ?
          </span>
        )}
      </span>
    </th>
  );
}

const COLUMNS: string[] = [
  "ticker", "contract", "exchange", "expiry_date", "days_to_expiration", "current_price",
  "strike_price", "highest_price", "avg_price", "lowest_price", "coeff_variation",
  "bid_per_share", "premium_per_contract", "option_yield", "max_profit", "max_profit_per_contract",
  "otm", "moneyness", "sigma_distance", "break_even", "roc", "tot_return", "delta",
  "spread_bid_ask", "open_interest", "impl_volatility", "sector", "industry", "main_trend", "beta",
];

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
    return <p className="py-10 text-center text-sm text-muted">No results found.</p>;
  }

  function getWatchlistItemForRow(row: OptionRow) {
    if (!strategyType) return null;
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
    <div className="overflow-x-auto overflow-y-auto rounded-xl border border-border shadow-sm max-h-[calc(100vh-14rem)]">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-surface">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted whitespace-nowrap">
              Watchlist
            </th>
            {COLUMNS.map((col) => (
              <HeaderCell key={col} metricKey={col} />
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const savedItem = getWatchlistItemForRow(row);
            const rowPending = isPending(row.contract);

            return (
              <tr
                key={row.contract}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-border/30 transition-colors",
                  idx % 2 === 0 ? "bg-surface" : "",
                )}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  {savedItem ? (
                    <button
                      type="button"
                      disabled={rowPending}
                      onClick={() => onRemoveFromWatchlist?.(savedItem.id, row.contract)}
                      className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      {rowPending ? "…" : "Remove"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={rowPending}
                      onClick={() => onAddToWatchlist?.(row)}
                      className="rounded border border-border bg-surface px-2 py-0.5 text-xs font-medium text-navy hover:bg-border/40 disabled:opacity-50 transition-colors"
                    >
                      {rowPending ? "…" : "+ Watch"}
                    </button>
                  )}
                </td>

                <td className="px-3 py-2 font-bold text-primary whitespace-nowrap">
                  {formatValue(row.ticker)}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted whitespace-nowrap">
                  {formatValue(row.contract)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(exchangeMap[row.exchange] ?? row.exchange)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.expiry_date)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.days_to_expiration)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.current_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.strike_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.highest_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.avg_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.lowest_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.coeff_variation)}</td>
                <td className={cn("px-3 py-2 font-medium whitespace-nowrap", getValueColorClass("bid_per_share", row.bid_per_share))}>{formatValue(row.bid_per_share)}</td>
                <td className={cn("px-3 py-2 font-medium whitespace-nowrap", getValueColorClass("premium_per_contract", row.premium_per_contract))}>{formatValue(row.premium_per_contract)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("option_yield", row.option_yield))}>{formatValue(row.option_yield)}</td>
                <td className={cn("px-3 py-2 font-medium whitespace-nowrap", getValueColorClass("max_profit", row.max_profit))}>{formatValue(row.max_profit)}</td>
                <td className={cn("px-3 py-2 font-medium whitespace-nowrap", getValueColorClass("max_profit_per_contract", row.max_profit_per_contract))}>{formatValue(row.max_profit_per_contract)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.otm)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.moneyness)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.sigma_distance)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.break_even)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("roc", row.roc))}>{formatValue(row.roc)}</td>
                <td className={cn("px-3 py-2 font-medium whitespace-nowrap", getValueColorClass("tot_return", row.tot_return))}>{formatValue(row.tot_return)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.delta)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.spread_bid_ask)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.open_interest)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.impl_volatility)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.sector)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.industry)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.main_trend)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.beta)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
