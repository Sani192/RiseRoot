# Missing Features and Architecture Mismatches

## Scope and Traceability

This report maps missing/partial/fake/static implementations against:

- `README.md`
- `docs/functional-requirements.md`
- `docs/architecture.md`

## Missing or Partial Implementations

### 1) Persistent daily task lifecycle (Missing)

- Requirement: durable completion state with immediate progress and reversible interactions.
- Actual: Today dashboard toggles task completion in local component state only.
- Gap: no persisted writes, no backend route, no durable undo history.

### 2) Global selected-date context across modules (Missing)

- Requirement: selected day should be global and preserved while navigating modules.
- Actual: calendar uses fixed/static labels; notes/weight each use isolated date inputs.
- Gap: no cross-route shared day context store.

### 3) Data-backed calendar history and indicators (Partial/Fake)

- Requirement: date indicators for completed logs/workouts/notes/scheduled items.
- Actual: hardcoded `weekDays`, `monthCells`, and `history` arrays.
- Gap: visual shell exists; production signal computation missing.

### 4) Workout save/complete workflow (Partial)

- Requirement: track planned workout, per-exercise completion, summary state.
- Actual: workout screen has controls and inputs but no real save pipeline.
- Gap: no persistent session model binding from UI.

### 5) Exercise substitution workflow (Partial/Fake)

- Requirement: alternatives should support actual swap and track chosen substitute.
- Actual: alternative buttons render static labels with no substitution state machine.
- Gap: no mapping from planned exercise to substituted completion log.

### 6) Weight logging persistence and trend rendering (Partial)

- Requirement: log by date/unit and surface latest value; trends future-facing.
- Actual: page includes inputs and placeholder graph; no persisted writes/reads.
- Gap: domain helpers exist but page not wired to storage or API.

### 7) Wellbeing logs persistence (Partial)

- Requirement: mood/energy/stress log for selected date with optional note.
- Actual: mood/energy controls in today view are local selection state only.
- Gap: no storage backend or historical comparison implementation.

### 8) Notes save lifecycle (Partial)

- Requirement: add/edit daily notes with clear save behavior.
- Actual: notes page explicitly labels save state as placeholder.
- Gap: note save UX is presented, but route-level persistence not integrated.

### 9) Meal personalization and constraints (Partial/Fake)

- Requirement: suggestions with future personalization/dietary constraints.
- Actual: static meal suggestion datasets and generated routines.
- Gap: no user-preference/allergy constraint engine.

### 10) Notification preferences + scheduling pipeline (Missing/Partial)

- Requirement: preference model + future scheduling/snooze/dismiss.
- Actual: settings checkboxes are static UI; reminders utility exists but unbound.
- Gap: no integrated preference persistence or scheduling orchestration.

## Architecture Mismatches

### A) Planned API route groups vs actual route absence

- Architecture documents `/api/days`, `/api/tasks`, `/api/workouts`, etc.
- Implementation currently lacks these route handlers.

### B) Intended layered architecture vs presentation-centric coupling

- Intended separation includes application services and integration layers.
- Current route screens hold direct mock data and UI control logic.

### C) “Avoid business rules in presentational components” vs inline rule behavior

- Example: weight Sunday constraint exists in feature utility, but page-level flow does not enforce or surface it.

### D) Planned server/cache state strategy vs local-only state

- Architecture calls for explicit server/cache state categories.
- Current app behavior is dominated by transient client state and constants.

## Fake or Static Behaviors (Representative)

- Calendar completion percentages and history bullets are hardcoded.
- Workout metrics (duration/sets/effort) are fixed values.
- Weight trend bars are placeholder percentages.
- Settings “profile and preferences” cards are static text.
- Notes save-state message confirms placeholder behavior.

## Conclusion

Most required modules have **visible shells** but remain **partially implemented** from a production standpoint. The core mismatch is that UX scaffolding is ahead of data and domain orchestration.
