# RiseRoot API Contract Planning

## Scope and Phase Notes

This document describes the planned API contracts for RiseRoot. It is a planning artifact only: Phase 1 may include optional route placeholders or mocks, but it should not implement production API routes, persistence, authentication, notification delivery, or AI-backed generation.

The contracts below are intended to guide future route handlers, client API wrappers, validators, tests, and database queries. They assume JSON request and response bodies unless noted otherwise.

## Cross-Cutting API Conventions

### Response Envelope

Successful responses should use a consistent envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "generatedAt": "2026-05-18T12:00:00.000Z"
  }
}
```

List responses should keep records in `data` and place pagination or range information in `meta`:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_123",
    "range": {
      "startDate": "2026-05-18",
      "endDate": "2026-05-24"
    }
  }
}
```

### Error Response Convention

Errors should use the same top-level shape across all endpoints:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "date",
        "message": "Expected YYYY-MM-DD."
      }
    ]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Planned error codes:

- `VALIDATION_ERROR` for malformed params, query strings, or request bodies.
- `UNAUTHENTICATED` for missing or invalid future sessions.
- `FORBIDDEN` for records that do not belong to the authenticated user.
- `NOT_FOUND` for missing resources or resources outside the user scope.
- `CONFLICT` for duplicate date-scoped records or stale updates.
- `RATE_LIMITED` for excessive generation, logging, or reminder requests.
- `INTERNAL_ERROR` for unexpected server failures.

### Validation Strategy

- Validate route params, query params, and JSON bodies at the API boundary before invoking application services.
- Prefer a shared schema library, such as Zod, so server validators and client types can stay aligned.
- Normalize local dates as `YYYY-MM-DD` strings and reject ambiguous date formats.
- Validate identifiers as UUID strings unless the final persistence layer uses another stable identifier format.
- Constrain status, mood, unit, category, and source fields to explicit string unions.
- Trim user-provided text and enforce maximum lengths for names, titles, notes, and labels.
- Validate numeric health and workout fields with realistic min/max boundaries and unit-aware rules.
- Treat omitted optional fields differently from explicit `null` in PATCH routes.

### Future Authentication and User Scoping

Phase 1 should not implement production authentication, but every contract should be designed as though user ownership already exists.

Future behavior:

- Authenticated requests derive `userId` from the session or access token, never from client-supplied body fields.
- Every user-owned query is scoped by `userId` plus the requested resource identifier or local date.
- Create routes attach `userId` server-side.
- Read and update routes return `404 NOT_FOUND` or `403 FORBIDDEN` according to the chosen security posture when a record exists but belongs to another user.
- Logs should avoid writing sensitive meal, mood, weight, note, or workout detail values.

## Planned Endpoints

### `GET /api/today`

#### Purpose

Returns the dashboard aggregation for the authenticated user's current local date, including the daily plan, task summary, workout summary, recent logs, notes preview, meal suggestions, and reminders due today.

#### Request Params/Body

- Query params:
  - `timezone` optional IANA timezone override for early clients; future authenticated users should default to their saved timezone.
  - `include` optional comma-separated sections such as `tasks,workouts,meals,logs,notes,reminders`.
- Body: none.

#### Response Shape

```json
{
  "data": {
    "date": "2026-05-18",
    "dailyPlan": {
      "id": "plan_uuid",
      "status": "active",
      "summary": "Focus on strength training and evening review."
    },
    "tasks": {
      "items": [],
      "summary": {
        "total": 4,
        "completed": 1,
        "overdue": 0
      }
    },
    "workouts": {
      "items": [],
      "summary": {
        "planned": 1,
        "completed": 0
      }
    },
    "logs": {
      "latestWeight": null,
      "latestMood": null
    },
    "notes": {
      "body": "",
      "updatedAt": null
    },
    "mealSuggestions": [],
    "reminders": []
  },
  "meta": {
    "requestId": "req_123",
    "generatedAt": "2026-05-18T12:00:00.000Z"
  }
}
```

#### Validation Strategy

