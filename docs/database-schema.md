# RiseRoot Database Schema Planning

## Scope and Phase Notes

This document describes the planned relational database schema for RiseRoot. It is a planning artifact only: Phase 1 and the initial Phase 2 may use mock data, local state, or API stubs rather than production migrations.

The `users` table should still exist as an internal ownership root even though user authentication is not implemented in Phase 1 or initial Phase 2. Early development can seed a single internal user record and attach all user-owned rows to that record. This avoids rewriting data models later when authentication, multi-device sync, or Row Level Security (RLS) are introduced.

## General Schema Principles

- Use UUID primary keys for application-owned records unless the final database platform recommends another globally unique identifier type.
- Include `created_at` and `updated_at` on mutable tables.
- Include `user_id` on every user-owned table, even before real authentication is available.
- Store day-scoped data with a `plan_date` or `logged_on` `date` column using the user's local date.
- Prefer constrained enum-like strings for statuses and categories in early migrations, with database-level constraints added once values are stable.
- Treat weight, mood, notes, workouts, and meals as sensitive personal data and avoid logging raw values in application telemetry.

## Ownership Assumptions

- Baseline migrations should keep user ownership explicit on all user-owned tables (`users`, `daily_plans`, `daily_tasks`, `workouts`, `exercises`, `exercise_alternatives`, `weight_logs`, `mood_logs`, `notes`, `meal_suggestions`, and `reminders`).
- API routes and repositories must scope reads and writes by the authenticated internal user id before returning or mutating user-owned rows.
- `user_id` is intentionally denormalized across child tables to keep ownership checks simple, predictable, and performant in queries.
- Cross-table ownership consistency should be enforced by composite foreign keys (for example `(user_id, parent_id)` patterns) so application-level authorization does not rely on joins for baseline safety.
- The `exercise_alternatives` "selected alternative" uniqueness should align with ownership strategy by scoping uniqueness to `(user_id, exercise_id)` for rows where `is_selected = true`.
- Administrative workflows are outside baseline end-user access paths and should be documented separately when introduced.

## Table Summary

| Table                   | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `users`                 | Internal account and ownership root for all user-owned data.   |
| `daily_plans`           | One daily planning container per user and local date.          |
| `daily_tasks`           | Tasks attached to a daily plan.                                |
| `workouts`              | Workout sessions planned or completed for a day.               |
| `exercises`             | Exercises within a workout.                                    |
| `exercise_alternatives` | Suggested substitutions for a workout exercise.                |
| `weight_logs`           | User weight entries by local date/time.                        |
| `mood_logs`             | Mood, energy, stress, and wellbeing check-ins.                 |
| `notes`                 | Free-form dated notes.                                         |
| `reminders`             | In-app or future push reminder definitions and delivery state. |
| `meal_suggestions`      | Suggested meals and user response state for a day.             |

## `users`

### Purpose

Stores the internal user identity and profile/preferences root. This table is required from the beginning as an internal anchor for ownership, even when Phase 1 and initial Phase 2 do not implement sign-up, sign-in, sessions, or external authentication providers.

### Columns and Types

| Column         | Type          | Notes                                                                  |
| -------------- | ------------- | ---------------------------------------------------------------------- |
| `id`           | `uuid`        | Stable internal user identifier.                                       |
| `display_name` | `text`        | Optional user-facing name.                                             |
| `email`        | `text`        | Nullable until authentication exists; should be unique when populated. |
| `timezone`     | `text`        | IANA timezone used for local dates and reminders.                      |
| `unit_system`  | `text`        | Suggested values: `imperial`, `metric`.                                |
| `created_at`   | `timestamptz` | Creation timestamp.                                                    |
| `updated_at`   | `timestamptz` | Last profile/preference update timestamp.                              |

### Primary Key

- `id`.

### Foreign Keys

- None.

### Relationships

- One `users` row has many `daily_plans`, `daily_tasks`, `workouts`, `weight_logs`, `mood_logs`, `notes`, `reminders`, and `meal_suggestions` rows.
- In early phases, the app can use one seeded internal user while preserving the same relationships production authentication will need.

### Suggested Indexes

- Unique index on `email` where `email is not null`.
- Index on `created_at` for administrative reporting if needed.

