# Requirements: Add Error Details Toggle

**Source:** `.github/specs/001-add-error-details-toggle/description.md`

**Date:** 2026-04-22

---

## Functional Requirements

### FR-1: Display Generic Error Message
- The application SHALL display a generic error message when an error occurs during prompt submission
- The message text SHALL be: "Something went wrong\n\nAn unexpected error occurred. Please try again or contact support."
- The message SHALL be rendered at the top of the error container
- **Acceptance Criteria:**
  - Generic message appears when any error is triggered
  - Text is exactly as specified
  - Message placement is visually distinct and accessible

### FR-2: Provide Collapsible Error Details Toggle
- The application SHALL display a `<details>` HTML element below the generic error message
- The `<details>` element SHALL be collapsed by default (not open)
- The `<summary>` element inside `<details>` SHALL display the label "Error Details" or similar user-friendly label
- The toggle SHALL expand/collapse when the user clicks the summary
- **Acceptance Criteria:**
  - `<details>` element is present in the DOM when error details are available
  - Element is collapsed on initial render
  - Click on summary expands/collapses the details section

### FR-3: Display Sanitized Error Information
- When the error details toggle is expanded, the application SHALL display:
  1. **Error Type** — The classification of the error (e.g., `NetworkError`, `ValidationError`, `APIError`)
  2. **HTTP Status Code** — The HTTP status code (if applicable; omit if not present)
  3. **Error Message** — A user-friendly error message (sanitized and safe to display)
- The error details SHALL be formatted in a readable, structured layout
- **Acceptance Criteria:**
  - All three fields are displayed when available
  - Fields are clearly labeled
  - Formatting is consistent and readable
  - No sensitive data is exposed (see Security Requirements)

### FR-4: Support Multiple Error Scenarios
- The error details component SHALL handle all error scenarios in the application:
  - Network errors (connection failures, timeouts)
  - API errors (OpenAI API failures, HTTP errors)
  - Validation errors (invalid model selection, missing input)
  - Unexpected errors (uncaught exceptions)
- Error details SHALL be available and displayable for all scenarios
- **Acceptance Criteria:**
  - Each error scenario produces normalized error data
  - All error types are successfully displayed in the toggle
  - No errors prevent the component from rendering

### FR-5: Maintain Error State Persistence
- When an error occurs and the user expands the error details toggle, the toggle state SHALL persist while the error is displayed
- If the user closes the error or a new error occurs, the toggle state SHALL reset to collapsed
- **Acceptance Criteria:**
  - Toggle remains in expanded/collapsed state until error is dismissed
  - New errors reset toggle to collapsed state
  - No duplicate or stale error details are displayed

---

## Technical Requirements

### TR-1: Normalize Error Data Structure
- The application SHALL normalize all errors into a consistent structure with the following properties:
  - `type: string` — Error classification (e.g., `NetworkError`, `ValidationError`, `APIError`)
  - `statusCode?: number` — HTTP status code (optional, omit if not applicable)
  - `message: string` — User-friendly error message (sanitized, no sensitive data)
  - `timestamp?: string` — ISO 8601 timestamp of error occurrence (optional, for logging)
- Error normalization SHALL occur at:
  - Server routes that handle API calls (before sending error to client)
  - Client-side error handlers in composables or utilities
- **Acceptance Criteria:**
  - All errors follow this structure
  - Server errors are normalized in `server/api/` routes
  - Client errors are normalized in composables or utilities
  - TypeScript types enforce the structure

### TR-2: Update UiErrorAlert Component
- The `app/components/UiErrorAlert.vue` component SHALL be updated to:
  1. Accept an error object with properties: `type`, `statusCode` (optional), and `message`
  2. Render the generic error message at the top (unchanged from current)
  3. Render a `<details>` element below the message with:
     - `<summary>` displaying "Error Details"
     - Structured display of error type, status code, and message inside the `<details>` body
  4. Support both expanded and collapsed states
- The component SHALL use Vue 3 Composition API with `<script setup lang="ts">`
- **Acceptance Criteria:**
  - Component accepts error object via props
  - `<details>` element renders correctly
  - Component renders without errors even if some error properties are missing
  - Component is backward compatible with existing error handling

