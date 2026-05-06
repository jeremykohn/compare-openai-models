# Description

## General Description

Change the web page `<title>` from `ChatGPT prompt tester - Compare OpenAI Models` to `Compare OpenAI Models`.

## Specific Description

### Problem Statement

The browser tab title still includes the older `ChatGPT prompt tester` wording even though the application branding and visible page heading have already been updated to `Compare OpenAI Models`. This creates inconsistent product naming between the document title shown in the browser and the UI shown on the page.

### Intended Outcome

After this update, the HTML document title shown in the browser tab and page metadata displays exactly: `Compare OpenAI Models`.

### Scope Boundaries

In scope:
- Updating the application's document title / page metadata string from `ChatGPT prompt tester - Compare OpenAI Models` to `Compare OpenAI Models`.
- Updating directly impacted automated tests if any assert the document title.

Out of scope:
- Changing visible page copy such as the main heading, subtitle, button labels, or helper text.
- Any behavior changes to model querying, comparison flow, or API/server logic.
- Any layout, styling, or accessibility-structure changes unrelated to the title string update.

### Key Behaviors and Expected User-Visible Results

- On page load, the browser tab title displays `Compare OpenAI Models`.
- The visible page heading and subtitle remain unchanged.
- No application behavior changes occur; only the document title is updated.

### Assumptions, Constraints, and Explicit Exclusions

Assumptions:
- The current document title is configured in a single application-level metadata location.
- Any existing test coverage for page metadata can be updated in place if needed.

Constraints:
- Use the exact replacement title string provided.
- Keep the change minimal and limited to the title metadata and directly affected tests.

Explicit exclusions:
- No renaming of components, routes, or files.
- No introduction of additional SEO metadata changes beyond the title replacement.
- No broader branding or copy refresh outside this specific title string.

## Non-Goals

- Reworking the application's visible landing-page copy.
- Adding dynamic per-route titles or title templating.
- Refactoring unrelated configuration or app setup.
