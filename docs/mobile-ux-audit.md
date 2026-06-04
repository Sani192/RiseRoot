# Mobile UX Audit (Evidence-Based)

## Scope

Audited mobile-first behavior in active route screens and shared shell components, with requirement traceability to `docs/functional-requirements.md` and `docs/architecture.md`.

## Positive Findings

- Large touch targets are common (`min-h-11`/`min-h-12` patterns on actionable controls).
- Vertical card stacking and sticky bottom actions support thumb-reach workflows.
- Tone and microcopy are calm and non-punitive, aligned with product philosophy.

## Issues with Path-Level Evidence

### 1) High risk: interactive illusion without reliable persistence

- Paths: `src/app/workout/page.tsx`, `src/app/notes/page.tsx`, `src/app/weight/page.tsx`, `src/app/onboarding/page.tsx`.
- Risk: users on mobile may assume “Save” or toggles persist changes when they may not.
- Impact: trust erosion and abandonment after perceived data loss.

### 2) High risk: selected-date continuity is not explicit across modules

- Paths: `src/app/calendar/page.tsx`, `src/app/notes/page.tsx`, `src/app/weight/page.tsx`, `src/components/today/today-overview.tsx`.
- Risk: users cannot reliably carry “current day context” while moving screens.
- Impact: cognitive overhead; undermines core day-driven flow.

### 3) Medium risk: static historical views can be mistaken for live analytics

- Path: `src/app/calendar/page.tsx`.
- Risk: fabricated percentages/history can mislead users.
- Impact: perceived dishonesty when real data eventually diverges.

### 4) Medium risk: settings controls lack immediate feedback semantics

- Path: `src/app/settings/page.tsx`.
- Risk: toggles do not indicate syncing/saved/error states.
- Impact: preference uncertainty on constrained mobile sessions.

### 5) Medium risk: workout data entry friction on small screens

- Path: `src/app/workout/page.tsx`.
- Risk: multi-input set rows may become dense; no inline validation or completion guidance.
- Impact: input fatigue and accidental entry errors.

## Accessibility and Ergonomics Notes

- Good: clear section headings and semantic grouping with cards/fieldsets.
- Improvement area: explicit screen-reader announcements for save/updated state and failed actions are largely absent.

## Mobile UX Risk Summary

- **Highest risk cluster:** false affordances around save/complete controls.
- **Second risk cluster:** missing global date context.
- **Third risk cluster:** analytics-like UI driven by placeholders.

## Recommendations

1. Introduce explicit save-state components (saving/saved/error) on all mutation actions.
2. Implement global selected-date state and display it persistently in screen headers.
3. Gate placeholder analytics behind “sample data” badges until real data is connected.
4. Add optimistic updates with rollback and concise mobile toast feedback.