### TR-3: Create Error Normalization Utility
- A utility function (or composable) SHALL normalize errors from various sources:
  - Fetch API responses (including HTTP error codes)
  - OpenAI API responses
  - Validation errors (e.g., missing/invalid model selection)
  - Unexpected JavaScript errors
- The utility SHALL:
  - Accept an error object of any shape (Error, Response, custom object, etc.)
  - Return a normalized error object with the structure defined in TR-1
  - Sanitize error messages to remove sensitive information
- Location: `app/utils/error-normalization.ts` (or existing location if it already exists)
- **Acceptance Criteria:**
  - Utility correctly normalizes errors from all sources
  - Sensitive data is removed during normalization
  - TypeScript types enforce input/output contracts
  - Utility is tested with unit tests

### TR-4: Integrate Error Normalization into Error Handlers
- All error handlers in the application SHALL use the error normalization utility:
  - Server routes in `server/api/` that catch errors
  - Client-side composables that handle API calls (e.g., `usePromptSubmit`, `useModelsState`)
  - Global error handling in the application shell (if applicable)
- Normalized errors SHALL be passed to the error state management (composable or store)
- **Acceptance Criteria:**
  - All error handlers call the normalization utility
  - Errors flow through error state management
  - Component receives normalized error data

### TR-5: Error State Management
- The application SHALL maintain error state via:
  - A composable (e.g., `useErrorState`) that manages error state, or
  - Existing error state mechanism (if already in place)
- The error state SHALL expose:
  - `error: Ref<ErrorType | null>` — The current error or null if no error
  - `setError(error: any)` — Function to set an error (normalizes automatically)
  - `clearError()` — Function to clear the current error
- **Acceptance Criteria:**
  - Error state is reactive and updates the UI when changed
  - setError() automatically normalizes the error
  - clearError() removes the error and resets UI
  - Composable integrates with all error handlers

### TR-6: Handle Errors in Prompt Submission Flow
- When the user submits a prompt, errors that occur SHALL be:
  1. Caught in the try/catch block in the submission handler
  2. Normalized using the error normalization utility
  3. Set in error state (which updates the component)
  4. Displayed via the updated `UiErrorAlert` component
- The submission form/button SHALL be disabled while awaiting a response
- Error state SHALL be cleared when:
  - User submits a new prompt
  - User dismisses the error (if a dismiss button is present)
- **Acceptance Criteria:**
  - Errors during submission are caught and displayed
  - Error details are accessible via the toggle
  - Component UI responds appropriately to error state

### TR-7: Testing Requirements
- Unit tests SHALL verify:
  - Error normalization utility correctly transforms various error formats
  - `UiErrorAlert` component renders error details correctly
  - Component displays/hides details toggle based on error state
  - Sensitive data is excluded from normalized errors
- Integration tests (or E2E tests) SHALL verify:
  - Prompt submission with error triggers error display
  - Error details toggle expands/collapses
  - Error state clears appropriately
- Test files:
  - `tests/unit/error-normalization.test.ts` (if creating new utility)
  - `tests/unit/ui-error-alert.test.ts` (component tests)
  - `tests/e2e/app.spec.ts` (E2E integration tests)
- **Acceptance Criteria:**
  - All tests pass
  - Coverage includes error paths
  - Tests validate both happy path and error scenarios

---

## Security Requirements

### SR-1: Sanitize Error Messages (OWASP A06: Vulnerable & Outdated Components / A03: Injection)
- Error messages displayed to users SHALL NOT contain:
  - Internal file paths or system paths (e.g., `/home/user/app/src/...`)
  - Stack traces or line numbers revealing code structure
  - Database connection strings or table names
  - API keys, tokens, or credentials
  - Internal IP addresses or hostnames
  - User personal identifiable information (PII)
  - SQL queries or database details
  - Internal system variable names or environment details
- Error normalization utility SHALL strip or redact all of the above
- **Acceptance Criteria:**
  - Unit tests verify sanitization of known sensitive data patterns
  - No sensitive data appears in error details displayed to users
  - Manual review confirms no new sensitive data leakage