### Future Multi-User Considerations

- Add authentication-provider mapping fields or a separate `user_identities` table when sign-in is implemented.
- Keep user-owned tables partitionable and queryable by `user_id`.
- Consider account deletion and export workflows before production launch because this table anchors sensitive health and wellbeing data.

### Future Row Level Security Considerations

- Enable RLS before exposing production user data.
- Allow users to select and update only their own `users` row.
- Service roles may need elevated access for account bootstrap, support, deletion, and data export jobs.

## `daily_plans`

### Purpose

Represents a user's plan for a specific local date and acts as the daily aggregation point for tasks, workouts, notes, reminders, and meal suggestions.

### Columns and Types

| Column       | Type          | Notes                                                         |
| ------------ | ------------- | ------------------------------------------------------------- |
| `id`         | `uuid`        | Stable daily plan identifier.                                 |
| `user_id`    | `uuid`        | Owner.                                                        |
| `plan_date`  | `date`        | User-local date for the plan.                                 |
| `status`     | `text`        | Suggested values: `draft`, `active`, `completed`, `archived`. |
| `summary`    | `text`        | Optional generated or user-edited daily summary.              |
| `created_at` | `timestamptz` | Creation timestamp.                                           |
| `updated_at` | `timestamptz` | Last update timestamp.                                        |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.

### Relationships

- Many `daily_plans` belong to one `users` row.
- One `daily_plans` row has many `daily_tasks`, `workouts`, `notes`, `reminders`, and `meal_suggestions` rows.

### Suggested Indexes

- Unique index on `(user_id, plan_date)`.
- Index on `(user_id, status, plan_date)` for dashboard and history queries.

### Future Multi-User Considerations

- Always scope daily plan lookup by both `user_id` and `plan_date`.
- Do not assume a globally unique date; every user can have their own plan for the same date.
- Timezone changes may require careful handling of future plans and reminder schedules.

### Future Row Level Security Considerations

- Permit access only when `daily_plans.user_id` matches the authenticated user.
- Child-table policies can validate ownership through either direct `user_id` columns or joins to `daily_plans`.

## `daily_tasks`

### Purpose

Stores actionable task items for a daily plan, including completion state and ordering.

### Columns and Types

| Column          | Type          | Notes                                                            |
| --------------- | ------------- | ---------------------------------------------------------------- |
| `id`            | `uuid`        | Stable task identifier.                                          |
| `user_id`       | `uuid`        | Owner.                                                           |
| `daily_plan_id` | `uuid`        | Parent daily plan.                                               |
| `title`         | `text`        | Required task label.                                             |
| `description`   | `text`        | Optional detail.                                                 |
| `status`        | `text`        | Suggested values: `todo`, `in_progress`, `completed`, `skipped`. |
| `priority`      | `integer`     | Optional priority or rank.                                       |
| `sort_order`    | `integer`     | Display order within a plan.                                     |
| `due_at`        | `timestamptz` | Optional due date/time.                                          |
| `completed_at`  | `timestamptz` | Null until completed.                                            |
| `created_at`    | `timestamptz` | Creation timestamp.                                              |
| `updated_at`    | `timestamptz` | Last update timestamp.                                           |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.

### Relationships

- Many `daily_tasks` belong to one `daily_plans` row.
- Many `daily_tasks` belong to one `users` row.
- A task can have zero or many related `reminders`.

### Suggested Indexes

- Index on `(user_id, daily_plan_id, sort_order)` for rendering a day's task list.
- Index on `(user_id, status, due_at)` for upcoming and incomplete task queries.

### Future Multi-User Considerations

- Keep `user_id` denormalized on the task for efficient ownership checks and RLS.
- If shared plans are introduced, add an explicit collaborators table rather than overloading `user_id`.

### Future Row Level Security Considerations

- Permit access only when `daily_tasks.user_id` matches the authenticated user.
- Add validation to ensure `daily_tasks.user_id` matches the parent `daily_plans.user_id`.

## `workouts`

### Purpose

Stores a planned or completed workout session for a user and day.

### Columns and Types

