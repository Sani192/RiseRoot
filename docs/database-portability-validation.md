# Database Portability Validation

This document validates RiseRoot's database portability across PostgreSQL providers and defines the rules for keeping migrations portable.

## Portability target

RiseRoot targets standard PostgreSQL accessed through a `DATABASE_URL` connection string. The application should be deployable without code changes across managed PostgreSQL, self-hosted PostgreSQL, and PostgreSQL-compatible platforms that support the schema features listed below.

## Supported PostgreSQL providers

The following provider categories are supported when they expose a normal PostgreSQL connection string and required SQL features:

| Provider category               | Examples                                                                   | Support notes                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Managed app-platform PostgreSQL | Render PostgreSQL, Railway PostgreSQL, Heroku Postgres                     | Recommended for simple deployments; verify extension availability and connection limits.       |
| Serverless/branching PostgreSQL | Neon, Railway Postgres                                                     | Suitable if connection pooling and cold-start behavior are configured for the Next.js runtime. |
| Cloud-managed PostgreSQL        | AWS RDS/Aurora PostgreSQL, Google Cloud SQL, Azure Database for PostgreSQL | Suitable for production; requires explicit networking, SSL, backups, and IAM/firewall setup.   |
| Self-hosted PostgreSQL          | Docker, VM packages, Kubernetes operator                                   | Suitable when operations team owns backups, upgrades, monitoring, and security patching.       |

A provider is unsupported for production if it does not support required PostgreSQL semantics or requires application code branches for core persistence.

## Required PostgreSQL capabilities

The current schema and repositories expect:

- UUID columns and UUID generation through `gen_random_uuid()`.
- `pgcrypto` extension or equivalent UUID generation support.
- `timestamptz` for UTC instants.
- `date` for local-day domain values.
- `jsonb` and JSONB validation.
- GIN indexes for JSONB tag lookup.
- Foreign keys, including composite foreign keys.
- Check constraints.
- Partial unique indexes.
- `on conflict` upserts.
- Standard transaction and isolation behavior.

## Application portability controls

Portability is preserved by these design decisions:

- `DATABASE_URL` is the single required runtime database environment variable.
- Database initialization is centralized in the infrastructure layer.
- The app uses `postgres` and Drizzle rather than a provider-specific persistence SDK for core data access.
- SQL is isolated in repository modules and migrations.
- Domain and UI modules do not know which provider stores data.
- Environment validation fails fast when required server settings are missing.

## Migration portability

Migration files must remain executable through ordinary PostgreSQL tooling such as `psql`.

Migration rules:

1. Use portable PostgreSQL SQL by default.
2. Include `create extension if not exists pgcrypto;` when UUID generation depends on it.
3. Avoid provider-only extensions unless they are optional or guarded.
4. Avoid migrations that depend on a platform CLI.
5. Use explicit constraints and indexes rather than relying on application-only validation.
6. Preserve data before destructive changes.
7. Prefer additive, backward-compatible migrations for deploy safety.
8. Document any manual provider step in `docs/deployment-guide.md`.

## Migration validation workflow

For every new migration:

1. Apply it to a fresh local PostgreSQL database.
2. Apply it to an existing database with realistic data.
3. Run `npm run db:smoke`.
4. Run `DB_SMOKE_CONNECT=1 npm run db:smoke`.
5. Run repository/API tests that touch migrated tables.
6. Confirm a rollback or restore strategy exists.
7. Test at least one managed PostgreSQL provider before production promotion.

## Provider-specific considerations

### SSL

Some providers require SSL. Prefer provider connection-string parameters or platform networking configuration. Do not hardcode SSL behavior by provider name in application code unless a future adapter layer explicitly owns it.

### Connection pooling

Next.js server runtimes can create many database connections under scale. Providers with low connection limits should use pooling. Keep pooling configuration at the provider or connection-string level where possible.

### Extensions

`pgcrypto` is usually available but may require elevated permissions. Confirm extension creation during provisioning. If a provider cannot enable `pgcrypto`, introduce a portable application-side UUID strategy before using that provider.

### Branching and previews

Branching database providers can support preview environments. Each preview database must run the same migrations as production and must not share production user data unless explicitly approved.

## Portability acceptance criteria

A database provider is accepted for RiseRoot when:

- The migration applies cleanly from an empty database.
- Required constraints and indexes are created.
- `DATABASE_URL` works with the `postgres` package.
- `DB_SMOKE_CONNECT=1 npm run db:smoke` passes.
- API routes can read/write through repositories without provider-specific branches.
- Backup and restore are configured and tested.
- Timezone semantics for `date` and `timestamptz` match PostgreSQL expectations.

## Non-goals

- Supporting non-PostgreSQL databases without an explicit new adapter.
- Depending on provider-only database APIs for core persistence.
- Replacing migrations with manual dashboard changes.
- Allowing provider-specific SQL to leak into UI or domain modules.
