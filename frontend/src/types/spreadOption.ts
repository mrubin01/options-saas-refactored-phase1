export interface SpreadOption {
  contract: string;
  ticker: string;
  exchange: number;
  expiry_date: string;      // ISO string from backend
  current_price: number;
  strike_price: number;
  updated_at?: string | null; // ISO string from backend, optional
}