### SR-2: Input Validation & Error Context (OWASP A01: Broken Access Control / A03: Injection)
- The error normalization utility SHALL validate the input error object to prevent injection or manipulation:
  - Ensure error message is a string (not an object or array)
  - Validate `statusCode` is a valid HTTP status code (100–599) or omit if invalid
  - Validate `type` is a known error classification or use a default (e.g., `UnknownError`)
- **Acceptance Criteria:**
  - Invalid error objects are handled gracefully
  - Invalid fields are rejected or normalized to defaults
  - No errors occur during normalization of unexpected input types

### SR-3: Prevent Client-Side XSS (OWASP A03: Injection)
- All error message content displayed in the `UiErrorAlert` component SHALL be treated as plain text:
  - Use `.textContent` or Vue's interpolation (which escapes by default) instead of `.innerHTML`
  - Do not use `v-html` directive on user-controlled error messages
  - Ensure no HTML or script content can be injected via error messages
- **Acceptance Criteria:**
  - Component uses safe rendering (e.g., `{{ message }}` or `textContent`)
  - No `v-html` is used on error fields
  - XSS injection attempts fail (tested via unit or security testing)

### SR-4: Secure Error Logging (OWASP A02: Cryptographic Failures)
- Error logging on the server SHALL NOT include sensitive data:
  - Internal stack traces MAY be logged server-side for debugging
  - User-facing error messages SHALL be sanitized (no sensitive data)
  - Original error object details SHALL be logged only in secure, restricted-access log files
- The client-side error display SHALL NOT log the full error object to the browser console
  - Only use `console.warn()` or `console.error()` with sanitized, user-safe error messages
  - Never use `console.log()` to output full error objects in production code
- **Acceptance Criteria:**
  - Server logs contain only server-safe error details
  - Client logs (console) contain only user-safe messages
  - No sensitive data in accessible logs or console output

### SR-5: Prevent Information Disclosure (OWASP A01: Broken Access Control)
- Error details displayed to users SHALL only show information that does not reveal:
  - System internals or architecture details
  - Whether a resource exists or doesn't exist (avoid `404 Not Found` details that leak information)
  - Authentication/authorization details (e.g., "Invalid API key" instead of "Your API key is invalid")
- **Acceptance Criteria:**
  - Error messages are generic enough to prevent information disclosure
  - Status codes are displayed (e.g., "4xx" or "5xx") but not explained in detail
  - No difference in error messages between authentication vs. authorization failures

---

## Accessibility Requirements

### AR-1: Semantic HTML & Landmark Structure (WCAG 2.2: 1.3.1 Info and Relationships)
- The error alert component SHALL use semantic HTML:
  - Use `<section>` or `<div role="alert">` for the error container (to announce to screen readers)
  - Use `<details>` and `<summary>` elements for the collapsible error details (native semantics)
- The error message text SHALL be inside the alert region so it is announced to screen reader users
- **Acceptance Criteria:**
  - Component uses semantic HTML elements
  - Alert region properly announces errors to screen readers
  - Details/summary semantics are preserved

### AR-2: Keyboard Navigation (WCAG 2.2: 2.1.1 Keyboard & 2.4.3 Focus Order)
- The `<details>` element and its `<summary>` SHALL be keyboard accessible:
  - `<summary>` SHALL be focusable via `Tab` key
  - `<summary>` SHALL be activatable via `Enter` or `Space` key (native behavior)
  - Focus outline SHALL be visible when summary has focus
- The error alert component SHALL maintain focus order consistent with DOM order
- **Acceptance Criteria:**
  - Summary is reachable via keyboard navigation
  - Keyboard users can open/close the details section
  - Focus indicator is visible (via browser default or custom CSS)

### AR-3: Focus Visibility (WCAG 2.2: 2.4.7 Focus Visible)
- The `<summary>` element SHALL have a visible focus indicator when keyboard-focused:
  - Use browser default focus outline, or
  - Provide custom CSS with contrast ratio ≥ 3:1 against adjacent colors
- Focus outline SHALL be clearly distinguishable from other page elements
- **Acceptance Criteria:**
  - Focus indicator is always visible when summary has keyboard focus
  - Focus outline has sufficient contrast
  - Focus is not hidden or removed