- Validate `timezone` against known IANA timezone names when provided.
- Validate `include` values against the supported section list.
- Derive the effective local date server-side from the user's timezone.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid timezone or include values.
- `401 UNAUTHENTICATED` once auth is required.
- `500 INTERNAL_ERROR` for aggregation failures.

#### Future Authentication and User Scoping Notes

Use the session-derived user ID and saved timezone. Do not accept `userId` as a query param. All aggregated records must be filtered by the authenticated user and effective local date.

### `GET /api/daily-plans/:date`

#### Purpose

Returns the daily plan and associated day-scoped records for a specific local date.

#### Request Params/Body

- Path params:
  - `date` required local date in `YYYY-MM-DD` format.
- Query params:
  - `include` optional comma-separated sections such as `tasks,workouts,meals,logs,notes,reminders`.
- Body: none.

#### Response Shape

```json
{
  "data": {
    "date": "2026-05-18",
    "dailyPlan": {
      "id": "plan_uuid",
      "status": "active",
      "summary": "Daily plan summary",
      "createdAt": "2026-05-18T08:00:00.000Z",
      "updatedAt": "2026-05-18T08:30:00.000Z"
    },
    "tasks": [],
    "workouts": [],
    "mealSuggestions": [],
    "logs": {
      "weight": [],
      "mood": []
    },
    "notes": null,
    "reminders": []
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Validate `date` as an exact `YYYY-MM-DD` local date.
- Reject impossible calendar dates.
- Validate `include` values against supported sections.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid date or include params.
- `401 UNAUTHENTICATED` once auth is required.
- `404 NOT_FOUND` if no plan exists and the route is configured not to auto-materialize empty plans.

#### Future Authentication and User Scoping Notes

Lookup should use `(userId, planDate)` rather than date alone. If plan auto-creation is added later, creation must attach the server-derived `userId`.

### `POST /api/daily-plans/generate`

#### Purpose

Generates or refreshes a daily plan for a requested date from existing preferences, incomplete tasks, workout cadence, meal settings, and optional user intent.

#### Request Params/Body

- Query params: none.
- Body:

```json
{
  "date": "2026-05-18",
  "timezone": "America/New_York",
  "intent": "Keep the morning light and prioritize strength training.",
  "overwrite": false,
  "sections": ["tasks", "workouts", "meals", "reminders"]
}
```

#### Response Shape

```json
{
  "data": {
    "dailyPlan": {
      "id": "plan_uuid",
      "date": "2026-05-18",
      "status": "draft",
      "summary": "Generated draft plan."
    },
    "created": {
      "tasks": 3,
      "workouts": 1,
      "mealSuggestions": 2,
      "reminders": 2
    },
    "warnings": []
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Require a valid `date` in `YYYY-MM-DD` format.
- Validate optional `timezone` as an IANA timezone.
- Limit `intent` length and trim whitespace.
- Validate `overwrite` as a boolean.
- Validate `sections` against supported generation sections and reject empty arrays.

#### Error Response Convention

- `400 VALIDATION_ERROR` for malformed generation input.
- `401 UNAUTHENTICATED` once auth is required.
- `409 CONFLICT` when a plan already exists and `overwrite` is false.
- `429 RATE_LIMITED` if generation is throttled.

#### Future Authentication and User Scoping Notes

Generation should only read preferences and source records owned by the authenticated user. If AI or background workers are introduced, pass only the minimum user-scoped context needed and avoid storing sensitive prompt payloads unnecessarily.

### `PATCH /api/tasks/:id`

#### Purpose

Updates a task's completion state, content, priority, due time, or ordering.

#### Request Params/Body

- Path params:
  - `id` required task UUID.
- Body:

```json
{
  "title": "Drink water",
  "description": "Finish one bottle before lunch.",
  "status": "completed",
  "priority": 2,
  "sortOrder": 10,
  "dueAt": "2026-05-18T16:00:00.000Z"
}
```

All body fields are optional, but at least one supported field is required.

#### Response Shape

```json
{
  "data": {
    "id": "task_uuid",
    "dailyPlanId": "plan_uuid",
    "title": "Drink water",
    "description": "Finish one bottle before lunch.",
    "status": "completed",
    "priority": 2,
    "sortOrder": 10,
    "dueAt": "2026-05-18T16:00:00.000Z",
    "completedAt": "2026-05-18T15:45:00.000Z",
    "updatedAt": "2026-05-18T15:45:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Validate `id` as a UUID.
- Require at least one patchable field.
- Enforce task title length and non-empty trimmed content when provided.
- Validate `status` against `todo`, `in_progress`, `completed`, and `skipped`.
- Validate numeric priority and sort order boundaries.
- Validate `dueAt` as an ISO timestamp or explicit `null` if clearing is allowed.
- Set or clear `completedAt` server-side based on status transition rules.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid params or body.
- `401 UNAUTHENTICATED` once auth is required.
- `404 NOT_FOUND` when the task does not exist within the user's scope.
- `409 CONFLICT` for stale updates if optimistic concurrency is added.

#### Future Authentication and User Scoping Notes

Update by `(id, userId)`. Never allow patching `userId` or ownership fields. Future shared plans should add explicit authorization checks before task mutation.

### `GET /api/calendar`

#### Purpose

Returns calendar metadata for a bounded date range, such as which days have plans, workouts, completed tasks, logs, notes, or reminders.

#### Request Params/Body

- Query params:
  - `startDate` required local date in `YYYY-MM-DD` format.
  - `endDate` required local date in `YYYY-MM-DD` format.
  - `include` optional comma-separated markers such as `plans,taskSummary,workoutSummary,logs,notes,reminders`.
- Body: none.

#### Response Shape

```json
{
  "data": [
    {
      "date": "2026-05-18",
      "hasPlan": true,
      "taskSummary": {
        "total": 4,
        "completed": 1
      },
      "workoutSummary": {
        "planned": 1,
        "completed": 0
      },
      "hasWeightLog": false,
      "hasMoodLog": true,
      "hasNotes": true,
      "reminderCount": 2
    }
  ],
  "meta": {
    "requestId": "req_123",
    "range": {
      "startDate": "2026-05-18",
      "endDate": "2026-05-24"
    }
  }
}
```

#### Validation Strategy

- Require valid `startDate` and `endDate` values.
- Reject ranges where `endDate` is before `startDate`.
- Enforce a maximum range, such as 31 or 92 days, to avoid unbounded aggregation.
- Validate `include` values against supported marker groups.

#### Error Response Convention

- `400 VALIDATION_ERROR` for malformed dates, reversed dates, unsupported include values, or excessive range size.
- `401 UNAUTHENTICATED` once auth is required.
- `500 INTERNAL_ERROR` for aggregation failures.

#### Future Authentication and User Scoping Notes

All calendar markers should be computed from records filtered by `userId` and date range. Shared or public exercise data should not appear unless tied to user-owned activity.

### `POST /api/workouts`

#### Purpose

Creates a planned or ad hoc workout session, optionally with exercises and alternatives.

#### Request Params/Body

- Query params: none.
- Body:

```json
{
  "date": "2026-05-18",
  "dailyPlanId": "plan_uuid",
  "name": "Upper Body Strength",
  "workoutType": "strength",
  "status": "planned",
  "scheduledAt": "2026-05-18T22:00:00.000Z",
  "notes": "Keep rests short.",
  "exercises": [
    {
      "name": "Push-up",
      "targetSets": 3,
      "targetReps": 12,
      "targetWeight": null,
      "unit": "bodyweight",
      "sortOrder": 1
    }
  ]
}
```

#### Response Shape

```json
{
  "data": {
    "id": "workout_uuid",
    "dailyPlanId": "plan_uuid",
    "date": "2026-05-18",
    "name": "Upper Body Strength",
    "workoutType": "strength",
    "status": "planned",
    "scheduledAt": "2026-05-18T22:00:00.000Z",
    "startedAt": null,
    "completedAt": null,
    "notes": "Keep rests short.",
    "exercises": []
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Require a valid `date` unless a valid `dailyPlanId` can determine the date.
- Validate `dailyPlanId` as UUID when provided.
- Require a non-empty workout name.
- Validate `workoutType` and `status` against supported string unions.
- Validate `scheduledAt` as an ISO timestamp when provided.
- Validate exercises as a bounded array and enforce names, set/rep ranges, units, and sort order.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid workout or exercise input.
- `401 UNAUTHENTICATED` once auth is required.
- `404 NOT_FOUND` when the referenced daily plan is outside the user's scope.
- `409 CONFLICT` if duplicate protection is later added.

#### Future Authentication and User Scoping Notes

Attach `userId` server-side to the workout and child exercises. If `dailyPlanId` is provided, verify that the plan belongs to the authenticated user before creating the workout.

### `PATCH /api/workouts/:id`

#### Purpose

Updates workout metadata, schedule, status, notes, or completion timestamps.

#### Request Params/Body

- Path params:
  - `id` required workout UUID.
- Body:

```json
{
  "name": "Upper Body Strength",
  "workoutType": "strength",
  "status": "completed",
  "scheduledAt": "2026-05-18T22:00:00.000Z",
  "startedAt": "2026-05-18T22:05:00.000Z",
  "completedAt": "2026-05-18T22:45:00.000Z",
  "notes": "Felt strong."
}
```

All body fields are optional, but at least one supported field is required.

#### Response Shape

```json
{
  "data": {
    "id": "workout_uuid",
    "dailyPlanId": "plan_uuid",
    "name": "Upper Body Strength",
    "workoutType": "strength",
    "status": "completed",
    "scheduledAt": "2026-05-18T22:00:00.000Z",
    "startedAt": "2026-05-18T22:05:00.000Z",
    "completedAt": "2026-05-18T22:45:00.000Z",
    "notes": "Felt strong.",
    "updatedAt": "2026-05-18T22:45:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Validate `id` as a UUID.
- Require at least one patchable field.
- Validate string fields and maximum note length.
- Validate `workoutType` and `status` against supported values.
- Validate timestamp order, such as `completedAt` not preceding `startedAt`.
- Apply server-side status transition rules for `startedAt` and `completedAt` defaults.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid params, body, timestamps, or status transitions.
- `401 UNAUTHENTICATED` once auth is required.
- `404 NOT_FOUND` when the workout does not exist within the user's scope.
- `409 CONFLICT` for stale updates if optimistic concurrency is added.

#### Future Authentication and User Scoping Notes

Update by `(id, userId)`. Do not allow clients to patch ownership. Child exercise updates should either use separate exercise endpoints or a clearly validated nested replacement strategy in a future contract.

### `GET /api/exercises`

#### Purpose

Returns exercise records for a workout or a searchable exercise library for workout building and substitution.

#### Request Params/Body

- Query params:
  - `workoutId` optional workout UUID to list exercises in a specific workout.
  - `query` optional search text for library lookup.
  - `muscleGroup` optional filter such as `chest`, `back`, `legs`, or `core`.
  - `equipment` optional filter such as `bodyweight`, `dumbbell`, `barbell`, or `machine`.
  - `limit` optional result limit.
- Body: none.

#### Response Shape

```json
{
  "data": [
    {
      "id": "exercise_uuid",
      "workoutId": "workout_uuid",
      "name": "Push-up",
      "muscleGroups": ["chest", "triceps"],
      "equipment": "bodyweight",
      "targetSets": 3,
      "targetReps": 12,
      "alternatives": []
    }
  ],
  "meta": {
    "requestId": "req_123",
    "limit": 20
  }
}
```

#### Validation Strategy

- Validate `workoutId` as UUID when provided.
- Trim and length-limit `query`.
- Validate filters against supported exercise metadata values.
- Clamp `limit` to a safe maximum.
- Require either a `workoutId` or at least one library search/filter parameter if broad library listing is not supported.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid query params or excessive limits.
- `401 UNAUTHENTICATED` once auth is required for user workout exercises.
- `404 NOT_FOUND` when a provided workout is outside the user's scope.

#### Future Authentication and User Scoping Notes

Workout-specific exercises must be scoped through the authenticated user's workout. A future shared exercise library may include system-owned records available to all users, but user-created exercise variants should remain user-scoped.

### `POST /api/weight-logs`

#### Purpose

Creates a weight log entry for a local date and optional measurement timestamp.

#### Request Params/Body

- Query params: none.
- Body:

```json
{
  "loggedOn": "2026-05-18",
  "measuredAt": "2026-05-18T11:30:00.000Z",
  "weight": 182.4,
  "unit": "lb",
  "notes": "Morning weigh-in"
}
```

#### Response Shape

```json
{
  "data": {
    "id": "weight_log_uuid",
    "loggedOn": "2026-05-18",
    "measuredAt": "2026-05-18T11:30:00.000Z",
    "weight": 182.4,
    "unit": "lb",
    "notes": "Morning weigh-in",
    "createdAt": "2026-05-18T11:31:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Require `loggedOn` as a valid `YYYY-MM-DD` date.
- Validate `measuredAt` as an ISO timestamp when provided.
- Require numeric `weight` within realistic unit-aware bounds.
- Validate `unit` against `lb` and `kg`.
- Trim and length-limit optional notes.
- Decide whether multiple logs per date are allowed; if not, enforce uniqueness by user and date.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid dates, units, weights, or notes.
- `401 UNAUTHENTICATED` once auth is required.
- `409 CONFLICT` if only one weight log per date is allowed and one already exists.

#### Future Authentication and User Scoping Notes

Attach logs to the authenticated user server-side. Weight data is sensitive; restrict reads and writes to the owner and avoid including raw values in operational logs.

### `POST /api/mood-logs`

#### Purpose

Creates a mood or wellbeing check-in for a local date.

#### Request Params/Body

- Query params: none.
- Body:

```json
{
  "loggedOn": "2026-05-18",
  "mood": 4,
  "energy": 3,
  "stress": 2,
  "tags": ["focused", "calm"],
  "notes": "Good afternoon energy."
}
```

#### Response Shape

```json
{
  "data": {
    "id": "mood_log_uuid",
    "loggedOn": "2026-05-18",
    "mood": 4,
    "energy": 3,
    "stress": 2,
    "tags": ["focused", "calm"],
    "notes": "Good afternoon energy.",
    "createdAt": "2026-05-18T18:30:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Require `loggedOn` as a valid `YYYY-MM-DD` date.
- Validate `mood`, `energy`, and `stress` as bounded integers, such as 1 through 5.
- Validate `tags` as a bounded array of known or sanitized labels.
- Trim and length-limit optional notes.
- Decide whether multiple check-ins per date are allowed; if not, enforce uniqueness by user and date.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid ratings, dates, tags, or notes.
- `401 UNAUTHENTICATED` once auth is required.
- `409 CONFLICT` if only one mood log per date is allowed and one already exists.

#### Future Authentication and User Scoping Notes

Attach logs to the authenticated user server-side. Mood and wellbeing data is sensitive; owner-only access and conservative telemetry are required before production use.

### `PUT /api/notes/:date`

#### Purpose

Creates or replaces the note for a specific local date. This route is idempotent for a user's date-scoped note.

#### Request Params/Body

- Path params:
  - `date` required local date in `YYYY-MM-DD` format.
- Body:

```json
{
  "body": "Remember how the new routine felt today.",
  "moodTag": "reflective"
}
```

#### Response Shape

```json
{
  "data": {
    "id": "note_uuid",
    "date": "2026-05-18",
    "body": "Remember how the new routine felt today.",
    "moodTag": "reflective",
    "updatedAt": "2026-05-18T20:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Validate `date` as an exact local date.
- Require `body` as a string; allow an empty string only if clearing notes is intentional.
- Enforce maximum note length.
- Validate optional `moodTag` as a known label or sanitized short string.
- Consider optimistic concurrency with an `If-Match` header or `updatedAt` precondition in later phases.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid date or body.
- `401 UNAUTHENTICATED` once auth is required.
- `409 CONFLICT` for stale note updates if concurrency checks are added.

#### Future Authentication and User Scoping Notes

Upsert by `(userId, date)`. Do not allow a body-supplied `userId`. Notes are sensitive free-form data and should be excluded from raw request logging.

### `GET /api/meal-suggestions`

#### Purpose

Returns meal suggestions for a date, optionally filtered by meal type, dietary preferences, or current suggestion status.

#### Request Params/Body

- Query params:
  - `date` optional local date in `YYYY-MM-DD`; defaults to the user's current local date.
  - `mealType` optional filter such as `breakfast`, `lunch`, `dinner`, or `snack`.
  - `status` optional filter such as `suggested`, `accepted`, `skipped`, `replaced`, or `completed`.
  - `limit` optional result limit.
- Body: none.

#### Response Shape

```json
{
  "data": [
    {
      "id": "meal_suggestion_uuid",
      "date": "2026-05-18",
      "mealType": "lunch",
      "title": "Chicken grain bowl",
      "description": "Protein-forward bowl with vegetables.",
      "status": "suggested",
      "nutritionEstimate": {
        "calories": 550,
        "proteinGrams": 38
      },
      "tags": ["high-protein"]
    }
  ],
  "meta": {
    "requestId": "req_123",
    "date": "2026-05-18"
  }
}
```

#### Validation Strategy

- Validate `date` when provided; otherwise derive it from the user's timezone.
- Validate `mealType` and `status` against supported values.
- Clamp `limit` to a safe maximum.
- Apply future dietary preference filters server-side from user profile data, not only client input.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid date, status, meal type, or limit.
- `401 UNAUTHENTICATED` once auth is required.
- `500 INTERNAL_ERROR` for suggestion retrieval failures.

#### Future Authentication and User Scoping Notes

Suggestions should be generated or retrieved for the authenticated user's preferences and date. Shared recipe metadata may be system-owned, but suggestion status and dietary context must remain user-scoped.

### `POST /api/reminders`

#### Purpose

Creates a reminder for a task, workout, meal, hydration prompt, wellbeing check-in, schedule block, or daily review.

#### Request Params/Body

- Query params: none.
- Body:

```json
{
  "category": "task",
  "targetType": "task",
  "targetId": "task_uuid",
  "scheduledFor": "2026-05-18T16:00:00.000Z",
  "timezone": "America/New_York",
  "channel": "in_app",
  "message": "Time to drink water.",
  "recurrence": null
}
```

#### Response Shape

```json
{
  "data": {
    "id": "reminder_uuid",
    "category": "task",
    "targetType": "task",
    "targetId": "task_uuid",
    "scheduledFor": "2026-05-18T16:00:00.000Z",
    "timezone": "America/New_York",
    "channel": "in_app",
    "status": "scheduled",
    "message": "Time to drink water.",
    "createdAt": "2026-05-18T12:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

#### Validation Strategy

- Validate `category`, `targetType`, and `channel` against supported values.
- Validate `targetId` as UUID when a target is required.
- Validate target ownership before creating a reminder tied to a user-owned record.
- Validate `scheduledFor` as an ISO timestamp and reject unsupported past reminders unless explicitly allowed.
- Validate `timezone` as an IANA timezone.
- Trim and length-limit message text.
- Defer complex recurrence rules until reminder scheduling requirements are stable.

#### Error Response Convention

- `400 VALIDATION_ERROR` for invalid reminder fields, timestamps, timezone, or recurrence.
- `401 UNAUTHENTICATED` once auth is required.
- `404 NOT_FOUND` when a target record is outside the user's scope.
- `409 CONFLICT` for duplicate reminders if idempotency keys or uniqueness constraints are introduced.
- `429 RATE_LIMITED` for excessive reminder creation.

#### Future Authentication and User Scoping Notes

Attach the authenticated `userId` server-side. Verify ownership of `targetId` through the target table before scheduling. Future push notification tokens and delivery providers should be isolated from core reminder records and protected as user-owned secrets.
