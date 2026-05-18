# RiseRoot Functional Requirements

## Phase 1 Statement

Phase 1 is planning and skeleton only. It defines product scope, screens, user flows, interaction expectations, and implementation boundaries for RiseRoot, but it does not implement production business logic, production data persistence, production authentication, or production notification delivery.

## Product Overview

RiseRoot is a mobile-first daily tracker that helps a user plan and complete a balanced day. The core experience combines daily schedules, tasks, workouts, meals, wellbeing logs, notes, calendar navigation, and reminders into a single daily dashboard.

The product should feel lightweight, fast, and supportive. Users should be able to open the app, understand what today requires, log progress with minimal friction, and review previous or future days from the calendar.

## Functional Scope

### Daily Schedules

Daily schedules represent the user's plan for a selected date.

Required capabilities:

- Display a date-specific daily dashboard.
- Show scheduled blocks, tasks, workout plan, meal suggestions, wellbeing prompts, notes, and notification status for the selected day.
- Support planned, in-progress, skipped, and completed item states.
- Allow users to add, edit, reorder, and remove schedule items in future phases.
- Preserve day context while users navigate between modules.
- Provide empty states when no schedule exists for a selected date.

Schedule item examples:

- Morning routine.
- Work or study block.
- Workout session.
- Meal reminder.
- Hydration or recovery check-in.
- Evening reflection.

### Task Completion

Tasks are actionable items associated with a day.

Required capabilities:

- List daily tasks grouped by time, category, or priority.
- Mark tasks complete or incomplete.
- Support optional task metadata, such as title, notes, due time, priority, category, and recurrence intent.
- Surface progress indicators, such as completed count and completion percentage.
- Allow task deferral, skipping, or rescheduling in future phases.
- Keep completion interactions fast and reversible.

Completion expectations:

- Completing a task should immediately update visible progress.
- Undo should be available after accidental completion when feasible.
- Completed tasks should remain visible but visually distinct from incomplete tasks.

### Calendar Navigation

Calendar navigation allows users to review past days and plan upcoming days.

Required capabilities:

- Navigate to today quickly from any date.
- Move between previous and next days.
- Provide a calendar picker or monthly overview in future phases.
- Indicate dates with completed logs, workouts, notes, or scheduled items.
- Keep the selected date as global context for relevant modules.

Calendar UX expectations:

- Date changes should be obvious and not reset unrelated UI unexpectedly.
- Today should be visually differentiated.
- Historical days should be viewable even when editing is restricted in later phases.

### Workout Tracking

Workout tracking helps users execute and record exercise sessions.

Required capabilities:

- Show the planned workout for the selected day.
- Display exercises, sets, reps, duration, rest guidance, intensity, and notes where available.
- Track workout status: not started, in progress, completed, skipped.
- Allow individual exercise completion.
- Support workout summary data, such as total exercises completed, duration, and perceived difficulty.
- Provide a clear path to log completion without requiring excessive typing.

Workout data examples:

- Workout name.
- Exercise list.
- Sets and reps.
- Time-based intervals.
- Equipment needed.
- Target muscles.
- Intensity or effort level.
- Completion notes.

### Exercise Alternatives

Exercise alternatives let users adapt workouts based on equipment, pain, preference, or ability.

Required capabilities:

- Present alternative exercises for a planned exercise.
- Explain substitution reasons, such as no equipment, lower impact, easier progression, or similar muscle group.
- Allow a user to swap a planned exercise for an alternative in future phases.
- Track whether the original or substitute exercise was completed.
- Preserve workout intent when substitutions occur.

Alternative selection expectations:

- Alternatives should be easy to compare.
- Alternatives should not shame users for changing the plan.
- Safety-oriented language should encourage users to stop or modify exercises when discomfort occurs.

### Weight Logs

Weight logs allow users to record body weight over time.

Required capabilities:

- Log weight for a selected date.
- Support common units, including pounds and kilograms.
- Show the latest logged value on the daily dashboard.
- Allow editing or deleting incorrect entries in future phases.
- Support trend visualization in future phases.

Data expectations:

- Weight entries should include date, value, unit, optional note, and creation/update timestamps.
- The UI should avoid overemphasizing daily fluctuations.

### Mood, Energy, and Stress Logs

