import type { CoveredCall } from "../types/coveredCall";

interface OptionsTableProps {
  data: CoveredCall[];
  exchangeMap: Record<number, string>;
}

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
          <th>Expiry</th>
          <th>Current</th>
          <th>Strike</th>

          <th>Rel Std Dev</th>
          <th>Spread Premium - Price/Bid</th>
          <th>Spread Strike Price - Current Price</th>
          <th>Bid per Share</th>
          <th>Premium per Contract</th>
          <th>Spread Bid - Ask</th>
          <th>Open Interest</th>
          <th>Implied Volatility</th>
          <th>Ratio Bid - Strike Price</th>
          <th>Sector</th>
          <th>Industry</th>
          <th>Highest Price</th>
          <th>Avg. Price</th>
          <th>Lowest Price</th>
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
            <td>{row.current_price}</td>
            <td>{row.strike_price}</td>

            <td>{row.rel_std_deviation}</td>
            <td>{row.spread_premium_price_and_bid}</td>
            <td>{row.spread_strike_price}</td>
            <td>{row.bid_per_share}</td>
            <td>{row.premium_per_contract}</td>
            <td>{row.spread_bid_ask}</td>
            <td>{row.open_interest}</td>
            <td>{row.impl_volatility}</td>
            <td>{row.ratio_bid_strike}</td>
            <td>{row.sector}</td>
            <td>{row.industry}</td>
            <td>{row.highest_price}</td>
            <td>{row.avg_price}</td>
            <td>{row.lowest_price}</td>
            <td>{row.main_trend}</td>
            <td>{row.beta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
