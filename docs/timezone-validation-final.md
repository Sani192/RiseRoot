# Timezone Validation Final

This document records the final timezone validation policy for RiseRoot.

## Canonical policy

RiseRoot treats time in two distinct ways:

1. **Instants:** exact moments such as creation time, update time, reminder delivery, workout start, or completion. Instants must be persisted in UTC-compatible `timestamptz` columns or ISO timestamps.
2. **Local-day records:** domain records that belong to a user's calendar day, such as daily plans, daily notes, mood logs, and weight logs. These use `YYYY-MM-DD` local dates where the domain meaning is a day rather than a moment.

The application must never use server timezone as product truth. User-facing date behavior must be based on an IANA timezone such as `America/New_York`, `America/Los_Angeles`, or `UTC`.

## UTC persistence validation

UTC persistence is valid when:

- All instant columns use UTC-capable types such as `timestamptz`.
- Application code stores and compares instants as absolute moments.
- Local formatted strings are not persisted as instant source-of-truth values.
- `created_at`, `updated_at`, `scheduled_at`, `started_at`, `completed_at`, `logged_at`, and notification delivery timestamps are treated as instants.
- Local-day fields such as `plan_date`, `note_date`, and `logged_on` remain date-only domain values.

Validation checks:

- Insert an instant from a non-UTC local timezone and confirm it reads back as the same absolute moment.
- Compare records across server deployments in different timezones and confirm ordering does not change.
- Confirm APIs do not default to `new Date().toISOString().slice(0, 10)` when deriving a user-local day.

## Rendering validation

Rendering is valid when:

- API handlers accept or resolve a timezone before calculating default local dates.
- UI components pass browser timezone where the API contract allows a timezone override.
- Response payloads return local dates that match the user's effective timezone.
- Display formatting is isolated to API serialization, view models, or UI formatting helpers.
- Components do not duplicate custom timezone math.

Rendering scenarios:

| Input                             | Timezone              | Expected rendering behavior                                                 |
| --------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| `2026-06-01T01:00:00Z`            | `America/Los_Angeles` | Displays as May 31, 2026 local date where date-only rendering is requested. |
| `2026-06-01T12:00:00Z`            | `UTC`                 | Displays as June 1, 2026.                                                   |
| Current instant near UTC midnight | `Asia/Tokyo`          | Today's local date may be the next UTC date and must match Tokyo.           |

## DST validation

DST correctness requires IANA timezone rules rather than fixed numeric offsets.

Spring-forward expectations:

- A day with a skipped local hour still has one valid local date bucket.
- Schedule generation does not create invalid persisted instants for nonexistent local wall times.
- If a nonexistent local time is requested, the schedule engine applies a deterministic policy such as rolling forward to the next valid instant.

Fall-back expectations:

- A day with a repeated local hour still has one valid local date bucket.
- Repeated wall times map consistently according to the schedule engine's chosen policy.
- Sorting is based on UTC instants after conversion, not ambiguous local labels.

DST test regions should include at least:

- `America/New_York`
- `America/Los_Angeles`
- `Europe/London`
- A non-DST zone such as `UTC`

## Schedule generation validation

Schedule generation is valid when:

1. The user's local date and IANA timezone are known.
2. Local schedule rules are expanded in the user's timezone.
3. Generated local times are converted to UTC instants for persistence or transport.
4. Day filtering uses `[local day start, next local day start)` converted to UTC when querying instant-based events.
5. Generated records preserve stable order across DST boundaries.

Schedule validation cases:

- Generate a normal day of reminders and verify UTC ordering matches local ordering.
- Generate on DST start and verify the skipped hour policy.
- Generate on DST end and verify repeated hour policy.
- Generate in UTC and verify no offset conversion surprises.
- Generate historical dates and verify offsets reflect the historical rule set.

## Historical correctness

Historical correctness means the app uses the timezone rules that applied on the date being rendered, not the current offset.

Examples:

- `America/New_York` in winter should use standard time; in summer it should use daylight time.
- Regions that changed DST law historically should be rendered according to the IANA database available in the runtime.
- Stored UTC instants should not be reinterpreted if a user changes their profile timezone; only their display changes.

Validation workflow:

1. Pick historical dates in winter and summer for the same region.
2. Convert known UTC instants to local dates.
3. Confirm rendered dates and times match IANA expectations.
4. Confirm date-only records remain attached to their original local date semantics.

## API validation

API handlers must:

- Validate date strings as `YYYY-MM-DD`.
- Validate timezone strings as IANA timezone IDs.
- Reject invalid timezone values.
- Derive missing dates from the effective timezone.
- Use authenticated user identity when reading or writing date-scoped records.

Invalid examples that should fail validation:

- `timezone=EST`
- `timezone=-05:00`
- `date=06/01/2026`
- `date=2026-6-1`

Valid examples:

- `timezone=UTC`
- `timezone=America/New_York`
- `date=2026-06-01`

## Final acceptance criteria

Timezone handling is accepted for production when:

- Date helper tests pass.
- Schedule engine edge-case tests pass.
- API contract tests cover timezone input validation and local date derivation.
- Manual smoke testing verifies at least one positive-offset, one negative-offset, one DST, and one non-DST timezone.
- No route or component owns duplicate timezone conversion logic when a shared helper exists.
