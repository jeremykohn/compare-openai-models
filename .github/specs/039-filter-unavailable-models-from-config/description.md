# Update: Filter Model Dropdowns Using `unavailable-models` Config Key

## General Description
Update the app so that, if a file exists at `server/assets/models/openai-models.json`, the app reads this file, parses as JSON, and filters each dropdown menu's items to exclude the models (if any) listed under the key `"unavailable-models"`, and also does not display the notice `"Note: List of OpenAI models may include some older models that are no longer available."` in the app UI. Ignore keys in the JSON file other than `"unavailable-models"`. If the file does not exist at the specified path, or the file does not include the key `"unavailable-models"`, include all models and display the notice. If any keys other than `"unavailable-models"` are in the JSON file, the file is still valid but the app should log a warning message. The warning should list the extra keys that are present and warn that only `"unavailable-models"` is a valid key in this file. If `"unavailable-models"` is not in the JSON file, log an error message but do not interrupt the app's execution.

## Specific Description

### Problem Statement
The app currently supports model filtering based on a different JSON schema and key set. The requested behavior changes the config contract so that only one key, `"unavailable-models"`, controls exclusion from all dropdown menus. The app must also change when it shows the fallback notice and must add explicit warning/error logging behavior for malformed or unexpected config shape while keeping runtime behavior non-disruptive.

### Intended Outcome
When `server/assets/models/openai-models.json` exists and contains a valid `"unavailable-models"` key, the app should:
1. Parse the JSON file.
2. Exclude all models listed in `"unavailable-models"` from every model dropdown.
3. Hide the fallback notice text in the UI.

When the file is missing, or the key `"unavailable-models"` is missing, the app should:
1. Include all upstream models in dropdowns (no exclusion filtering).
2. Show the fallback notice in the UI.
3. Continue running normally without interrupting request/response flows.

### Scope Boundaries
In scope:
1. Reading and parsing `server/assets/models/openai-models.json`.
2. Using `"unavailable-models"` as the only filtering source.
3. Ignoring other keys for filtering logic.
4. Warning logs for extra keys.
5. Error logs when `"unavailable-models"` is absent.
6. Notice visibility behavior tied to file/key availability rules.

Out of scope for this update:
1. Any new UI controls or changes to dropdown layout/appearance.
2. Changes to OpenAI API fetch behavior.
3. Replacing upstream model source with local file data.
4. Using any JSON keys other than `"unavailable-models"` for filtering.

### Required Behaviors
1. **Primary filter key**: Only `"unavailable-models"` is valid for exclusion filtering.
2. **Filtering behavior**: If `"unavailable-models"` exists and is usable, remove matching model IDs from all dropdown menus.
3. **Ignore other keys**: Any keys besides `"unavailable-models"` do not affect filtering.
4. **Extra-key warning**: If extra keys are present, log a warning that includes the extra key names and states that only `"unavailable-models"` is valid.
5. **Missing-key error**: If `"unavailable-models"` is missing, log an error and continue execution.
6. **Notice hidden path**: Hide the notice only when the file exists and includes `"unavailable-models"`.
7. **Notice shown path**: Show the notice when the file does not exist, or when `"unavailable-models"` is missing.
8. **Graceful execution**: Logging must not crash, throw unhandled errors, or block model loading.

### Assumptions and Constraints
1. The config file path remains `server/assets/models/openai-models.json`.
2. Dropdown options continue to originate from the upstream OpenAI models API; the file only provides exclusions.
3. The warning/error logs are emitted server-side where config loading currently occurs.
4. The fallback notice text remains exactly: `"Note: List of OpenAI models may include some older models that are no longer available."`.
5. This update preserves existing response shapes unless explicitly required by implementation details.

## Non-Goals
1. Supporting legacy keys such as `"models-with-error"`, `"models-with-no-response"`, `"available-models"`, or `"other-models"` as filtering sources.
2. Introducing strict failure behavior for invalid config content that would halt app execution.
3. Adding telemetry pipelines, alerting systems, or persistent log storage changes.
4. Changing unrelated model selection, prompt generation, or output rendering behavior.