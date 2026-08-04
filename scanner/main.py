import sys
import time
import functions
import warnings
import pandas as pd
from pathlib import Path
from datetime import date as _date, datetime
import Assets
import config
import covered_calls as cov_calls
import put_options as put_options
import long_calls
import long_puts
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = Path(__file__).parent
TICKERS_DIR = BASE_DIR / "tickers"
OUTPUT_DIR = BASE_DIR.parent / "shared" / "data"

warnings.simplefilter("ignore")
pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)

target_dates = config.TARGET_DATES
std_dev_threshold = config.STD_DEV_THRESHOLD

option_type = config.OPTION_TYPE
exchanges = config.EXCHANGES

# 6 scans: each ticker is fetched once per exchange and produces both selling and buying JSONs
SCANS = [
    (0, 5), (1, 5), (2, 5),  # combined calls  NYSE / NASDAQ / ARCA
    (0, 6), (1, 6), (2, 6),  # combined puts   NYSE / NASDAQ / ARCA
]


def main(exchange_number: int = 0, option_type_input: int | None = None):
    stock_exchange = exchange_number
    option_no = option_type_input if option_type_input is not None else config.TYPE

    if stock_exchange in [0, 1]:
        max_stock_price = config.NYSE_NASDAQ_MAX_STOCK_PRICE
        min_bid_price = config.NYSE_NASDAQ_MIN_BID_PRICE
        config.STRIKE_PRICE_THRESHOLD = 1.5
    else:
        max_stock_price = config.ARCA_MAX_STOCK_PRICE
        min_bid_price = config.ARCA_MIN_BID_PRICE
        config.STRIKE_PRICE_THRESHOLD = 3

    print("|--------------------------------------------------------------------------|")

    match (stock_exchange, config.SCOPE):
        case (0, 0):
            ticker_file = TICKERS_DIR / "nyse_options.txt"
        case (1, 0):
            ticker_file = TICKERS_DIR / "nasdaq_options.txt"
        case (2, 0):
            ticker_file = TICKERS_DIR / "arca_options.txt"
        case (0, 1):
            ticker_file = TICKERS_DIR / "nyse_full.txt"
        case (1, 1):
            ticker_file = TICKERS_DIR / "nasdaq_full.txt"
        case (2, 1):
            ticker_file = TICKERS_DIR / "arca_full.txt"
        case _:
            print("Wrong values!")
            sys.exit()

    with open(ticker_file, "r") as my_file:
        data = my_file.read()
    data_into_list = data.replace('\n', ', ').split(", ")
    ticker_list = list(filter(None, data_into_list))

    start_time = time.time()
    print(f"|-- Scanning {option_type[option_no]} options in {exchanges[stock_exchange]} --|")
    print()

    all_selling_contracts = []
    all_buying_contracts = []

    if stock_exchange in [0, 1]:

        def _process_equity_ticker(t: str) -> tuple[list[dict], list[dict]]:
            ticker = Assets.Equity(t, exchanges[stock_exchange])
            ticker_data = ticker.get_info()
            if not ticker_data:
                return [], []

            price = float(ticker_data["price"])
            options = ticker_data["options"]
            sector = functions.normalize_nullable_fields(ticker_data.get("sector"))
            industry = functions.normalize_nullable_fields(ticker_data.get("industry"))
            beta = functions.normalize_nullable_float(ticker_data.get("beta"))
            ex_dividend_date = functions.normalize_nullable_fields(ticker_data.get("ex_dividend_date"))
            earnings_date = functions.normalize_nullable_fields(ticker_data.get("earnings_date"))

            if price > max_stock_price:
                return [], []

            price_data = ticker.get_price_stats()
            if not price_data:
                return [], []

            lowest_price = price_data["low"]
            highest_price = price_data["high"]
            avg_price = price_data["avg_price"]
            avg_price_7d = price_data["avg_price_7d"]
            avg_price_30d = price_data["avg_price_30d"]
            trend = price_data["price_trend"]
            rel_std_deviation = price_data["rel_sd"]
            hv = price_data.get("hv", 0.0)

            too_volatile_for_selling = rel_std_deviation > std_dev_threshold

            if len(options) == 0:
                return [], []

            # Combined mode: fetch chain once, apply both selling and buying filters
            if option_no in [5, 6]:
                scan_sell = cov_calls.scan_covered_calls if option_no == 5 else put_options.scan_put_options
                scan_buy = long_calls.scan_long_calls if option_no == 5 else long_puts.scan_long_puts
                opt_type = "call" if option_no == 5 else "put"
                selling = []
                buying = []
                earnings_dt = None
                if earnings_date:
                    try:
                        earnings_dt = datetime.strptime(earnings_date, "%Y-%m-%d").date()
                    except ValueError:
                        pass
                ex_div_dt = None
                if ex_dividend_date:
                    try:
                        ex_div_dt = datetime.strptime(ex_dividend_date, "%Y-%m-%d").date()
                    except ValueError:
                        pass
                for d in options:
                    option_dt = datetime.strptime(d, "%Y-%m-%d").date()
                    today = _date.today()
                    earnings_within_dte = earnings_dt is not None and today <= earnings_dt <= option_dt
                    ex_div_within_dte = ex_div_dt is not None and today <= ex_div_dt <= option_dt
                    is_selling = (d in target_dates and not too_volatile_for_selling
                                  and not earnings_within_dte and not ex_div_within_dte)
                    is_buying = d in config.LONG_TARGET_DATES and not earnings_within_dte
                    if option_no == 5:  # long calls: also skip ex-div (stock drop hurts calls)
                        is_buying = is_buying and not ex_div_within_dte
                    if not is_selling and not is_buying:
                        continue
                    df = functions.get_alpaca_option_chain(t, d, opt_type)
                    if df.empty:
                        continue
                    if is_selling:
                        try:
                            best = scan_sell(
                                ticker, stock_exchange, d, min_bid_price, t, price,
                                lowest_price, highest_price, avg_price, avg_price_7d,
                                avg_price_30d, trend, rel_std_deviation,
                                sector=sector, industry=industry, beta=beta, hv=hv, df=df,
                                ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                            selling.extend(best)
                        except Exception:
                            pass
                    if is_buying:
                        try:
                            best = scan_buy(
                                ticker, stock_exchange, d, t, price,
                                lowest_price, highest_price, avg_price, avg_price_7d,
                                avg_price_30d, trend, rel_std_deviation,
                                hv=hv, sector=sector, industry=industry, beta=beta, df=df,
                                ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                            buying.extend(best)
                        except Exception:
                            pass
                return selling, buying

            # Single modes (backward compat)
            if too_volatile_for_selling and option_no not in [3, 4]:
                return [], []

            active_dates = config.LONG_TARGET_DATES if option_no in [3, 4] else target_dates
            matched = []
            for d in options:
                if d not in active_dates:
                    continue
                try:
                    if option_no == 0:
                        best_contracts = cov_calls.scan_covered_calls(
                            ticker, stock_exchange, d, min_bid_price, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation,
                            sector=sector, industry=industry, beta=beta, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 1:
                        best_contracts = put_options.scan_put_options(
                            ticker, stock_exchange, d, min_bid_price, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation,
                            sector=sector, industry=industry, beta=beta, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 3:
                        best_contracts = long_calls.scan_long_calls(
                            ticker, stock_exchange, d, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            sector=sector, industry=industry, beta=beta,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 4:
                        best_contracts = long_puts.scan_long_puts(
                            ticker, stock_exchange, d, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            sector=sector, industry=industry, beta=beta,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    else:
                        best_contracts = []
                except Exception:
                    continue
                matched.extend(best_contracts)

            if option_no in [3, 4]:
                return [], matched
            return matched, []

        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(_process_equity_ticker, ticker_list))

        for selling, buying in results:
            all_selling_contracts.extend(selling)
            all_buying_contracts.extend(buying)

    elif stock_exchange == 2:

        def _process_etf_ticker(t: str) -> tuple[list[dict], list[dict]]:
            ticker = Assets.ETF(t, exchanges[stock_exchange])
            ticker_data = ticker.get_info_etf()
            if not ticker_data:
                return [], []

            price = float(ticker_data["price"])
            options = ticker_data["options"]

            if price > max_stock_price:
                return [], []

            price_data = ticker.get_price_stats()
            if not price_data:
                return [], []

            lowest_price = price_data["low"]
            highest_price = price_data["high"]
            avg_price = price_data["avg_price"]
            avg_price_7d = price_data["avg_price_7d"]
            avg_price_30d = price_data["avg_price_30d"]
            trend = price_data["price_trend"]
            rel_std_deviation = price_data["rel_sd"]
            hv = price_data.get("hv", 0.0)

            too_volatile_for_selling = rel_std_deviation > std_dev_threshold
            ex_dividend_date = functions.normalize_nullable_fields(ticker_data.get("ex_dividend_date"))
            earnings_date = functions.normalize_nullable_fields(ticker_data.get("earnings_date"))

            if len(options) == 0:
                return [], []

            # Combined mode
            if option_no in [5, 6]:
                scan_sell = cov_calls.scan_covered_calls if option_no == 5 else put_options.scan_put_options
                scan_buy = long_calls.scan_long_calls if option_no == 5 else long_puts.scan_long_puts
                opt_type = "call" if option_no == 5 else "put"
                selling = []
                buying = []
                earnings_dt = None
                if earnings_date:
                    try:
                        earnings_dt = datetime.strptime(earnings_date, "%Y-%m-%d").date()
                    except ValueError:
                        pass
                ex_div_dt = None
                if ex_dividend_date:
                    try:
                        ex_div_dt = datetime.strptime(ex_dividend_date, "%Y-%m-%d").date()
                    except ValueError:
                        pass
                for d in options:
                    option_dt = datetime.strptime(d, "%Y-%m-%d").date()
                    today = _date.today()
                    earnings_within_dte = earnings_dt is not None and today <= earnings_dt <= option_dt
                    ex_div_within_dte = ex_div_dt is not None and today <= ex_div_dt <= option_dt
                    is_selling = (d in target_dates and not too_volatile_for_selling
                                  and not earnings_within_dte and not ex_div_within_dte)
                    is_buying = d in config.LONG_TARGET_DATES and not earnings_within_dte
                    if option_no == 5:  # long calls: also skip ex-div (stock drop hurts calls)
                        is_buying = is_buying and not ex_div_within_dte
                    if not is_selling and not is_buying:
                        continue
                    df = functions.get_alpaca_option_chain(t, d, opt_type)
                    if df.empty:
                        continue
                    if is_selling:
                        try:
                            best = scan_sell(
                                ticker, stock_exchange, d, min_bid_price, t, price,
                                lowest_price, highest_price, avg_price, avg_price_7d,
                                avg_price_30d, trend, rel_std_deviation, hv=hv, df=df,
                                ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                            selling.extend(best)
                        except Exception:
                            pass
                    if is_buying:
                        try:
                            best = scan_buy(
                                ticker, stock_exchange, d, t, price,
                                lowest_price, highest_price, avg_price, avg_price_7d,
                                avg_price_30d, trend, rel_std_deviation, hv=hv, df=df,
                                ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                            buying.extend(best)
                        except Exception:
                            pass
                return selling, buying

            # Single modes (backward compat)
            if too_volatile_for_selling and option_no not in [3, 4]:
                return [], []

            active_dates = config.LONG_TARGET_DATES if option_no in [3, 4] else target_dates
            matched = []
            for d in options:
                if d not in active_dates:
                    continue
                try:
                    if option_no == 0:
                        best_contracts = cov_calls.scan_covered_calls(
                            ticker, stock_exchange, d, min_bid_price, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 1:
                        best_contracts = put_options.scan_put_options(
                            ticker, stock_exchange, d, min_bid_price, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 3:
                        best_contracts = long_calls.scan_long_calls(
                            ticker, stock_exchange, d, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    elif option_no == 4:
                        best_contracts = long_puts.scan_long_puts(
                            ticker, stock_exchange, d, t, price,
                            lowest_price, highest_price, avg_price, avg_price_7d,
                            avg_price_30d, trend, rel_std_deviation, hv=hv,
                            ex_dividend_date=ex_dividend_date, earnings_date=earnings_date)
                    else:
                        best_contracts = []
                except Exception:
                    continue
                matched.extend(best_contracts)

            if option_no in [3, 4]:
                return [], matched
            return matched, []

        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(_process_etf_ticker, ticker_list))

        for selling, buying in results:
            all_selling_contracts.extend(selling)
            all_buying_contracts.extend(buying)

    selling_sorted = sorted(all_selling_contracts, key=lambda x: x["option_yield"], reverse=True)
    buying_sorted = sorted(
        all_buying_contracts,
        key=lambda x: x["iv_hv_ratio"] if x["iv_hv_ratio"] is not None else 999)

    print(f"Selling contracts: {len(selling_sorted)}, Buying contracts: {len(buying_sorted)}")
    print()

    # Combined call scan: covered calls (selling) + long calls (buying)
    if option_no == 5:
        if stock_exchange == 0:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_cov_calls_nyse.json", 0, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_calls_nyse.json", 0, buying_sorted, buying_side=True)
        elif stock_exchange == 1:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_cov_calls_nasdaq.json", 1, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_calls_nasdaq.json", 1, buying_sorted, buying_side=True)
        elif stock_exchange == 2:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_cov_calls_arca.json", 2, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_calls_arca.json", 2, buying_sorted, buying_side=True)

    # Combined put scan: put options (selling) + long puts (buying)
    elif option_no == 6:
        if stock_exchange == 0:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_put_options_nyse.json", 0, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_puts_nyse.json", 0, buying_sorted, buying_side=True)
        elif stock_exchange == 1:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_put_options_nasdaq.json", 1, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_puts_nasdaq.json", 1, buying_sorted, buying_side=True)
        elif stock_exchange == 2:
            functions.write_best_options_to_json(OUTPUT_DIR / "best_put_options_arca.json", 2, selling_sorted)
            functions.write_best_options_to_json(OUTPUT_DIR / "best_long_puts_arca.json", 2, buying_sorted, buying_side=True)

    end_time = time.time()
    execution_time = end_time - start_time
    print("--- EXECUTION TIME ---")
    print(f"--> {execution_time:.3f} seconds")
    print(f"--> {execution_time / 60:.2f} minutes")


if __name__ == "__main__":
    total_start = time.time()
    for i, (exch, opt) in enumerate(SCANS, 1):
        print(f"\n{'='*74}")
        print(f"  Scan {i}/{len(SCANS)}: {option_type[opt]} — {exchanges[exch]}")
        print(f"{'='*74}")
        main(exch, opt)
    total_elapsed = time.time() - total_start
    print(f"\n{'='*74}")
    print(f"  All {len(SCANS)} scans complete — {total_elapsed/60:.1f} min total")
    print(f"{'='*74}")
