# RiseRoot Architecture Plan

## Phase 1 Statement

Phase 1 is planning and skeleton only. The architecture described here establishes intended boundaries, modules, data shapes, route strategy, and implementation direction for RiseRoot, but it does not implement production business logic, production data persistence, production authentication, or production notification delivery.

## System Architecture

RiseRoot should use a layered architecture that keeps user interface code, application state, data access, and external integrations separate.

Planned layers:

1. Presentation layer: mobile-first screens, layouts, and reusable components.
2. Application layer: view models, hooks, actions, validators, and orchestration logic.
3. Domain layer: typed models for schedules, tasks, workouts, meals, logs, notes, and notifications.
4. Data layer: API clients, persistence adapters, cache management, and future offline storage.
5. Integration layer: notification services, calendar integrations, wearable integrations, and analytics in later phases.

Phase 1 should focus on folder structure, placeholder screens, mock data, model planning, and clear seams between layers.

## Frontend Architecture

The frontend should be organized around date-driven modules. The selected day is the primary context for most views.

Frontend responsibilities:

- Render the daily dashboard and feature screens.
- Manage selected-date state.
- Present skeleton data and placeholder interactions in Phase 1.
- Provide accessible, mobile-first components.
- Call backend/API routes through a dedicated client layer in future phases.
- Avoid embedding production business rules directly in presentational components.

Recommended frontend concepts:

- Route-level screens for dashboard, schedule, tasks, workout, logs, notes, meals, and settings.
- Feature folders for each product module.
- Shared UI primitives for cards, buttons, inputs, date navigation, status badges, and empty states.
- Typed domain models shared across UI, API planning, and tests where the stack allows.

## Backend and API Route Strategy

The backend/API layer should expose resource-oriented routes aligned to daily tracking modules.

Potential route groups:

- `/api/days` for daily summaries and selected-day aggregation.
- `/api/schedules` for schedule blocks.
- `/api/tasks` for task records and completion state.
- `/api/workouts` for workout plans, exercises, alternatives, and completion summaries.
- `/api/logs/weight` for weight entries.
- `/api/logs/wellbeing` for mood, energy, and stress entries.
- `/api/notes` for daily notes.
- `/api/meals` for meal suggestions and meal statuses.
- `/api/notifications/preferences` for reminder preferences.

API expectations:

- Keep route handlers thin.
- Validate request payloads at API boundaries.
- Route handlers should call application services rather than performing complex business logic inline.
- Use consistent response envelopes and error shapes.
- Design for authenticated user ownership, even if authentication is not implemented in Phase 1.
- Keep Phase 1 routes, if created, as stubs or mocks only.

## State Management Approach

State should be divided into local UI state, selected day state, server/cache state, and persisted user preferences.

State categories:

- Local UI state: open sheets, edit mode, form drafts, optimistic toggles, and temporary validation messages.
- Day context state: selected date, today shortcut, calendar range, and navigation direction.
- Server/cache state: schedules, tasks, workouts, logs, notes, meals, and notification preferences.
- Preference state: units, notification defaults, dietary preferences, and display settings.

State guidelines:

- Keep selected date globally available to day-based modules.
- Use derived selectors for dashboard summaries and progress counts.
- Avoid duplicating server state across unrelated stores.
- Isolate form draft state to the screen or component that owns editing.
- Plan for optimistic updates where completion interactions should feel instant.

## Rendering Strategy

RiseRoot should render initial screens quickly and progressively hydrate or fetch module data as needed.

Rendering expectations:

- Dashboard shell should appear quickly on mobile connections.
- Module cards should support loading, empty, error, and ready states.
- Date navigation should update the visible context immediately while data loads.
- Long lists should be virtualized only when needed.
- Production implementation should choose server rendering, static rendering, or client rendering based on framework capabilities and data sensitivity.

Phase 1 may use static placeholder content and skeleton screens to validate layout and navigation.

## Deployment Architecture

The deployment architecture should prioritize simple, repeatable releases early, while leaving room for services to evolve.

Planned deployment concerns:

- Web application hosting for the frontend.
- API route hosting in the same platform or a separate backend service.
- Managed database for persistent user data in later phases.
- Environment variable management for secrets and service URLs.
- Preview deployments for pull requests.
- Production monitoring and logging in later phases.