### AR-4: Screen Reader Announcements (WCAG 2.2: 4.1.2 Name, Role, Value)
- When an error occurs, the component SHALL:
  - Announce the generic error message immediately (via `role="alert"` or similar)
  - Provide an accessible label for the details toggle (e.g., "Error Details" in the `<summary>`)
- When the user expands the details, screen readers SHALL announce the expanded state
- **Acceptance Criteria:**
  - Error message is announced when displayed
  - Details toggle state is announced (e.g., "expanded" or "collapsed")
  - Screen reader users can understand the error context and access error details

### AR-5: Color Contrast (WCAG 2.2: 1.4.3 Contrast Minimum & 1.4.11 Non-Text Contrast)
- All error text (message, error type, status code, error details) SHALL have a contrast ratio ≥ 4.5:1 against background:
  - Dark text on light background, or
  - Light text on dark background
- Error alert styling (border, icon, background) used to convey information SHALL have contrast ≥ 3:1
- **Acceptance Criteria:**
  - Text contrast measured and verified ≥ 4.5:1
  - Icon/border contrast measured and verified ≥ 3:1
  - Contrast validated using tools like WCAG Color Contrast Analyzer

### AR-6: Readable Text (WCAG 2.2: 1.4.4 Resize Text)
- Error messages and details SHALL remain readable when text is resized up to 200%
- Layout SHALL not break or become unusable when text is enlarged
- **Acceptance Criteria:**
  - Text remains readable at 200% zoom
  - Layout adjusts or scrolls gracefully
  - No content is cut off or hidden

### AR-7: Plain Language & Error Clarity (WCAG 2.2: 3.3.4 Error Prevention & General Best Practice)
- Error messages SHALL use plain language and clear formatting:
  - Short sentences, simple vocabulary
  - Avoid technical jargon unless necessary
  - Formatted with line breaks or bullet points for readability
- Error details (type, status code) SHALL be clearly labeled
- **Acceptance Criteria:**
  - Error message is understandable to non-technical users
  - Field labels are clear
  - Message formatting aids readability

---

## Performance Requirements

### PR-1: Error Rendering Performance
- The `UiErrorAlert` component SHALL render within 50ms of error state change
- Error normalization utility SHALL complete normalization within 5ms
- **Acceptance Criteria:**
  - Component re-renders quickly without perceptible delay
  - Error details appear without jank or stuttering
  - Performance measured via browser DevTools or automated performance tests

### PR-2: No Performance Regression
- Adding the error details feature SHALL NOT introduce:
  - Memory leaks or unbounded memory growth
  - Increased component bundle size by more than 2KB (gzipped)
  - Additional network requests or API calls
- **Acceptance Criteria:**
  - Bundle size increase is ≤ 2KB gzipped
  - No memory leaks detected in testing
  - No additional API calls triggered by error handling

---

## Assumptions

1. The application already has a centralized error display component (`UiErrorAlert.vue` or similar)
2. The application uses Vue 3 Composition API with TypeScript
3. Error handling is already in place in server routes and client-side composables
4. The `<details>` HTML element is supported by all target browsers
5. Sensitive data sanitization can be implemented as a utility function without major architectural changes
6. Error state is managed via a composable or similar pattern (not global state)
7. Existing tests cover error scenarios; new tests will complement them

---

## Constraints

1. **Security First:** Error sanitization is mandatory; no sensitive data exposure is acceptable
2. **Accessibility:** Component must be WCAG 2.2 Level AA compliant
3. **No Breaking Changes:** Update must not break existing error handling or UI
4. **Backward Compatibility:** Component must work with existing error state structures (with normalization if needed)
5. **Code Style:** Must follow existing Vue 3, TypeScript, and project conventions
6. **Testing:** All new code and modified code must include unit tests and integration tests

---

## Out of Scope / Non-Goals

- Modifying error logging infrastructure or server middleware (beyond error normalization)
- Changing the generic error message text
- Implementing error tracking, telemetry, or external error reporting systems
- Adding custom error UI themes or styling beyond existing app conventions
- Modifying OpenAI API response structures (normalization happens client-side)
- Implementing real-time error notifications or alerts beyond current error display
- Storing or persisting error history across sessions

---

**Next Step:** Pass these requirements to `.github/prompts/prompt-3-create-technical-design-from-requirements.md` to create a detailed technical design.
