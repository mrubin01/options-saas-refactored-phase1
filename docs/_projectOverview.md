# Options SaaS Platform — Project Overview

## 1. Project Description: the overall domain problem the system is trying to solve

This project is a full‑stack SaaS platform for U.S. equity options analytics.
It allows users to discover and filter options strategies such as:

- Covered Calls
- Cash‑Secured Puts
- Spread strategies

The platform ingests options market data and exposes analytics through a FastAPI backend and a React (Vite) frontend.

Users can:
- Authenticate via JWT
- Query and filter options strategies
- View tables of strategy opportunities
- Inspect contracts across exchanges
- Analyze opportunities through a responsive UI

The system is structured to evolve into a production SaaS analytics platform.


## 2. Users 

The standard user is supposed to be a retail option trader: initially a few users, at a later stage potentially hundreds. 


## 3. Requirements

Users will have the chance of filtering options on the basis of several metrics and sorting them accordingly, of saving screeners, IE. searches with specific criteria, exporting results in json and xlsx format.

Refresh tokens, password reset, email verification

Accept online payments.

Security and performance both relevant.

Dockerization.

Staging and production environment. 


## 4. Additional context: implicit knowledge of the problem domain


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

