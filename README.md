# RiseRoot

RiseRoot is a calm, mobile-first health routine tracker implemented as a Next.js application. It helps users review a daily plan, manage wellness tasks, log workouts and notes, inspect calendar history, and keep lightweight health records without turning self-care into a noisy productivity system.

## Current Implementation

The repository now contains a runnable application with implemented UI, API, data, and validation layers:

- **Next.js App Router application** in `src/app` with pages for the Today dashboard, onboarding, calendar, notes, settings, weight, and workouts.
- **API routes** under `src/app/api` for daily plans, tasks, workouts, logs, meal suggestions, notes, calendar history, and notification preferences.
- **PostgreSQL-backed data layer** using `DATABASE_URL`, the `postgres` driver, and Drizzle's Postgres adapter.
- **Repository layer** in `src/repositories` and `src/infrastructure/orm` that keeps feature code behind domain repository interfaces.
- **PostgreSQL schema migration** in `migrations/20260518000000_create_core_schema.sql`, including user-owned tables, indexes, constraints, and update triggers.
- **PWA metadata and install assets** through Next.js metadata in `src/app/layout.tsx` plus `public/manifest.webmanifest`, icons, Apple touch icon, and favicon.
- **Automated validation** through linting, TypeScript checks, Vitest tests, and database smoke checks.

## Product Overview

RiseRoot focuses on lightweight daily health routines such as hydration, movement, sleep preparation, mindfulness, medication reminders, notes, meals, workouts, mood, and weight. The product makes it easy for users to:

- Review a focused daily plan.
- Track daily tasks with minimal friction.
- Manage workouts, notes, logs, reminders, and meal suggestions.
- View calendar and history-oriented progress signals.
- Recover from missed days without shame or punitive language.
- Use the app comfortably on a phone as the primary device.

## Product Philosophy

RiseRoot should feel calming, minimal, and supportive:

- **Calming by default:** Use soft visual hierarchy, gentle copy, and reduced cognitive load.
- **Minimal interactions:** Favor short flows, obvious actions, and few decisions per screen.
- **Mobile-first:** Design for small screens before desktop layouts.
- **Health without pressure:** Avoid guilt-driven streak mechanics or harsh failure states.
- **Routine over optimization:** Help users repeat healthy actions rather than over-analyze performance.
- **Accessibility and clarity:** Prefer readable typography, strong contrast, semantic structure, and predictable navigation.

## Tech Stack

- **Next.js 15** with App Router for pages, layouts, metadata, and API route handlers.
- **React 19** and **TypeScript** for typed UI and application code.
- **Tailwind CSS** and local shadcn-style UI primitives for responsive, accessible components.
- **Framer Motion** for subtle interaction and transition animation.
- **Zod** for API input validation and structured response contracts.
- **PostgreSQL** as the provider-neutral relational database target.
- **postgres** plus **Drizzle ORM's Postgres adapter** for server-side database access.
- **Vitest**, Testing Library, ESLint, Prettier, and TypeScript for validation.

## Application Surfaces

### Pages

The app currently includes these App Router pages:

- `/` — Today overview dashboard.
- `/onboarding` — onboarding/mobile interaction flow.
- `/calendar` — calendar-oriented history view.
- `/notes` — notes interface.
- `/settings` — settings surface.
- `/weight` — weight tracking surface.
- `/workout` — workout surface.

### API routes

API responses use a common envelope shape with `data` or `error` plus request metadata. Route handlers validate query strings and request bodies with Zod before calling feature services and repositories.

| Route                            | Methods       | Purpose                                                          |
| -------------------------------- | ------------- | ---------------------------------------------------------------- |
| `/api/days`                      | `GET`         | Load daily plan data for a date.                                 |
| `/api/tasks`                     | `GET`, `POST` | List or upsert daily tasks.                                      |
| `/api/workouts`                  | `GET`, `POST` | List or upsert workouts.                                         |
| `/api/logs`                      | `GET`, `POST` | Read and create health logs such as mood/weight-related records. |
| `/api/meals`                     | `GET`         | Read meal suggestions.                                           |
| `/api/notes`                     | `GET`, `PUT`  | Read and update notes.                                           |
| `/api/calendar/history`          | `GET`         | Read calendar/history summaries.                                 |
| `/api/notifications/preferences` | `GET`, `PUT`  | Read and update notification preference state.                   |