| Column          | Type          | Notes                                                                    |
| --------------- | ------------- | ------------------------------------------------------------------------ |
| `id`            | `uuid`        | Stable workout identifier.                                               |
| `user_id`       | `uuid`        | Owner.                                                                   |
| `daily_plan_id` | `uuid`        | Optional parent daily plan.                                              |
| `name`          | `text`        | Workout name.                                                            |
| `workout_type`  | `text`        | Suggested values: `strength`, `cardio`, `mobility`, `recovery`, `mixed`. |
| `status`        | `text`        | Suggested values: `planned`, `in_progress`, `completed`, `skipped`.      |
| `scheduled_at`  | `timestamptz` | Optional planned time.                                                   |
| `started_at`    | `timestamptz` | Actual start time.                                                       |
| `completed_at`  | `timestamptz` | Actual completion time.                                                  |
| `notes`         | `text`        | Optional workout-level notes.                                            |
| `created_at`    | `timestamptz` | Creation timestamp.                                                      |
| `updated_at`    | `timestamptz` | Last update timestamp.                                                   |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.

### Relationships

- Many `workouts` belong to one `users` row.
- Many `workouts` can belong to one `daily_plans` row.
- One `workouts` row has many `exercises` and can have zero or many `reminders`.

### Suggested Indexes

- Index on `(user_id, daily_plan_id)` for daily dashboard aggregation.
- Index on `(user_id, status, scheduled_at)` for upcoming and incomplete workout queries.
- Index on `(user_id, completed_at)` for workout history.

### Future Multi-User Considerations

- Workout templates could later become shared or system-owned; workout session records should remain user-owned.
- Avoid storing only plan-date data on workouts because users may complete sessions across date boundaries.

### Future Row Level Security Considerations

- Permit access only when `workouts.user_id` matches the authenticated user.
- For future shared templates, keep template access policies separate from user workout session policies.

## `exercises`

### Purpose

Stores exercises prescribed or performed within a workout, including target and actual performance details.

### Columns and Types

| Column                    | Type           | Notes                                                                     |
| ------------------------- | -------------- | ------------------------------------------------------------------------- |
| `id`                      | `uuid`         | Stable exercise row identifier.                                           |
| `user_id`                 | `uuid`         | Owner.                                                                    |
| `workout_id`              | `uuid`         | Parent workout.                                                           |
| `name`                    | `text`         | Exercise name.                                                            |
| `category`                | `text`         | Suggested values: `strength`, `cardio`, `mobility`, `warmup`, `cooldown`. |
| `target_sets`             | `integer`      | Optional planned sets.                                                    |
| `target_reps`             | `integer`      | Optional planned reps.                                                    |
| `target_duration_seconds` | `integer`      | Optional planned duration.                                                |
| `target_weight`           | `numeric(8,2)` | Optional planned load.                                                    |
| `actual_sets`             | `integer`      | Optional completed sets.                                                  |
| `actual_reps`             | `integer`      | Optional completed reps.                                                  |
| `actual_duration_seconds` | `integer`      | Optional completed duration.                                              |
| `actual_weight`           | `numeric(8,2)` | Optional completed load.                                                  |
| `sort_order`              | `integer`      | Display order within workout.                                             |
| `status`                  | `text`         | Suggested values: `planned`, `completed`, `skipped`, `swapped`.           |
| `notes`                   | `text`         | Optional exercise-level notes.                                            |
| `created_at`              | `timestamptz`  | Creation timestamp.                                                       |
| `updated_at`              | `timestamptz`  | Last update timestamp.                                                    |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `workout_id` references `workouts(id)`.

### Relationships

- Many `exercises` belong to one `workouts` row.
- One `exercises` row can have many `exercise_alternatives`.

### Suggested Indexes

- Index on `(user_id, workout_id, sort_order)` for workout detail rendering.
- Index on `(user_id, name)` for exercise history and autocomplete.

### Future Multi-User Considerations

- If a global exercise library is added, keep library exercises separate from user-specific workout exercise rows.
- Personal records and history should remain scoped by `user_id`.

### Future Row Level Security Considerations

- Permit access only when `exercises.user_id` matches the authenticated user.
- Add validation to ensure `exercises.user_id` matches the parent `workouts.user_id`.

## `exercise_alternatives`

### Purpose

