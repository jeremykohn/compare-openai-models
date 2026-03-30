# Implementation Plan with Tasks (TDD)

## Source Design
- `.github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md`

## Objective
Implement the `call-openai-api` design in `compare-openai-models` with strict Test-Driven Development (TDD), covering unit, integration, and end-to-end behavior while preserving functional, visual, accessibility, and security parity.

## TDD Method (Mandatory for Every Task)
For each task below, use **red-green-refactor**:

1. **Red**: Add a failing test for one behavior.
2. **Green**: Implement the smallest change to pass.
3. **Refactor**: Improve structure/naming without changing behavior.
4. Re-run the smallest related suite first, then broader suites.

## Design Assumptions (Resolved from Spec Open Questions)
- `openai-model-support.ts` is treated as non-runtime legacy utility; `/api/models` does not apply capability filtering.
- Runtime env vars beyond the three in `.env.example` remain optional with safe defaults.
- Node runtime baseline is `20+`.
- `/api/models` output contract remains strict (`object: "model"`) even if some tests use minimal mocks.
- SSR auto-fetch edge cases are handled by skipping models fetch on SSR in `useModelsState`.

---

## Phase 0 — Baseline Harness and Quality Gate Readiness

### Approach
Establish a reliable test harness first so each TDD cycle produces deterministic feedback and no suite fails due to missing scaffolding.

### Tasks
- [ ] **P0-T1: Stabilize test inventory and command behavior**
  - Red: Confirm failures from empty/missing test targets across `test:unit`, `test:integration`, `test:e2e`.
  - Green: Add minimal baseline tests per layer to validate harness operation.
  - Refactor: Consolidate shared setup in `tests/test-setup.ts`.
  - Independently testable: `npm run test:unit`.

- [ ] **P0-T2: Create deterministic fixture/mocking helpers**
  - Red: Add failing tests requiring shared fixture builders (models payload, responses payload, error payload).
  - Green: Implement reusable helpers in `tests/helpers/`.
  - Refactor: Remove duplicate fixture literals.
  - Independently testable: one unit file using fixture helpers.

- [ ] **P0-T3: Define local quality-gate sequence mirroring design merge gates**
  - Red: Document expected gate order and verify at least one fails before implementation proceeds.
  - Green: Ensure command sequence is executable locally.
  - Refactor: Keep gate order references consistent in docs and scripts.
  - Independently testable: run each gate command manually.

---

## Phase 1 — Contracts, Constants, and Core Utilities

### Approach
Implement shared contracts/constants and foundational utilities first because both routes and UI depend on exact contract semantics.

### Tasks
- [ ] **P1-T1: Define shared constants with exact copy parity**
  - Red: Unit tests for `DEFAULT_MODEL = gpt-4.1-mini` and fallback note text exact match.
  - Green: Implement/update `shared/constants/models.ts`.
  - Refactor: remove duplicate hardcoded strings.
  - Independently testable: constants unit tests.

- [ ] **P1-T2: Align type contracts for request/response payloads**
  - Red: Type-level tests/checks for `/api/respond` and `/api/models` request/response contracts.
  - Green: Implement/align types in `types/` and `server/types/`.
  - Refactor: simplify type aliases to avoid duplicate schema definitions.
  - Independently testable: `npm run typecheck`.

- [ ] **P1-T3: Implement prompt validation utility behavior**
  - Red: Unit tests for trimmed-empty and trimmed-over-4000 failures with exact messages.
  - Green: Implement validation util(s) reused by client and server.
  - Refactor: ensure message constants are centralized.
  - Independently testable: prompt-validation unit tests.

- [ ] **P1-T4: Implement error sanitization utility contract**
  - Red: Unit tests redacting API keys (`sk-...`), Bearer tokens, Authorization header values.
  - Green: Implement `sanitizeErrorText` and optional variant.
  - Refactor: stabilize regex order and avoid over-redaction.
  - Independently testable: error-sanitization unit tests.

- [ ] **P1-T5: Implement error normalization categories**
  - Red: Unit tests for `network`, `api`, and `unknown` categories and exact canonical messages.
  - Green: Implement normalization util with optional details handling.
  - Refactor: isolate type guard branching.
  - Independently testable: error-normalization unit tests.

