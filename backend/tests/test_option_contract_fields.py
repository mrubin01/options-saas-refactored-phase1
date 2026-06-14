import importlib
import inspect
from typing import Any

from pydantic import BaseModel

from app.models.covered_call import CoveredCall
from app.models.put_option import PutOption
from app.models.spread_option import SpreadOption


COMMON_OPTION_CONTRACT_FIELDS = {
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
}

DEPRECATED_FIELD_NAMES = {
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
}

STRATEGY_MODEL_CONTRACTS = [
    ("covered_calls", CoveredCall),
    ("put_options", PutOption),
    ("spread_options", SpreadOption),
]

STRATEGY_SCHEMA_MODULES = [
    ("covered_calls", "app.schemas.v1.covered_call"),
    ("put_options", "app.schemas.v1.put_option"),
    ("spread_options", "app.schemas.v1.spread_option"),
]


def get_model_column_names(model: Any) -> set[str]:
    return set(model.__table__.columns.keys())


def get_pydantic_schema_classes(module_path: str) -> list[type[BaseModel]]:
    module = importlib.import_module(module_path)

    schema_classes: list[type[BaseModel]] = []

    for _, value in inspect.getmembers(module, inspect.isclass):
        if value is BaseModel:
            continue

        if issubclass(value, BaseModel) and value.__module__ == module.__name__:
            schema_classes.append(value)

    return schema_classes


def get_schema_field_names(schema_class: type[BaseModel]) -> set[str]:
    return set(schema_class.__fields__.keys())


def test_option_models_expose_stable_contract_fields():
    for strategy_name, model in STRATEGY_MODEL_CONTRACTS:
        model_columns = get_model_column_names(model)

        missing_fields = COMMON_OPTION_CONTRACT_FIELDS - model_columns
        deprecated_fields = DEPRECATED_FIELD_NAMES & model_columns

        assert not missing_fields, (
            f"{strategy_name} model is missing contract fields: "
            f"{sorted(missing_fields)}"
        )

        assert not deprecated_fields, (
            f"{strategy_name} model contains deprecated field names: "
            f"{sorted(deprecated_fields)}"
        )


def test_option_response_schemas_expose_stable_contract_fields():
    for strategy_name, module_path in STRATEGY_SCHEMA_MODULES:
        schema_classes = get_pydantic_schema_classes(module_path)

        assert schema_classes, f"No Pydantic schemas found in {module_path}"

        matching_schemas = []

        for schema_class in schema_classes:
            schema_fields = get_schema_field_names(schema_class)

            if COMMON_OPTION_CONTRACT_FIELDS.issubset(schema_fields):
                matching_schemas.append(schema_class.__name__)

        assert matching_schemas, (
            f"{strategy_name} has no response schema exposing all stable "
            f"contract fields. Checked schemas: "
            f"{[schema.__name__ for schema in schema_classes]}"
        )


def test_option_schemas_do_not_expose_deprecated_field_names():
    for strategy_name, module_path in STRATEGY_SCHEMA_MODULES:
        schema_classes = get_pydantic_schema_classes(module_path)

        for schema_class in schema_classes:
            schema_fields = get_schema_field_names(schema_class)
            deprecated_fields = DEPRECATED_FIELD_NAMES & schema_fields

            assert not deprecated_fields, (
                f"{strategy_name} schema {schema_class.__name__} exposes "
                f"deprecated field names: {sorted(deprecated_fields)}"
            )
