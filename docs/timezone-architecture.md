# Timezone Architecture

This document defines RiseRoot's canonical timezone strategy for persistence, rendering, and schedule logic.

## 1) UTC-only persistence policy

All persisted timestamps must be stored in UTC.

- Use UTC-backed columns for instants (`timestamptz` or ISO-8601 `Z` timestamps).
- Treat persisted values as absolute moments in time, not display values.
- Never persist locale-formatted date strings (for example `MM/DD/YYYY`) as source-of-truth fields.
- For local-day keyed records (notes, daily summaries, day plans), persist the **UTC instant representing the start of the user local day**.
- Store user timezone preferences separately (IANA name such as `America/New_York`) and use them only for interpretation/rendering.

Current implementation references:

- API routes accept/derive timezone and convert local day boundaries before persistence and after reads. (`src/app/api/notes/route.ts`, `src/app/api/days/route.ts`)
- Shared conversion helpers are centralized in schedule-engine utilities and reused across features. (`src/features/schedule-engine.ts`, `src/lib/schedule-engine.ts`)

## 2) Local rendering strategy

Clients and APIs should render time in a user-effective timezone while keeping storage UTC.

- Resolve effective timezone in this order:
  1. authenticated user profile timezone
  2. explicit request override (only where contract allows)
  3. client/runtime timezone fallback
  4. `UTC` fallback
- Convert UTC instants to local presentation only at boundaries:
  - API response serialization
  - UI component/view-model formatting
- Keep domain logic timezone-aware but side-effect free: conversion in pure helpers, not duplicated ad-hoc in components.

Practical examples in repository:

- `toLocalIsoDate(...)` is used for query defaults and response payload normalization. (`src/app/api/days/route.ts`, `src/app/api/notes/route.ts`)
- Calendar page sends browser timezone to API so server can derive local date accurately. (`src/app/calendar/page.tsx`)

## 3) Conversion rules (local day ↔ UTC storage)

Define one canonical mapping for day-scoped records.

### Local day to UTC (write path)

Given local date `YYYY-MM-DD` and timezone `tz`:

1. Construct local midnight at `tz`.
2. Convert that local midnight to UTC instant.
3. Persist that UTC instant.

This mapping is deterministic and avoids ambiguity across environments.

### UTC to local day (read path)

Given persisted UTC instant and timezone `tz`:

1. Convert UTC instant to `tz`.
2. Extract local calendar date (`YYYY-MM-DD`).
3. Return local date for day-keyed APIs/UI.

### Invariants

- Roundtrip invariant: `localDate -> utcStartOfDay -> localDate` must return the same date for the same timezone.
- API handlers must validate input date format and timezone before conversion.
- All modules should call shared helpers rather than implement custom math.

Repository evidence:

- Local day write conversion via `localDayStartUtc(...).toISOString()`. (`src/app/api/notes/route.ts`)
- Read conversion back via `toLocalIsoDate(...)`. (`src/app/api/notes/route.ts`, `src/app/api/days/route.ts`)
- Tests explicitly cover roundtrip behavior and boundary conditions. (`src/features/__tests__/schedule-engine.edge-cases.test.ts`, `src/features/__tests__/schedule-engine.test.ts`)

## 4) DST handling and schedule engine rules

DST must not change correctness of day selection or ordering.

- Treat schedule instants as UTC in persistence and transport.
- Perform recurrence/day-bucket expansion in user-local timezone.
- Convert back to UTC only when emitting persisted/scheduled instants.
- Do not assume fixed offsets (e.g., `-05:00`) for a timezone; always use IANA rules.
- Handle skipped/repeated local wall times deterministically:
  - non-existent local time during spring-forward should roll forward to next valid instant
  - duplicated local time during fall-back should map using a consistent policy (earlier or later offset) and test that policy
- Day-level filtering must use local date boundaries (`[local day start, next local day start)`) converted to UTC for querying.

Schedule-engine expectations already have DST-focused tests and local-midnight boundary tests. (`src/features/__tests__/schedule-engine.edge-cases.test.ts`, `src/features/__tests__/schedule-engine.test.ts`)

## 5) Operational checklist

- Persist only UTC instants.
- Keep timezone ID per user/profile.
- Normalize date conversions through shared helpers.
- Add tests for DST start/end for each supported region set.
- Keep API contract explicit: date input format, timezone resolution, and return semantics.