- [ ] **P1-T6: Implement runtime security validation utility**
  - Red: Unit tests for missing API key, invalid/empty allowlist, invalid URL credentials, insecure-http toggle semantics.
  - Green: Implement security parser/validator in `server/utils/openai-security.ts`.
  - Refactor: split parsing and validation concerns.
  - Independently testable: openai-security unit tests.

---

## Phase 2 — Models Config, Filtering, Sorting, and Cache Utilities

### Approach
Build deterministic model config and caching primitives before wiring `/api/models` integration behavior.

### Tasks
- [ ] **P2-T1: Implement models config loader and schema validation**
  - Red: Unit tests for valid config and all invalid modes (missing, malformed, missing keys, wrong types, non-string arrays).
  - Green: Implement loader and validation result shape in `openai-models-config-loader.ts`.
  - Refactor: return explicit fallback reason metadata.
  - Independently testable: config-loader unit tests.

- [ ] **P2-T2: Implement exclusion semantics exactly per spec**
  - Red: Unit tests proving only `models-with-error` + `models-with-no-response` are excluded.
  - Green: Implement exclusion-set filtering util.
  - Refactor: isolate set construction helper.
  - Independently testable: models-config filtering unit tests.

- [ ] **P2-T3: Implement deterministic alphabetical sorting**
  - Red: Unit tests for case-sensitive `localeCompare()` ordering.
  - Green: Implement sort helper used by route.
  - Refactor: ensure function purity and deterministic output.
  - Independently testable: sorting unit tests.

- [ ] **P2-T4: Implement 24h models response cache with stale-while-revalidate**
  - Red: Unit tests for fresh hit, stale serve + background refresh trigger, base-url cache keying.
  - Green: Implement `models-response-cache.ts` API.
  - Refactor: inject clock/time source for deterministic tests.
  - Independently testable: models-response-cache unit tests.

- [ ] **P2-T5: Implement 5-minute model validation cache utility**
  - Red: Unit tests for TTL behavior, cache disable toggle (`OPENAI_DISABLE_MODEL_VALIDATION_CACHE`), and base-url keying.
  - Green: Implement `openai-model-validation.ts` cache layer.
  - Refactor: separate cache storage from validation fetch logic.
  - Independently testable: model-validation cache unit tests.

---

## Phase 3 — `GET /api/models` Route (Integration-First)

### Approach
Drive route implementation by integration tests to enforce contract shape, metadata flags, fallback rules, sorting, and cache behavior.

### Tasks
- [ ] **P3-T1: Implement happy-path `/api/models` contract**
  - Red: Integration test for successful upstream proxy + strict response shape + metadata fields.
  - Green: Implement route baseline.
  - Refactor: move mappers/helpers to route-local utilities.
  - Independently testable: models integration happy-path.

- [ ] **P3-T2: Implement filtering and metadata semantics**
  - Red: Integration tests for valid config (`usedConfigFilter=true`, `showFallbackNote=false`).
  - Green: Apply exclusion filter and metadata.
  - Refactor: remove repeated branching code.
  - Independently testable: models filtering integration tests.

- [ ] **P3-T3: Implement fallback mode semantics**
  - Red: Integration tests for missing/unreadable/malformed/invalid config resulting in full list + fallback flags.
  - Green: Implement fallback path.
  - Refactor: centralize fallback flag assignment.
  - Independently testable: models fallback integration tests.

- [ ] **P3-T4: Implement route-level security preflight**
  - Red: Integration tests proving invalid runtime config blocks upstream calls.
  - Green: enforce openai-security validation at route entry.
  - Refactor: normalize server error responses.
  - Independently testable: models security integration tests.

- [ ] **P3-T5: Implement cache behavior in route**
  - Red: Integration tests for fresh cache hit and stale background refresh.
  - Green: wire `models-response-cache` into route flow.
  - Refactor: isolate cache decision helper.
  - Independently testable: models cache integration tests.

