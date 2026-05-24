# Mobile viewport QA checklist (iPhone)

## Visual regression targets
- iPhone SE (375x667)
- iPhone 12/13/14 (390x844)
- iPhone 14 Pro Max (430x932)

## Verify on each mobile-first route
- `src/app/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/workout/page.tsx`
- `src/app/weight/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/calendar/page.tsx`
- `src/app/settings/page.tsx`

## Checks
1. Focus text/number/time input and confirm content scrolls above keyboard in iOS Safari.
2. Confirm sticky CTA/footer action remains visible and does not overlap focused fields.
3. Confirm bottom navigation never covers the final form control/content.
4. Confirm validation errors are visible, specific, and announced (`role=alert`) where relevant.
5. Confirm save buttons expose async states (`Saving...`) and disable during request.
6. Confirm modal/sheet interactions:
   - Open via keyboard and pointer.
   - Initial focus lands inside dialog.
   - Escape and overlay click close dialog.
   - Focus returns to triggering control after close.
7. Confirm no horizontal overflow at any tested width.
