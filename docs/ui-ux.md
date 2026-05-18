# RiseRoot UI/UX Direction

## Purpose

This document defines the intended visual and interaction direction for RiseRoot. It should guide early wireframes, component design, and future implementation decisions so the product feels cohesive, calm, and usable on mobile devices from the beginning.

## Design Language

RiseRoot should feel calm, premium, minimal, translucent, and modern. The interface should support daily routines without feeling noisy, gamified, or clinical.

Design principles:

- Calm: prioritize visual quiet, generous spacing, soft contrast, and low-pressure progress language.
- Premium: use deliberate hierarchy, refined surfaces, polished motion, and consistent spacing rather than decorative density.
- Minimal: show only what helps the user understand the day and take the next action.
- Translucent: use layered surfaces and subtle depth where it clarifies grouping.
- Modern: prefer clean geometry, fluid transitions, and mobile-native interaction patterns.

The product should feel like a thoughtful daily companion, not a data-heavy performance dashboard.

## Dark Mode First Color Direction

RiseRoot should be designed dark mode first. Light mode may be added later, but the initial color system should optimize for comfortable repeated use in dim or indoor environments.

Color direction:

- Base surfaces should use deep neutral backgrounds, such as charcoal, near-black blue, or warm black.
- Primary surfaces should be slightly elevated from the base with low-contrast tonal shifts.
- Accent colors should be muted, wellness-oriented, and restrained.
- Status colors should be readable but not aggressive.
- Text should use strong contrast for primary content and intentionally softer contrast for secondary metadata.

Avoid relying on saturated color as the only way to communicate state. Icons, labels, affordances, and layout should reinforce meaning.

## Glassmorphism Card Treatment

Cards should use a refined glassmorphism treatment that supports a premium mobile experience without reducing readability.

Card guidance:

- Use translucent surfaces layered over dark backgrounds.
- Apply background blur sparingly and consistently.
- Use soft borders to define edges without high-contrast outlines.
- Keep surfaces low contrast and calm.
- Use subtle shadows or highlights only where they improve separation.
- Avoid stacking too many translucent layers in one viewport.

Glassmorphism should feel like soft depth, not visual noise. If text readability suffers, increase surface opacity or reduce background complexity.

## Mobile-First Layout Rules for iPhone Browsers

RiseRoot should be planned for iPhone browser use before desktop expansion.

Mobile layout rules:

- Design the primary viewport for narrow widths first, including small iPhone screens.
- Respect safe areas, browser chrome, and dynamic viewport changes.
- Keep critical content above bottom navigation and sticky action areas.
- Use a single-column default layout for daily dashboard content.
- Stack cards vertically with clear section rhythm.
- Prefer bottom sheets and inline expansion for short tasks.
- Avoid long modal workflows on mobile.
- Keep forms short, chunked, and keyboard-aware.
- Ensure inputs are not obscured by the on-screen keyboard.
- Use desktop and tablet layouts as progressive enhancements, not the baseline.

Primary mobile screens should remain usable with one hand where possible.

## Bottom Navigation Pattern

RiseRoot should use a bottom navigation pattern for primary app sections on mobile.

Bottom navigation guidance:

- Keep primary destinations limited and stable.
- Place the most frequently used daily destination in the easiest thumb zone.
- Use clear labels with icons rather than icon-only navigation.
- Keep the selected state obvious but understated.
- Do not overcrowd the bar with secondary actions.
- Reserve settings, history, and infrequent tools for secondary navigation when possible.

The bottom navigation should create orientation and quick access, not become a control panel.

## Sticky Action Areas

High-frequency completion and save actions should be available without forcing excessive scrolling.

Sticky action guidance:

- Use sticky bottom action areas for primary form submission or daily completion flows.
- Keep sticky areas visually distinct from content while preserving the calm glass treatment.
- Ensure sticky controls do not cover important content.
- Add enough bottom padding to scrollable content so final fields remain reachable.
- Keep the sticky area focused on one primary action and, when necessary, one secondary action.

Sticky actions should reduce friction while staying predictable and unobtrusive.

## Thumb-Friendly Tap Targets

RiseRoot should be comfortable to use during quick check-ins throughout the day.

Tap target guidance:

- Use a minimum target size of 44 by 44 CSS pixels for interactive controls.
- Prefer larger targets for primary daily actions, completion toggles, and bottom navigation items.
- Maintain sufficient spacing between adjacent controls to prevent accidental taps.
- Place common actions within comfortable thumb reach on mobile.
- Avoid tiny inline links for essential actions.
- Make the entire row or card region tappable when that matches user expectations.

Interaction design should assume users may be moving, distracted, or using one hand.

## Typography Direction

Typography should feel clear, warm, and premium without becoming ornamental.

Typography guidance:

- Use a modern sans-serif type system with excellent mobile legibility.
- Prefer medium-weight headings and readable body sizes.
- Use type scale to create hierarchy instead of adding extra dividers or labels.
- Keep line lengths short on mobile.
- Use relaxed line height for notes, descriptions, and supportive copy.
- Use tabular numerals where alignment helps schedules, times, or metrics.
- Avoid overly technical, athletic, or clinical typography cues.

Copy should be concise, supportive, and non-judgmental.

## Animation Philosophy

Motion should use subtle Framer Motion transitions to make the interface feel responsive and polished.

Animation guidance:

- Use short, soft transitions for card entry, screen changes, selection states, and bottom sheets.
- Favor opacity, slight translate, and small scale changes over dramatic movement.
- Use motion to clarify causality, such as completing a task or opening a detail view.
- Keep transitions fast enough for repeated daily use.
- Avoid bouncy, flashy, or attention-seeking effects.
- Respect reduced-motion preferences and provide non-animated fallbacks.

Animations should reinforce calm confidence. They should never delay core actions.

## Accessibility Expectations

Accessibility should be a baseline requirement, not a later enhancement.

Expected standards:

- Maintain accessible contrast for text, controls, focus states, and essential icons.
- Do not depend on color alone to communicate status or progress.
- Provide visible keyboard focus states for all interactive elements.
- Ensure all controls are reachable and operable by keyboard where the platform supports keyboard input.
- Use semantic HTML and accessible names for navigation, buttons, fields, and status indicators.
- Keep touch targets at least 44 by 44 CSS pixels.
- Support screen reader comprehension with meaningful labels and state announcements.
- Respect reduced-motion settings.
- Validate forms with clear, human-readable messages.

Glass and low-contrast visual treatments must never compromise readability, focus visibility, or touch usability.

## Explicit Exclusions

RiseRoot should not adopt visual styles that conflict with its calm daily wellness direction.

Excluded styles:

- No neon cyberpunk styling.
- No cluttered dashboards.
- No calorie-counting aesthetic.
- No bodybuilding aesthetic.
- No aggressive streak mechanics or shame-based progress visuals.
- No dense analytics-first layouts for the primary daily experience.
- No overly clinical medical interface treatment unless required by future compliance needs.

The interface should prioritize sustainable daily use over intensity, performance pressure, or visual spectacle.
