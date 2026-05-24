# Database Portability

This document describes how RiseRoot keeps its persistence layer portable across PostgreSQL providers while using Drizzle as the ORM boundary.

## 1) Supported Postgres providers

RiseRoot targets **standards-compliant PostgreSQL** deployments, including:

- local Docker/Postgres for development
- managed Postgres offerings (for example Supabase Postgres, Neon, Railway Postgres, Render Postgres, RDS/Aurora Postgres, Cloud SQL Postgres)

Portability principle: provider choice should be an infrastructure concern, not an application rewrite.

## 2) Drizzle-based architecture

The codebase uses Drizzle as the primary typed database interface over a `postgres` client.

- Database bootstrap reads `DATABASE_URL` and creates a shared Drizzle client. (`src/lib/db/index.ts`)
- Environment mapping keeps `DATABASE_URL` as the required canonical variable. (`src/lib/env.ts`)
- ORM mappers and repositories isolate row-shape conversions and domain models, reducing direct provider coupling. (`src/infrastructure/orm/mappers.ts`, `src/repositories/index.ts`)

Design goals:

- Keep SQL/data access in infrastructure/repository boundaries.
- Keep domain modules independent of provider-specific SQL extensions.
- Centralize connection policy in one place.

## 3) Migration strategy and provider-agnostic assumptions

### Migration strategy

- Maintain schema through deterministic, versioned migrations (Drizzle migration workflow).
- Run migrations in CI/CD before serving new application versions.
- Keep reversible roll-forward/roll-back playbooks for critical releases.
- Avoid data transforms hidden in app startup; explicit migration scripts only.

### Provider-agnostic assumptions

To stay portable, schema and queries should assume only common PostgreSQL behavior:

- Prefer standard PostgreSQL types (`uuid`, `text`, `boolean`, `integer`, `timestamptz`, `jsonb`).
- Avoid provider-specific extensions unless gated and documented.
- Default ordering/filter logic should not depend on non-standard collation behavior.
- Keep timezone semantics in application/domain helpers and UTC storage policy.
- Keep id generation strategy deterministic and provider-neutral.

## 4) Environment strategy centered on `DATABASE_URL`

`DATABASE_URL` is the single required runtime contract.

- Required: `DATABASE_URL` for every environment (dev, preview, prod). (`src/lib/db/index.ts`, `src/lib/env.ts`)
- Optional: provider-specific tuning variables may exist, but must not replace `DATABASE_URL` as the app contract.
- Secrets management should inject `DATABASE_URL` through environment configuration, never hardcode connection strings.

Operational guidance:

- Keep one app artifact deployable to many providers by swapping only environment configuration.
- Validate `DATABASE_URL` at startup and fail fast with actionable errors.
- Document SSL/connection-pool differences per provider as deployment notes rather than code forks.

## 5) Portability checklist

- `DATABASE_URL` is present and validated.
- Drizzle client initialization is centralized.
- Migrations are versioned, tested, and automated.
- Query surface avoids provider-specific SQL unless explicitly abstracted.
- UTC storage and timezone conversion policies are preserved across providers.
