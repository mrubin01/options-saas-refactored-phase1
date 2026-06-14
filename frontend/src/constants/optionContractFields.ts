export const OPTION_CONTRACT_FIELDS = [
  "ticker",
  "exchange",
  "contract",
  "expiry_date",
  "current_price",
  "strike_price",
  "days_to_expiration",
  "coeff_variation",
  "max_profit",
  "max_profit_per_contract",
  "otm",
  "moneyness",
  "sigma_distance",
  "break_even",
  "option_yield",
  "roc",
  "tot_return",
  "delta",
  "spread_bid_ask",
  "open_interest",
  "impl_volatility",
  "bid_per_share",
  "premium_per_contract",
  "sector",
  "industry",
  "highest_price",
  "avg_price",
  "lowest_price",
  "main_trend",
  "beta",
] as const;

export type OptionContractField = (typeof OPTION_CONTRACT_FIELDS)[number];

export const OPTION_CONTRACT_IDENTITY_FIELDS = [
  "ticker",
  "exchange",
  "contract",
  "expiry_date",
] as const satisfies readonly OptionContractField[];

export const OPTION_CONTRACT_PRIMARY_DISCOVERY_FIELDS = [
  "days_to_expiration",
  "option_yield",
  "roc",
  "tot_return",
  "premium_per_contract",
  "open_interest",
  "impl_volatility",
  "delta",
  "moneyness",
  "spread_bid_ask",
  "sector",
  "industry",
] as const satisfies readonly OptionContractField[];

export const SPREAD_OPTION_PRIMARY_DISCOVERY_FIELDS = [
  "days_to_expiration",
  "roc",
  "tot_return",
  "max_profit",
  "max_profit_per_contract",
  "open_interest",
  "impl_volatility",
  "delta",
  "moneyness",
  "spread_bid_ask",
  "sector",
  "industry",
] as const satisfies readonly OptionContractField[];

export const DEPRECATED_OPTION_CONTRACT_FIELD_NAMES = [
  "days_to_exp",
  "dte",
  "yield_pct",
  "yield",
  "implied_volatility",
  "iv",
  "bid_ask_spread",
  "spread",
  "premium",
  "contract_premium",
  "bid",
  "bid_price",
  "total_return",
  "coefficient_variation",
  "trend",
] as const;

export type DeprecatedOptionContractField =
  (typeof DEPRECATED_OPTION_CONTRACT_FIELD_NAMES)[number];

export function isOptionContractField(
  value: string,
): value is OptionContractField {
  return OPTION_CONTRACT_FIELDS.includes(value as OptionContractField);
}

export function isDeprecatedOptionContractField(
  value: string,
): value is DeprecatedOptionContractField {
  return DEPRECATED_OPTION_CONTRACT_FIELD_NAMES.includes(
    value as DeprecatedOptionContractField,
  );
}
