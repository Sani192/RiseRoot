# RiseRoot

RiseRoot is a Phase 1 product planning and application skeleton for a calm, mobile-first health routine tracker. The project is intended to help people define simple daily wellness routines, complete them consistently, and review progress without turning self-care into a noisy or stressful productivity system.

> **Phase 1 status:** This repository currently contains planning and skeleton guidance only. It does **not** include the full application logic, production-ready data flows, authentication flows, or complete user-facing feature implementation.

## Product Overview

RiseRoot focuses on lightweight daily health routines such as hydration, movement, sleep preparation, mindfulness, medication reminders, or other personal wellness habits. The product should make it easy for users to:

- Create a small set of meaningful health routines.
- Track daily completion with minimal friction.
- View gentle progress signals over time.
- Recover from missed days without shame or punitive language.
- Use the app comfortably on a phone as the primary device.

The long-term goal is to become a trusted daily companion for sustainable wellness routines while remaining intentionally simple.

## Product Philosophy

RiseRoot should feel calming, minimal, and supportive. The product direction for Phase 1 and beyond is guided by these principles:

- **Calming by default:** Use soft visual hierarchy, gentle copy, and reduced cognitive load.
- **Minimal interactions:** Favor short flows, obvious actions, and few decisions per screen.
- **Mobile-first:** Design for small screens before desktop layouts.
- **Health without pressure:** Avoid guilt-driven streak mechanics or harsh failure states.
- **Routine over optimization:** Help users repeat healthy actions rather than over-analyze performance.
- **Accessibility and clarity:** Prefer readable typography, strong contrast, semantic structure, and predictable navigation.

## Tech Stack

The planned Phase 1 stack is:

- **Next.js** for the application framework and routing.
- **TypeScript** for type-safe application code.
- **Tailwind CSS** for utility-first styling and responsive design.
- **shadcn/ui** for accessible, composable UI primitives.
- **Framer Motion** for subtle, calming interaction and transition animations.
- **Supabase PostgreSQL** for hosted relational data storage.
- **Render.com** for application deployment.

## Local Setup

Phase 1 is a skeleton, so exact commands may evolve as the application is scaffolded. A typical local setup should follow this shape:

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd RiseRoot
   ```

2. **Install dependencies**

   Use the package manager selected by the project once the Next.js app is scaffolded. For example:

   ```bash
   npm install
   ```

3. **Create a local environment file**

   ```bash
   cp .env.example .env.local
   ```

   Then set `DATABASE_URL` first (required for backend connectivity), then optionally add provider adapter variables. Keep privileged credentials server-only; never place them in `NEXT_PUBLIC_` variables.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app locally**

   Visit `http://localhost:3000` in a browser.

## Environment Variables

Environment variables should be stored locally in `.env.local` and configured in Render.com for deployed environments. Do not commit secrets to the repository.

Use `.env.example` as the source of truth for expected variables:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/riseroot
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional provider-specific adapter variables
NEXT_PUBLIC_SUPABASE_URL=<optional-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<optional-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<optional-server-only-supabase-key>
```

Guidance:

- `DATABASE_URL` is required and is the primary backend connectivity setting for local and cloud Postgres providers.
- Provider-specific variables (for example Supabase keys) are optional and should only be set when enabling that adapter.
- Variables prefixed with `NEXT_PUBLIC_` are bundled into client code, so they must contain only public-safe values.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code, browser bundles, or `NEXT_PUBLIC_` variables.
- For local development, `NEXT_PUBLIC_APP_URL` should usually be `http://localhost:3000`.
- Restart the Next.js dev server after changing environment variables.

### Database connectivity smoke check

After installing dependencies, run a lightweight module-load check to verify the runtime packages used by `src/lib/db/index.ts` are available:

```bash
npm run db:smoke
```

To verify a live Postgres connection for the configured environment, set `DATABASE_URL` and opt in to the connection probe:

```bash
DB_SMOKE_CONNECT=1 npm run db:smoke
```

This executes `SELECT 1` through the `postgres` client and Drizzle adapter. For a local API route check, run `npm run dev` with the same `DATABASE_URL` and call an API route that uses the Drizzle repositories, for example:

```bash
curl "http://localhost:3000/api/tasks?date=2026-05-31&userId=<existing-user-id>"
```

A successful response confirms that the route can load `src/lib/db/index.ts#getDb`, resolve both database modules, and reach the configured database.

## Supabase Database Migrations

The initial schema lives in `supabase/migrations/` and is designed for the Supabase free tier. It creates the documented ownership-ready tables for daily plans, tasks, workouts, exercises, logs, notes, meals, and reminders. Authentication and RLS policies are not required for this first migration, but every user-owned table includes a `user_id` column so policies can be added later without reshaping the data model.

Recommended free-tier setup:

1. Create a Supabase project from the Supabase dashboard.
2. Open **Project Settings → API** and copy the project URL and anon key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Apply migrations with one of these options:
   - **Dashboard SQL editor:** open `supabase/migrations/20260518000000_create_core_schema.sql`, paste it into the Supabase SQL editor, and run it once against the target project.
   - **Supabase CLI:** install or update the CLI, authenticate, link the project, and push migrations:

     ```bash
     supabase login
     supabase link --project-ref <your-project-ref>
     supabase db push
     ```

