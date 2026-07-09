import {
  isOptionContractField,
  type OptionContractField,
} from "../constants/optionContractFields";
import type {
  CoveredCallsDiscoveryFilters,
  PutOptionsDiscoveryFilters,
  SpreadOptionsDiscoveryFilters,
  SortDirection,
} from "../types/discovery";

type DiscoveryFilters =
  | CoveredCallsDiscoveryFilters
  | PutOptionsDiscoveryFilters
  | SpreadOptionsDiscoveryFilters;

type NumberFilterKey = (typeof NUMBER_FILTER_KEYS)[number];
type StringFilterKey = (typeof STRING_FILTER_KEYS)[number];

const NUMBER_FILTER_KEYS = [
  "exchange",
  "current_price_min",
  "current_price_max",
  "strike_price_min",
  "strike_price_max",
  "days_to_expiration_min",
  "days_to_expiration_max",
  "coeff_variation_min",
  "coeff_variation_max",
  "max_profit_min",
  "max_profit_max",
  "max_profit_per_contract_min",
  "max_profit_per_contract_max",
  "otm_min",
  "otm_max",
  "moneyness_min",
  "moneyness_max",
  "sigma_distance_min",
  "sigma_distance_max",
  "break_even_min",
  "break_even_max",
  "option_yield_min",
  "option_yield_max",
  "roc_min",
  "roc_max",
  "tot_return_min",
  "tot_return_max",
  "delta_min",
  "delta_max",
  "spread_bid_ask_min",
  "spread_bid_ask_max",
  "open_interest_min",
  "open_interest_max",
  "impl_volatility_min",
  "impl_volatility_max",
  "bid_per_share_min",
  "bid_per_share_max",
  "premium_per_contract_min",
  "premium_per_contract_max",
  "highest_price_min",
  "highest_price_max",
  "avg_price_min",
  "avg_price_max",
  "lowest_price_min",
  "lowest_price_max",
  "main_trend",
  "main_trend_min",
  "main_trend_max",
  "beta_min",
  "beta_max",
  "limit",
  "offset",
] as const;

const STRING_FILTER_KEYS = [
  "ticker",
  "contract",
  "expiry_date",
  "min_expiry",
  "expiry_date_min",
  "expiry_date_max",
  "sector",
  "industry",
  "sort_by",
  "sort_dir",
] as const;

function isSortDirection(value: string): value is SortDirection {
  return value === "asc" || value === "desc";
}

function isSortField(value: string): value is OptionContractField {
  return isOptionContractField(value);
}

function parseDiscoveryFiltersFromSearchParams<TFilters extends DiscoveryFilters>(
  searchParams: URLSearchParams,
): TFilters {
  const filters: Partial<Record<NumberFilterKey | StringFilterKey, string | number>> =
    {};

  NUMBER_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      filters[key] = numericValue;
    }
  });

  STRING_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    if (key === "sort_by") {
      if (isSortField(value)) {
        filters.sort_by = value;
      }
      return;
    }

    if (key === "sort_dir") {
      if (isSortDirection(value)) {
        filters.sort_dir = value;
      }
      return;
    }

    filters[key] = value;
  });

  return filters as TFilters;
}

function discoveryFiltersToSearchParams(
  filters: DiscoveryFilters,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}

function hasActiveDiscoveryFilters(filters: DiscoveryFilters): boolean {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "limit" || key === "offset") {
      return false;
    }

    return value !== undefined && value !== null && value !== "";
  });
}

export function parseCoveredCallsFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CoveredCallsDiscoveryFilters {
  return parseDiscoveryFiltersFromSearchParams<CoveredCallsDiscoveryFilters>(
    searchParams,
  );
}

export function coveredCallsFiltersToSearchParams(
  filters: CoveredCallsDiscoveryFilters,
): URLSearchParams {
  return discoveryFiltersToSearchParams(filters);
}

export function hasActiveCoveredCallsDiscoveryFilters(
  filters: CoveredCallsDiscoveryFilters,
): boolean {
  return hasActiveDiscoveryFilters(filters);
}

export function buildCoveredCallsPathFromFilters(
  filters: CoveredCallsDiscoveryFilters,
) {
  const searchParams = coveredCallsFiltersToSearchParams(filters);
  const qs = searchParams.toString();

  return qs ? `/covered-calls?${qs}` : "/covered-calls";
}

export function parsePutOptionsFiltersFromSearchParams(
  searchParams: URLSearchParams,
): PutOptionsDiscoveryFilters {
  return parseDiscoveryFiltersFromSearchParams<PutOptionsDiscoveryFilters>(
    searchParams,
  );
}

export function putOptionsFiltersToSearchParams(
  filters: PutOptionsDiscoveryFilters,
): URLSearchParams {
  return discoveryFiltersToSearchParams(filters);
}

export function hasActivePutOptionsDiscoveryFilters(
  filters: PutOptionsDiscoveryFilters,
): boolean {
  return hasActiveDiscoveryFilters(filters);
}

export function buildPutOptionsPathFromFilters(
  filters: PutOptionsDiscoveryFilters,
) {
  const searchParams = putOptionsFiltersToSearchParams(filters);
  const qs = searchParams.toString();

  return qs ? `/put-options?${qs}` : "/put-options";
}

export function parseSpreadOptionsFiltersFromSearchParams(
  searchParams: URLSearchParams,
): SpreadOptionsDiscoveryFilters {
  return parseDiscoveryFiltersFromSearchParams<SpreadOptionsDiscoveryFilters>(
    searchParams,
  );
}

export function spreadOptionsFiltersToSearchParams(
  filters: SpreadOptionsDiscoveryFilters,
): URLSearchParams {
  return discoveryFiltersToSearchParams(filters);
}

export function hasActiveSpreadOptionsDiscoveryFilters(
  filters: SpreadOptionsDiscoveryFilters,
): boolean {
  return hasActiveDiscoveryFilters(filters);
}

export function buildSpreadOptionsPathFromFilters(
  filters: SpreadOptionsDiscoveryFilters,
) {
  const searchParams = spreadOptionsFiltersToSearchParams(filters);
  const qs = searchParams.toString();

  return qs ? `/spread-options?${qs}` : "/spread-options";
}
