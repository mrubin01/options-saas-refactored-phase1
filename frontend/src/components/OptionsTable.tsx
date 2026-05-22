import type { OptionRow } from "../types/optionRow";

type OptionsTableProps = {
  data: OptionRow[];
  exchangeMap: Record<number, string>;
};

export default function OptionsTable({
  data,
  exchangeMap,
}: OptionsTableProps) {
  if (data.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <table border={1} cellPadding={6} cellSpacing={0}>
      <thead>
        <tr>
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
        {data.map((row) => (
          <tr key={row.contract}>
            <td>{row.ticker}</td>
            <td>{row.contract}</td>
            <td>{exchangeMap[row.exchange] ?? row.exchange}</td>

            <td>{row.expiry_date}</td>
            <td>{row.days_to_expiration}</td>
            <td>{row.current_price}</td>

            <td>{row.strike_price}</td>
            <td>{row.highest_price}</td>
            <td>{row.avg_price}</td>

            <td>{row.lowest_price}</td>
            <td>{row.coeff_variation}</td>
            <td>{row.bid_per_share}</td>

            <td>{row.premium_per_contract}</td>
            <td>{row.option_yield}</td>
            <td>{row.max_profit}</td>
            
            <td>{row.max_profit_per_contract}</td>
            <td>{row.otm}</td>
            <td>{row.moneyness}</td>

            <td>{row.sigma_distance}</td>
            <td>{row.break_even}</td>
            <td>{row.roc}</td>

            <td>{row.tot_return}</td>
            <td>{row.delta}</td>
            <td>{row.spread_bid_ask}</td>

            <td>{row.open_interest}</td>
            <td>{row.impl_volatility}</td>
            <td>{row.sector}</td>

            <td>{row.industry}</td>
            <td>{row.main_trend}</td>
            <td>{row.beta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
