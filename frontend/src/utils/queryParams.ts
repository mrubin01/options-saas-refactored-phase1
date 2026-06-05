import type {
  CoveredCallSortField,
  CoveredCallsDiscoveryFilters,
  PutOptionSortField,
  PutOptionsDiscoveryFilters,
  SortDirection,
} from "../types/discovery";


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
  "min_expiry",
  "expiry_date_min",
  "expiry_date_max",
  "sector",
  "industry",
  "sort_by",
  "sort_dir",
] as const;

const COVERED_CALL_SORT_FIELDS: CoveredCallSortField[] = [
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
];

const PUT_OPTION_SORT_FIELDS: PutOptionSortField[] = [
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
];

function isSortDirection(value: string): value is SortDirection {
  return value === "asc" || value === "desc";
}


// covered calls
function isCoveredCallSortField(value: string): value is CoveredCallSortField {
  return COVERED_CALL_SORT_FIELDS.includes(value as CoveredCallSortField);
}

export function parseCoveredCallsFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CoveredCallsDiscoveryFilters {
  const filters: CoveredCallsDiscoveryFilters = {};

  NUMBER_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      filters[key] = numericValue as never;
    }
  });

  STRING_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    if (key === "sort_by") {
      if (isCoveredCallSortField(value)) {
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

    filters[key] = value as never;
  });

  return filters;
}

export function coveredCallsFiltersToSearchParams(
  filters: CoveredCallsDiscoveryFilters,
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

export function hasActiveCoveredCallsDiscoveryFilters(
  filters: CoveredCallsDiscoveryFilters,
): boolean {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "limit" || key === "offset") {
      return false;
    }

    return value !== undefined && value !== null && value !== "";
  });
}

export function buildCoveredCallsPathFromFilters(
  filters: CoveredCallsDiscoveryFilters,
) {
  const searchParams = coveredCallsFiltersToSearchParams(filters);
  const qs = searchParams.toString();

  return qs ? `/covered-calls?${qs}` : "/covered-calls";
}



// put options
function isPutOptionSortField(value: string): value is PutOptionSortField {
  return PUT_OPTION_SORT_FIELDS.includes(value as PutOptionSortField);
}

export function parsePutOptionsFiltersFromSearchParams(
  searchParams: URLSearchParams,
): PutOptionsDiscoveryFilters {
  const filters: PutOptionsDiscoveryFilters = {};

  NUMBER_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      filters[key] = numericValue as never;
    }
  });

  STRING_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);

    if (value === null || value === "") {
      return;
    }

    if (key === "sort_by") {
      if (isPutOptionSortField(value)) {
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

    filters[key] = value as never;
  });

  return filters;
}

export function putOptionsFiltersToSearchParams(
  filters: PutOptionsDiscoveryFilters,
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

export function hasActivePutOptionsDiscoveryFilters(
  filters: PutOptionsDiscoveryFilters,
): boolean {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "limit" || key === "offset") {
      return false;
    }

    return value !== undefined && value !== null && value !== "";
  });
}

export function buildPutOptionsPathFromFilters(
  filters: PutOptionsDiscoveryFilters,
) {
  const searchParams = putOptionsFiltersToSearchParams(filters);
  const qs = searchParams.toString();

  return qs ? `/put-options?${qs}` : "/put-options";
}