- [ ] **P3-T6: Implement canonical route error contract**
  - Red: Integration test for failure message `Error: Failed API call, could not get list of OpenAI models` with optional sanitized details.
  - Green: implement stable error response mapping.
  - Refactor: reuse sanitization utility in route error path.
  - Independently testable: models error integration tests.

---

## Phase 4 — `POST /api/respond` Route and Model Validation

### Approach
Build submit API with strict validation/defaulting/error contracts, driven by integration tests that mirror FR-048..FR-052 and model validation requirements.

### Tasks
- [ ] **P4-T0: Implement route-level security preflight for `/api/respond`**
  - Red: Integration tests proving invalid runtime config blocks `/responses` upstream calls and returns generic internal error contract.
  - Green: enforce `openai-security` validation at `/api/respond` route entry before any upstream call.
  - Refactor: reuse the same preflight helper pattern used by `/api/models`.
  - Independently testable: respond security integration tests.

- [ ] **P4-T1: Implement prompt validation enforcement in route**
  - Red: Integration tests for empty/whitespace and >4000 trimmed prompt returning `400`.
  - Green: wire prompt validation util in route.
  - Refactor: unify message constants client/server.
  - Independently testable: respond validation integration tests.

- [ ] **P4-T2: Implement default model resolution for omitted model**
  - Red: Integration test ensures omitted/empty model resolves to `gpt-4.1-mini`.
  - Green: implement resolver branch.
  - Refactor: isolate model resolution helper.
  - Independently testable: respond default-model integration test.

- [ ] **P4-T3: Implement selected model upstream validation behavior**
  - Red: Integration tests for:
    - invalid selected model -> `400` + `Model is not valid`
    - validation unavailable -> `502` + `Unable to validate model right now. Please try again.`
  - Green: wire model-validation utility with 5-minute cache semantics.
  - Refactor: reduce duplicate validation error handling.
  - Independently testable: model-validation integration tests.

- [ ] **P4-T4: Implement OpenAI `/responses` proxy success mapping**
  - Red: Integration test for success payload `{ response, model }`.
  - Green: implement upstream call and response parser extraction.
  - Refactor: keep parser utility robust and deterministic.
  - Independently testable: respond success integration test.

- [ ] **P4-T5: Implement upstream/non-OK and internal error contracts**
  - Red: Integration tests for passthrough/non-OK behavior and `500` fallback with canonical message `Request to OpenAI failed.` and optional sanitized details.
  - Green: implement error contract mapping.
  - Refactor: centralize error contract builder.
  - Independently testable: respond error integration tests.

---

## Phase 5 — Client Composables and Submission State Machine

### Approach
Implement client state composables and request flow logic under unit/component tests to guarantee deterministic state transitions and request shaping.

### Tasks
- [ ] **P5-T1: Implement `useRequestState` state transitions**
  - Red: Unit tests for `start`, `succeed`, `fail`, `reset` transitions.
  - Green: implement composable behavior.
  - Refactor: remove redundant state writes.
  - Independently testable: request-state unit tests.

- [ ] **P5-T2: Implement `useModelsState` auto-fetch + SSR skip**
  - Red: Unit tests for client-init fetch and SSR skip behavior.
  - Green: implement init flow.
  - Refactor: encapsulate init trigger function.
  - Independently testable: models-state init tests.

- [ ] **P5-T3: Implement request deduplication and cancellation in `useModelsState`**
  - Red: Unit tests for request ID stale-response suppression and AbortController cancellation.
  - Green: implement dedupe/cancel logic.
  - Refactor: isolate concurrency control helper.
  - Independently testable: models-state concurrency tests.

- [ ] **P5-T4: Implement models fetch error normalization + retry contract**
  - Red: Unit tests for normalized error and retry-triggered state transition.
  - Green: wire error normalization, `logNormalizedUiError()` logging, and `fetchModels` retry.
  - Refactor: extract fetch adapter for easier mocking.
  - Independently testable: models-state error/retry tests.

- [ ] **P5-T5: Implement app submit payload shaping (`model` omitted when not selected)**
  - Red: Component tests asserting outbound request body omits `model` when unselected and includes it when selected.
  - Green: implement payload builder and submit handler usage.
  - Refactor: make payload builder pure.
  - Independently testable: app submit payload tests.

