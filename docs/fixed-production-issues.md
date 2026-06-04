# Fixed Production Issues

This document lists production issues that have been addressed, their root causes, the files involved, the fix, and the architectural impact.

## 1. Missing required server environment validation

- **Root cause:** The app previously allowed runtime paths to proceed without a clear required server environment contract.
- **Changed files:** `src/lib/env.ts`, `src/lib/db/index.ts`, `src/lib/env.test.ts`.
- **Fix:** Added centralized environment key definitions, required `DATABASE_URL` validation, and actionable missing-variable errors.
- **Architectural impact:** Infrastructure configuration is now explicit and fail-fast, reducing hidden deployment drift.

## 2. Development identity could leak into production

- **Root cause:** Development identity values were not fully separated from production authentication expectations.
- **Changed files:** `src/lib/env.ts`, `src/lib/identity/authentication.ts`, `src/lib/identity/session.ts`, `src/lib/env.test.ts`.
- **Fix:** Added production startup rejection for `LOCAL_DEV_USER_ID`, `RISEROOT_DEV_USER_ID`, and `NEXT_PUBLIC_APP_USER_ID`; kept local fallback server-only.
- **Architectural impact:** Production identity is now forced through authenticated server-side resolution instead of public or local test values.

## 3. Cross-user access risk at API boundaries

- **Root cause:** User identifiers supplied by clients can be unsafe unless checked against authenticated identity.
- **Changed files:** `src/lib/identity/authentication.ts`, `src/app/api/days/route.ts`, `src/app/api/notes/route.ts`, `src/app/api/tasks/route.ts`, `src/app/api/workouts/route.ts`, `src/app/api/meals/route.ts`, `src/app/api/logs/route.ts`, `src/app/api/calendar/history/route.ts`, `src/app/api/notifications/preferences/route.ts`.
- **Fix:** Added authenticated user resolution and `assertAuthorizedUserId` checks so client-supplied user IDs cannot access another user's records.
- **Architectural impact:** Ownership enforcement moved into a reusable API boundary pattern.

## 4. Inconsistent API error and response shapes

- **Root cause:** Route handlers needed a consistent way to parse input, surface validation errors, and return JSON.
- **Changed files:** `src/lib/api/errors.ts`, `src/lib/api/response.ts`, `src/lib/api/validation.ts`, `src/app/api/*/route.ts`.
- **Fix:** Added shared API error types, response wrappers, JSON parsing helpers, and Zod validation schemas.
- **Architectural impact:** API routes are thinner and more uniform, enabling contract tests and safer client integration.

## 5. Database provider coupling through direct legacy provider-oriented paths

- **Root cause:** Core persistence was historically planned around provider-specific utilities, which made provider portability unclear.
- **Changed files:** `src/lib/db/index.ts`, `src/infrastructure/orm/drizzle-repositories.ts`, `src/infrastructure/orm/drizzle-repositories.ts`, `src/repositories/index.ts`, `scripts/db-smoke.mjs`.
- **Fix:** Introduced centralized Drizzle/postgres initialization, repository implementations, and a database smoke script based on `DATABASE_URL`.
- **Architectural impact:** Core data access is now PostgreSQL-provider neutral and can run on Render, Railway, Neon, RDS, Cloud SQL, or self-hosted PostgreSQL.

## 6. Timezone-dependent local date derivation

- **Root cause:** Deriving a day from the server runtime date risks incorrect results for users near UTC midnight or on servers in unexpected timezones.
- **Changed files:** `src/lib/date/index.ts`, `src/lib/date/date-boundaries.test.ts`, `src/app/api/days/route.ts`, `src/app/api/notes/route.ts`, `src/app/calendar/page.tsx`.
- **Fix:** Centralized date conversion helpers, required IANA timezone validation, and derived API defaults from the effective user/request timezone.
- **Architectural impact:** Day-scoped product behavior is now aligned with user-local calendar semantics instead of server-local assumptions.

## 7. DST and local boundary schedule risks

- **Root cause:** Schedule generation and day bucketing can break when fixed offsets are assumed or DST boundaries are not tested.
- **Changed files:** `src/features/schedule-engine.ts`, `src/lib/schedule-engine/index.ts`, `src/features/__tests__/schedule-engine.test.ts`, `src/features/__tests__/schedule-engine.edge-cases.test.ts`.
- **Fix:** Consolidated schedule/time helpers and added tests for DST transitions, local-midnight boundaries, and local/UTC roundtrips.
- **Architectural impact:** Temporal logic is testable as domain behavior rather than duplicated in UI or route code.

## 8. Completion timestamp inconsistency

- **Root cause:** Status fields and completion timestamps could drift if completion rules were implemented separately for each entity.
- **Changed files:** `src/domain/status-timestamp-invariants.ts`, `src/features/__tests__/daily-and-logic.test.ts`, `src/infrastructure/orm/drizzle-repositories.ts`.
- **Fix:** Centralized completion timestamp normalization and applied it to task and workout repository writes.
- **Architectural impact:** Domain invariants are enforced before persistence, reducing inconsistent task/workout states.

## 9. Repository row/domain shape drift

- **Root cause:** Database rows use snake_case while domain models use application-oriented naming; direct mapping at call sites increases drift.
- **Changed files:** `src/infrastructure/orm/drizzle-repositories.ts`, `src/infrastructure/orm/drizzle-repositories.ts`, `src/infrastructure/orm/__tests__/drizzle-repositories.test.ts`, `src/infrastructure/orm/__tests__/drizzle-repositories.postgres.test.ts`.
- **Fix:** Added repository mapper boundaries and tests around repository behavior.
- **Architectural impact:** Persistence concerns are isolated from domain and presentation code, making schema evolution safer.

## 10. Missing database connectivity verification

- **Root cause:** There was no lightweight command to distinguish dependency loading, client construction, and live database connectivity.
- **Changed files:** `scripts/db-smoke.mjs`, `package.json`.
- **Fix:** Added `npm run db:smoke`, with optional `DB_SMOKE_CONNECT=1` live `select 1` execution.
- **Architectural impact:** Local, CI, staging, and production environments can verify database readiness without starting the whole app.

## 11. Static production-readiness documentation was outdated

- **Root cause:** Earlier documentation reflected a Phase 1 skeleton and did not fully describe the newer API, database, timezone, and deployment posture.
- **Changed files:** `docs/final-production-validation.md`, `docs/local-development-setup.md`, `docs/deployment-guide.md`, `docs/database-portability-validation.md`, `docs/timezone-validation-final.md`, `docs/fixed-production-issues.md`.
- **Fix:** Added final validation, setup, deployment, portability, timezone, and fixed-issue documentation.
- **Architectural impact:** Operational knowledge is now part of the repository, making deployment and validation repeatable across providers.
