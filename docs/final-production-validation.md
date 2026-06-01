# Final Production Validation

## Readiness assessment

RiseRoot is **conditionally ready for a controlled production deployment or closed beta**, provided the deployment uses a real PostgreSQL database, production authentication, managed secrets, and the operational checks in this document.

The application has moved beyond the earlier skeleton-only posture in the following areas:

- Server API routes validate inputs with Zod and return consistent response/error envelopes.
- Runtime identity resolution requires an authenticated user or an explicitly local-only development user.
- Production startup rejects development-only identity environment variables.
- Data access is centralized behind repositories and a Drizzle/postgres connection created from `DATABASE_URL`.
- Core date and timezone helpers are centralized and covered by tests for local date boundaries and DST-sensitive schedule behavior.
- The database schema is represented as versioned PostgreSQL migration SQL.

Production readiness remains conditional because provider operations, observability, backups, and authentication configuration must be completed outside the repository for each environment.

## Local setup validation

Validate a local environment before deploying from the same commit:

1. Install dependencies with `npm install`.
2. Create `.env.local` with at least:
   - `DATABASE_URL=postgres://...`
   - `LOCAL_DEV_USER_ID=<uuid>` for local-only API testing.
3. Apply the SQL in `supabase/migrations/20260518000000_create_core_schema.sql` to the local PostgreSQL database.
4. Run the database smoke check:
   - `npm run db:smoke` verifies the runtime can load the PostgreSQL and Drizzle packages.
   - `DB_SMOKE_CONNECT=1 npm run db:smoke` executes `select 1` against `DATABASE_URL`.
5. Run validation commands:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
6. Start the application with `npm run dev` and verify day, notes, workout, weight, calendar, and settings routes render without server-side environment errors.

A local environment is valid only if it exercises the same `DATABASE_URL` contract used in production. Do not depend on browser-only identity values or `NEXT_PUBLIC_*` user identifiers.

## Portability validation

The application is designed to be portable across standard PostgreSQL providers.

Validated portability assumptions:

- The application-level database contract is `DATABASE_URL`.
- The database client is instantiated centrally through `postgres` and `drizzle-orm/postgres-js`.
- Repository modules keep SQL usage at the data boundary instead of spreading provider-specific queries through UI code.
- The migration is plain PostgreSQL SQL and avoids a platform-specific deployment SDK.
- UUID generation uses PostgreSQL `gen_random_uuid()`, which requires the `pgcrypto` extension. This is broadly available on managed PostgreSQL providers, but it must be enabled by migration or provider setup.

Provider portability checklist:

- Confirm the provider supports PostgreSQL 15+ or a compatible version.
- Confirm the provider supports `pgcrypto` and `gen_random_uuid()`.
- Confirm JSONB, GIN indexes, partial unique indexes, check constraints, foreign keys, and `timestamptz` are supported.
- Confirm the connection string format works with the `postgres` npm package.
- Confirm SSL requirements are expressed in the connection string or provider connection settings without application code changes.
- Apply migrations through the provider CLI, `psql`, CI, or a migration runner before starting application traffic.

## Timezone validation

RiseRoot's final timezone model is:

- Persist absolute instants in UTC.
- Persist day-scoped dates as canonical `date` values where the domain entity is truly day-based.
- Accept and validate IANA timezone names at API boundaries.
- Derive default local dates from the effective timezone rather than the server timezone.
- Convert for display and schedule generation at API/UI boundaries, not by duplicating ad-hoc date math in components.

Timezone validation scenarios before release:

| Scenario                                                           | Expected result                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| User in `UTC` requests today's plan without a date                 | API derives the current UTC local date.                                               |
| User in `America/New_York` near midnight UTC requests today's plan | API derives the user's New York calendar date, not the server date.                   |
| User in `America/Los_Angeles` writes and reads a daily note        | The same local `YYYY-MM-DD` is returned after persistence.                            |
| DST spring-forward day                                             | Schedule generation avoids fixed-offset assumptions and keeps day bucket correctness. |
| DST fall-back day                                                  | Repeated local wall-time behavior is deterministic and covered by schedule tests.     |
| Historical date                                                    | Rendering uses IANA timezone rules for that date rather than the current offset.      |

## Architecture validation

Production architecture is considered valid when these boundaries are preserved:

- **Presentation layer:** route components and UI components render state and call API/client helpers; they should not own persistence rules.
- **API layer:** route handlers authenticate users, validate input, normalize request data, and delegate to services/repositories.
- **Service/domain layer:** business aggregation, date interpretation, and invariant enforcement happen in shared modules.
- **Repository layer:** persistence SQL and row-to-domain mapping are isolated in repository implementations.
- **Infrastructure layer:** database initialization and environment validation remain centralized.

Key production invariants:

- No `NEXT_PUBLIC_*` identity variable may grant production access.
- `LOCAL_DEV_USER_ID`, `RISEROOT_DEV_USER_ID`, and `NEXT_PUBLIC_APP_USER_ID` must be absent in production.
- All API access must resolve an authenticated user and must reject cross-user access.
- Database migrations must be applied exactly once per environment and tracked through release operations.
- UI features that appear durable must route through API/repository flows or be clearly labeled as non-production placeholders.

## Remaining risks

| Risk                                                                              | Severity | Mitigation                                                                                                                          |
| --------------------------------------------------------------------------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| Production authentication configuration is environment-dependent.                 |     High | Configure Supabase auth or another server-verified bearer-token source; test unauthenticated and cross-user failures before launch. |
| Migration execution is not automated in repository scripts.                       |     High | Add CI/CD migration step or an explicit release runbook for the chosen provider.                                                    |
| Observability and incident response are not defined in code.                      |   Medium | Add provider logs, request tracing, uptime checks, and error aggregation before public launch.                                      |
| Backup/restore validation is provider-specific.                                   |   Medium | Enable automated backups and perform at least one restore drill before launch.                                                      |
| Some product screens may still contain placeholder or partially integrated flows. |   Medium | Gate or label incomplete flows; verify each launched workflow persists and reloads correctly.                                       |
| Connection pooling needs provider-specific tuning under load.                     |   Medium | Use provider pooling or PgBouncer-compatible settings; load test before opening traffic.                                            |

## Deployment readiness

A deployment is ready to receive controlled production traffic only after all of the following are true:

- `DATABASE_URL` is configured as a secret in the target platform.
- Production does not set any local/dev identity variables.
- Authentication tokens are verified server-side.
- The core schema migration has been applied to the production database.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass from a clean checkout.
- `DB_SMOKE_CONNECT=1 npm run db:smoke` passes against the production or staging database from an approved network path.
- The deployment platform injects `NEXT_PUBLIC_APP_URL` and any optional public Supabase variables appropriate for the environment.
- Backups, restore procedure, logs, monitoring, and rollback steps are documented for the selected provider.
- A smoke test confirms API authentication, day aggregation, notes read/write, and core page rendering after deployment.

Final verdict: **Ready for controlled deployment after environment, migration, authentication, backup, and smoke-test gates are satisfied.**
