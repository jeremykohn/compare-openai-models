# Description: Add Third Output Area Placeholder Panel

## General Description

Currently there are two output areas, one for the output of model 1, and another for the output of model 2. Create a new, third output area, which should:
- be displayed along with the other two output areas after the user submits the form
- be located under the two existing dropdown menus when the screen is narrow (mobile resolution)
- be located in its own row underneath the two existing side-by-side dropdown menus when the screen is wide (laptop/desktop resolution)
- initially show "Waiting for Model 1 and Model 2 responses..." (with a loading spinner) until the output panels for model 1 and model 2 are fully loaded and displayed
- afterwards show the heading "Comparison between responses of Models 1 and 2", along with the italicized placeholder text "New feature coming soon!"

## Specific Description

### Problem Statement

The current UI shows two output panels only (Model 1 and Model 2). There is no dedicated third output panel that previews future comparison functionality. The app needs a visible third output area that appears in the output region after submission, shows an interim loading message while the two existing model outputs are still resolving, and then transitions to a static comparison placeholder message once both existing outputs are fully displayed.

### Intended Outcome

Add a third output panel in the output region with the following behavior:

- It becomes part of the output-region rendering once the user submits the form.
- During in-flight state (while either Model 1 or Model 2 output panel is still loading), it displays:
  - loading spinner,
  - text: `Waiting for Model 1 and Model 2 responses...`
- After both Model 1 and Model 2 output panels have fully resolved and are displayed (success and/or error terminal states), it displays:
  - heading: `Comparison between responses of Models 1 and 2`
  - italicized body text: `New feature coming soon!`

### Scope Boundaries

**In scope:**
- Adding one third output panel in the output rendering section.
- Showing the third panel only as part of post-submit output rendering (with the existing output visibility flow).
- Implementing third-panel interim loading state and post-resolution placeholder state.
- Applying required text content exactly as specified.
- Ensuring the placeholder text is italicized.
- Implementing responsive placement rules for the third panel:
  - narrow/mobile: rendered below existing output content in the single-column flow,
  - wide/desktop: rendered in its own row below the two existing side-by-side output panels.
- Updating affected unit/e2e/a11y tests as needed.

**Out of scope:**
- Any real comparison logic or comparison API requests.
- Any changes to query orchestration (still only Model 1 and Model 2 requests).
- Any changes to selectors/dropdowns behavior in this spec.
- Any change to existing Model 1 / Model 2 output content semantics.
- Any enablement of the third selector introduced in prior specs.

### Key Behaviors and Expected User-Visible Results

- Before submit, output area behavior remains unchanged.
- After submit starts, the two existing output panels behave as they do now.
- The third output panel is present in the output region and initially shows loading UI with:
  - spinner,
  - `Waiting for Model 1 and Model 2 responses...`
- Once both existing output panels are fully loaded and displayed, the third panel switches to:
  - heading: `Comparison between responses of Models 1 and 2`
  - italicized text: `New feature coming soon!`
- If one existing model output resolves before the other, the third panel remains in waiting state until both are resolved.
- Existing accessibility semantics for output regions (status/alert behavior of existing panels) remain intact.

### Assumptions and Constraints

- The third output panel is UI-only and does not trigger network requests.
- Existing request lifecycle states for Model 1 and Model 2 can be used to determine the third panel transition from waiting state to placeholder state.
- "Fully loaded and displayed" means both existing output panels are in terminal (non-loading) states for the active submission.
- The third output panel should align with existing output-area visual language, except for explicitly requested heading/text content and italic styling.

## Non-Goals

- Producing a comparison summary/report.
- Displaying compared response content in this spec.
- Handling comparison-request errors (that belongs to later comparison-enabled specs).
- Refactoring unrelated output or selector architecture beyond what is needed to add the third output panel placeholder behavior.