Phase 1 deployment, if any, should be a skeleton preview deployment without production data dependencies.

## Component Strategy

Components should be split by responsibility and reuse potential.

Component categories:

- Layout components: app shell, page container, dashboard grid, section header.
- Navigation components: tab bar, date navigator, calendar picker entry point.
- Feedback components: loading skeleton, empty state, error state, toast, progress ring.
- Form components: text input, number input, segmented control, rating selector, unit selector.
- Domain components: task card, schedule block, workout exercise row, meal card, wellbeing log card, note preview, notification preference row.

Component guidelines:

- Prefer small, composable components.
- Keep domain components aware of domain model shape but not API transport details.
- Keep visual primitives consistent across modules.
- Build for touch input first.
- Use semantic markup and accessibility labels.

## Mobile-First Strategy

RiseRoot is expected to be used frequently on mobile devices throughout the day.

Mobile-first requirements:

- Primary navigation should be reachable with one hand where possible.
- Core completion actions should have large touch targets.
- Dashboard cards should stack vertically on narrow screens.
- Important daily actions should appear before secondary analytics or settings.
- Inputs should use mobile-appropriate keyboards.
- Sheets and modals should avoid trapping users in long workflows.

Desktop layouts may expand dashboard sections into multi-column grids, but mobile should remain the baseline experience.

## Notification Strategy

Notifications should be planned as a dedicated module rather than scattered across features.

Notification concepts:

- Category definitions: task, workout, meal, hydration, wellbeing check-in, schedule block, daily review.
- Preference records: enabled state, default time, quiet hours, channel, and category-specific settings.
- Delivery adapters: in-app reminders in early phases, device push notifications in later phases.
- Scheduling service: future layer responsible for calculating and registering reminders.

Phase 1 does not deliver production notifications. It may define preference shapes, placeholder settings UI, and no-op scheduling interfaces.

## Offline Discussion

Offline support is valuable because daily tracking often happens away from reliable connectivity.

Future offline considerations:

- Local draft storage for notes and logs.
- Queued completion actions for tasks and workouts.
- Conflict resolution when the same day is edited on multiple devices.
- Last-known dashboard data for the current day.
- Clear sync status indicators.

Recommended direction:

- Start with explicit loading and error states.
- Add local draft protection for notes before full offline sync.
- Introduce a durable local queue only after API contracts and conflict rules are stable.

## Performance Strategy

Performance goals:

- Fast first load for the dashboard shell.
- Minimal JavaScript or client bundle growth from rarely used modules.
- Efficient date navigation without full app reloads.
- Optimistic completion interactions.
- Lazy loading for heavy screens, charts, and future analytics.

Performance practices:

- Keep shared components lightweight.
- Avoid over-fetching all historical data for every dashboard view.
- Cache selected-day data by date.
- Use pagination or date ranges for historical views.
- Measure before adding complex optimization layers.

## Scalability Considerations

Scalability should be addressed through clean domain boundaries before adding infrastructure complexity.

Considerations:

- User-owned records should be partitionable by user ID and date.
- Daily summary endpoints should aggregate module data efficiently.
- Historical trends should use bounded date ranges.
- Exercise and meal libraries may become shared reference data.
- Notification scheduling should be idempotent.
- Background jobs may be needed for recurring plan generation, reminders, and insights.
- API and database models should avoid assuming only one device per user.

## Database Schema Planning

Detailed table planning is maintained in [`docs/database-schema.md`](database-schema.md), including planned columns, keys, relationships, indexes, multi-user considerations, and future Row Level Security notes. Planned API contracts are maintained in [`docs/api-contracts.md`](api-contracts.md), including endpoint purpose, request and response shapes, validation strategy, error conventions, and future authentication and user-scoping notes. Phase 1 does not create production migrations or production API routes, but these schema and contract concepts should guide future implementation.

Core entities:

