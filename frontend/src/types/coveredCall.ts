export interface CoveredCall {
  contract: string;
  ticker: string;
  exchange: number;
  expiry_date: string;      // ISO string from backend
  current_price: number;
  strike_price: number;
  days_to_expiration: number;
  coeff_variation: number;
  max_profit: number;
  max_profit_per_contract: number;
  otm: number;
  moneyness: number;
  sigma_distance: number;
  break_even: number;
  option_yield: number;
  roc: number;
  tot_return: number;
  delta: number;
  spread_bid_ask: number;
  open_interest: number | null;
  impl_volatility: number;
  bid_per_share: number;
  premium_per_contract: number;
  sector: number | null;
  industry: number | null;
  highest_price: number;
  avg_price: number;
  lowest_price: number;
  main_trend: number;
  beta: number | null;

  updated_at?: string | null; // ISO string from backend, optional
}
