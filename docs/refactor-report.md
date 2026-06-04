# Refactor Report

This report summarizes the recent architecture refactor focused on timezone correctness and database portability.

## 1) Changed modules

### Timezone and schedule flow

- API day/note handlers now consistently parse timezone/date inputs and route conversions through shared helpers. (`src/app/api/days/route.ts`, `src/app/api/notes/route.ts`)
- Schedule/time conversion helpers are centralized and re-exported for feature usage. (`src/features/schedule-engine.ts`, `src/lib/schedule-engine.ts`)
- Calendar UI passes runtime timezone to server APIs to align local-day selection with backend derivation. (`src/app/calendar/page.tsx`)

### Data access and infrastructure

- Database bootstrap is centralized around a Drizzle + `postgres` client with required `DATABASE_URL`. (`src/lib/db/index.ts`)
- Environment contract is explicitly mapped to `DATABASE_URL`. (`src/lib/env.ts`)
- Repository and mapper boundaries isolate persistence rows from domain model shapes. (`src/repositories/index.ts`, `src/infrastructure/orm/drizzle-repositories.ts`)

## 2) Removed/isolated vendor couplings

- Vendor-specific persistence concerns were isolated behind repositories/mappers and ORM boundaries, reducing direct coupling in feature/UI modules. (`src/repositories/index.ts`, `src/infrastructure/orm/drizzle-repositories.ts`)
- DB provider selection is now primarily an environment concern via connection URL rather than application branching logic. (`src/lib/db/index.ts`, `src/lib/env.ts`)
- Existing legacy provider-oriented query modules remain available but are effectively separated from the newer Drizzle-centric core path. (`src/infrastructure/orm/drizzle-repositories.ts`, `src/lib/db/index.ts`)

## 3) Timezone correctness fixes

- Day-scoped note persistence now converts local date + timezone into canonical UTC day-start before write, and converts back for read responses. (`src/app/api/notes/route.ts`)
- Day endpoint derives default date in user-effective local timezone instead of raw server date assumptions. (`src/app/api/days/route.ts`)
- Schedule-engine tests explicitly cover DST transitions, midnight boundaries, and local↔UTC roundtrip correctness. (`src/features/__tests__/schedule-engine.edge-cases.test.ts`, `src/features/__tests__/schedule-engine.test.ts`)

## 4) Portability and maintainability improvements

- Centralized DB initialization simplifies cross-provider adoption and reduces duplicate setup code. (`src/lib/db/index.ts`)
- Explicit env contract (`DATABASE_URL`) improves deployment consistency across environments and hosting vendors. (`src/lib/env.ts`)
- Concentrating temporal logic in reusable helpers improves testability and prevents drift from copy-pasted date math across routes/components. (`src/features/schedule-engine.ts`, `src/lib/schedule-engine.ts`)
- Documented architecture and API contracts now align better with timezone-aware and provider-agnostic implementation direction. (`docs/architecture.md`, `docs/api-contracts.md`)

## 5) Follow-up recommendations

- Add migration-runbook docs for each deployment target.
- Expand contract tests for timezone edge cases across additional IANA regions.
- Define explicit deprecation timeline for any legacy vendor-specific query paths.
