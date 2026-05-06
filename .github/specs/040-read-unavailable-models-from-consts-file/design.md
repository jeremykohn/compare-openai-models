# Technical Design

## Overview

This update migrates unavailable-model filtering for `GET /api/models` from a runtime JSON asset (`server/assets/models/openai-models.json`) to a source-controlled constants module. The change preserves existing API response shape and user-visible behavior while removing runtime file-path and JSON parsing dependency for this filtering concern.

## Architecture

Current flow:
- `server/api/models.get.ts` resolves a JSON file path.
- `server/utils/openai-models-config-loader.ts` reads/parses JSON and validates schema.
- Route builds exclusion set and filters upstream model list.

Target flow:
- Introduce shared constants module exporting unavailable model IDs.
- `openai-models-config-loader` returns config based on constants instead of filesystem reads.
- `models.get` consumes the same loader boundary without JSON path resolution.

This keeps filtering responsibilities centralized while simplifying the route runtime path.

## Interfaces

- New module:
  - `shared/constants/unavailable-models.ts`
  - Exports `UNAVAILABLE_MODELS: readonly string[]`

- Existing utility interface retained:
  - `loadOpenAIModelsConfig(filePath?: string): Promise<OpenAIModelsConfigResult>`
  - `buildExclusionSet(config: OpenAIModelsConfig): Set<string>`

- Route contract retained:
  - `GET /api/models` returns:
    - `object: "list"`
    - `data: OpenAIModel[]`
    - `usedConfigFilter: boolean`
    - `showFallbackNote: boolean`

## Data

- Unavailable model IDs move from JSON data file to TypeScript constant list.
- Filtering remains exact match on `model.id` against exclusion set.
- No schema migration required for persisted data (none exists).

## Validation/Error Handling

- Remove runtime JSON validation for unavailable-models source.
- Loader will return valid configuration from constants source.
- Upstream models fetch and mapped error handling remain unchanged.
- Route continues to expose `usedConfigFilter/showFallbackNote` fields to preserve client contract.

## Security

- Reduces attack surface by removing runtime file input/parsing for this feature.
- Keeps unavailable-model source in source-controlled code and avoids dynamic user/runtime injection points.
- Preserves existing upstream error sanitization and safe status mapping behavior.

## Accessibility

- No changes to selector semantics, labels, or keyboard behaviors.
- Only option availability changes according to filtering data source migration.
- Existing accessibility-focused tests remain expected to pass unchanged.

## Performance

- Eliminates per-request filesystem read and JSON parse for unavailable-model retrieval.
- Maintains existing model-list cache behavior for route responses.

## Testing

- Unit tests:
  - Verify loader returns constants-backed unavailable list.
  - Verify exclusion set behavior remains correct.

- Integration tests (`/api/models` route):
  - Verify unavailable model IDs are filtered when present upstream.
  - Keep upstream error mapping/sanitization tests.
  - Remove temporary JSON-file setup related to config loader behavior.

- Regression checks:
  - Run focused unit/integration tests for modified route/loader.
  - Run lint/typecheck if changes touch shared typing or route signatures.

## Assumptions

- Constants-based source is acceptable long-term for this project.
- `usedConfigFilter` and `showFallbackNote` remain part of client-facing response expectations.

## Constraints

- Keep change scoped to unavailable-model source migration.
- Preserve external route shape and core filtering semantics.

## Open Questions

None.

## Traceability

| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture, Interfaces, Data | Source of truth moved from JSON file to constants module. |
| FR-2 | Data, Validation/Error Handling, Testing | Exact ID exclusion behavior preserved and validated. |
| FR-3 | Interfaces, Validation/Error Handling | Response shape remains stable for UI compatibility. |
| TR-1 | Interfaces, Data | New constants module defined and typed. |
| TR-2 | Architecture, Validation/Error Handling | Loader/route updated to consume constants flow. |
| TR-3 | Testing | Unit/integration test migration from file-driven assumptions. |
| TR-4 | Overview, Interfaces | README/API docs updated to reflect constants source. |
| SR-1 | Security, Architecture | No dynamic config/env source introduced. |
| SR-2 | Validation/Error Handling, Testing | Upstream error sanitization behavior preserved and verified. |
| AR-1 | Accessibility, Testing | UI accessibility semantics remain unchanged. |
| PR-1 | Performance, Architecture | Removes blocking filesystem read for unavailable-model source. |