- [ ] **P5-T6: Implement submit loading semantics and resubmit guard**
  - Red: Component tests for disabled button + `aria-busy=true` while loading and duplicate-submit prevention.
  - Green: bind loading state and guard path.
  - Refactor: simplify loading-guard branch.
  - Independently testable: app submit loading behavior tests.

---

## Phase 6 — UI Components, UX States, and Accessibility Parity

### Approach
Implement UI and component-level behavior to match exact copy, state rendering, accessibility roles/attributes, and visual-state semantics.

### Tasks
- [ ] **P6-T1: Replace starter app shell with specified page layout and copy**
  - Red: component tests for header/subtitle/footer/legal links and main layout sections.
  - Green: implement full page structure in `app/app.vue`.
  - Refactor: split repeated UI blocks.
  - Independently testable: app UI rendering tests.

- [ ] **P6-T2: Implement prompt field semantics and validation presentation**
  - Red: tests for `maxlength=4000`, `aria-required`, dynamic `aria-invalid`, helper text, inline role-alert error, and textarea focus on validation error.
  - Green: wire prompt field and validation UI.
  - Refactor: centralize aria IDs.
  - Independently testable: prompt field accessibility/validation tests.

- [ ] **P6-T3: Implement `ModelsSelector` all required UI states**
  - Red: tests for loading indicator, success with models, no-model placeholder, error+retry, helper text, fallback note.
  - Green: implement selector states and props/events.
  - Refactor: simplify state rendering conditions.
  - Independently testable: ModelsSelector component tests.

- [ ] **P6-T4: Implement `UiErrorAlert` behavior contract**
  - Red: tests for title/message, details hidden by default, toggle labels `Show details`/`Hide details`, `aria-expanded`, optional retry button.
  - Green: implement alert component behavior.
  - Refactor: reduce prop branching complexity.
  - Independently testable: UiErrorAlert component tests.

- [ ] **P6-T5: Implement response area states**
  - Red: tests for loading text `Waiting for response from ChatGPT...`, success heading `Response`, pre-wrap response text, response/error conditional rendering, and response section `aria-live="polite"` + `aria-atomic="true"`.
  - Green: implement response area.
  - Refactor: extract status card wrappers.
  - Independently testable: response-area tests.

- [ ] **P6-T6: Implement global accessibility landmarks and keyboard behavior**
  - Red: tests for skip link, `main#maincontent`, role/status/alert semantics, keyboard-operable toggles/retry.
  - Green: implement all landmark and aria wiring.
  - Refactor: keep IDs and aria bindings centralized.
  - Independently testable: app accessibility unit tests.

---

## Phase 7 — End-to-End and Accessibility E2E Verification

### Approach
Validate full user journeys and accessibility in browser-level tests that mirror the designed flow and state transitions.

### Tasks
- [ ] **P7-T1: E2E happy-path end-user flow**
  - Red: failing test for load models -> enter prompt -> send -> receive response.
  - Green: adjust integration points to satisfy flow.
  - Refactor: improve selector reliability in tests.
  - Independently testable: e2e app happy-path test.

- [ ] **P7-T2: E2E prompt validation and focus behavior**
  - Red: failing tests for empty/whitespace and over-limit prompt with focus assertion.
  - Green: implement/fix client validation behavior.
  - Refactor: reduce flaky focus timing.
  - Independently testable: e2e validation tests.

- [ ] **P7-T3: E2E models selector loading/error/retry/fallback flows**
  - Red: failing tests for each selector state including fallback note display.
  - Green: align client route metadata handling and retry behavior.
  - Refactor: shared mock/server helpers.
  - Independently testable: e2e models-selector tests.

- [ ] **P7-T4: E2E response error details toggle behavior**
  - Red: failing test for default-collapsed details and toggle label transitions.
  - Green: ensure UiErrorAlert integration in app state.
  - Refactor: simplify assertions for accessibility text.
  - Independently testable: e2e error details test.