- `users`: account identity, preferences, and ownership root.
- `days`: optional daily aggregate keyed by user and date.
- `schedule_items`: date-specific timeline blocks and status.
- `tasks`: daily or recurring task definitions and completion state.
- `workouts`: planned workout sessions for a date.
- `workout_exercises`: exercises within a workout.
- `exercise_alternatives`: substitution candidates for an exercise.
- `exercise_logs`: completion details for performed exercises.
- `weight_logs`: body weight entries by date.
- `wellbeing_logs`: mood, energy, stress, and optional notes.
- `daily_notes`: date-specific free-form notes.
- `meal_suggestions`: suggested meals and metadata.
- `meal_statuses`: accepted, skipped, replaced, or completed meal states.
- `notification_preferences`: category settings and timing preferences.
- `notification_events`: scheduled, sent, dismissed, or snoozed reminder records in future phases.

Schema principles:

- Every user-owned table should include `user_id`.
- Date-based records should include a normalized local date.
- Mutable records should include `created_at` and `updated_at`.
- Status fields should use constrained enums or validated string unions.
- Deletions should be designed intentionally; soft deletes may be useful for sync and audit behavior.
- Sensitive health and wellbeing data should be protected by access controls and careful logging practices.

## API Contract Planning

Phase 1 should define expected contracts before production implementation.

Recommended response envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Recommended error shape:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A human-readable summary.",
    "fields": {}
  }
}
```

Representative contracts:

- `GET /api/days/:date`: returns daily aggregate data for dashboard rendering.
- `PATCH /api/tasks/:id`: updates task title, metadata, or status.
- `POST /api/tasks/:id/complete`: marks a task complete.
- `POST /api/tasks/:id/reopen`: reopens a completed task.
- `GET /api/workouts/:id`: returns workout details and exercises.
- `POST /api/workouts/:id/complete`: records workout completion summary.
- `POST /api/workout-exercises/:id/swap`: records an exercise alternative selection.
- `PUT /api/logs/weight/:date`: creates or updates the weight log for a date.
- `PUT /api/logs/wellbeing/:date`: creates or updates mood, energy, and stress logs.
- `PUT /api/notes/:date`: creates or updates a daily note.
- `GET /api/meals?date=YYYY-MM-DD`: returns meal suggestions for a date.
- `PUT /api/notifications/preferences`: updates reminder preferences.

Contract principles:

- Use ISO date strings for date parameters.
- Use stable IDs for mutable resources.
- Validate user ownership on every request in production.
- Keep completion and status transitions explicit.
- Return updated resources after mutations when useful for optimistic UI reconciliation.
- Version contracts if breaking changes are introduced after external clients exist.

## UI/UX Planning

UI/UX planning should validate daily usability before investing in complex automation.

Planning priorities:

- Map the full daily dashboard hierarchy.
- Define mobile navigation and screen transitions.
- Prototype completion interactions for tasks, workouts, meals, and logs.
- Establish empty, loading, error, and success states for every module.
- Define accessible color, typography, spacing, and touch target standards.
- Document copy tone for supportive progress tracking.
- Test whether users can complete core flows without training.

Design artifacts to create in future phases:

- Low-fidelity wireframes.
- Component inventory.
- Interaction prototypes.
- Data-state matrix.
- Accessibility checklist.
- Content style guide.

## Folder Structure

A future implementation may use a structure similar to the following. Names should be adapted to the selected framework.

```text
src/
  app/
    dashboard/
    schedule/
    tasks/
    workouts/
    logs/
    notes/
    meals/
    settings/
    api/
  components/
    ui/
    layout/
    feedback/
    forms/
  features/
    day-context/
    schedules/
    tasks/
    workouts/
    logs/
    notes/
    meals/
    notifications/
  domain/
    models/
    validators/
    constants/
  services/
    api-client/
    notifications/
    storage/
  state/
    stores/
    selectors/
  styles/
  tests/
```

Documentation may remain in:

```text
docs/
  functional-requirements.md
  architecture.md
  database-schema.md
```

## Implementation Guardrails

- Do not treat Phase 1 placeholder data as production logic.
- Do not hard-code future medical, fitness, or nutrition advice rules into UI components.
- Keep stubs, mocks, and no-op services clearly labeled.
- Prefer interfaces and typed models that can be replaced by real implementations later.
- Avoid irreversible architectural decisions until core flows are validated.
