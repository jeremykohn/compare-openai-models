# Requirements

## Functional Requirements

- FR-1: The system must use a code constants source as the authoritative list of unavailable model IDs for model-list filtering instead of reading `server/assets/models/openai-models.json` at runtime.
  - Acceptance Criteria:
    - `GET /api/models` filtering behavior is driven by a constants module.
    - Runtime filtering does not require file path resolution for unavailable-model IDs.

- FR-2: `GET /api/models` must continue to exclude any upstream model whose `id` exactly matches a configured unavailable model ID.
  - Acceptance Criteria:
    - Given upstream models including one unavailable ID and one available ID, response data excludes the unavailable ID and includes the available ID.

- FR-3: Model list response shape consumed by the UI must remain compatible with current client expectations.
  - Acceptance Criteria:
    - Response still includes `object`, `data`, `usedConfigFilter`, and `showFallbackNote` fields.

## Technical Requirements

- TR-1: Add a dedicated constants module in repository conventions (shared constants area) that exports unavailable model IDs.
  - Acceptance Criteria:
    - Module exports a typed, read-only list of string model IDs.

- TR-2: Update server filtering logic to consume the constants module through the existing models-config loader boundary, preserving public utility interfaces where practical.
  - Acceptance Criteria:
    - Loader resolves unavailable models from constants source.
    - Route no longer depends on runtime JSON file path resolution for unavailable-model filtering.

- TR-3: Update unit and integration tests to validate constants-backed filtering behavior and remove test dependencies on temporary JSON config files for this feature.
  - Acceptance Criteria:
    - Unit tests cover constants-backed loader output.
    - Integration tests validate filtering behavior without writing temporary unavailable-models JSON files.

- TR-4: Update repository documentation that currently states unavailable-model filtering comes from `server/assets/models/openai-models.json`.
  - Acceptance Criteria:
    - README API section reflects constants-based source of unavailable-model IDs.

## Security Requirements

- SR-1: The change must not introduce new secret-bearing configuration surfaces or dynamic untrusted input paths for unavailable-model filtering.
  - Acceptance Criteria:
    - Unavailable-model IDs are maintained in source-controlled code constants.
    - No new runtime env var or request input controls unavailable-model source selection.

- SR-2: Existing models-route error sanitization behavior for upstream failures must remain intact.
  - Acceptance Criteria:
    - Integration tests for sanitized upstream errors continue passing.

## Accessibility Requirements

- AR-1: Model selector behavior for keyboard and assistive-technology users must remain functionally unchanged aside from expected filtered option contents.
  - Acceptance Criteria:
    - Existing selector semantics and labels remain unchanged.
    - Existing a11y/unit tests for model selector behavior remain compatible.

## Performance Requirements

- PR-1: The update must avoid adding new blocking runtime I/O for unavailable-model filtering in `GET /api/models`.
  - Acceptance Criteria:
    - Filtering source retrieval does not perform per-request filesystem reads.

## Out of Scope / Non-Goals

- Dynamic runtime editing of unavailable model IDs.
- Remote- or database-sourced unavailable-model configuration.
- Unrelated UI redesign or behavior changes for model selectors.
- Changes to upstream OpenAI model-fetch contract beyond current filtering responsibilities.

## Assumptions

- Exact string matching for model ID exclusion remains the intended filtering rule.
- API response metadata fields are part of the client contract and should remain stable.
- Unavailable-model list maintenance through source control is acceptable for this project.

## Constraints

- Maintain compatibility with existing Nuxt 4 / TypeScript project patterns.
- Keep changes limited to the unavailable-model source migration scope.
- Preserve existing test quality gates and avoid unrelated refactors.