- [ ] **P7-T5: E2E accessibility (axe) checks**
  - Red: failing axe checks on representative page states.
  - Green: remediate a11y violations.
  - Refactor: reuse common axe helper setup.
  - Independently testable: `npm run test:a11y:e2e`.

---

## Phase 8 — Documentation and Final Gate Conformance

### Approach
Finalize documentation/runtime alignment and verify all mandatory quality gates pass in the exact expected order.

### Tasks
- [ ] **P8-T1: Align setup docs with env/runtime behavior**
  - Red: docs audit fails when optional env toggles are undocumented.
  - Green: update docs and `.env.example` to explicitly document all runtime env vars and defaults:
    - `OPENAI_API_KEY`
    - `OPENAI_BASE_URL`
    - `OPENAI_ALLOWED_HOSTS`
    - `OPENAI_ALLOW_INSECURE_HTTP`
    - `OPENAI_DISABLE_MODELS_CACHE`
    - `OPENAI_DISABLE_MODEL_VALIDATION_CACHE`
  - Refactor: keep docs concise and copy-accurate.
  - Independently testable: manual setup from docs only.

- [ ] **P8-T2: Confirm Node 20+ and deployment compatibility constraints**
  - Red: compatibility checklist fails if Node requirement or Vercel preset drift from design.
  - Green: verify config/docs parity for Node 20+ and Nitro Vercel preset.
  - Refactor: centralize version/preset references.
  - Independently testable: config/doc verification checklist.

- [ ] **P8-T3: Execute final quality gates**
  - Red: identify remaining failing checks.
  - Green: resolve failures while preserving all spec contracts.
  - Refactor: remove brittle tests and duplicated assertions.
  - Independently testable:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run test:e2e`
    - `npm run test:a11y`

---

## Dependency-Ordered Execution Summary
1. Phase 0: Harness readiness.
2. Phase 1: Core contracts/utilities/security.
3. Phase 2: Model config/filter/cache primitives.
4. Phase 3: `/api/models` integration behavior.
5. Phase 4: `/api/respond` integration behavior.
6. Phase 5: Client composables and submit state machine.
7. Phase 6: UI and accessibility parity.
8. Phase 7: E2E and accessibility validation.
9. Phase 8: Docs compatibility and final gate pass.

## Test Coverage Mapping
- **Unit**: validation, sanitization, normalization, security parser, config loader/filter/sort/cache, composables, components, a11y semantics.
- **Integration**: `/api/models` and `/api/respond` contracts, filtering/fallback, cache semantics, security preflight, model validation behavior.
- **E2E**: complete user flow, model selector states, prompt validation/focus, response success/error states, accessibility scans.

## Test File Inventory (Spec-Named Targets)

### Unit (`tests/unit/`)
- `app.a11y.test.ts` — P6-T6, P7-T5
- `app.ui.test.ts` — P6-T1, P6-T5
- `error-normalization.test.ts` — P1-T5
- `error-sanitization.test.ts` — P1-T4
- `prompt-validation.test.ts` — P1-T3, P6-T2
- `openai-security.test.ts` — P1-T6
- `type-guards.test.ts` — P1-T5
- `openai-models-config.test.ts` — P2-T1, P2-T2
- `models-list.test.ts` — P2-T2, P2-T3
- `models-response-cache.test.ts` — P2-T4
- `ui-error-alert.test.ts` — P6-T4

### Integration (`tests/integration/`)
- `respond-route.test.ts` — P4-T0, P4-T1, P4-T2, P4-T3, P4-T4, P4-T5
- `models.test.ts` — P3-T1, P3-T2, P3-T3, P3-T4, P3-T5, P3-T6
- `models-config-cache.test.ts` — P2-T5, P3-T5

### E2E (`tests/e2e/`)
- `app.spec.ts` — P7-T1, P7-T2
- `models-selector.spec.ts` — P7-T3
- `accessibility.spec.ts` — P7-T5

## Definition of Done
- All FR-001..FR-052 behaviors are test-covered and implemented.
- Non-functional requirements (determinism, performance TTLs, maintainability, compatibility) are validated.
- Functional, visual/UX, and accessibility parity checklists pass.
- Full quality-gate command sequence passes locally and in CI.