See [`docs/api-contracts.md`](docs/api-contracts.md) for detailed request and response contracts.

## Database and Repository Layer

`DATABASE_URL` is the primary database configuration for all environments. It should point at any compatible PostgreSQL database: local Postgres, Render Postgres, Neon, Railway, Fly Postgres, or another managed PostgreSQL provider.

The implemented server-side path is:

1. API route validates input and resolves user identity.
2. Feature/service code applies date, aggregate, or persistence logic.
3. Domain repository interfaces describe the required persistence operations.
4. `src/repositories/index.ts` exports the active Drizzle-backed repository implementations.
5. `src/lib/db/index.ts` reads `DATABASE_URL`, creates a `postgres` client, and adapts it through Drizzle.

The schema migration creates the current core tables:

- `users`
- `daily_plans`
- `daily_tasks`
- `workouts`
- `exercises`
- `exercise_alternatives`
- `weight_logs`
- `mood_logs`
- `notes`
- `meal_suggestions`
- `reminders`

The migration also defines ownership-oriented foreign keys, indexes, status/value constraints, and `updated_at` triggers. For a provider-neutral explanation of portability expectations, see [`docs/database-portability.md`](docs/database-portability.md) and [`docs/database-portability-validation.md`](docs/database-portability-validation.md).

## PWA Metadata

RiseRoot includes install metadata but does not currently implement offline application caching:

- Next.js metadata advertises the app name, description, manifest, theme color, icons, and Apple web app settings.
- Static assets live in `public/` and are served at `/manifest.webmanifest`, `/favicon.svg`, `/icon-192.png`, `/icon-512.png`, and `/apple-touch-icon.png`.
- No service worker is registered, so offline support can be added later without coupling it to the current metadata and icon setup.

## Local Development

For the full local walkthrough, see [`docs/local-development-setup.md`](docs/local-development-setup.md).

### Requirements

- Node.js compatible with Next.js 15 and the package lock/dependency set.
- npm for the documented scripts.
- A PostgreSQL database reachable by `DATABASE_URL`.
- The schema from `migrations/20260518000000_create_core_schema.sql` applied to that database.
- A development user row in `public.users` when using `LOCAL_DEV_USER_ID` before production authentication is wired into every flow.

### Quick start

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd RiseRoot
   npm install
   ```

2. **Create local environment variables**

   ```bash
   cp .env.example .env.local
   ```

3. **Configure the database**

   Set `DATABASE_URL` to your PostgreSQL connection string:

   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/riseroot
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Apply the schema**

   Run the SQL in `migrations/20260518000000_create_core_schema.sql` against your PostgreSQL database.

5. **Bootstrap a local user when needed**

   For local development before a real authenticated session exists, insert or select one internal row in `public.users`, then set its id as a server-only value:

   ```bash
   LOCAL_DEV_USER_ID=<public.users.id>
   ```

   Never prefix this variable with `NEXT_PUBLIC_`, and never set it in production.

6. **Run the app**

   ```bash
   npm run dev
   ```

7. **Open the app**

   Visit `http://localhost:3000`.

## Environment Variables

Use `.env.example` as the source of truth for expected variables:

```bash
# Required server-only database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/riseroot

# Optional public app origin
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development-only server-side identity bootstrap
LOCAL_DEV_USER_ID=
```

Guidance:

- `DATABASE_URL` is required and is the provider-neutral source of truth for backend database connectivity.
- Variables prefixed with `NEXT_PUBLIC_` are bundled into client code, so they must contain only public-safe values.
- `NEXT_PUBLIC_APP_URL` should usually be `http://localhost:3000` locally and the canonical HTTPS origin in deployed environments.
- `LOCAL_DEV_USER_ID` is a server-only local/test bootstrap. Do not set it in production.
- Production startup rejects development-only identity variables such as `LOCAL_DEV_USER_ID`, legacy `RISEROOT_DEV_USER_ID`, and legacy `NEXT_PUBLIC_APP_USER_ID`.
- Never expose database credentials or identity bootstrap values in browser bundles or `NEXT_PUBLIC_` variables.
- Restart the Next.js dev server after changing environment variables.

## Validation and Smoke Checks

Common validation commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:smoke
```

`npm run db:smoke` verifies that the database modules used by `src/lib/db/index.ts` can load. To verify a live PostgreSQL connection, set `DATABASE_URL` and opt in to the connection probe:

```bash
DB_SMOKE_CONNECT=1 npm run db:smoke
```

This executes `SELECT 1` through the `postgres` client and Drizzle adapter. With the dev server running against the same environment, an API route check such as the following confirms route, repository, and database wiring:

```bash
curl "http://localhost:3000/api/tasks?date=2026-05-31"
```

See [`docs/final-production-validation.md`](docs/final-production-validation.md), [`docs/production-readiness.md`](docs/production-readiness.md), and [`docs/testing-strategy.md`](docs/testing-strategy.md) for broader validation guidance.

## Deployment

Deployment is intentionally provider-neutral at the application layer:

1. Provision a PostgreSQL database with a production `DATABASE_URL`.
2. Apply the database schema/migrations.
3. Configure server-only environment variables with the deployment provider.
4. Build with `npm run build`.
5. Start with `npm run start`.
6. Run smoke checks against the deployed environment.

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for the detailed deployment guide.

### Optional: Render deployment notes

Render is one supported hosting option, not a hard requirement.

- Create a Render web service connected to the repository.
- Set the build command to `npm run build`.
- Set the start command to `npm run start`.
- Add `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` in the Render environment settings.
- Add provider-specific variables only if that deployment uses the corresponding provider integration.
- Keep secrets in Render environment variables, not in source control.
- Do not configure `LOCAL_DEV_USER_ID` or other development-only identity variables in production.

## Documentation Index

- [Local development setup](docs/local-development-setup.md)
- [Deployment guide](docs/deployment-guide.md)
- [Database portability](docs/database-portability.md)
- [Database portability validation](docs/database-portability-validation.md)
- [Final production validation](docs/final-production-validation.md)
- [Architecture](docs/architecture.md)
- [Database schema](docs/database-schema.md)
- [API contracts](docs/api-contracts.md)
- [Testing strategy](docs/testing-strategy.md)
- [Production readiness](docs/production-readiness.md)

## Folder Structure Overview

```text
RiseRoot/
├── README.md
├── src/
│   ├── app/                    # Next.js App Router pages, layout, API routes, and globals
│   ├── components/             # Shared React components and UI primitives
│   ├── domain/                 # Domain types, repository contracts, and invariants
│   ├── features/               # Feature-level orchestration and schedule logic
│   ├── infrastructure/orm/     # Drizzle/Postgres repository implementations and mappers
│   ├── lib/                    # API helpers, DB connection, env checks, identity, and utilities
│   ├── repositories/           # Active repository exports used by application code
│   └── types/                  # Shared TypeScript types
├── migrations/                 # PostgreSQL schema migration SQL
├── public/                     # Manifest, icons, Apple touch icon, and favicon
├── docs/                       # Architecture, setup, deployment, validation, and product docs
├── scripts/                    # Utility scripts such as database smoke checks
├── package.json                # npm scripts and dependencies
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

## Future Work

Future phases may include:

- Production authentication and account lifecycle flows.
- Richer reminders and notification delivery.
- Offline-friendly check-ins and optimistic updates.
- Expanded analytics, calendar trends, and weekly reflections.
- Data export and account deletion flows.
- Production observability, monitoring, and alerting.
- Continued accessibility audits, usability testing, and security review.
