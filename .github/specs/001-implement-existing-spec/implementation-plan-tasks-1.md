# Implementation Plan with Tasks (TDD)

## Source Design
- `.github/specs/001-implement-existing-spec/spec-1-for-call-openai-api-repo.md`

## Goal
Implement the specified `call-openai-api` behavior in `compare-openai-models` using strict Test-Driven Development (TDD) with unit, integration, and end-to-end coverage.

## TDD Execution Model (Applies to Every Task)
For each task below, execute a **red-green-refactor** loop:

1. **Red**: Add or update a failing test that captures one behavior.
2. **Green**: Implement the smallest change required to pass.
3. **Refactor**: Improve names/structure while preserving behavior and test pass.
4. Re-run the smallest relevant suite first, then broader suites.

## Assumptions (From Design Open Questions)
- `openai-model-support` remains non-runtime/legacy and is **not** applied in `/api/models` filtering unless a new requirement adds it.
- Optional runtime env controls remain optional and documented.
- Node baseline remains 20+ unless separately changed.
- Route output shape remains strict; tests may use minimal mocks where contract-critical fields are not under test.

## Phase 0 — Baseline Test Harness and Quality Gates

### Approach
Stabilize test/lint/typecheck foundations so every subsequent TDD cycle has reliable feedback.

### Tasks
- [ ] **P0-T1: Align test command behavior with current test inventory**
  - Red: Confirm current failing behavior for empty suites (`test:unit`, `test:integration`, `test:e2e`).
  - Green: Add minimal placeholder tests in `tests/unit`, `tests/integration`, `tests/e2e` that verify harness integrity.
  - Refactor: Consolidate shared setup in `tests/test-setup.ts`.
  - Independently testable: `npm run test:unit`.

- [ ] **P0-T2: Add deterministic test fixtures and mock helpers**
  - Red: Add failing tests that require reusable OpenAI and config fixtures.
  - Green: Create `tests/helpers/` fixture builders for models list, responses payload, error payload.
  - Refactor: Remove duplicated fixture literals.
  - Independently testable: one fixture-consumer test file passes.

- [ ] **P0-T3: Define CI-oriented local gate command order**
  - Red: Add a local scripted gate check in docs/spec task notes (no code behavior change).
  - Green: Verify this order passes as tasks progress: `typecheck -> unit -> integration -> e2e`.
  - Refactor: Keep command ordering consistent across docs and workflow expectations.
  - Independently testable: run each command manually in sequence.

---

## Phase 1 — Shared Contracts, Constants, and Security Foundations

### Approach
Implement foundational constants/types/security utilities first because all routes and client logic depend on stable contracts.

### Tasks
- [ ] **P1-T1: Define shared constants for default model and fallback note copy**
  - Red: Unit tests for exact constant values (`gpt-4.1-mini`, fallback note text).
  - Green: Add/update `shared/constants/models.ts`.
  - Refactor: Centralize references to eliminate literal duplication.
  - Independently testable: constants unit test file.

- [ ] **P1-T2: Add/update route contract types**
  - Red: Type-level and unit tests for `/api/respond` and `/api/models` shapes.
  - Green: Implement/align `types/` and `server/types/` contract definitions.
  - Refactor: Ensure naming consistency between client and server.
  - Independently testable: `npm run typecheck`.

- [ ] **P1-T3: Implement runtime OpenAI config validation utility behavior**
  - Red: Unit tests for missing API key, invalid/empty allowlist, invalid URL credentials, insecure HTTP toggle semantics.
  - Green: Implement config parsing/validation logic in `server/utils/openai-security.ts` (or equivalent).
  - Refactor: Extract parser helpers for allowlist and truthy parsing.
  - Independently testable: security util unit tests.

- [ ] **P1-T4: Implement error detail sanitization utility**
  - Red: Unit tests for redaction of `Bearer`, `Authorization`, and `sk-...` patterns.
  - Green: Implement sanitizer behavior in `app/utils/error-sanitization.ts` and shared server-safe usage if needed.
  - Refactor: Keep deterministic pattern ordering and avoid over-redaction.
  - Independently testable: sanitizer unit tests.

---

## Phase 2 — Models Config, Filtering, Sorting, and Cache Utilities

### Approach
Implement deterministic config parsing/filtering/sorting and cache utilities before wiring `/api/models` route.

### Tasks
- [ ] **P2-T1: Implement models config schema loader and validation**
  - Red: Unit tests for valid config, missing file, malformed JSON, invalid root shape, missing keys, non-array values, non-string array members.
  - Green: Implement loader in `server/utils/openai-models-config-loader.ts`.
  - Refactor: Return explicit typed result (`valid` vs fallback reason).
  - Independently testable: config-loader unit tests.