Wellbeing logs capture the user's subjective state.

Required capabilities:

- Log mood, energy, and stress for the selected date.
- Support simple scales, such as 1-5, low/medium/high, or emoji-based options.
- Allow optional notes alongside each log.
- Display the day's current wellbeing values on the dashboard.
- Support historical comparison and trends in future phases.

UX expectations:

- Logging should be quick and private-feeling.
- Labels should be clear and non-clinical unless future product strategy requires clinical framing.
- The app should not diagnose medical or mental health conditions.

### Daily Notes

Daily notes provide free-form reflection and context.

Required capabilities:

- Add and edit notes for a selected day.
- Support autosave or explicit save in future implementation.
- Display note previews on the daily dashboard.
- Support multiple note sections in future phases, such as gratitude, reflection, wins, blockers, or symptoms.

Interaction expectations:

- Notes should be easy to start and safe to leave without losing work.
- The UI should clearly communicate save state when editing is supported.

### Meal Suggestions

Meal suggestions help users plan nutrition without requiring full calorie tracking in Phase 1.

Required capabilities:

- Display suggested meals for the selected day.
- Group suggestions by breakfast, lunch, dinner, snack, or custom category.
- Include optional metadata, such as preparation time, dietary tags, protein focus, ingredients, and notes.
- Allow users to mark a suggestion accepted, skipped, or replaced in future phases.
- Support future personalization based on preferences, allergies, goals, budget, and available ingredients.

Meal suggestion expectations:

- Suggestions should be practical and low-friction.
- Dietary restrictions and allergies must be treated as high-priority constraints in future production logic.
- Phase 1 may use placeholder content only.

### Notifications

Notifications remind users about planned actions.

Required capabilities:

- Define notification types for tasks, workouts, meals, hydration, check-ins, and daily review.
- Represent notification preferences in the planning model.
- Distinguish between in-app reminders and device push notifications.
- Support future scheduling, snoozing, dismissal, and preference controls.

Notification expectations:

- Notifications should be helpful, respectful, and configurable.
- Users should be able to opt out of categories in future phases.
- Phase 1 does not deliver production notifications.

## Primary User Flows

### Start the Day

1. User opens RiseRoot.
2. App loads the daily dashboard for today.
3. User reviews schedule, tasks, workout, meals, logs, and notes.
4. User completes quick check-ins or starts the first planned activity.

### Complete a Task

1. User views the task list on the selected day.
2. User taps a checkbox or completion control.
3. Task state changes to completed.
4. Progress indicators update immediately.
5. User can undo or reopen the task when supported.

### Navigate to Another Date

1. User taps previous day, next day, today, or a calendar picker.
2. Selected date updates globally.
3. Dashboard modules refresh to show data for the selected date.
4. User reviews or edits date-specific content according to future permissions.

### Track a Workout

1. User opens the workout module from the daily dashboard.
2. User reviews exercises and starts the workout.
3. User marks exercises complete as they progress.
4. User optionally swaps exercises for alternatives.
5. User completes the workout and records summary details.

### Log Wellbeing

1. User opens the wellbeing module or dashboard prompt.
2. User selects mood, energy, and stress values.
3. User optionally adds a note.
4. App saves or stages the log depending on implementation phase.
5. Dashboard reflects the updated check-in.

### Add a Daily Note

1. User opens the notes module.
2. User writes a note for the selected date.
3. User saves or relies on autosave in future phases.
4. Dashboard shows a preview or completion indicator.

### Review Meal Suggestions

1. User views meal suggestions for the selected day.
2. User opens a meal card for details.
3. User accepts, skips, replaces, or saves a meal in future phases.
4. Meal status updates on the dashboard.

### Manage Reminder Preferences

1. User opens notification preferences.
2. User selects categories and preferred reminder times.
3. User grants device permissions when production push notifications are implemented.
4. App schedules or updates reminders in future phases.

## Screen Descriptions

### Daily Dashboard

Purpose: provide a complete snapshot of the selected day.

Expected sections:

- Date header and calendar navigation controls.
- Daily progress summary.
- Schedule timeline.
- Task list preview.
- Workout card.
- Meal suggestion cards.
- Weight and wellbeing log prompts.
- Daily note preview.
- Notification or reminder status.

