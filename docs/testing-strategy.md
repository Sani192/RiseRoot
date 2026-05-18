# Phase 2 Testing Strategy

## Scope and Timing

Full automated test implementation is deferred until Phase 2. Phase 1 should establish configuration, boundaries, contracts, and documentation so the production test suite can be added without reshaping the application architecture.

Phase 2 testing should prioritize confidence in the daily schedule, task completion flows, API contracts, mobile navigation, and accessibility expectations before broad visual or end-to-end coverage is expanded.

## Unit Testing for Schedule Generation

Pure schedule-generation logic should live outside React components and API route handlers so it can be tested with deterministic unit tests.

Recommended approach:

- Place schedule calculation, recurrence expansion, conflict detection, ordering, and reminder-window helpers in domain or application modules.
- Test functions with fixed inputs, fixed local dates, and explicit timezone assumptions.
- Cover empty days, overlapping schedule blocks, all-day items, recurring items, completed items, skipped items, and daylight-saving boundary dates.
- Keep test data small and readable so failures explain the user scenario being protected.
- Avoid mocking UI or persistence for these tests; schedule generation should accept plain typed inputs and return plain typed outputs.

Expected Phase 2 tools may include Vitest or Jest with TypeScript support, plus table-driven test cases for recurring schedule scenarios.

## API Route Contract Testing

API route tests should verify that route handlers preserve the documented request and response contracts before real clients depend on them.

Recommended approach:

- Test request validation for required fields, invalid IDs, invalid dates, unsupported status transitions, and malformed JSON payloads.
- Assert the consistent response envelope with `data`, `meta`, and `error` keys for both success and failure cases.
- Assert error codes, validation field maps, and HTTP status codes for representative failure modes.
- Mock application services or persistence adapters at the route boundary so tests focus on API behavior rather than database implementation details.
- Include user-ownership and authentication expectation tests once authentication is introduced, even if Phase 2 still uses a mock identity provider.

Contract coverage should begin with the routes that drive the dashboard aggregate, schedule items, task completion, workout completion, logs, notes, meals, and notification preferences.

## Component Testing Strategy

Component tests should focus on user-visible behavior for high-frequency mobile flows rather than implementation details.

### Task Completion

Task completion component tests should verify that users can complete and reopen tasks through accessible controls.

Expected coverage:

- A task card exposes a clearly named button or checkbox for completion.
- Completing a task updates visible status, progress counts, and disabled/loading states when applicable.
- Reopening a task returns it to the active state without losing the task title or schedule context.
- Optimistic UI behavior reconciles with success and failure responses once API integration exists.
- Keyboard interaction and screen-reader labels match the visual completion state.

### Mobile Navigation

Mobile navigation component tests should verify that daily movement and tab-based navigation remain reliable on narrow viewports.

Expected coverage:

- Bottom or primary navigation exposes accessible names for Today, Schedule, Tasks, Workouts, Logs, Notes, Meals, and Settings as implemented.
- Date navigation supports previous day, next day, and return-to-today actions.
- Active navigation state is visible and announced semantically where appropriate.
- Navigation controls meet touch-target expectations and remain usable when viewport height is constrained.
- Route changes preserve or intentionally reset the selected-day context according to the product decision.

React Testing Library should be preferred for component behavior tests because it encourages queries aligned with how users and assistive technologies interact with the app.

## Accessibility Testing Expectations

Accessibility should be validated continuously rather than treated as a release-only audit.

Expected Phase 2 practices:

- Add automated accessibility checks for key rendered screens and components with an axe-compatible tool.
- Verify semantic headings, landmark structure, form labels, button names, focus order, and visible focus indicators.
- Confirm color contrast for the dark-mode-first palette and any status colors used for progress, warnings, or completion.
- Ensure completion controls, date navigation, sheets, dialogs, and bottom navigation can be operated with a keyboard.
- Avoid relying on color alone to communicate task, schedule, workout, meal, or log status.
- Include manual screen-reader spot checks for the dashboard, task completion, mobile navigation, and form-heavy flows.

Automated accessibility tests should block obvious regressions, but manual checks remain required for mobile gestures, focus management, and screen-reader phrasing.

## Manual QA Checklist for iPhone Browser Behavior

Before Phase 2 functionality is considered shippable, run manual checks on current iPhone Safari and at least one Chromium-based iOS browser when possible.

Checklist:

- Dashboard loads without horizontal scrolling at common iPhone widths, including small and Pro Max viewports.
- Bottom navigation remains reachable above the Safari toolbar and does not overlap important content.
- Tap targets for task completion, date navigation, tabs, and primary actions are comfortable to use with one hand.
- Sticky headers, bottom bars, sheets, and dialogs account for safe-area insets and browser chrome changes while scrolling.
- Form inputs use appropriate iOS keyboards for dates, numbers, notes, and search-like fields.
- Text remains readable under iOS text-size adjustments and does not clip inside cards or buttons.
- Date navigation and completion actions still work after orientation changes.
- The app behaves predictably when returning from the background or refreshing the browser tab.
- Loading, empty, error, and offline-like states are understandable on a mobile connection.
- No critical action depends on hover behavior.

## Deferred Implementation Note

This document defines the Phase 2 testing strategy only. The complete automated unit, API contract, component, accessibility, and mobile browser test implementation is intentionally deferred until Phase 2, after Phase 1 planning and skeleton boundaries are accepted.
