import type { OptionContractField } from "../constants/optionContractFields";

export type OptionRow = {
  ticker: string;
  exchange: number;
  contract: string;
  expiry_date: string;

  current_price: number | null;
  strike_price: number | null;

  days_to_expiration: number | null;
  coeff_variation: number | null;
  max_profit: number | null;
  max_profit_per_contract: number | null;
  otm: number | null;
  moneyness: number | null;
  sigma_distance: number | null;
  break_even: number | null;
  option_yield: number | null;
  roc: number | null;
  tot_return: number | null;
  delta: number | null;
  spread_bid_ask: number | null;
  open_interest: number | null;
  impl_volatility: number | null;
  bid_per_share: number | null;
  premium_per_contract: number | null;

  sector: string | null;
  industry: string | null;
  highest_price: number | null;
  avg_price: number | null;
  lowest_price: number | null;
  main_trend: string | number | null;
  beta: number | null;

  updated_at?: string | null;
};

type MissingOptionRowContractFields = Exclude<
  OptionContractField,
  keyof OptionRow
>;

type AssertNoMissingOptionRowFields<T extends never> = T;

export type OptionRowContractFieldCheck =
  AssertNoMissingOptionRowFields<MissingOptionRowContractFields>;
