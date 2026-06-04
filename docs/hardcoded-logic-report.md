# Hardcoded Logic and Static/Mock Flow Report

## Method

Reviewed route components and feature modules for static constants, placeholder data, and non-persistent interaction flows.

## Findings

| Path                                      | Hardcoded / Mock Behavior                                                               | Severity | Why It Matters                                                        | Remediation                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/app/calendar/page.tsx`               | `weekDays`, `monthCells`, `history`, fixed date labels (e.g., “Monday, May 18”).        | High     | Simulates historical accuracy without real data linkage.              | Replace with date-context query model + derived completion aggregations.              |
| `src/app/workout/page.tsx`                | Static exercise plan, static summary metrics, non-persistent set inputs and checkboxes. | High     | Suggests completed workout tracking that is not durable.              | Bind to workout session store/API and persist per-set/per-exercise logs.              |
| `src/app/weight/page.tsx`                 | Static `trendPoints`, static `logs`, placeholder graph narrative.                       | High     | May imply real trend analytics while using fabricated points.         | Hydrate chart from weight log records, compute trend server/client from real entries. |
| `src/app/notes/page.tsx`                  | Prompt list hardcoded; save-state explicitly placeholder.                               | Medium   | Core note workflow appears actionable but lacks reliable save status. | Connect to save pipeline and show true optimistic/saved/error states.                 |
| `src/app/settings/page.tsx`               | Notification toggles and profile summary data static; no persistence hooks.             | Medium   | Preference controls can create false expectations.                    | Persist preferences and show last-updated or sync states.                             |
| `src/app/onboarding/page.tsx`             | Form appears complete but no submit handling/business action.                           | High     | User onboarding data entry may be discarded.                          | Add validated submit action, persistence, and success/failure UI.                     |
| `src/components/today/today-overview.tsx` | `buildTodayRoutine()` generates fixed routine template and meal/workout/task content.   | High     | “Today” appears personalized while mostly static template.            | Replace with date/user scoped fetched plan and server-backed task state.              |
| `src/features/meals/index.ts`             | Static meal catalog and deterministic fallback selection.                               | Medium   | Adequate for placeholder, but not user-constrained suggestions.       | Introduce preference/allergy profile filters + dynamic catalog source.                |
| `src/features/daily-plans/index.ts`       | Weekday templates are hardcoded.                                                        | Medium   | Good scaffold but not adaptable to user profile/history.              | Move templates into configurable data source and allow user overrides.                |

## Additional Hardcoded Rule Risks

1. `createSundayWeightLog` enforces Sunday-only writes in utility layer, but this constraint is not reflected in page UX flows.
2. `getDailyWorkoutSplit` defaults unknown weekdays to Monday, which can hide bad inputs.

## Prioritized Remediation Sequence

1. Implement date-context and persistence boundaries first.
2. Replace static dashboard/calendar/workout/weight data with real data adapters.
3. Connect settings/onboarding/notes to durable write paths.
4. Add observability for save failures and stale data.
