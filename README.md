# options-saas

Basic project structure:

options-saas/
 ├── backend/
 ├── frontend/
 ├── ingestion/
 ├── database/
 ├── shared/
 └── README.md

```
options-saas-refactored-phase1
├─ DEPLOYMENT_CONTAINERS.md
├─ README.md
├─ backend
│  ├─ Dockerfile
│  ├─ README.md
│  ├─ __init__.py
│  ├─ alembic
│  │  ├─ README
│  │  ├─ env.py
│  │  ├─ script.py.mako
│  │  └─ versions
│  │     ├─ 20260323_add_refresh_sessions.py
│  │     ├─ 20260329_add_account_lifecycle.py
│  │     ├─ 20260414_expand_covered_calls_fields.py
│  │     ├─ 20260418_expand_put_options_fields.py
│  │     ├─ 20260419_expand_spread_options_fields.py
│  │     ├─ 20260517_expand_covered_calls_fields.py
│  │     ├─ 522f47e06099_initial_schema.py
│  │     ├─ add_saved_screeners_001.py
│  │     ├─ add_watchlist_items_001.py
│  │     ├─ cc_days_to_exp_20260418.py
│  │     ├─ cc_schema_v2_20260418.py
│  │     ├─ e78a2ced7291_name_exchange_foreign_keys.py
│  │     ├─ po_days_to_exp_20260418.py
│  │     ├─ po_schema_v2_20260418.py
│  │     └─ so_schema_v2_20260418.py
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ __init__.py
│  │  ├─ api
│  │  │  ├─ __init__.py
│  │  │  ├─ v1
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ auth.py
│  │  │  │  ├─ covered_calls.py
│  │  │  │  ├─ health.py
│  │  │  │  ├─ metrics.py
│  │  │  │  ├─ put_options.py
│  │  │  │  ├─ router.py
│  │  │  │  ├─ saved_screeners.py
│  │  │  │  ├─ spread_options.py
│  │  │  │  └─ watchlist.py
│  │  │  └─ v2
│  │  │     ├─ __init__.py
│  │  │     ├─ auth.py
│  │  │     ├─ covered_calls.py
│  │  │     ├─ put_options.py
│  │  │     ├─ router.py
│  │  │     └─ spread_options.py
│  │  ├─ auth
│  │  │  ├─ deps.py
│  │  │  ├─ jwt.py
│  │  │  └─ security.py
│  │  ├─ bootstrap.py
│  │  ├─ core
│  │  │  ├─ __init__.py
│  │  │  ├─ cache.py
│  │  │  ├─ config.py
│  │  │  ├─ error_codes.py
│  │  │  ├─ errors
│  │  │  │  └─ validation.py
│  │  │  ├─ exceptions.py
│  │  │  ├─ exceptions_auth.py
│  │  │  ├─ handlers
│  │  │  │  ├─ rate_limit.py
│  │  │  │  └─ unexpected_exception.py
│  │  │  ├─ metrics.py
│  │  │  ├─ middleware
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ headers.py
│  │  │  │  ├─ logging.py
│  │  │  │  ├─ metrics.py
│  │  │  │  ├─ no_cache.py
│  │  │  │  ├─ request_context.py
│  │  │  │  ├─ request_id.py
│  │  │  │  ├─ request_logging.py
│  │  │  │  ├─ unwrap_exception_group.py
│  │  │  │  └─ version.py
│  │  │  ├─ paths.py
│  │  │  ├─ rate_limit.py
│  │  │  ├─ response.py
│  │  │  ├─ security
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ cookies.py
│  │  │  │  ├─ env_validation.py
│  │  │  │  ├─ rate_limit.py
│  │  │  │  ├─ rate_policies.py
│  │  │  │  └─ request_info.py
│  │  │  ├─ sentry.py
│  │  │  └─ serialize.py
│  │  ├─ db
│  │  │  ├─ __init__.py
│  │  │  ├─ database.py
│  │  │  ├─ init_db.py
│  │  │  ├─ reset_db.py
│  │  │  └─ seed.py
│  │  ├─ main.py
│  │  ├─ models
│  │  │  ├─ __init__.py
│  │  │  ├─ auth_token.py
│  │  │  ├─ covered_call.py
│  │  │  ├─ exchange.py
│  │  │  ├─ industry.py
│  │  │  ├─ put_option.py
│  │  │  ├─ refresh_session.py
│  │  │  ├─ saved_screener.py
│  │  │  ├─ sector.py
│  │  │  ├─ spread_option.py
│  │  │  ├─ trend.py
│  │  │  ├─ user.py
│  │  │  └─ watchlist_item.py
│  │  ├─ schemas
│  │  │  ├─ __init__.py
│  │  │  ├─ api.py
│  │  │  ├─ user.py
│  │  │  └─ v1
│  │  │     ├─ covered_call.py
│  │  │     ├─ put_option.py
│  │  │     ├─ saved_screener.py
│  │  │     ├─ spread_option.py
│  │  │     └─ watchlist_item.py
│  │  └─ services
│  │     ├─ __init__.py
│  │     ├─ auth_sessions.py
│  │     ├─ auth_tokens.py
│  │     ├─ covered_calls.py
│  │     ├─ put_options.py
│  │     ├─ saved_screeners_service.py
│  │     ├─ spread_options.py
│  │     └─ watchlist_service.py
│  ├─ cookies.txt
│  ├─ docker-entrypoint.sh
│  ├─ environment.yml
│  ├─ ingestion
│  │  ├─ base.py
│  │  ├─ covered_calls.py
│  │  ├─ put_options.py
│  │  ├─ spread_options.py
│  │  └─ utils.py
│  ├─ requirements.txt
│  └─ tests
│     ├─ __snapshots__
│     │  └─ test_contracts.ambr
│     ├─ conftest.py
│     ├─ test_api_contracts.py
│     ├─ test_contracts.py
│     ├─ test_saved_screeners.py
│     └─ test_watchlist.py
├─ database
├─ deploy
├─ docker-compose.yml
├─ docs
│  ├─ production-readiness-checklist.md
│  ├─ projectOverview.md
│  ├─ staging-deploy.md
│  └─ staging-smoke-test-checklist.md
├─ frontend
│  ├─ Dockerfile
│  ├─ README.md
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ nginx.conf
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ api
│  │  │  ├─ auth.ts
│  │  │  ├─ client.ts
│  │  │  ├─ coveredCalls.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ hooks
│  │  │  │  ├─ useCoveredCalls.ts
│  │  │  │  ├─ usePutOptions.ts
│  │  │  │  └─ useSpreadOptions.ts
│  │  │  ├─ http.ts
│  │  │  ├─ optionsQuery.ts
│  │  │  ├─ putOptions.ts
│  │  │  ├─ queryKeys.ts
│  │  │  ├─ savedScreeners.ts
│  │  │  ├─ spreadOptions.ts
│  │  │  └─ watchlist.ts
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ auth
│  │  │  ├─ AuthContext.tsx
│  │  │  ├─ RequireAuth.tsx
│  │  │  └─ tokenStore.ts
│  │  ├─ components
│  │  │  ├─ ApiStatus.tsx
│  │  │  ├─ Layout.tsx
│  │  │  ├─ Navigation.tsx
│  │  │  ├─ OptionsFilters.tsx
│  │  │  ├─ OptionsTable.tsx
│  │  │  ├─ PageHeader.tsx
│  │  │  └─ SavedScreenersPanel.tsx
│  │  ├─ constants
│  │  │  └─ exchanges.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ AccountPage.tsx
│  │  │  ├─ CoveredCallsPage.tsx
│  │  │  ├─ DashboardPage.tsx
│  │  │  ├─ ForgotPasswordPage.tsx
│  │  │  ├─ LoginPage.tsx
│  │  │  ├─ PutOptionsPage.tsx
│  │  │  ├─ RegisterPage.tsx
│  │  │  ├─ ResetPasswordPage.tsx
│  │  │  ├─ SpreadOptionsPage.tsx
│  │  │  ├─ VerifyEmailPage.tsx
│  │  │  └─ WatchlistPage.tsx
│  │  ├─ providers
│  │  │  └─ AppProviders.tsx
│  │  ├─ types
│  │  │  ├─ coveredCall.ts
│  │  │  ├─ filters.ts
│  │  │  ├─ optionRow.ts
│  │  │  ├─ putOption.ts
│  │  │  ├─ savedScreener.ts
│  │  │  ├─ spreadOption.ts
│  │  │  └─ watchlistItem.ts
│  │  ├─ utils
│  │  │  ├─ lastUpdated.ts
│  │  │  ├─ strategyLabels.ts
│  │  │  └─ useDebouncedValue.ts
│  │  └─ vite-env.d.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ ingestion
└─ shared
   └─ data
      ├─ best_cov_calls_arca.json
      ├─ best_cov_calls_nasdaq.json
      ├─ best_cov_calls_nyse.json
      ├─ best_put_options_arca.json
      ├─ best_put_options_nasdaq.json
      ├─ best_put_options_nyse.json
      ├─ best_spreads_arca.json
      ├─ best_spreads_nasdaq.json
      └─ best_spreads_nyse.json

```