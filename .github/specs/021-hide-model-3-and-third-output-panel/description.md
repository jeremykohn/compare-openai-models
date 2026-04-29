# General Description

Remove or hide the Model 3 dropdown and the third output panel, so that they are not visible or reachable when using the app. This update should be easily reversible so that a future commit can re-add the removed or hidden elements.

# Specific Description

## Problem Statement

The current app UI exposes a third model selector and a third comparison output panel that are not desired for the current user experience. People using the app should interact only with the two primary model selectors and the two corresponding output panels. Leaving the third UI elements visible introduces unnecessary complexity and can confuse users about available functionality.

At the same time, product direction may re-enable this comparison UI in a future commit, so the change needs to be implemented in a way that is straightforward to reverse.

## Intended Outcome

Update the app so the Model 3 dropdown and the third output panel are not visible, discoverable, or reachable in normal app usage, while preserving an implementation approach that can be cleanly reverted later.

The two-model flow should remain intact:
- Model 1 and Model 2 selectors remain visible and usable.
- Left and right output panels continue to render existing loading/success/error behavior.
- No new feature behavior is introduced in this update.

## Scope Boundaries

In scope:
- Hiding/removing UI rendering of the Model 3 dropdown in the main app interface.
- Hiding/removing UI rendering of the third comparison output panel in the main app interface.
- Updating related UI and e2e/unit tests that currently assert the third selector/panel is present.
- Refactoring limited UI wiring needed to prevent users from reaching these elements.
- Keeping implementation easy to reverse in a future commit.

Out of scope:
- Backend/API contract changes unrelated to hiding these UI elements.
- Redesign of the two-model UI layout beyond what is required by removing/hiding the third elements.
- Introduction of new feature flags or infrastructure unless strictly required.
- Changes to existing Model 1/Model 2 query behavior.

## Key Behaviors and Expected User-Visible Results

After the update:
- The Model 3 dropdown is not rendered in the user-visible interface.
- The third comparison output panel is not rendered in the user-visible interface.
- Users can interact only with the two existing model selectors and prompt input flow.
- Submission continues to run the existing two-model request flow.
- Existing left/right output behavior remains functionally unchanged.
- The hidden/removed elements are not keyboard-focusable or screen-reader discoverable through active UI paths.

## Assumptions

- The desired current UX is strictly two-model interaction and output display.
- A future commit is expected to restore these hidden/removed elements.
- Reversibility is achieved through minimal, localized UI changes rather than broad architectural removal.

## Constraints

- Keep changes minimal and focused on visibility/reachability of Model 3 UI elements.
- Preserve behavior of Model 1 and Model 2 user flows.
- Avoid deleting foundational logic if not necessary, to keep future restoration simple.

## Explicit Exclusions

- Adding new comparison logic.
- Modifying server endpoints to support this hide/remove operation.
- Introducing unrelated copy or styling refactors.

# Non-Goals

- Permanent deprecation of comparison functionality.
- Cleanup of all dormant comparison-related code outside direct UI reachability scope.
- Broader simplification of app architecture unrelated to this UI change.
