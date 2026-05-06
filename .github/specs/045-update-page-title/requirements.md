# Requirements

## Functional Requirements

### FR-1 Document title update
The application MUST set the page document title to exactly `Compare OpenAI Models` for the default app route.

Acceptance criteria:
- Given the app is loaded, when page metadata is resolved, then the HTML title equals `Compare OpenAI Models`.
- The previous title string `ChatGPT prompt tester - Compare OpenAI Models` is not present in runtime page metadata for the app route.

### FR-2 Preserve existing visible UI copy
The update MUST NOT change user-visible page text content outside the browser/document title.

Acceptance criteria:
- The main page heading remains `Compare OpenAI Models`.
- The subtitle and existing helper text remain unchanged from their current approved copy.

### FR-3 Test coverage for title behavior
Automated tests MUST verify the updated title behavior where title assertions are applicable.

Acceptance criteria:
- Existing title assertions are updated to the new title value.
- If no current title assertion exists, add targeted coverage that validates the app title value.

## Technical Requirements

### TR-1 Single-source metadata change
Implement the title update in the existing app-level metadata configuration source rather than introducing duplicate title definitions.

Acceptance criteria:
- Exactly one canonical app title value is used for default metadata.
- No additional route-level title override is introduced unless already required by current architecture.

### TR-2 Minimal scoped code change
Limit implementation changes to title metadata configuration and directly impacted tests.

Acceptance criteria:
- No server route logic, request/response contracts, model-selection logic, or comparison flow logic is modified.
- No unrelated refactors are included in this update.

### TR-3 Validation commands
The implementation MUST pass targeted project checks relevant to this update.

Acceptance criteria:
- Title-related unit/integration/e2e tests (where applicable) pass.
- Repository lint/typecheck commands continue to pass for touched files.

## Security Requirements

### SR-1 No untrusted title sources
The document title value MUST remain a static trusted string in code and MUST NOT be derived from user-controlled input.

Acceptance criteria:
- Title assignment uses a constant literal or trusted static config value.
- No new path is introduced where request data, query params, or prompt text can influence page title.

### SR-2 Prevent stale sensitive branding strings
Deprecated title strings MUST be removed from active app metadata sources to reduce confusion and accidental leakage of outdated identifiers.

Acceptance criteria:
- Active metadata config no longer contains `ChatGPT prompt tester - Compare OpenAI Models`.
- Generated artifacts are out of scope for this requirement; source metadata is authoritative.

## Accessibility Requirements

### AR-1 Programmatic page title clarity
The page title MUST provide a concise, accurate description of page purpose for people using assistive technologies.

Acceptance criteria:
- The `<title>` value is human-readable and aligned with the visible page heading intent.
- The title is unique enough for browser tab and assistive-technology context switching within the app scope.

## Out of Scope / Non-Goals

- Changing heading, subtitle, form labels, button copy, helper text, or error text.
- Introducing dynamic per-route title templates.
- Modifying API endpoints, server utilities, caching behavior, or OpenAI integration logic.
- Performing unrelated formatting/refactoring outside touched metadata/tests.

## Assumptions and Constraints

- The current title is controlled from one app-level configuration location.
- The exact target title string is fixed: `Compare OpenAI Models`.
- The change should remain minimal, reversible, and low risk.
