# Overview

This update refines the third output panel shown in the Model 3 comparison success path by replacing legacy placeholder copy, updating panel text labels, and aligning inner spacing with the Model 1 and Model 2 panels.

Goals:
- Remove outdated placeholder text from the third panel.
- Update the third-panel header to include selected Model 3 name.
- Rename the prompt toggle label to `Comparison prompt for Model 3`.
- Align third-panel inner margin with other response panels.
- Preserve existing request orchestration and panel visibility behavior.

Out of scope:
- Changes to comparison generation logic or API request flow.
- Changes to backend routes/contracts.
- Broad panel/layout redesign outside the requested copy/spacing updates.

# Architecture

## High-Level Approach

1. Update third-panel success-state content rendering in existing UI component surfaces.
2. Replace static/legacy header and toggle label literals with the new target copy.
3. Interpolate selected Model 3 display name into the new header text using existing selection state.
4. Remove legacy placeholder-text rendering from the third-panel success path.
5. Normalize third-panel inner spacing to match Model 1/Model 2 panel content spacing.
6. Preserve existing visibility conditions and state transitions for third-panel rendering.

## Affected Files (Expected)

- `app/components/ComparisonOutputPanel.vue` (panel header/toggle/placeholder display content and spacing classes)
- `app/composables/use-comparison-ui-state.ts` (selected Model 3 name projection if needed for view-model text)
- `app/app.vue` (only if third-panel content binding currently lives here)
- `tests/unit/app.ui.test.ts` (text and visibility assertions)
- `tests/e2e/app.spec.ts` (user-visible behavior assertions for updated copy)

# Interfaces

## UI Text Contract

### Third-panel header (success path)
- Old: `Comparison of responses from Model 1 and Model 2`
- New: `Response from Model 3 ({model-3-name}) comparing responses from Model 1 and Model 2`
- `{model-3-name}` resolves to selected Model 3 dropdown label.

### Third-panel toggle label
- Old: `Prompt for Model 3`
- New: `Comparison prompt for Model 3`

### Placeholder text behavior
- Remove rendering of old placeholder text from third-panel success content.

## Layout Contract

- Third-panel content container inner margin must match equivalent content-container spacing used in Model 1/Model 2 response panels.

# Data

## State Usage

No new domain data is introduced.

Use existing state values:
- selected Model 3 identifier/label source
- existing third-panel visibility/success-path state

## Data Flow

1. User selects models and submits request.
2. Existing flow produces Model 1 + Model 2 success and triggers third-panel display conditions.
3. Third panel renders updated header using selected Model 3 name from existing state.
4. Third panel renders updated toggle label.
5. Third panel no longer renders old placeholder text.

# Validation/Error Handling

- This change does not alter API error handling.
- Existing success/error branch conditions remain unchanged.
- If selected Model 3 label is unavailable unexpectedly, fallback behavior must remain deterministic and non-breaking (e.g., existing label fallback), without changing branch visibility logic.

# Security

- No new request surfaces introduced.
- No secret-bearing values are rendered in new header interpolation.
- UI copy/layout-only changes preserve existing security posture and server/client boundaries.

# Accessibility

- Updated toggle label must remain accessible and keyboard-operable.
- Existing `aria-expanded` semantics and controlled-region behavior remain intact.
- Updated heading text remains in current semantic location for screen-reader discoverability.

# Testing

## Unit Tests

- Validate third-panel header renders new string with selected Model 3 name.
- Validate toggle label renders `Comparison prompt for Model 3`.
- Validate old placeholder text is not rendered in third-panel success state.
- Validate no regressions in third-panel visibility conditions.

## E2E Tests

- Validate user-visible third-panel header text includes selected Model 3 name.
- Validate toggle label text update in browser flow.
- Validate legacy placeholder copy is absent where third panel is shown.

## Quality Gates

- `npm run typecheck`
- `npm test`
- `npm run lint`

# Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Interfaces; Testing | Removes legacy placeholder text from third-panel success content. |
| FR-2 | Interfaces; Data; Testing | Updates header contract and interpolates selected Model 3 name. |
| FR-3 | Interfaces; Accessibility; Testing | Renames toggle label while preserving interaction semantics. |
| FR-4 | Interfaces; Architecture; Testing | Aligns third-panel inner spacing with Model 1/Model 2 panels. |
| FR-5 | Architecture; Data; Validation/Error Handling | Preserves existing visibility/orchestration behavior. |
| TR-1 | Architecture; Affected Files | Keeps implementation scoped to relevant UI surfaces. |
| TR-2 | Data; Validation/Error Handling | Reuses existing Model 3 selection source of truth. |
| TR-3 | Interfaces; Testing | Ensures deterministic rendering behavior for new text content. |
| TR-4 | Testing | Defines required updates to unit/e2e assertions. |
| TR-5 | Testing | Requires passing repository quality gates. |
| AR-1 | Accessibility; Interfaces; Testing | Preserves toggle accessibility after label rename. |
| AR-2 | Accessibility; Interfaces | Maintains heading comprehension and semantic location. |