4. For early development without authentication, insert one internal row in `public.users` and reuse its `id` as the `user_id` on related records.
5. Keep separate Supabase projects for local/staging and production when possible. Run migrations against staging before production, and avoid committing service role keys or database passwords.
6. Before exposing real user data, enable Row Level Security and add policies that scope every user-owned table to the authenticated user's `user_id`.

## Architecture Overview

Phase 1 defines the intended application architecture rather than implementing every layer completely.

### Frontend

- Next.js routes should organize the main product surfaces such as landing, onboarding, dashboard, routine management, and progress review.
- React components should be small, reusable, and styled with Tailwind CSS.
- shadcn/ui components should provide accessible base primitives for forms, dialogs, buttons, cards, and navigation.
- Framer Motion should be used sparingly for gentle transitions, completion feedback, and screen changes.

### Data Layer

- Supabase PostgreSQL is planned as the source of truth for user profiles, routines, daily routine entries, and progress summaries.
- Client-side Supabase access should use the public anon key with row-level security enabled.
- Server-side actions or API routes may be added for trusted workflows that should not run directly in the browser.

### Authentication and Authorization

- Supabase Auth is the likely authentication provider for email-based or social sign-in flows.
- Row-level security policies should protect user-owned records.
- Phase 1 does not implement the complete authentication experience.

### Design System

- Tailwind theme tokens should support a soft, health-focused interface.
- Components should be optimized for mobile touch targets.
- Empty states, loading states, and error states should use supportive language.

## Deployment Approach

### Render.com

The planned deployment target for the Next.js application is Render.com.

Recommended approach:

1. Create a Render.com web service connected to the repository.
2. Configure the build command, for example `npm run build`.
3. Configure the start command, for example `npm run start`.
4. Add all required environment variables in Render.com.
5. Enable automatic deploys from the main production branch when appropriate.
6. Use preview environments or separate services for staging if needed.

#### Render.com environment variable setup

- In the Render service, open **Environment** and add `DATABASE_URL` and `NEXT_PUBLIC_APP_URL`.
- Add provider-specific variables (for example `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`) only when that adapter is enabled.
- Keep secrets in Render protected environment variables, not in source control.
- Use separate values for staging and production environments.

### PWA assets and static serving

RiseRoot includes a web app manifest and install icons in `public/`, which Next.js serves from the application root. The manifest is available at `/manifest.webmanifest`, and the app icons are available at `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png`, and `/favicon.svg`. These root-relative asset paths are compatible with Render.com static asset serving for a standard Next.js deployment and do not require custom routing, rewrites, or headers.

Offline support is intentionally out of scope for this phase. The project does not register a service worker or cache application routes, so PWA metadata and install assets can ship independently from any future offline strategy.

### Supabase

Supabase should host the PostgreSQL database and authentication services.

Recommended approach:

1. Create a Supabase project for local development or staging.
2. Create a separate Supabase project for production.
3. Define database schema migrations for users, routines, routine completions, and related metadata.
4. Enable row-level security on user-owned tables.
5. Keep `DATABASE_URL` configured per environment and rotate credentials as needed.
6. Store public client keys in `NEXT_PUBLIC_` variables and privileged keys only in secure server environments.
7. Document migration and seed workflows as they are introduced.

## Folder Structure Overview

The exact structure may change as the app is scaffolded, but the intended layout is:

```text
RiseRoot/
├── README.md                  # Phase 1 project overview and setup notes
├── app/                       # Next.js App Router routes and layouts
├── components/                # Shared React and shadcn/ui components
│   ├── ui/                    # shadcn/ui primitives
│   └── routines/              # Routine-specific UI components
├── lib/                       # Shared utilities, Supabase clients, helpers
├── styles/                    # Global styles and Tailwind CSS entry points
├── supabase/                  # Database migrations, policies, and seed files
├── public/                    # Static assets
├── docs/                      # Product notes, architecture docs, and roadmap details
├── package.json               # Project scripts and dependencies
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Phase 2 Roadmap

Phase 2 should move the project from planning and skeleton toward a usable product slice. Potential Phase 2 work includes:

- Scaffold the Next.js application with TypeScript and Tailwind CSS.
- Install and configure shadcn/ui.
- Define initial visual design tokens and mobile-first layouts.
- Create core screens for onboarding, dashboard, routine creation, and daily check-ins.
- Add Supabase client configuration.
- Design the initial PostgreSQL schema.
- Implement Supabase Auth basics.
- Add row-level security policies for user-owned routine data.
- Build basic routine CRUD flows.
- Build daily completion tracking.
- Add initial loading, empty, and error states.
- Configure Render.com deployment.

## Future Roadmap

Future phases may include:

- Gentle progress insights and weekly reflections.
- Optional reminders and notification preferences.
- Routine templates for common health goals.
- Offline-friendly check-ins and optimistic updates.
- Calendar and trend visualizations.
- Accessibility audits and usability testing.
- Expanded personalization for tone, schedule, and routine categories.
- Data export and account deletion flows.
- Production observability, analytics, and error monitoring.
- Security review of authentication, row-level security, and server-only workflows.

## Phase 1 Scope Reminder

Phase 1 is intentionally limited to planning, documentation, product direction, and application skeleton decisions. The repository should not be treated as a complete or production-ready health tracking application yet. Full feature implementation, database migrations, authentication, deployment automation, and polished user experience are planned for later phases.
