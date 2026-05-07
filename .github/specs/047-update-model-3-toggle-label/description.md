# Description

## General Description

For the toggle in the Model 3 output panel, change the label from "Comparison prompt for Model 3" to "View the prompt sent to Model 3 for comparing Response 1 and Response 2".

## Specific Description

### Problem Statement

The current toggle label in the Model 3 output panel is "Comparison prompt for Model 3," which is brief but less explicit about what the prompt is and what it does. This can reduce immediate clarity for people scanning the interface and trying to understand what will be shown when the disclosure is opened.

### Intended Outcome

After this update:
- The toggle/disclosure label in the Model 3 output panel displays exactly:
  `View the prompt sent to Model 3 for comparing Response 1 and Response 2`
- The behavior of the toggle/disclosure remains unchanged.
- The prompt content shown when expanded remains unchanged.

### Scope Boundaries

In scope:
- Update only the user-visible label text for the Model 3 prompt toggle/disclosure.
- Update automated tests that assert the old label text.

Out of scope:
- Any changes to toggle/disclosure interaction behavior.
- Any changes to prompt generation logic or prompt content.
- Any changes to Model 1 or Model 2 panels.
- Any backend, API, or data contract changes.

### Key Behaviors and Expected User-Visible Results

- Before interaction, users see the updated label:
  `View the prompt sent to Model 3 for comparing Response 1 and Response 2`
- Expanding/collapsing the prompt control behaves the same as before.
- The same generated prompt content appears when expanded.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- The Model 3 prompt disclosure control already exists and remains in use.
- Existing tests include assertions for the old label text and must be updated.

Constraints:
- The new label text must match exactly as provided.
- No behavior or structural UI changes are part of this request.

Explicit exclusions:
- No accessibility semantics changes beyond text replacement.
- No styling redesign beyond what is necessary to render the updated label.

## Non-Goals

- Refactoring the prompt disclosure implementation.
- Changing timing, visibility conditions, or data flow for Model 3 prompt content.
- Updating unrelated copy elsewhere in the application.
