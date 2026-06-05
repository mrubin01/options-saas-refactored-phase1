import { apiGet } from "./client";

import type { SpreadOption } from "../types/spreadOption";
import type { SpreadOptionsDiscoveryFilters } from "../types/discovery";

function appendParam(
  searchParams: URLSearchParams,
  key: keyof SpreadOptionsDiscoveryFilters,
  value: SpreadOptionsDiscoveryFilters[keyof SpreadOptionsDiscoveryFilters],
) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

function buildSpreadOptionsQuery(params: SpreadOptionsDiscoveryFilters = {}) {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, "exchange", params.exchange);
  appendParam(searchParams, "ticker", params.ticker);
  appendParam(searchParams, "contract", params.contract);
  appendParam(searchParams, "min_expiry", params.min_expiry);

  appendParam(searchParams, "days_to_expiration_min", params.days_to_expiration_min);
  appendParam(searchParams, "days_to_expiration_max", params.days_to_expiration_max);

  appendParam(searchParams, "current_price_min", params.current_price_min);
  appendParam(searchParams, "current_price_max", params.current_price_max);

  appendParam(searchParams, "strike_price_min", params.strike_price_min);
  appendParam(searchParams, "strike_price_max", params.strike_price_max);

  appendParam(searchParams, "coeff_variation_min", params.coeff_variation_min);
  appendParam(searchParams, "coeff_variation_max", params.coeff_variation_max);

  appendParam(searchParams, "max_profit_min", params.max_profit_min);
  appendParam(searchParams, "max_profit_max", params.max_profit_max);

  appendParam(searchParams, "max_profit_per_contract_min", params.max_profit_per_contract_min);
  appendParam(searchParams, "max_profit_per_contract_max", params.max_profit_per_contract_max);

  appendParam(searchParams, "otm_min", params.otm_min);
  appendParam(searchParams, "otm_max", params.otm_max);

  appendParam(searchParams, "moneyness_min", params.moneyness_min);
  appendParam(searchParams, "moneyness_max", params.moneyness_max);

  appendParam(searchParams, "sigma_distance_min", params.sigma_distance_min);
  appendParam(searchParams, "sigma_distance_max", params.sigma_distance_max);

  appendParam(searchParams, "break_even_min", params.break_even_min);
  appendParam(searchParams, "break_even_max", params.break_even_max);

  appendParam(searchParams, "option_yield_min", params.option_yield_min);
  appendParam(searchParams, "option_yield_max", params.option_yield_max);

  appendParam(searchParams, "roc_min", params.roc_min);
  appendParam(searchParams, "roc_max", params.roc_max);

  appendParam(searchParams, "tot_return_min", params.tot_return_min);
  appendParam(searchParams, "tot_return_max", params.tot_return_max);

  appendParam(searchParams, "delta_min", params.delta_min);
  appendParam(searchParams, "delta_max", params.delta_max);

  appendParam(searchParams, "spread_bid_ask_min", params.spread_bid_ask_min);
  appendParam(searchParams, "spread_bid_ask_max", params.spread_bid_ask_max);

  appendParam(searchParams, "open_interest_min", params.open_interest_min);
  appendParam(searchParams, "open_interest_max", params.open_interest_max);

  appendParam(searchParams, "impl_volatility_min", params.impl_volatility_min);
  appendParam(searchParams, "impl_volatility_max", params.impl_volatility_max);

  appendParam(searchParams, "bid_per_share_min", params.bid_per_share_min);
  appendParam(searchParams, "bid_per_share_max", params.bid_per_share_max);

  appendParam(searchParams, "premium_per_contract_min", params.premium_per_contract_min);
  appendParam(searchParams, "premium_per_contract_max", params.premium_per_contract_max);

  appendParam(searchParams, "sector", params.sector);
  appendParam(searchParams, "industry", params.industry);

  appendParam(searchParams, "sort_by", params.sort_by);
  appendParam(searchParams, "sort_dir", params.sort_dir);

  appendParam(searchParams, "limit", params.limit);
  appendParam(searchParams, "offset", params.offset);

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function fetchSpreadOptions(
  params: SpreadOptionsDiscoveryFilters = {},
): Promise<SpreadOption[]> {
  const qs = buildSpreadOptionsQuery(params);
  return apiGet<SpreadOption[]>(qs ? `/spread-options${qs}` : "/spread-options");
}
