# Technical Design: Filter Dropdown Models by `unavailable-models`

**Source:** `.github/specs/039-filter-unavailable-models-from-config/requirements.md`

**Date:** 2026-05-06

## Overview
This update changes model-config filtering semantics to a single key contract. The app will treat `"unavailable-models"` as the only valid filtering key in `server/assets/models/openai-models.json`.

If config is readable, valid JSON object, and includes `"unavailable-models"` as a string array:
- Exclude listed IDs from model dropdown options (via `/api/models` data filtering).
- Suppress fallback UI notice by returning `showFallbackNote: false`.

If file is missing, JSON is invalid/non-object, key is missing, or key is malformed:
- Return unfiltered upstream model list.
- Return `showFallbackNote: true`.
- Emit appropriate warning/error logs without interrupting execution.

## Architecture
### Current State
- Config loader expects legacy 4-key schema.
- Exclusion set is built from `"models-with-error"` and `"models-with-no-response"`.
- Models route applies filtering only when legacy schema validates.

### Target State
- Config loader validates a focused schema:
  - JSON root object required.
  - `"unavailable-models"` required and must be `string[]` for filtering mode.
- Extra keys are accepted, ignored for filtering, and warned via `console.warn`.
- Missing `"unavailable-models"` logs via `console.error` and triggers fallback mode.
- Models route keeps existing API response shape and cache behavior, but uses new loader semantics.

### Affected Modules
- `server/utils/openai-models-config-loader.ts`
- `server/api/models.get.ts`
- `server/assets/models/openai-models.json` (schema alignment)
- `tests/unit/openai-models-config.test.ts`
- `tests/integration/models.test.ts`
- `tests/e2e/models-selector.spec.ts` (if fallback/notice behavior assertions require adjustment)

## Interfaces
### Config Loader Types
Replace legacy config type with a focused type:

```ts
type OpenAIModelsConfig = {
  "unavailable-models": string[];
};
```

Loader result remains discriminated but reason semantics become specific:

```ts
type OpenAIModelsConfigResult =
  | { isValid: true; config: OpenAIModelsConfig }
  | { isValid: false; reason: string };
```

`buildExclusionSet(config)` becomes:
- `new Set(config["unavailable-models"])`

### Models API Contract
`ModelsApiResponse` remains unchanged:
- `usedConfigFilter`: `true` only when unavailable-models filtering is applied.
- `showFallbackNote`: `false` only in valid filtering mode; otherwise `true`.

## Data
### Config Data Rules
- Accepted filtering key: `"unavailable-models"` only.
- Extra keys:
  - Allowed in file.
  - Ignored for filtering.
  - Reported in warning log.
- Missing key:
  - No filtering.
  - Fallback note shown.
  - Error log emitted.

### File Examples
Valid and filtering:
```json
{ "unavailable-models": ["model-a", "model-b"] }
```

Valid with warning and filtering:
```json
{
  "unavailable-models": ["model-a"],
  "other-models": [],
  "legacy-key": ["x"]
}
```

Fallback with error log (missing key):
```json
{ "other-models": [] }
```

## Validation/Error Handling
### Loader Validation Flow
1. Attempt `readFile`.
2. If read fails (e.g., missing file): return invalid result (`reason` indicates read failure); no throw.
3. Parse JSON.
4. If parse fails: return invalid result (`reason` indicates parse failure).
5. Ensure parsed root is object and not null/array.
6. Determine extra keys: `Object.keys(parsed).filter((k) => k !== "unavailable-models")`.
7. If extra keys exist: `console.warn` with list of keys and allowed key guidance.
8. Validate `parsed["unavailable-models"]` as `string[]`.
9. If missing or invalid: `console.error` and return invalid result.
10. Return valid result when key is present and type-valid.

### Models Route Behavior
- On valid config: apply exclusion and set metadata (`usedConfigFilter: true`, `showFallbackNote: false`).
- On invalid config: keep upstream models and set metadata (`usedConfigFilter: false`, `showFallbackNote: true`).
- No interruption of normal route execution from config issues.

## Security
- Config parsing is defensive and treats malformed content as fallback state (SR-1, SR-3).
- Logging includes only key names and structural reasons; no secrets or auth artifacts (SR-2).
- No dynamic code execution or external URL resolution introduced.

## Accessibility
- UI notice behavior remains controlled by `showFallbackNote`, preserving predictable content state for assistive technologies.
- No changes to form controls/labels/focus order in model selectors.

## Testing
### Unit Tests
- `loadOpenAIModelsConfig`:
  - valid with only `"unavailable-models"`.
  - valid with extra keys + warning logged.
  - missing key logs error + invalid result.
  - missing file invalid result.
  - invalid JSON invalid result.
  - non-object JSON invalid result.
- `buildExclusionSet`:
  - includes all IDs from `"unavailable-models"` with de-duplication by set behavior.

### Integration Tests (`/api/models`)
- valid config filters models and returns `usedConfigFilter=true`, `showFallbackNote=false`.
- missing key yields unfiltered data and `showFallbackNote=true` with non-throw behavior.
- missing file yields unfiltered data and `showFallbackNote=true`.
- extra keys still allow filtering and return `showFallbackNote=false`.

### E2E / UI Assertions
- fallback note appears only when `showFallbackNote=true`.
- fallback note absent when `showFallbackNote=false`.

## Assumptions and Constraints
- Existing runtime config override path behavior remains unchanged.
- Existing cache behavior in `/api/models` remains unchanged.
- Existing response shape remains unchanged.

## Open Questions
- None.

## Traceability
| Requirement ID | Design Section | Notes |
|----------------|----------------|-------|
| FR-1 | Architecture, Validation/Error Handling, Testing | Missing-file fallback behavior defined and tested. |
| FR-2 | Interfaces, Data, Validation/Error Handling, Testing | Only `"unavailable-models"` drives filtering. |
| FR-3 | Data, Validation/Error Handling, Testing | Missing-key fallback with error log behavior. |
| FR-4 | Data, Validation/Error Handling, Testing | Extra keys ignored for filtering. |
| FR-5 | Interfaces, Validation/Error Handling, Testing | `showFallbackNote` semantics mapped to config states. |
| FR-6 | Validation/Error Handling, Testing | Warning log for extra keys includes key list. |
| FR-7 | Validation/Error Handling, Testing | Missing-key error log without interrupting response. |
| FR-8 | Interfaces, Accessibility, Testing | UI note driven solely by metadata contract. |
| TR-1 | Interfaces, Architecture | Loader contract moved to single-key schema. |
| TR-2 | Validation/Error Handling | JSON root object validation path. |
| TR-3 | Validation/Error Handling | `string[]` validation for key usability. |
| TR-4 | Interfaces, Data | Exclusion-set construction updated. |
| TR-5 | Interfaces, Architecture | Models API response shape unchanged. |
| TR-6 | Interfaces, Validation/Error Handling | Metadata semantics explicitly defined. |
| TR-7 | Architecture | Scoped to existing modules, no new endpoints. |
| TR-8 | Testing | Unit/integration/e2e coverage mapped. |
| SR-1 | Security, Validation/Error Handling | Defensive parsing and validation. |
| SR-2 | Security, Validation/Error Handling | Safe logging constraints. |
| SR-3 | Validation/Error Handling, Security | Non-crashing fallback behavior. |
| AR-1 | Accessibility, Interfaces, Testing | Deterministic notice visibility. |
| AR-2 | Accessibility | No selector semantic regressions. |
