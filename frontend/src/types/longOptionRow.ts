export type LongOptionRow = {
  ticker: string;
  exchange: number;
  contract: string;
  expiry_date: string;

  current_price: number | null;
  strike_price: number | null;

  days_to_expiration: number | null;
  coeff_variation: number | null;
  otm: number | null;
  moneyness: number | null;
  sigma_distance: number | null;
  ask_per_share: number | null;
  premium_per_contract: number | null;
  break_even: number | null;
  spread_bid_ask: number | null;
  open_interest: number | null;
  impl_volatility: number | null;
  delta: number | null;

  highest_price: number | null;
  avg_price: number | null;
  lowest_price: number | null;
  main_trend: string | number | null;
  beta: number | null;

  sector: string | null;
  industry: string | null;

  iv_hv_ratio: number | null;
  ex_dividend_date: string | null;
  earnings_date: string | null;

  profit_5pct: number | null;
  return_5pct: number | null;
  profit_10pct: number | null;
  return_10pct: number | null;

  updated_at?: string | null;
};
