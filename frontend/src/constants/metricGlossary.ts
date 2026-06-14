import type { MetricGlossaryEntry } from "../types/metrics";

export const metricGlossary: Record<string, MetricGlossaryEntry> = {
  ticker: {
    key: "ticker",
    label: "Ticker",
    shortDefinition: "The stock symbol of the underlying company.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  exchange: {
    key: "exchange",
    label: "Exchange",
    shortDefinition: "The stock exchange where the underlying company is listed.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

  contract: {
    key: "contract",
    label: "Contract",
    shortDefinition: "The option contract identifier.",
    interpretation:
      "Use this to distinguish between different strikes, expirations, and option types.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  expiry_date: {
    key: "expiry_date",
    label: "Expiry date",
    shortDefinition: "The date when the option contract expires.",
    interpretation:
      "Shorter expirations usually mean faster time decay and more sensitivity to near-term price movement.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  current_price: {
    key: "current_price",
    label: "Current price",
    shortDefinition: "The latest available price of the underlying stock.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  strike_price: {
    key: "strike_price",
    label: "Strike price",
    shortDefinition: "The price at which the option can be exercised.",
    interpretation:
      "Compare strike price with current price to understand whether the option is in, at, or out of the money.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  days_to_expiration: {
    key: "days_to_expiration",
    label: "DTE",
    shortDefinition: "Days to expiration.",
    interpretation:
      "Lower DTE means the contract expires sooner. Higher DTE gives the trade more time but may reduce annualized efficiency.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  coeff_variation: {
    key: "coeff_variation",
    label: "Coefficient of variation",
    shortDefinition: "A relative volatility or dispersion measure. Also known as relative standard deviation.",
    interpretation:
      "Can help compare variability across instruments with different price levels.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "advanced",
  },

    max_profit: {
    key: "max_profit",
    label: "Max profit",
    shortDefinition: "Estimated maximum profit for the trade.",
    interpretation:
      "This is the upper bound of the modeled payoff, assuming the trade reaches its best-case outcome.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  max_profit_per_contract: {
    key: "max_profit_per_contract",
    label: "Max profit / contract",
    shortDefinition: "Estimated maximum profit for one option contract: max_profit * 100.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

  otm: {
    key: "otm",
    label: "OTM",
    shortDefinition: "Out-of-the-money distance.",
    interpretation:
      "For income strategies, farther OTM contracts may offer more cushion but usually lower premium.",
    appliesTo: ["covered_calls", "put_options"],
    importance: "supporting",
  },

  moneyness: {
    key: "moneyness",
    label: "Moneyness",
    shortDefinition: "Relationship between the stock price and the option strike price.",
    interpretation:
      "The % the stock needs to rise (for calls) or to drop (for puts) to reach the strike price.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  sigma_distance: {
    key: "sigma_distance",
    label: "Sigma distance",
    shortDefinition: "Distance from current price expressed in volatility-adjusted terms.",
    interpretation:
      "Useful for comparing strike distance across stocks with different volatility levels.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "advanced",
  },

  break_even: {
    key: "break_even",
    label: "Break-even",
    shortDefinition: "The underlying price level where the trade approximately breaks even.",
    interpretation:
      "A break-even farther from the current price can indicate a larger margin of safety.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  option_yield: {
    key: "option_yield",
    label: "Option yield",
    shortDefinition: "The option premium expressed as a yield against the relevant capital base.",
    interpretation:
      "Useful for comparing income opportunities across contracts with different prices or strikes. It is calculated differently for covered calls and puts, so be sure to check the definition for each strategy.",
    caution:
      "A high yield may indicate higher risk, lower liquidity, or a strike close to the current price.",
    appliesTo: ["covered_calls", "put_options"],
    importance: "core",
  },

  roc: {
    key: "roc",
    label: "ROC",
    shortDefinition: "Return On Capital.",
    interpretation:
      "Shows the expected return relative to the capital required for the trade. It is the annuallized option_yield",
    caution:
      "ROC should be compared with DTE and downside risk, not viewed alone.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  tot_return: {
    key: "tot_return",
    label: "Total return",
    shortDefinition: "Estimated total return.",
    interpretation:
      "Useful as a broad comparison metric, but it should be checked against risk and liquidity.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  delta: {
    key: "delta",
    label: "Delta",
    shortDefinition: "An estimate % of the chance of the option finishing in the money.",
    interpretation:
      "The probability that the option will be assigned at the expiration date.",
    caution:
      "Delta changes as price, volatility, and time to expiration change.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "advanced",
  },

  spread_bid_ask: {
    key: "spread_bid_ask",
    label: "Bid/ask spread",
    shortDefinition: "The difference between the option bid and ask prices.",
    interpretation:
      "A narrower spread usually indicates better liquidity and lower execution friction.",
    caution:
      "Wide spreads can make attractive-looking opportunities harder to execute at the displayed price.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  open_interest: {
    key: "open_interest",
    label: "Open interest",
    shortDefinition: "The number of outstanding option contracts currently open.",
    interpretation:
      "Higher open interest can indicate better market participation and potentially better liquidity.",
    caution:
      "Open interest does not guarantee good execution. Always consider bid/ask spread too.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  impl_volatility: {
    key: "impl_volatility",
    label: "Implied volatility",
    shortDefinition: "The market-implied expectation of future price movement.",
    interpretation:
      "Higher implied volatility often increases option premiums, but it can also signal greater expected risk.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  bid_per_share: {
    key: "bid_per_share",
    label: "Bid per share",
    shortDefinition: "The quoted bid price per option share.",
    interpretation:
      "This is often used as a conservative estimate of what a seller may receive.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

  premium_per_contract: {
    key: "premium_per_contract",
    label: "Premium",
    shortDefinition: "Estimated option premium per contract in $: bid_per_share * 100.",
    interpretation:
      "Higher premium can improve income, but it may also reflect higher risk, volatility, or less favorable moneyness.",
    caution:
      "Premium alone is not enough to judge quality. Compare it with DTE, liquidity, strike distance, and risk.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "core",
  },

  sector: {
    key: "sector",
    label: "Sector",
    shortDefinition: "The broad market sector of the underlying company.",
    interpretation:
      "Useful for diversification and avoiding overconcentration.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

  industry: {
    key: "industry",
    label: "Industry",
    shortDefinition: "The more specific industry group of the underlying company.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

  beta: {
    key: "beta",
    label: "Beta",
    shortDefinition: "A measure of how much the underlying stock tends to move relative to the broader market.",
    interpretation:
      "Higher beta usually means the stock is more sensitive to market moves.",
    appliesTo: ["covered_calls", "put_options", "spread_options"],
    importance: "supporting",
  },

};

export function getMetricGlossaryEntry(metricKey: string) {
  return metricGlossary[metricKey];
}
