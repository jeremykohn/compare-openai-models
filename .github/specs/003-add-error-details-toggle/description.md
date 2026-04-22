# Update Description: Add Error Details Toggle

## General Description

Currently, when the application encounters an error while processing a user's prompt submission (e.g., selected model unavailable, API failure), the UI displays a generic error message:

```
Something went wrong

An unexpected error occurred. Please try again or contact support.
```

This message provides no actionable details about the error, limiting the user's ability to understand what happened or troubleshoot the issue. The update should enhance the error display to show error details in an expandable toggle, allowing users to inspect the error without compromising application security.

## Specific Description

### Problem Statement

- **Who is affected:** End users encountering errors during prompt submission and developers/support staff needing to troubleshoot errors.
- **What is missing:** The error UI does not provide visibility into error details (error type, HTTP status code, error message) that could help users understand failure reasons or provide information to support staff.
- **Current limitation:** The generic message alone is insufficient for debugging and user support.

### Intended Outcome

- When an error occurs during prompt submission, the UI displays:
  1. The existing generic error message (unchanged) at the top
  2. A collapsible `<details>` element below the message with the label "Error Details" or similar
- When the user expands the toggle, the following information is displayed (in a secure manner):
  - Error type (e.g., `NetworkError`, `ValidationError`, `APIError`)
  - HTTP status code (if applicable)
  - Error message or description (sanitized to exclude sensitive data)
- The error details are visible only when the toggle is explicitly opened, reducing visual clutter while providing opt-in transparency.

### Key Behaviors

1. **Error Detection & Normalization**
   - Server routes and client-side handlers must normalize errors into a consistent structure containing: `type`, `statusCode`, and `message`.
   - Sensitive information (API keys, internal system details, stack traces) must be excluded from the error details displayed to the user.

2. **Error Details Component**
   - The `UiErrorAlert.vue` component (or similar error display component) must be updated to render a `<details>` element when error details are available.
   - The `<details>` element should display error type, status code, and message in a readable format.
   - The `<details>` element should be positioned below the generic error message.

3. **Security & Privacy**
   - Error messages must be sanitized; internal paths, stack traces, database details, and API credentials must never be included.
   - Only safe-to-display error information (type, status code, user-friendly message) is shown.
   - The toggle is expandable but does not automatically open, preventing accidental information leakage.

4. **User Experience**
   - The error details toggle should be optional and non-intrusive (collapsed by default).
   - The component should remain accessible for keyboard navigation and screen readers.
   - Error rendering should be consistent across all error scenarios in the application.

### Scope Boundaries

**Included:**
- Updating the error display component to include a collapsible `<details>` element
- Normalizing error data structure for consistency
- Sanitizing error messages to exclude sensitive data
- Adding tests for error detail display and sanitization

**Excluded:**
- Modifying error logging infrastructure or server middleware (unless required for consistency)
- Changing the generic error message text
- Implementing analytics or error tracking (this is separate)

### Assumptions

- The application already has a centralized error handling mechanism or error normalization utility
- The `UiErrorAlert.vue` component (or similar) is the primary surface for rendering errors to users
- Error details will be available in the component's error state (e.g., via props or composable)
- The application uses Vue 3 Composition API and TypeScript

### Constraints

- Error details must not compromise security or expose sensitive internal information
- The solution must work across all error scenarios (network errors, API errors, validation errors)
- The implementation must be accessible (WCAG 2.2 Level AA compliance)

## Non-Goals

- Implementing custom error UI themes or styling beyond existing app conventions
- Adding error tracking, telemetry, or external error reporting systems
- Modifying API response structures (error details will be normalized client-side if needed)
- Implementing real-time error notifications or alerts beyond the current error display

---

**Next Step:** Pass this `description.md` to `.github/prompts/prompt-2-create-requirements-from-description.md` to generate detailed functional and technical requirements.
