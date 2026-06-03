# Options SaaS Platform — Project Overview

## 1. Project Description

This project is a full-stack SaaS platform for U.S. equity options analytics.
It helps users discover, filter, save, and monitor options strategies such as:

- Covered Calls
- Cash-Secured Puts
- Spread strategies

The platform ingests options market data and exposes analytics through a FastAPI backend and a React (Vite) frontend.

Users can:
- Authenticate via JWT
- Query and filter options strategies
- View tables of strategy opportunities
- Inspect contracts across exchanges
- Save screeners
- Maintain a personal watchlist
- Use a dashboard to review recent screeners and watchlist items
- Analyze opportunities through a responsive UI

The system is structured to evolve into a production SaaS analytics platform.

## 2. Users

The standard user is a retail options trader.  
Initially the system is expected to support a small number of users, with growth later into the hundreds.

## 3. Requirements

Core product requirements:
- Filtering and sorting options by several metrics
- Saving screeners, i.e. reusable searches with specific criteria
- Watchlist / favorites for individual option opportunities
- Dashboard / home overview
- Export results in JSON and XLSX format
- Refresh tokens
- Password reset
- Email verification
- Online payments in a later stage

Non-functional requirements:
- Security
- Performance
- Dockerization
- Staging and production environments
- Operational traceability for deploys and rollbacks

## 4. Additional Context

The product is being built incrementally in stages.
The current architecture and implementation already cover:
- authenticated user flows
- options analytics pages for three strategy types
- persistent user productivity features (saved screeners and watchlist)
- a first user dashboard
- staging deployment and smoke-test practices

## 5. Architecture

### Backend

Framework: FastAPI  
Language: Python  
Database: PostgreSQL  
Cache / Rate limiting: Redis  
Auth: JWT Bearer tokens

### Frontend

Framework: React + Vite  
Language: TypeScript  
Data layer: TanStack Query

## 6. Delivery Status Through Stage 4

### Stage 3 — Deployment, authentication maturity, and data operations
Stage 3 established the operational and account-management foundation of the platform.

Completed areas:
- Docker-based local development workflow
- Staging environment on Hetzner
- CI + image build/push + staging deployment workflows
- Refresh sessions
- Account lifecycle features:
  - password reset
  - email verification
- staging deployment runbook and smoke-test process
- production readiness checklist draft
- practical debugging of environment, CORS, image tagging, and migration issues
- repeated migration replay validation and deployment hardening

### Stage 4 — User productivity features
Stage 4 transformed the app from a browsing interface into a user workflow product.

#### 4.1 Saved Screeners
Completed:
- backend CRUD for saved screeners
- frontend save / apply / delete flow
- rename screener
- update existing screener config
- duplicate-name overwrite flow
- UI consistency polish

#### 4.2 Watchlist
Completed:
- backend CRUD for watchlist items
- add/remove watchlist actions from:
  - Covered Calls
  - Put Options
  - Spread Options
- dedicated Watchlist page
- watchlist UX polish

#### 4.3 Dashboard
Completed:
- Dashboard page
- counts for saved screeners and watchlist
- recent saved screeners section
- recent watchlist items section
- navigation update to make dashboard the default authenticated landing page
- dashboard polish and clearer structure

#### 4.4 Quality of life
Completed:
- clearer and more robust saved screener flows
- rename support
- update / overwrite support
- duplicate-name handling
- consistency improvements in feedback, empty states, and user messaging

## 7. Stage 5 Roadmap — Discovery, Explainability, and Platform Hardening

Stage 5 should deepen the product while also strengthening the platform beneath it.

### 5.1 Discovery
Goal: help users find the right opportunities faster.

#### 5.1.1 Advanced filtering and sorting
- richer numeric range filters
- better strategy-specific sort presets
- stronger filtering by liquidity / volatility / DTE / yield-related metrics

#### 5.1.2 Search in user productivity features
- search saved screeners by name
- search watchlist items by ticker / contract
- additional filtering within watchlist and saved screener pages

#### 5.1.3 Smarter cross-page navigation
- open a screener directly into its strategy page context
- open watchlist items with better page context
- improve dashboard-to-page flow

### 5.2 Explainability
Goal: make the analytics more trustworthy and easier to understand.

#### 5.2.1 Metric glossary and tooltips
- explain each major options metric
- provide lightweight definitions and interpretation hints

#### 5.2.2 Table interpretation guidance
- small help panels on strategy pages
- explain how to read and compare opportunities

#### 5.2.3 Data freshness visibility
- clearer last-updated indicators
- ingestion freshness visibility
- better trust signals around data recency

### 5.3 Platform hardening
Goal: make the system easier to operate, safer to evolve, and more production-ready.

#### 5.3.1 Data contract hardening
- canonical field contracts per strategy
- explicit required vs optional field policy
- stronger ingestion validation rules
- reduced schema / ingestion drift

#### 5.3.2 Ingestion automation
- reduce manual file copy / ingestion steps
- define repeatable update workflow for market data
- document and monitor ingestion status

#### 5.3.3 Observability and internal operations
- better visibility into ingestion state
- operational checks for data availability and row counts
- cleaner internal runbooks

#### 5.3.4 Testing maturity
- stronger contract tests
- migration replay validation
- end-to-end smoke coverage for major user flows

## 8. Architectural Guidance for Stage 5

Recommended priority order:
1. Advanced filtering and sorting
2. Metric glossary / explainability
3. Ingestion automation
4. Data-contract hardening
5. Stronger end-to-end and migration validation

This sequencing keeps user-facing value high while reducing long-term operational risk.
