# Description

## General Description

Currently the app is designed to read server/assets/models/openai-models.json to get the list of unavailable models. Change this behavior and have the app read the list of unavailable models from a consts file.

## Specific Description

### Problem Statement

The current unavailable-model filtering behavior depends on a JSON asset file at server/assets/models/openai-models.json. This introduces file-based configuration handling in the runtime path for model filtering, including path resolution and JSON parsing concerns that are unnecessary for a static, code-owned list.

People working on the app are affected because unavailable model filtering behavior is split between application logic and an external asset file, which can make refactors and testing less direct.

### Intended Outcome

Move the source of truth for unavailable model IDs from the JSON asset file to a constants module in the codebase.

After the update:
- The models filtering flow reads unavailable model IDs from a consts/constants file.
- The app continues filtering unavailable models from the dropdown model list.
- External behavior of the models API remains stable unless explicitly documented otherwise.

### Scope Boundaries

In scope:
- Introduce and use a constants source for unavailable model IDs.
- Update server-side model filtering code to consume this constants source.
- Update tests that currently assume JSON-file-driven behavior.
- Update documentation that currently states JSON-file-driven filtering.

Out of scope:
- Broad redesign of model-filtering architecture beyond source-of-truth replacement.
- Unrelated UI/UX changes for model selectors.
- Changing upstream OpenAI model fetch logic.

### Key Behaviors and Expected User-Visible Results

- Unavailable models listed in the new consts source are not shown in model dropdowns.
- Available models continue to be shown and sorted as before.
- Error handling and response contract for GET /api/models remain consistent with current app expectations.

### Assumptions

- The unavailable model list is intended to be maintained in source control as application code, not user-editable runtime data.
- Existing filtering semantics use exact model ID matching.
- The constants file location should follow existing repository conventions for shared constants.

### Constraints

- Keep security posture unchanged: no secrets or sensitive runtime values in the new constants source.
- Preserve current API response shape expected by client code and tests unless changes are explicitly planned and documented.
- Keep implementation aligned with existing TypeScript, Nuxt, and testing patterns in this repository.

### Explicit Exclusions

- No migration to remote or database-managed unavailable-model configuration.
- No addition of new runtime environment variables for unavailable-model source selection.
- No changes to unrelated model validation or response-generation routes.

## Non-Goals

- Making unavailable-models dynamically configurable at runtime.
- Implementing admin tooling for editing unavailable models.
- Changing default model selection behavior.
