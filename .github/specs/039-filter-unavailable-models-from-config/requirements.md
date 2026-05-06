# Requirements: Filter Dropdown Models by `unavailable-models`

**Source:** `.github/specs/039-filter-unavailable-models-from-config/description.md`

**Date:** 2026-05-06

## Functional Requirements

- **FR-1: Config file presence behavior**
  - The system MUST attempt to read `server/assets/models/openai-models.json` when building the models API response.
  - If the file cannot be read because it does not exist, the system MUST return all upstream models unfiltered.
  - Acceptance criteria:
    - With missing file, response includes all valid upstream model IDs.
    - With missing file, `showFallbackNote` is `true`.

- **FR-2: Single valid filtering key**
  - The system MUST treat `"unavailable-models"` as the only valid key used for filtering.
  - If `"unavailable-models"` exists as a string array, the system MUST exclude all listed model IDs from the API response model list.
  - Acceptance criteria:
    - For upstream IDs `a,b,c` and `unavailable-models: ["b"]`, response includes `a,c` only.

- **FR-3: Missing `unavailable-models` key behavior**
  - If the config file exists but does not include the `"unavailable-models"` key, the system MUST include all upstream models unfiltered.
  - In this case, the system MUST set `showFallbackNote` to `true`.
  - Acceptance criteria:
    - Config JSON `{}` yields unfiltered upstream model list.
    - Config JSON `{}` yields `showFallbackNote: true`.

- **FR-4: Ignore additional keys for filtering**
  - Keys other than `"unavailable-models"` MUST NOT influence filtering results.
  - If `"unavailable-models"` exists and extra keys exist, filtering MUST still use only `"unavailable-models"`.
  - Acceptance criteria:
    - JSON containing `"unavailable-models"` plus other keys still filters solely by `"unavailable-models"` values.

- **FR-5: Fallback notice visibility contract**
  - The system MUST set `showFallbackNote` to `false` only when the config file is readable, valid JSON object, and contains `"unavailable-models"` as a string array.
  - The system MUST set `showFallbackNote` to `true` when:
    - the file does not exist,
    - JSON is invalid,
    - JSON root is not an object,
    - or `"unavailable-models"` is missing or not a string array.
  - Acceptance criteria:
    - All above scenarios map deterministically to `showFallbackNote` values.

- **FR-6: Logging behavior for extra keys**
  - If config JSON contains keys beyond `"unavailable-models"`, the system MUST log a warning message.
  - The warning MUST list extra key names and state that only `"unavailable-models"` is a valid key.
  - Acceptance criteria:
    - Warning log is emitted once per config evaluation.
    - Warning includes discovered extra keys.

- **FR-7: Logging behavior for missing key**
  - If config JSON does not include `"unavailable-models"`, the system MUST log an error message.
  - The error MUST NOT interrupt normal request handling.
  - Acceptance criteria:
    - Request still returns successful list response when upstream fetch succeeds.
    - Error log is emitted for missing key case.

- **FR-8: UI notice text usage**
  - The UI MUST display `Note: List of OpenAI models may include some older models that are no longer available.` only when `showFallbackNote` is `true`.
  - Acceptance criteria:
    - Existing UI continues to conditionally render this note based on server-provided metadata.

## Technical Requirements

- **TR-1: Config loader contract update**
  - Update config parsing contract to support the new schema centered on `"unavailable-models"`.
  - Loader result MUST distinguish between valid-config-with-key and fallback scenarios without throwing.

- **TR-2: JSON root validation**
  - The loader MUST validate that parsed JSON root is an object before key inspection.
  - Non-object JSON MUST be treated as invalid config and fallback path.

- **TR-3: String-array validation**
  - `"unavailable-models"` MUST be validated as `string[]` to be considered usable.
  - Missing or non-array/non-string contents MUST trigger fallback path and missing-key/invalid-key logging behavior.

- **TR-4: Exclusion set generation**
  - Exclusion set builder MUST derive exclusions only from `"unavailable-models"`.
  - Duplicate values SHOULD be naturally deduplicated using set semantics.

- **TR-5: API response shape stability**
  - The `/api/models` response shape MUST remain backward compatible:
    - `object: "list"`
    - `data: OpenAIModel[]`
    - `usedConfigFilter: boolean`
    - `showFallbackNote: boolean`
  - No additional required response fields should be introduced for this update.

- **TR-6: Metadata semantics**
  - `usedConfigFilter` MUST be `true` only when filtering was actually applied from a valid `"unavailable-models"` array.
  - `showFallbackNote` semantics MUST match FR-5.

- **TR-7: Existing integration points**
  - Update only the existing model config loader and models route integration points.
  - Do not introduce new endpoints or alter upstream fetch behavior.

- **TR-8: Test coverage updates**
  - Unit/integration tests MUST cover:
    - valid config with `"unavailable-models"`,
    - file missing,
    - invalid JSON,
    - missing key,
    - extra keys warning,
    - and key type mismatch.

## Security Requirements

- **SR-1: Safe handling of untrusted config content (OWASP A03/A05)**
  - Config content read from disk MUST be parsed and validated defensively.
  - Invalid or malformed input MUST fail closed to fallback behavior without unsafe assumptions.

- **SR-2: No secret leakage in logs (OWASP A09)**
  - Warning/error logs for config issues MUST NOT include sensitive runtime values (API keys, auth headers, or environment secret values).
  - Logs MAY include file path context and offending key names.

- **SR-3: Resilient error handling**
  - Config parsing and schema issues MUST NOT crash request handling when upstream fetch succeeds.
  - Errors must be converted into controlled fallback behavior.

## Accessibility Requirements

- **AR-1: Notice behavior consistency**
  - The fallback note visibility MUST remain deterministic and tied to `showFallbackNote`, preserving predictable content presentation for people using screen readers.

- **AR-2: No regression in model selector semantics**
  - Dropdown filtering updates MUST NOT alter existing labels, focus behavior, keyboard navigation order, or control roles in the model selector UI.

## Out of Scope / Non-Goals

- Supporting legacy filtering keys (`"models-with-error"`, `"models-with-no-response"`, `"available-models"`, `"other-models"`) for exclusion logic.
- Modifying OpenAI upstream model retrieval behavior.
- Adding UI elements for warnings/errors.
- Introducing telemetry or persistent logging infrastructure.

## Assumptions and Constraints

- Config file path remains `server/assets/models/openai-models.json` unless runtime override already supported by current codebase is used.
- Model dropdowns continue to be sourced from upstream model API data.
- Current notice text remains unchanged.
- Existing cache behavior for `/api/models` remains in place.
