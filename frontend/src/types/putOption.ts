export interface PutOption {
  contract: string;
  ticker: string;
  exchange: number;
  expiry_date: string;      // ISO string from backend
  current_price: number;
  strike_price: number;

  rel_std_deviation: number;
  spread_premium_price_and_bid: number;
  spread_strike_price: number;
  bid_per_share: number;
  premium_per_contract: number;
  spread_bid_ask: number;
  open_interest: number | null;
  impl_volatility: number;
  ratio_bid_strike: number;
  sector: number | null;
  industry: number | null;
  highest_price: number;
  avg_price: number;
  lowest_price: number;
  main_trend: number;
  beta: number | null;
  
  updated_at?: string | null; // ISO string from backend, optional
}