- [ ] **P2-T2: Implement exclusion-set filtering semantics**
  - Red: Unit tests proving only `models-with-error` and `models-with-no-response` are excluded; `available-models` and `other-models` are non-exclusion.
  - Green: Implement filtering util in `server/utils/openai-models-config.ts`.
  - Refactor: Isolate exclusion-set builder.
  - Independently testable: filtering util unit tests.

- [ ] **P2-T3: Implement deterministic alphabetical sorting utility**
  - Red: Unit tests for localeCompare-based alphabetical sorting and stable deterministic order.
  - Green: Implement shared sort helper used by route.
  - Refactor: Ensure helper is side-effect free (returns new array or clearly documented behavior).
  - Independently testable: sorting util unit tests.

- [ ] **P2-T4: Implement models-response cache semantics**
  - Red: Unit tests for 24-hour TTL, fresh hit, stale-while-revalidate behavior, base-url keyed cache.
  - Green: Implement `server/utils/models-response-cache.ts` deterministic cache API.
  - Refactor: Separate time-provider for deterministic tests.
  - Independently testable: cache util unit tests.

- [ ] **P2-T5: Enforce deterministic config serialization behavior**
  - Red: Unit tests for canonical key order and trailing newline preservation in config serialization utilities/scripts.
  - Green: Implement/update serializer used by model config tooling.
  - Refactor: isolate key-order strategy to a single helper.
  - Independently testable: config serialization unit tests.

---

## Phase 3 — `GET /api/models` Route (Integration-First)

### Approach
Drive route behavior from integration tests covering contracts, filtering metadata flags, fallback mode, and error semantics.

### Tasks
- [ ] **P3-T1: Add integration test for happy-path models proxy + filtering**
  - Red: Integration test expects sorted list, filtered exclusions only, and metadata `usedConfigFilter=true`, `showFallbackNote=false`.
  - Green: Implement route wiring in `server/api/models.get.ts`.
  - Refactor: Extract route-local mapping/parsing helpers.
  - Independently testable: models integration test (happy path).

- [ ] **P3-T2: Add integration tests for config fallback behavior**
  - Red: Tests for missing/unreadable/malformed/invalid config returning full upstream list with `usedConfigFilter=false`, `showFallbackNote=true`.
  - Green: Implement fallback branching.
  - Refactor: Reduce branch duplication.
  - Independently testable: fallback integration tests.

- [ ] **P3-T3: Add integration tests for route-level security preflight**
  - Red: Tests that invalid OpenAI runtime config/allowed hosts fail before upstream call.
  - Green: Apply security validation at route start.
  - Refactor: Standardize route error response shape.
  - Independently testable: security integration tests for `/api/models`.

- [ ] **P3-T4: Add integration tests for cache behavior paths**
  - Red: Tests for fresh cache hit, stale serve + background refresh trigger, and no-cache mode toggle.
  - Green: Wire cache utility into route.
  - Refactor: Clarify observability hooks for refresh branch in tests.
  - Independently testable: cache integration tests.

- [ ] **P3-T5: Add integration tests for error contract**
  - Red: Upstream failure test expects `message: Error: Failed API call, could not get list of OpenAI models` and optional sanitized details.
  - Green: Implement stable error mapping contract.
  - Refactor: Reuse sanitizer and error mapping helper.
  - Independently testable: models error integration tests.

---

## Phase 4 — Model Resolution and `POST /api/respond` Route

### Approach
Implement strict server-side validation and response parsing from integration tests, with model-default and model-validation logic enforced.

### Tasks
- [ ] **P4-T1: Implement prompt validation utility and server enforcement**
  - Red: Unit + integration tests for empty/whitespace prompt and >4000 trimmed prompt failures (`400`).
  - Green: Implement shared prompt validation logic used by route.
  - Refactor: Single-source messages to avoid drift.
  - Independently testable: prompt util unit tests + respond integration tests.

- [ ] **P4-T2: Implement model resolution defaulting behavior**
  - Red: Integration test for omitted/empty model resolving to `gpt-4.1-mini`.
  - Green: Implement resolver path for `model` omission.
  - Refactor: Keep resolver function pure where possible.
  - Independently testable: model resolution unit/integration tests.

- [ ] **P4-T3: Implement selected-model validation against upstream `/models`**
  - Red: Integration tests:
    - valid selected model passes,
    - unknown model returns `400` + `Model is not valid`,
    - validation service unavailable returns `502` + `Unable to validate model right now. Please try again.`
  - Green: Implement `server/utils/openai-model-validation.ts` integration and caching (5-minute TTL).
  - Refactor: Isolate cache key and disable-toggle logic.
  - Independently testable: model-validation unit + respond integration tests.