Stores suggested substitutions for a specific workout exercise, including whether the user selected one.

### Columns and Types

| Column             | Type          | Notes                                                |
| ------------------ | ------------- | ---------------------------------------------------- |
| `id`               | `uuid`        | Stable alternative identifier.                       |
| `user_id`          | `uuid`        | Owner.                                               |
| `exercise_id`      | `uuid`        | Exercise being substituted.                          |
| `alternative_name` | `text`        | Suggested alternative exercise name.                 |
| `reason`           | `text`        | Optional rationale, such as equipment or difficulty. |
| `equipment_needed` | `text`        | Optional equipment description.                      |
| `difficulty`       | `text`        | Suggested values: `easier`, `similar`, `harder`.     |
| `is_selected`      | `boolean`     | Whether this alternative was chosen.                 |
| `selected_at`      | `timestamptz` | Selection timestamp.                                 |
| `created_at`       | `timestamptz` | Creation timestamp.                                  |
| `updated_at`       | `timestamptz` | Last update timestamp.                               |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `exercise_id` references `exercises(id)`.

### Relationships

- Many `exercise_alternatives` belong to one `exercises` row.
- Many `exercise_alternatives` belong to one `users` row through direct ownership and the parent exercise.

### Suggested Indexes

- Index on `(user_id, exercise_id)` for retrieving alternatives.
- Partial unique index on `(exercise_id)` where `is_selected = true` if only one selected alternative should be allowed.

### Future Multi-User Considerations

- Shared alternative libraries should be modeled separately from user-owned recommendations and selections.
- Selection history can be used for personalization but must remain user-scoped.

### Future Row Level Security Considerations

- Permit access only when `exercise_alternatives.user_id` matches the authenticated user.
- Add validation to ensure the alternative owner matches the parent `exercises.user_id`.

## `weight_logs`

### Purpose

Stores body weight entries and optional context for trend tracking.

### Columns and Types

| Column         | Type           | Notes                                             |
| -------------- | -------------- | ------------------------------------------------- |
| `id`           | `uuid`         | Stable log identifier.                            |
| `user_id`      | `uuid`         | Owner.                                            |
| `logged_on`    | `date`         | User-local date of the entry.                     |
| `logged_at`    | `timestamptz`  | Exact timestamp if available.                     |
| `weight_value` | `numeric(6,2)` | Recorded weight.                                  |
| `weight_unit`  | `text`         | Suggested values: `lb`, `kg`.                     |
| `source`       | `text`         | Suggested values: `manual`, `imported`, `device`. |
| `notes`        | `text`         | Optional context.                                 |
| `created_at`   | `timestamptz`  | Creation timestamp.                               |
| `updated_at`   | `timestamptz`  | Last update timestamp.                            |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.

### Relationships

- Many `weight_logs` belong to one `users` row.
- Weight logs may be summarized into daily dashboard data, but they do not require a `daily_plan_id` because logs can exist without a generated plan.

### Suggested Indexes

- Index on `(user_id, logged_on desc)` for trend and dashboard queries.
- Optional unique index on `(user_id, logged_on, source)` if the product allows one weight entry per source per day.

### Future Multi-User Considerations

- Support multiple devices or imports without overwriting manual entries unexpectedly.
- Unit preferences should display converted values without losing the originally recorded unit.

### Future Row Level Security Considerations

- Permit access only when `weight_logs.user_id` matches the authenticated user.
- Treat this table as sensitive health data and restrict service-role read paths to necessary jobs only.

## `mood_logs`

### Purpose

Stores mood, energy, stress, and related wellbeing check-ins for a user.

### Columns and Types

| Column          | Type          | Notes                                                          |
| --------------- | ------------- | -------------------------------------------------------------- |
| `id`            | `uuid`        | Stable log identifier.                                         |
| `user_id`       | `uuid`        | Owner.                                                         |
| `daily_plan_id` | `uuid`        | Optional related daily plan.                                   |
| `logged_on`     | `date`        | User-local date of the entry.                                  |
| `logged_at`     | `timestamptz` | Exact timestamp.                                               |
| `mood_score`    | `integer`     | Suggested range: 1-5 or 1-10.                                  |
| `energy_score`  | `integer`     | Optional range-aligned score.                                  |
| `stress_score`  | `integer`     | Optional range-aligned score.                                  |
| `tags`          | `jsonb`       | Optional structured tags such as `sleep`, `work`, or `family`. |
| `notes`         | `text`        | Optional private note.                                         |
| `created_at`    | `timestamptz` | Creation timestamp.                                            |
| `updated_at`    | `timestamptz` | Last update timestamp.                                         |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.

