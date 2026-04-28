# Description: Add Third Model Selector for Comparing Outputs

## General Description

Currently there are two dropdown menus, labeled "Model 1" and "Model 2", for selecting an OpenAI model. Create a new, third dropdown for selecting an OpenAI model, using the same model list as for the other two dropdowns. The new dropdown should be:
- labeled "Model for comparing outputs"
- located under the two existing dropdown menus when the screen is narrow (mobile resolution)
- located in its own row underneath the two existing side-by-side dropdown menus when the screen is wide (desktop/laptop resolution)
- disabled/inactive (for now)

## Specific Description

### Problem Statement

The app currently presents two active model selectors ("Model 1" and "Model 2") in a side-by-side layout at desktop widths. A future feature will allow users to compare model outputs by selecting a third model. In preparation for that feature, a third dropdown must be added to the UI now, in disabled/inactive form, so that the layout and structural scaffolding are in place before the comparison feature is wired up.

### Intended Outcome

Add one new, disabled dropdown menu to `ModelsSelector.vue` with the following characteristics:

- **Label:** `"Model for comparing outputs"` (with the same required-indicator treatment as the existing selectors, i.e., appended with `*` when required)
- **Behavior:** Always disabled/inactive — the control is not interactive and does not participate in the submit flow or any query
- **Model options:** Populated from the same model list source as the existing two dropdowns
- **Layout at narrow widths (mobile):** Stacked vertically below both existing selectors, each selector in its own row
- **Layout at wide widths (desktop/laptop):** The two existing selectors remain in a two-column row; the new third selector appears in its own full-width row directly below that two-column row

### Scope Boundaries

**In scope:**
- Adding one new `ModelSelectField` instance to `ModelsSelector.vue` for the third selector
- Binding the new selector to the same models source used by "Model 1" and "Model 2"
- Always rendering the new selector as disabled (the `disabled` prop or equivalent)
- Applying correct responsive layout: `md:grid-cols-2` for the existing two selectors, with the third selector spanning the full width of the container in its own row
- Adding a new prop and emit to `ModelsSelector` for the third model's selected value, following the established `selectedModelIdModel1` / `selectedModelIdModel2` naming pattern (e.g., `selectedModelIdModelComparison`)
- Wiring the new prop in `app/app.vue` with a default empty string ref, without connecting it to any query
- Updating unit tests and accessibility tests to cover the new selector's presence, disabled state, label, and option parity
- Updating the e2e selector helper in `tests/e2e/helpers/selectors.ts` to expose the new selector

**Out of scope:**
- Making the third dropdown interactive or enabling it in this update
- Connecting the third dropdown to any API query or server route
- Adding any output panel or output area for the third model
- Changing the layout or behavior of the existing two dropdowns or their output areas
- Any visual redesign of the existing selector or output areas beyond the layout addition

### Key Behaviors and Expected User-Visible Results

- The model-selector area shows three dropdown menus: "Model 1", "Model 2", and "Model for comparing outputs"
- On desktop/laptop widths, "Model 1" and "Model 2" appear side by side in one row; "Model for comparing outputs" appears in a full-width row below them
- On mobile widths, all three dropdowns appear stacked vertically, each in its own row
- The "Model for comparing outputs" dropdown is visually disabled: it is not interactive, its styling matches the existing disabled state (slate background, not-allowed cursor), and it cannot be changed by the user
- When models load successfully, the "Model for comparing outputs" dropdown shows the same options as the other two dropdowns, in the same order, but remains non-interactive
- When models are loading or errored, the "Model for comparing outputs" dropdown follows the same unavailable/disabled presentation as the other two dropdowns
- The label "Model for comparing outputs" is visually and programmatically associated with the selector control (via matching `for` and `id` attributes)
- The disabled state is exposed to assistive technologies so screen reader users understand the control is currently inactive
- All existing Model 1 and Model 2 functionality, queries, and output areas are unchanged

### Assumptions and Constraints

- The new selector always uses the same models source (`modelsState.data`) as the existing two — no separate fetch is needed
- The new selector is hardcoded as disabled for this update; enablement is a future spec
- The existing `ModelSelectField` component already supports the `disabled` prop and disabled styling — the new selector can reuse it without changes to `ModelSelectField`
- The ID for the new select element should follow the established pattern: `model-comparison-select`
- The responsive layout should be achieved with Tailwind utility classes consistent with the existing `ModelsSelector.vue` approach (`md:grid-cols-2` for the two-column row, and a separate single-column row for the third selector)
- No server routes, composables, API types, or error normalization logic change as a result of this update

## Non-Goals

- Enabling or wiring the third dropdown to a model query
- Adding a third output area or comparison output panel
- Displaying comparison results of any kind
- Changing any existing query, request, or response behavior