- [ ] **P4-T4: Implement OpenAI `/responses` proxy and success contract**
  - Red: Integration test expecting `{ response: string, model: string }` from successful upstream payload.
  - Green: Implement route call + parser (`server/utils/openai-response-parser.ts`).
  - Refactor: Keep parser resilient and deterministic.
  - Independently testable: parser unit tests + respond success integration.

- [ ] **P4-T5: Implement stable error contract for upstream and unexpected failures**
  - Red: Integration tests for non-OK upstream status and unexpected exceptions requiring message `Request to OpenAI failed.` plus sanitized optional details.
  - Green: Implement route error mapping.
  - Refactor: share error mapping helper to reduce branch complexity.
  - Independently testable: respond error integration tests.

---

## Phase 5 — Client Error Model, Composables, and Form Submission Logic

### Approach
Implement client state and error normalization first, then app submit behavior with strict request-shape expectations.

### Tasks
- [ ] **P5-T1: Implement `useRequestState` transitions**
  - Red: Unit tests for `idle/loading/success/error` transitions and payload reset behavior.
  - Green: Implement composable API (`start`, `succeed`, `fail`, `reset`).
  - Refactor: remove redundant state mutation paths.
  - Independently testable: request-state unit tests.

- [ ] **P5-T2: Implement `useModelsState` with request-id + abort semantics**
  - Red: Unit tests for loading/success/error states, stale request prevention, retry behavior, SSR-skip behavior.
  - Green: Implement composable with `AbortController` and request token strategy.
  - Refactor: isolate fetch adapter for testability.
  - Independently testable: models-state unit tests.

- [ ] **P5-T3: Implement client error normalization categories and messages**
  - Red: Unit tests for `network`, `api`, `unknown` categories and exact canonical messages.
  - Green: Implement `app/utils/error-normalization.ts`.
  - Refactor: ensure sanitizer consistently applied before displaying details.
  - Independently testable: error-normalization unit tests.

- [ ] **P5-T4: Implement client submit payload shaping**
  - Red: Component/unit tests that verify request body omits `model` when no selection and includes `model` when selected.
  - Green: Implement submit body builder and invocation logic.
  - Refactor: extract request body function from `app/app.vue` if complexity grows.
  - Independently testable: app submit logic tests.

- [ ] **P5-T5: Implement client-side prompt validation + focus behavior**
  - Red: UI tests for:
    - empty/whitespace prompt -> `Please enter a prompt.` and focus to prompt field,
    - >4000 trimmed -> `Prompt must be 4000 characters or fewer.`
  - Green: wire validation before request dispatch.
  - Refactor: reuse shared validation util.
  - Independently testable: app validation UI tests.

- [ ] **P5-T6: Implement submit button loading accessibility semantics**
  - Red: UI tests for disabled submit button and `aria-busy="true"` while request is in-flight.
  - Green: bind loading state to button disabled + aria attributes and prevent duplicate submits.
  - Refactor: keep loading-state wiring centralized.
  - Independently testable: submit-button accessibility behavior tests.

---

## Phase 6 — UI Composition, Accessibility, and UX Parity

### Approach
Implement components and page structure to satisfy required copy, visual behavior, loading/success/error states, and accessibility semantics.

### Tasks
- [ ] **P6-T1: Implement page structure and copy parity in `app/app.vue`**
  - Red: Component snapshot/assertion tests for title/subtitle/footer links and major layout regions.
  - Green: Replace starter template with specified single-page structure.
  - Refactor: split repeated UI sections into subcomponents where needed.
  - Independently testable: app UI rendering tests.

- [ ] **P6-T2: Implement `ModelsSelector` required UX states**
  - Red: Component tests for loading text, placeholders (`Select a model` / `No models available`), disabled-on-error, retry button behavior, helper/fallback note copy.
  - Green: Implement selector rendering/state props/events.
  - Refactor: simplify state-to-view mapping.
  - Independently testable: models-selector unit tests.

- [ ] **P6-T3: Implement response state area behaviors**
  - Red: Component tests for loading spinner text `Waiting for response from ChatGPT...`, success card heading `Response`, and pre-wrap response text.
  - Green: Implement response-state rendering logic.
  - Refactor: extract reusable status card wrappers.
  - Independently testable: response-area unit tests.

- [ ] **P6-T4: Implement `UiErrorAlert` details toggle contract**
  - Red: Unit tests for default-collapsed details, toggle labels `Show details` / `Hide details`, keyboard operability, and role semantics.
  - Green: Implement error alert with optional details and proper aria.
  - Refactor: reduce prop branching complexity.
  - Independently testable: error-alert unit tests.