### Relationships

- Many `mood_logs` belong to one `users` row.
- Many `mood_logs` can optionally attach to one `daily_plans` row.

### Suggested Indexes

- Index on `(user_id, logged_on desc)` for history and charts.
- Index on `(user_id, daily_plan_id)` for daily dashboard aggregation.
- Optional GIN index on `tags` if tag filtering becomes a core feature.

### Future Multi-User Considerations

- Allow multiple mood logs per day unless the product intentionally limits check-ins.
- Mood and stress data should not be visible to other users without explicit future sharing permissions.

### Future Row Level Security Considerations

- Permit access only when `mood_logs.user_id` matches the authenticated user.
- Consider separate policies for aggregated insights if future analytics tables derive from mood logs.

## `notes`

### Purpose

Stores dated free-form notes for planning, reflection, and daily context.

### Columns and Types

| Column          | Type          | Notes                                                                 |
| --------------- | ------------- | --------------------------------------------------------------------- |
| `id`            | `uuid`        | Stable note identifier.                                               |
| `user_id`       | `uuid`        | Owner.                                                                |
| `daily_plan_id` | `uuid`        | Optional related daily plan.                                          |
| `note_date`     | `date`        | User-local date associated with the note.                             |
| `title`         | `text`        | Optional note title.                                                  |
| `body`          | `text`        | Note content.                                                         |
| `category`      | `text`        | Suggested values: `daily`, `workout`, `meal`, `wellbeing`, `general`. |
| `pinned`        | `boolean`     | Whether the note is emphasized.                                       |
| `created_at`    | `timestamptz` | Creation timestamp.                                                   |
| `updated_at`    | `timestamptz` | Last update timestamp.                                                |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.

### Relationships

- Many `notes` belong to one `users` row.
- Many `notes` can optionally attach to one `daily_plans` row.

### Suggested Indexes

- Index on `(user_id, note_date desc)` for dated note history.
- Index on `(user_id, daily_plan_id, pinned)` for daily dashboard retrieval.
- Future full-text search index on `title` and `body` if search is added.

### Future Multi-User Considerations

- Notes should be private by default.
- If sharing is introduced, use explicit note-level or notebook-level permissions rather than making notes globally visible.

### Future Row Level Security Considerations

- Permit access only when `notes.user_id` matches the authenticated user.
- Future shared notes require additional policies that check collaborator permissions.

## `reminders`

### Purpose

Stores reminder definitions and future delivery state for tasks, workouts, meals, wellbeing check-ins, and daily reviews.

### Columns and Types

| Column          | Type          | Notes                                                                                           |
| --------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `id`            | `uuid`        | Stable reminder identifier.                                                                     |
| `user_id`       | `uuid`        | Owner.                                                                                          |
| `daily_plan_id` | `uuid`        | Optional related daily plan.                                                                    |
| `related_type`  | `text`        | Suggested values: `daily_plan`, `daily_task`, `workout`, `meal_suggestion`, `mood_log`, `note`. |
| `related_id`    | `uuid`        | ID of the related record; application-enforced polymorphic reference.                           |
| `category`      | `text`        | Suggested values: `task`, `workout`, `meal`, `hydration`, `wellbeing`, `daily_review`.          |
| `scheduled_at`  | `timestamptz` | Intended reminder time.                                                                         |
| `status`        | `text`        | Suggested values: `scheduled`, `sent`, `dismissed`, `snoozed`, `cancelled`.                     |
| `channel`       | `text`        | Suggested values: `in_app`, `push`, `email`.                                                    |
| `snoozed_until` | `timestamptz` | Optional next reminder time.                                                                    |
| `delivered_at`  | `timestamptz` | Delivery timestamp.                                                                             |
| `created_at`    | `timestamptz` | Creation timestamp.                                                                             |
| `updated_at`    | `timestamptz` | Last update timestamp.                                                                          |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.
- `related_id` is polymorphic and should be validated by application logic or replaced with dedicated nullable foreign keys if stricter database enforcement is preferred.

