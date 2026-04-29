# Description: Two Active Dropdowns and Two Queries

## General Description

In the current app UI there are two dropdown menus and two output areas. The left-hand menu is active and the right-hand menu is inactive, and the two output areas display identical contents. Update the app so both dropdown menus are active, each dropdown controls its own query, and each output area shows the result or error for its corresponding model.

## Specific Description

### Problem Statement
- The current UI presents two model selectors, but only the left-hand dropdown is active.
- The current send flow issues only one ChatGPT query, so both output areas show identical content instead of model-specific results.
- The current labels do not clearly distinguish the first model, second model, or which model produced each output.

### Intended Outcome
- Make the right-hand dropdown active so users can independently choose a second model.
- Rename the dropdown labels to `Model 1` and `Model 2`.
- When the user clicks `Send`, submit two ChatGPT queries using the same prompt text:
  - Query 1 uses the model selected in the left-hand dropdown.
  - Query 2 uses the model selected in the right-hand dropdown.
- Show each query's result or error in its corresponding output area:
  - Left output area shows the first query result or error.
  - Right output area shows the second query result or error.
- Update the output headings so they identify both the response slot and the selected model name:
  - `Response from Model 1 (<model-1-name>)`
  - `Response from Model 2 (<model-2-name>)`

### Scope Boundaries
- In scope:
  - Enabling the right-hand dropdown.
  - Renaming the two dropdown labels.
  - Submitting two model-specific ChatGPT queries from a single send action.
  - Rendering separate success or error states in the left and right output areas.
  - Updating output headings to include the selected model names.
- Out of scope:
  - Adding a third dropdown or a third output area.
  - Adding comparison logic between the two model outputs.
  - Changing the prompt input experience beyond reusing the same prompt text for both queries.
  - Introducing new non-OpenAI backends or changing the overall visual structure beyond what is needed for this two-query behavior.

### Key Behaviors and Expected User-Visible Results
- The left dropdown is labeled `Model 1` and remains interactive.
- The right dropdown is labeled `Model 2` and becomes interactive.
- Both dropdowns use the same list of available models.
- Clicking `Send` with valid input triggers two ChatGPT queries.
- If both queries succeed:
  - The left output area shows only the first model's response.
  - The right output area shows only the second model's response.
  - Each output heading includes the selected model name used for that response.
- If one or both queries fail:
  - Each output area independently shows either the successful response or the error UI for that side.
  - An error on one side does not prevent the other side from showing its own result.
- Existing loading/progress behavior should evolve as needed to support the dual-query flow while remaining clear to the user.

### Assumptions and Constraints
- Both queries reuse the same prompt text entered by the user.
- Both dropdowns continue to use the same shared models list source.
- The app may execute the two model requests in parallel or in another implementation-safe way, as long as the user-visible behavior matches the intended outcome.
- Error details shown in each output area must continue following the app’s existing sanitization and security rules.
- Accessibility semantics should remain clear for both dropdowns and both output regions after the labels and behaviors are updated.

## Non-Goals
- Comparing or summarizing the two model outputs.
- Introducing a middle comparison area or placeholder content.
- Persisting query history or caching paired responses.
- Changing the underlying product goal from “compare model responses side-by-side” to a more complex workflow in this update.