### Schedule Screen

Purpose: manage and review the day's time-based plan.

Expected sections:

- Timeline or grouped list.
- Item status controls.
- Empty state.
- Add/edit affordances in future phases.

### Tasks Screen

Purpose: focus on actionable daily tasks.

Expected sections:

- Task groups.
- Completion controls.
- Priority or time indicators.
- Progress summary.

### Workout Screen

Purpose: guide and record the workout session.

Expected sections:

- Workout overview.
- Exercise list.
- Set, rep, duration, and rest details.
- Alternative exercise controls.
- Completion summary.

### Exercise Alternative Screen or Sheet

Purpose: let the user choose a safer or more practical substitute.

Expected sections:

- Original exercise summary.
- Alternative cards.
- Equipment and difficulty labels.
- Selection confirmation.

### Logs Screen

Purpose: capture weight, mood, energy, stress, and related notes.

Expected sections:

- Weight input.
- Mood selector.
- Energy selector.
- Stress selector.
- Optional note field.
- Recent history preview in future phases.

### Notes Screen

Purpose: provide date-specific writing space.

Expected sections:

- Date context.
- Text editor.
- Save/autosave indicator.
- Prompt templates in future phases.

### Meals Screen

Purpose: review and manage meal suggestions.

Expected sections:

- Meal categories.
- Meal suggestion cards.
- Dietary tags.
- Replacement actions in future phases.

### Notifications Settings Screen

Purpose: configure reminder categories, timing, and permissions.

Expected sections:

- Category toggles.
- Time preferences.
- Permission state.
- Quiet hours in future phases.

## Module Descriptions

### Day Context Module

Owns the selected date and exposes it to dashboard modules. It should keep date selection consistent across schedules, tasks, workouts, meals, logs, notes, and notifications.

### Schedule Module

Owns daily timeline items and their display order. It should eventually coordinate recurring routines, generated schedules, and manually added schedule blocks.

### Task Module

Owns task metadata, completion state, and progress calculations. It should remain independent enough to support one-off tasks, recurring tasks, and tasks generated by routines.

### Workout Module

Owns workout plans, exercise lists, exercise completion state, alternatives, and workout summaries.

### Logs Module

Owns weight, mood, energy, stress, and related daily wellness data.

### Notes Module

Owns free-form date-specific notes and future note templates.

### Meal Module

Owns meal suggestions, dietary metadata, and future personalization rules.

### Notification Module

Owns reminder preferences, notification category definitions, and future scheduling integration.

## UX Expectations

- Mobile-first layout with comfortable touch targets.
- Fast access to today's plan.
- Minimal friction for repeated daily actions.
- Friendly tone that supports progress without guilt.
- Clear distinction between planned, completed, skipped, and missing information.
- Consistent date context across screens.
- Accessible color contrast, readable typography, and semantic structure.
- Empty states that explain what the user can do next.
- Confirmation or undo for destructive actions.
- Privacy-conscious presentation of personal wellbeing data.

## Interaction Expectations

- Taps should produce immediate visual feedback.
- Completion controls should be reversible where possible.
- Long forms should be avoided on core daily flows.
- Editing should communicate save status and validation errors clearly.
- Navigation should preserve user context and avoid unexpected data loss.
- Loading and offline states should be explicit.
- Placeholder Phase 1 interactions should be labeled as non-production when applicable.

## Future Extensibility

RiseRoot should be designed to support:

- Recurring routines and habit plans.
- Personalized schedule generation.
- Workout progression and exercise libraries.
- Nutrition preferences, allergies, and grocery planning.
- Trends and insights for weight and wellbeing logs.
- Cloud sync and multi-device continuity.
- Wearable integrations.
- Push notifications and calendar integrations.
- Offline-first data entry.
- Exportable user data.
- Coaching content, recommendations, and adaptive plans.
- Multi-user or household use cases if product direction expands.

## Out of Scope for Phase 1

Phase 1 does not include:

- Production business logic.
- Production database migrations.
- Production authentication.
- Production push notification delivery.
- Medical, nutrition, or fitness advice engines.
- AI personalization or recommendation logic.
- Payment flows.
- Wearable integrations.
- Analytics dashboards beyond planning placeholders.