### Relationships

- Many `reminders` belong to one `users` row.
- Many `reminders` can optionally belong to one `daily_plans` row.
- A reminder can point to one task, workout, meal suggestion, mood check-in, note, or daily plan through `related_type` and `related_id`.

### Suggested Indexes

- Index on `(user_id, scheduled_at)` for user-facing reminder lists.
- Index on `(status, scheduled_at)` for delivery workers.
- Index on `(user_id, related_type, related_id)` for finding reminders attached to a resource.

### Future Multi-User Considerations

- Reminder delivery jobs must be idempotent and scoped by user preferences, timezone, and device registrations.
- For shared plans, reminders should remain personal unless explicitly configured as shared notifications.

### Future Row Level Security Considerations

- Permit user reads and writes only when `reminders.user_id` matches the authenticated user.
- Background delivery services should use a restricted service role that can read scheduled reminders without exposing unrelated user data to clients.

## `meal_suggestions`

### Purpose

Stores suggested meals for a day, including meal category, suggestion metadata, and user response.

### Columns and Types

| Column              | Type          | Notes                                                                          |
| ------------------- | ------------- | ------------------------------------------------------------------------------ |
| `id`                | `uuid`        | Stable meal suggestion identifier.                                             |
| `user_id`           | `uuid`        | Owner.                                                                         |
| `daily_plan_id`     | `uuid`        | Optional parent daily plan.                                                    |
| `meal_date`         | `date`        | User-local date for the suggestion.                                            |
| `meal_type`         | `text`        | Suggested values: `breakfast`, `lunch`, `dinner`, `snack`.                     |
| `title`             | `text`        | Suggested meal name.                                                           |
| `description`       | `text`        | Optional preparation or context.                                               |
| `ingredients`       | `jsonb`       | Optional structured ingredient list.                                           |
| `nutrition_summary` | `jsonb`       | Optional calories/macros/metadata; avoid medical claims.                       |
| `status`            | `text`        | Suggested values: `suggested`, `accepted`, `skipped`, `replaced`, `completed`. |
| `source`            | `text`        | Suggested values: `manual`, `template`, `generated`.                           |
| `created_at`        | `timestamptz` | Creation timestamp.                                                            |
| `updated_at`        | `timestamptz` | Last update timestamp.                                                         |

### Primary Key

- `id`.

### Foreign Keys

- `user_id` references `users(id)`.
- `daily_plan_id` references `daily_plans(id)`.

### Relationships

- Many `meal_suggestions` belong to one `users` row.
- Many `meal_suggestions` can belong to one `daily_plans` row.
- A meal suggestion can have zero or many `reminders`.

### Suggested Indexes

- Index on `(user_id, meal_date, meal_type)` for daily meal views.
- Index on `(user_id, status, meal_date)` for accepted/completed meal history.
- Optional GIN index on `ingredients` or `nutrition_summary` only if structured filtering becomes necessary.

### Future Multi-User Considerations

- Dietary preferences, allergies, and restrictions should remain user-scoped and should not be inferred across users.
- Generated suggestions should store enough source metadata to explain or regenerate them without mixing users' personal data.

### Future Row Level Security Considerations

- Permit access only when `meal_suggestions.user_id` matches the authenticated user.
- If future shared recipe libraries are added, separate public recipe access from private suggestion rows.

## Cross-Table Integrity and Lifecycle Notes

- Consider `on delete cascade` from `users` to user-owned data only after account deletion requirements are defined; soft-delete or archival may be required for sync and export workflows.
- Consider cascading deletes from `daily_plans` to day-specific child records only if the product treats a plan deletion as deleting all daily content.
- Add database checks for score ranges, positive weights, valid statuses, and matching ownership once values stabilize.
- Keep `user_id` on child tables even when parent tables also imply ownership; this simplifies indexes, API filtering, and future RLS policies.
- Introduce migrations in small increments and backfill seeded internal user ownership before adding non-null constraints in existing environments.
