import type { LongOptionRow } from "../types/longOptionRow";
import { metricGlossary } from "../constants/metricGlossary";
import { cn } from "../lib/utils";

type BuyingOptionsTableProps = {
  data: LongOptionRow[];
  exchangeMap: Record<number, string>;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

const RETURN_COLS = new Set(["profit_5pct", "return_5pct", "profit_10pct", "return_10pct"]);

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
  strike_price: "Strike",
  coeff_variation: "CV%",
  otm: "OTM",
  moneyness: "Moneyness%",
  sigma_distance: "Sigma Dist",
  iv_hv_ratio: "IV/HV",
  profit_5pct: "Profit 5%",
  return_5pct: "Return 5%",
  profit_10pct: "Profit 10%",
  return_10pct: "Return 10%",
  delta: "Delta%",
  spread_bid_ask: "Spread",
  impl_volatility: "IV",
  sector: "Sector",
  industry: "Industry",
  main_trend: "Trend",
  beta: "Beta",
  ex_dividend_date: "Ex-Div",
  earnings_date: "Earnings",
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

const TREND_LABELS: Record<number, { label: string; className: string }> = {
  0:  { label: "Sideways",  className: "text-muted" },
  1:  { label: "Uptrend",   className: "text-emerald-400" },
  [-1]: { label: "Downtrend", className: "text-red-400" },
};

function formatTrend(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return { label: "—", className: "" };
  const id = Number(value);
  return TREND_LABELS[id] ?? { label: String(value), className: "" };
}

const COLUMNS: string[] = [
  "ticker", "contract", "exchange", "expiry_date", "days_to_expiration", "strike_price",
  "coeff_variation", "otm", "moneyness", "sigma_distance",
  "iv_hv_ratio", "profit_5pct", "return_5pct", "profit_10pct", "return_10pct",
  "delta", "spread_bid_ask", "impl_volatility",
  "sector", "industry", "main_trend", "beta",
  "ex_dividend_date", "earnings_date",
];

export default function BuyingOptionsTable({
  data,
  exchangeMap,
}: BuyingOptionsTableProps) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No results found.</p>;
  }

  return (
    <>
      <div className="mb-2 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
        Data is delayed by at least 15 minutes. Not suitable for live trading decisions.
      </div>
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-border shadow-sm max-h-[calc(100vh-14rem)]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-surface">
              {COLUMNS.map((col) => (
                <HeaderCell key={col} metricKey={col} />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.contract}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-border/30 transition-colors",
                  idx % 2 === 0 ? "bg-surface" : "",
                )}
              >
                <td className="px-3 py-2 font-bold text-primary whitespace-nowrap">
                  {formatValue(row.ticker)}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted whitespace-nowrap">
                  {formatValue(row.contract)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(exchangeMap[row.exchange] ?? row.exchange)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.expiry_date)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.days_to_expiration)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.strike_price)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.coeff_variation)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.otm)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.moneyness)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.sigma_distance)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.iv_hv_ratio)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("profit_5pct", row.profit_5pct))}>{formatValue(row.profit_5pct)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("return_5pct", row.return_5pct))}>{formatValue(row.return_5pct)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("profit_10pct", row.profit_10pct))}>{formatValue(row.profit_10pct)}</td>
                <td className={cn("px-3 py-2 font-semibold whitespace-nowrap", getValueColorClass("return_10pct", row.return_10pct))}>{formatValue(row.return_10pct)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.delta)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.spread_bid_ask)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatValue(row.impl_volatility)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.sector)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.industry)}</td>
                <td className={cn("px-3 py-2 whitespace-nowrap font-medium", formatTrend(row.main_trend).className)}>{formatTrend(row.main_trend).label}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.beta)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.ex_dividend_date)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted">{formatValue(row.earnings_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
