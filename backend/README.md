
```
backend
├─ .DS_Store
├─ .env
├─ .env.example
├─ .pytest_cache
│  ├─ CACHEDIR.TAG
│  ├─ README.md
│  └─ v
│     └─ cache
│        ├─ lastfailed
│        └─ nodeids
├─ __init__.py
├─ __pycache__
│  └─ __init__.cpython-311.pyc
├─ alembic
│  ├─ README
│  ├─ __pycache__
│  │  └─ env.cpython-311.pyc
│  ├─ env.py
│  ├─ script.py.mako
│  └─ versions
│     ├─ 522f47e06099_initial_schema.py
│     ├─ __pycache__
│     │  ├─ 2a09055d1b69_initial_full_schema.cpython-311.pyc
│     │  ├─ 522f47e06099_initial_schema.cpython-311.pyc
│     │  ├─ 78fa906b97dc_remove_duplicate_exchange_foreign_keys.cpython-311.pyc
│     │  ├─ 8d8c4fd0a251_add_exchange_foreign_keys.cpython-311.pyc
│     │  ├─ 95199af90bb3_index_exchange_columns.cpython-311.pyc
│     │  ├─ 96b68bf3d54c_add_not_null_constraints_to_options_.cpython-311.pyc
│     │  ├─ e78a2ced7291_name_exchange_foreign_keys.cpython-311.pyc
│     │  ├─ f56ce0a674e3_add_indexes_to_options_tables.cpython-311.pyc
│     │  └─ fe8a562beb7c_initial_schema.cpython-311.pyc
│     └─ e78a2ced7291_name_exchange_foreign_keys.py
├─ alembic.ini
├─ app
│  ├─ .DS_Store
│  ├─ __init__.py
│  ├─ __pycache__
│  │  ├─ __init__.cpython-311.pyc
│  │  └─ main.cpython-311.pyc
│  ├─ api
│  │  ├─ __init__.py
│  │  ├─ __pycache__
│  │  │  ├─ __init__.cpython-311.pyc
│  │  │  └─ health.cpython-311.pyc
│  │  ├─ v1
│  │  │  ├─ __init__.py
│  │  │  ├─ __pycache__
│  │  │  │  ├─ __init__.cpython-311.pyc
│  │  │  │  ├─ auth.cpython-311.pyc
│  │  │  │  ├─ covered_calls.cpython-311.pyc
│  │  │  │  ├─ health.cpython-311.pyc
│  │  │  │  ├─ metrics.cpython-311.pyc
│  │  │  │  ├─ put_options.cpython-311.pyc
│  │  │  │  ├─ router.cpython-311.pyc
│  │  │  │  └─ spread_options.cpython-311.pyc
│  │  │  ├─ auth.py
│  │  │  ├─ covered_calls.py
│  │  │  ├─ health.py
│  │  │  ├─ metrics.py
│  │  │  ├─ put_options.py
│  │  │  ├─ router.py
│  │  │  └─ spread_options.py
│  │  └─ v2
│  │     ├─ __init__.py
│  │     ├─ __pycache__
│  │     │  ├─ __init__.cpython-311.pyc
│  │     │  └─ router.cpython-311.pyc
│  │     ├─ auth.py
│  │     ├─ covered_calls.py
│  │     ├─ put_options.py
│  │     ├─ router.py
│  │     └─ spread_options.py
│  ├─ auth
│  │  ├─ __pycache__
│  │  │  ├─ deps.cpython-311.pyc
│  │  │  ├─ jwt.cpython-311.pyc
│  │  │  └─ security.cpython-311.pyc
│  │  ├─ deps.py
│  │  ├─ jwt.py
│  │  └─ security.py
│  ├─ core
│  │  ├─ __init__.py
│  │  ├─ __pycache__
│  │  │  ├─ __init__.cpython-311.pyc
│  │  │  ├─ cache.cpython-311.pyc
│  │  │  ├─ config.cpython-311.pyc
│  │  │  ├─ error_codes.cpython-311.pyc
│  │  │  ├─ errors.cpython-311.pyc
│  │  │  ├─ exceptions.cpython-311.pyc
│  │  │  ├─ logging.cpython-311.pyc
│  │  │  ├─ metrics.cpython-311.pyc
│  │  │  ├─ middleware.cpython-311.pyc
│  │  │  ├─ paths.cpython-311.pyc
│  │  │  ├─ rate_limit.cpython-311.pyc
│  │  │  ├─ request_id.cpython-311.pyc
│  │  │  ├─ response.cpython-311.pyc
│  │  │  ├─ security.cpython-311.pyc
│  │  │  ├─ sentry.cpython-311.pyc
│  │  │  └─ serialize.cpython-311.pyc
│  │  ├─ cache.py
│  │  ├─ config.py
│  │  ├─ error_codes.py
│  │  ├─ errors
│  │  │  ├─ __pycache__
│  │  │  │  └─ validation.cpython-311.pyc
│  │  │  └─ validation.py
│  │  ├─ exceptions.py
│  │  ├─ exceptions_auth.py
│  │  ├─ handlers
│  │  │  ├─ __pycache__
│  │  │  │  ├─ rate_limit.cpython-311.pyc
│  │  │  │  └─ unexpected_exception.cpython-311.pyc
│  │  │  ├─ rate_limit.py
│  │  │  └─ unexpected_exception.py
│  │  ├─ metrics.py
│  │  ├─ middleware
│  │  │  ├─ __init__.py
│  │  │  ├─ __pycache__
│  │  │  │  ├─ __init__.cpython-311.pyc
│  │  │  │  ├─ logging.cpython-311.pyc
│  │  │  │  ├─ metrics.cpython-311.pyc
│  │  │  │  ├─ no_cache.cpython-311.pyc
│  │  │  │  ├─ request_context.cpython-311.pyc
│  │  │  │  ├─ request_id.cpython-311.pyc
│  │  │  │  ├─ request_logging.cpython-311.pyc
│  │  │  │  ├─ unwrap_exception_group.cpython-311.pyc
│  │  │  │  └─ version.cpython-311.pyc
│  │  │  ├─ logging.py
│  │  │  ├─ metrics.py
│  │  │  ├─ no_cache.py
│  │  │  ├─ request_context.py
│  │  │  ├─ request_id.py
│  │  │  ├─ request_logging.py
│  │  │  ├─ unwrap_exception_group.py
│  │  │  └─ version.py
│  │  ├─ paths.py
│  │  ├─ rate_limit.py
│  │  ├─ response.py
│  │  ├─ security
│  │  │  ├─ __init__.py
│  │  │  ├─ __pycache__
│  │  │  │  ├─ __init__.cpython-311.pyc
│  │  │  │  ├─ rate_limit.cpython-311.pyc
│  │  │  │  ├─ rate_policies.cpython-311.pyc
│  │  │  │  └─ request_info.cpython-311.pyc
│  │  │  ├─ rate_limit.py
│  │  │  ├─ rate_policies.py
│  │  │  └─ request_info.py
│  │  ├─ sentry.py
│  │  └─ serialize.py
│  ├─ db
│  │  ├─ .DS_Store
│  │  ├─ __init__.py
│  │  ├─ __pycache__
│  │  │  ├─ __init__.cpython-311.pyc
│  │  │  ├─ database.cpython-311.pyc
│  │  │  └─ reset_db.cpython-311.pyc
│  │  ├─ database.py
│  │  ├─ init_db.py
│  │  ├─ models
│  │  ├─ reset_db.py
│  │  └─ seed.py
│  ├─ main.py
│  ├─ models
│  │  ├─ .DS_Store
│  │  ├─ __init__.py
│  │  ├─ __pycache__
│  │  │  ├─ __init__.cpython-311.pyc
│  │  │  ├─ covered_call.cpython-311.pyc
│  │  │  ├─ exchange.cpython-311.pyc
│  │  │  ├─ industry.cpython-311.pyc
│  │  │  ├─ put_option.cpython-311.pyc
│  │  │  ├─ sector.cpython-311.pyc
│  │  │  ├─ spread_option.cpython-311.pyc
│  │  │  ├─ trend.cpython-311.pyc
│  │  │  └─ user.cpython-311.pyc
│  │  ├─ covered_call.py
│  │  ├─ exchange.py
│  │  ├─ industry.py
│  │  ├─ put_option.py
│  │  ├─ sector.py
│  │  ├─ spread_option.py
│  │  ├─ trend.py
│  │  └─ user.py
│  ├─ schemas
│  │  ├─ __init__.py
│  │  ├─ __pycache__
│  │  │  ├─ __init__.cpython-311.pyc
│  │  │  ├─ api.cpython-311.pyc
│  │  │  ├─ covered_call.cpython-311.pyc
│  │  │  ├─ put_option.cpython-311.pyc
│  │  │  ├─ response.cpython-311.pyc
│  │  │  ├─ spread_option.cpython-311.pyc
│  │  │  └─ user.cpython-311.pyc
│  │  ├─ api.py
│  │  ├─ user.py
│  │  └─ v1
│  │     ├─ __pycache__
│  │     │  ├─ covered_call.cpython-311.pyc
│  │     │  ├─ put_option.cpython-311.pyc
│  │     │  └─ spread_option.cpython-311.pyc
│  │     ├─ covered_call.py
│  │     ├─ put_option.py
│  │     └─ spread_option.py
│  └─ services
│     ├─ __init__.py
│     ├─ __pycache__
│     │  ├─ __init__.cpython-311.pyc
│     │  ├─ covered_calls.cpython-311.pyc
│     │  ├─ put_options.cpython-311.pyc
│     │  └─ spread_options.cpython-311.pyc
│     ├─ covered_calls.py
│     ├─ put_options.py
│     └─ spread_options.py
├─ environment.yml
├─ ingestion
│  ├─ base.py
│  ├─ covered_calls.py
│  ├─ put_options.py
│  ├─ spread_options.py
│  └─ utils.py
├─ logfile
└─ tests
   ├─ __pycache__
   │  ├─ conftest.cpython-311-pytest-9.0.2.pyc
   │  ├─ test_api_contracts.cpython-311-pytest-9.0.2.pyc
   │  └─ test_contracts.cpython-311-pytest-9.0.2.pyc
   ├─ __snapshots__
   │  └─ test_contracts.ambr
   ├─ conftest.py
   ├─ test_api_contracts.py
   └─ test_contracts.py

```