- [ ] **P6-T5: Implement accessibility landmarks and form aria requirements**
  - Red: a11y unit tests for skip link, `main#maincontent`, prompt/model aria-required/invalid/describedby, role alert/status semantics.
  - Green: wire required attributes and IDs.
  - Refactor: centralize IDs and aria linkages.
  - Independently testable: a11y unit tests.

---

## Phase 7 — End-to-End and Accessibility E2E Coverage

### Approach
Use Playwright to verify complete user behavior, error paths, model-selector states, and axe checks for WCAG A/AA tags.

### Tasks
- [ ] **P7-T1: Add E2E happy path (models load -> submit -> response)**
  - Red: failing e2e spec for full successful flow.
  - Green: implement/fix UI and route integration points.
  - Refactor: stabilize selectors and test helpers.
  - Independently testable: one e2e scenario.

- [ ] **P7-T2: Add E2E prompt validation and focus behavior**
  - Red: failing e2e for empty/whitespace and over-limit prompt cases.
  - Green: ensure error messages and focus behavior match spec.
  - Refactor: avoid flaky timing around focus assertions.
  - Independently testable: validation e2e scenario.

- [ ] **P7-T3: Add E2E models selector fallback/error/retry scenarios**
  - Red: failing e2e for unavailable models, fallback note visibility, and retry behavior.
  - Green: align view and route metadata handling.
  - Refactor: shared network mocking helpers.
  - Independently testable: selector state e2e scenarios.

- [ ] **P7-T4: Add E2E error details toggle scenario**
  - Red: failing e2e verifying default-collapsed details and toggle labels.
  - Green: implement exact toggle behavior.
  - Refactor: tighten semantics assertions.
  - Independently testable: error alert e2e scenario.

- [ ] **P7-T5: Add E2E accessibility scan**
  - Red: failing axe e2e test for core page states.
  - Green: remediate accessibility violations.
  - Refactor: keep shared a11y test utility for repeated scans.
  - Independently testable: `npm run test:a11y:e2e`.

---

## Phase 8 — Documentation, Environment, and Final Gate Alignment

### Approach
Finalize implementation by ensuring docs/environment/runtime instructions match behavior and all quality gates pass.

### Tasks
- [ ] **P8-T1: Update `README.md` and `.env.example` for runtime env clarity**
  - Red: docs checklist test/manual audit fails when env vars are missing from docs.
  - Green: document required and optional env vars including cache toggles.
  - Refactor: keep docs concise and command-accurate.
  - Independently testable: manual setup using docs only.

- [ ] **P8-T2: Verify script and workflow command parity**
  - Red: detect mismatched commands between docs and `package.json` scripts.
  - Green: align references without changing design scope.
  - Refactor: centralize command snippets where practical.
  - Independently testable: command copy/paste audit.

- [ ] **P8-T2a: Confirm runtime compatibility and deployment preset parity**
  - Red: integration/config test fails if Nuxt/Nitro preset drifts from required Vercel target or TypeScript strict mode expectations.
  - Green: verify and align `nitro.config.ts` preset and strict TS posture with design.
  - Refactor: reduce duplicated config assumptions in tests/docs.
  - Independently testable: config verification tests and `npm run typecheck`.

- [ ] **P8-T3: Run final quality gate sequence**
  - Red: identify remaining failing checks.
  - Green: resolve final failures while preserving contracts.
  - Refactor: clean test duplication and brittle assertions.
  - Independently testable:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run test:e2e`
    - `npm run test:a11y`

---

## Dependency Order Summary
1. Phase 0 (harness).
2. Phase 1 (constants/contracts/security).
3. Phase 2 (config/filter/cache utils).
4. Phase 3 (`/api/models`).
5. Phase 4 (`/api/respond` + model validation).
6. Phase 5 (client state/error/prompt/submit logic).
7. Phase 6 (UI/UX/accessibility).
8. Phase 7 (e2e + axe).
9. Phase 8 (docs + final gates).

## Test Mapping Matrix
- **Unit tests**: utilities, composables, components, a11y semantics, constants/contracts.
- **Integration tests**: route contracts (`/api/models`, `/api/respond`), filtering/fallback/cache/model validation/security behavior.
- **E2E tests**: complete user flows, selector states, validation/focus, error details toggle, accessibility scans.

## Definition of Done
- All functional requirements FR-001 through FR-029 covered by tests and implementation.
- Non-functional requirements (determinism, security boundaries, caching TTL semantics, maintainability) validated through tests and review.
- Acceptance criteria sections (functional parity, visual/UX parity, accessibility parity) are all demonstrably satisfied.
- Full gate command sequence passes locally and in CI.