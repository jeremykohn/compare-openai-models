# Design: Add Third Output Area Placeholder Panel

**Spec:** `017-add-third-output-area-placeholder`
**Related Requirements:** `requirements.md`

## Overview

This change adds a third, UI-only output panel in the app response section. The panel participates in the existing output lifecycle:

1. It appears after submission starts (same visibility gate as existing output section).
2. It shows a waiting state while either Model 1 or Model 2 is still loading.
3. It switches to placeholder content once both existing model requests reach terminal states.

The design intentionally avoids introducing a third API request and preserves Model 1/Model 2 behavior.

## Goals

- Add third output panel with required text content and transition behavior.
- Keep existing two-panel output logic and request orchestration stable.
- Preserve accessibility semantics and testing confidence.

## Non-Goals

- Real comparison generation.
- Third-model request orchestration.
- Contract changes to server API responses.

## Current State Analysis

- `app/app.vue` currently renders Model 1 and Model 2 output panels via `outputPanels` in a two-column grid on `md+`.
- Output region visibility is controlled by `showOutputPanels` (true for loading/success/error).
- Global loading flag `isLoading` is true if either model request status is `loading`.
- `ModelOutputPanel.vue` owns each existing panel’s loading/success/error body.

This is sufficient to derive third-panel state without changing server logic.

## Proposed Architecture

### Template Structure (`app/app.vue`)

- Keep existing two-panel grid unchanged for Model 1 and Model 2.
- Add a new panel element immediately below that grid, within the same output section.
- Style as full width so it naturally becomes its own row beneath the two-column layout.

Proposed structure (conceptual):
- `section` response region
  - `div` existing 2-column grid (Model 1 + Model 2)
  - `article` third comparison placeholder panel (full width row)

### Third Panel State Model

Derive with computed state from existing statuses:

- `isComparisonWaiting = model1State.status === 'loading' || model2State.status === 'loading'`
- `isComparisonReady = !isComparisonWaiting`

Because the panel is rendered only when `showOutputPanels` is true, `isComparisonReady` corresponds to terminal display states after loading completes.

### Third Panel Rendering Rules

- If `isComparisonWaiting`:
  - render spinner + exact waiting text `Waiting for Model 1 and Model 2 responses...`
  - expose polite status semantics (`role="status"`, `aria-live="polite"`)
- Else:
  - render heading `Comparison between responses of Models 1 and 2`
  - render italicized text `New feature coming soon!`

### Styling and Responsive Behavior

- Third panel uses same surface styling language as output panels (border, rounded, background) for consistency.
- Existing two panels remain side-by-side on `md+` because their grid remains unchanged.
- Third panel appears beneath due to placement outside the two-column grid but inside output section stack.

## Data Flow

1. User submits valid prompt.
2. Existing submit handler sets model states to `loading`.
3. Output section appears (`showOutputPanels = true`).
4. Third panel appears in waiting mode.
5. Model requests settle independently.
6. When both are non-loading terminal states, third panel switches to placeholder mode.

No additional API calls or payload transformations are introduced.

## Accessibility Design

- Waiting state uses `role="status"` with polite live updates to announce progress text.
- Placeholder heading uses heading semantics for scanability.
- Existing landmarks and response-region labels remain unchanged.
- No keyboard traps or new focusable elements are introduced.

## Security Considerations

- Third panel renders static strings only.
- No secrets, tokens, or additional user-controlled content is processed.
- Existing error handling pipeline remains unchanged.

## Testing Strategy

### Unit Tests

- Update `tests/unit/app.ui.test.ts`:
  - Verify waiting state appears in third panel during loading.
  - Verify placeholder heading + italic text appears after both requests resolve.

### Accessibility Tests

- Update `tests/unit/app.a11y.test.ts`:
  - If counting status regions during loading, include third-panel status semantics.
  - Verify response region labels/alerts remain stable.

### End-to-End Tests

- Update `tests/e2e/app.spec.ts`:
  - Verify third panel appears after submit and transitions to placeholder content once responses complete.

### Quality Gates

- Run:
  - `npm run typecheck`
  - `npm test`
  - `npm run lint`

## Rollout / Risk

- Low risk: additive UI change in `app/app.vue` with no server contract changes.
- Primary regression risk: tests assuming only two status/loading messages.
- Mitigation: adjust assertions to check intended semantics rather than brittle counts where possible.

## Requirement Traceability

- **FR-1/FR-2** → Third panel placement in `app/app.vue` under existing grid.
- **FR-3** → Waiting branch with spinner + exact text.
- **FR-4** → Placeholder branch with exact heading + italicized message.
- **FR-5/TR-4** → Keep existing `ModelOutputPanel` usage and states unchanged.
- **TR-3/PR-1** → No submit/request orchestration changes.
- **AR-1/AR-2/AR-3** → Status semantics + heading semantics + existing a11y test coverage.
