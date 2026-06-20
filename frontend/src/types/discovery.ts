import type { OptionContractField } from "../constants/optionContractFields";

export type SortDirection = "asc" | "desc";

export type CoveredCallSortField = OptionContractField;
export type PutOptionSortField = OptionContractField;
export type SpreadOptionSortField = OptionContractField;

export type BaseDiscoveryFilters<TSortField extends OptionContractField> = {
  exchange?: number;
  ticker?: string;
  contract?: string;

  /**
   * Legacy/basic filter currently used by the old backend route.
   * Keep this while transitioning.
   */
  min_expiry?: string;

  /**
   * Stage 5 naming convention.
   * Prefer these in new UI.
   */
  expiry_date_min?: string;
  expiry_date_max?: string;

  current_price_min?: number;
  current_price_max?: number;

  strike_price_min?: number;
  strike_price_max?: number;

  days_to_expiration_min?: number;
  days_to_expiration_max?: number;

  coeff_variation_min?: number;
  coeff_variation_max?: number;

  max_profit_min?: number;
  max_profit_max?: number;

  max_profit_per_contract_min?: number;
  max_profit_per_contract_max?: number;

  otm_min?: number;
  otm_max?: number;

  moneyness_min?: number;
  moneyness_max?: number;

  sigma_distance_min?: number;
  sigma_distance_max?: number;

  break_even_min?: number;
  break_even_max?: number;

  option_yield_min?: number;
  option_yield_max?: number;

  roc_min?: number;
  roc_max?: number;

  tot_return_min?: number;
  tot_return_max?: number;

  delta_min?: number;
  delta_max?: number;

  spread_bid_ask_min?: number;
  spread_bid_ask_max?: number;

  open_interest_min?: number;
  open_interest_max?: number;

  impl_volatility_min?: number;
  impl_volatility_max?: number;

  bid_per_share_min?: number;
  bid_per_share_max?: number;

  premium_per_contract_min?: number;
  premium_per_contract_max?: number;

  sector?: string;
  industry?: string;

  highest_price_min?: number;
  highest_price_max?: number;

  avg_price_min?: number;
  avg_price_max?: number;

  lowest_price_min?: number;
  lowest_price_max?: number;

  main_trend_min?: number;
  main_trend_max?: number;

  beta_min?: number;
  beta_max?: number;

  sort_by?: TSortField;
  sort_dir?: SortDirection;

  limit?: number;
  offset?: number;
};

export type CoveredCallsDiscoveryFilters =
  BaseDiscoveryFilters<CoveredCallSortField>;

export type PutOptionsDiscoveryFilters =
  BaseDiscoveryFilters<PutOptionSortField>;

export type SpreadOptionsDiscoveryFilters =
  BaseDiscoveryFilters<SpreadOptionSortField>;

export type SortPreset<TSortField extends string> = {
  label: string;
  sort_by: TSortField;
  sort_dir: SortDirection;
};
