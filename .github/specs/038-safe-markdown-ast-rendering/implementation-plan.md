# Implementation Plan: Safe Markdown AST Rendering

**Source Design:** `.github/specs/038-safe-markdown-ast-rendering/design.md`

**Date:** 2026-05-06

## Phase 1: Define Safe AST Contracts

### Objective
Create a closed, strict TypeScript AST model for supported markdown features so parsing and rendering are type-safe and cannot represent unsafe HTML semantics.

### Tasks
- [x] Define discriminated union node types in `app/types/markdown-ast.ts`
  - Task ID: P1-T1
  - Description: Add `TextNode`, `HeadingNode`, `ParagraphNode`, `UnorderedListNode`, `OrderedListNode`, `ListItemNode`, `CodeBlockNode`, `InlineCodeNode`, `BoldNode`, `ItalicNode`, `LineBreakNode`, plus `MarkdownInlineNode`, `MarkdownBlockNode`, and `MarkdownNode` union aliases.
  - Dependencies: None
  - Validation command: `npm run typecheck`
  - Expected result: Typecheck succeeds and AST unions are fully discriminated with no `any`.

- [x] Add compile-time safety coverage for unsupported constructs
  - Task ID: P1-T2
  - Description: Add type-focused test coverage (or type assertion checks in unit tests) to ensure unsupported node shapes (for example HTML-like nodes) are rejected by TypeScript.
  - Dependencies: P1-T1
  - Validation command: `npm run test -- tests/unit/render-markdown.test.ts`
  - Expected result: Existing tests continue passing and type-safety assertions validate the closed AST contract.

### Validation
- Run full static checks once phase tasks are complete.
- Confirm AST node model supports recursive composition for inline children.

### Exit Criteria
Done when AST types are committed as a closed discriminated union and compile cleanly under strict TypeScript.

## Phase 2: Implement Safe Markdown Parser

### Objective
Build a pure, synchronous parser that converts markdown text into safe AST nodes while neutralizing unsupported syntax and sanitizing text.

### Tasks
- [x] Create parser utility in `app/utils/parse-markdown-safe.ts`
  - Task ID: P2-T1
  - Description: Implement `parseMarkdownSafe(input: string): MarkdownNode[]` with line-based block parsing for headings, paragraphs, ordered/unordered lists, and fenced code blocks.
  - Dependencies: P1-T1
  - Validation command: `npm run typecheck`
  - Expected result: Parser utility compiles and exports the required API signature.

- [x] Implement inline token parsing and recursive inline composition
  - Task ID: P2-T2
  - Description: Parse bold, italic, inline code, and line breaks inside paragraph/heading/list-item children using deterministic parsing rules and safe fallbacks.
  - Dependencies: P2-T1
  - Validation command: `npm run test -- tests/unit/parse-markdown-safe.test.ts`
  - Expected result: Inline syntax is represented in AST with nested children support and tests for core inline features pass.

- [x] Implement sanitization and unsupported-syntax neutralization
  - Task ID: P2-T3
  - Description: Strip/neutralize HTML tags, links, images, blockquotes, tables, javascript/data URI patterns, and script-like content without throwing; sanitize text fields prior to AST insertion.
  - Dependencies: P2-T1
  - Validation command: `npm run test -- tests/unit/parse-markdown-safe.test.ts`
  - Expected result: Security and unsupported-feature test vectors pass with no executable output in AST.

- [x] Add parser resilience and normalization behavior
  - Task ID: P2-T4
  - Description: Ensure graceful behavior for malformed input (unclosed fences, broken markers), heading level clamping/progression normalization, ordered-list start validation, and empty input handling.
  - Dependencies: P2-T2
  - Validation command: `npm run test -- tests/unit/parse-markdown-safe.test.ts`
  - Expected result: Malformed input does not throw and expected fallback nodes are produced.

### Validation
- Execute parser unit suite and verify deterministic output for supported syntax.
- Verify no console warnings/errors are emitted for normal unsupported syntax handling.

### Exit Criteria
Done when parser behavior covers all in-scope markdown features, security neutralization, and malformed-input resilience with passing unit tests.

## Phase 3: Build Semantic AST Renderer Component

### Objective
Create a recursive Vue renderer that maps safe AST nodes to semantic HTML elements with no HTML injection APIs.

### Tasks
- [x] Create `MarkdownRenderer.vue` with typed props and recursion support
  - Task ID: P3-T1
  - Description: Implement `<script setup lang="ts">` component accepting `nodes?: MarkdownNode[]` with default empty array and recursive rendering strategy for nested nodes.
  - Dependencies: P1-T1
  - Validation command: `npm run typecheck`
  - Expected result: Component compiles with strict prop typing and recursion resolves without runtime warnings.

- [x] Implement semantic node-to-element mapping
  - Task ID: P3-T2
  - Description: Map heading/paragraph/list/list-item/code block/inline code/bold/italic/line break/text nodes to semantic HTML elements (`h1..h6`, `p`, `ul`, `ol`, `li`, `pre`, `code`, `strong`, `em`, `br`) using interpolation-only text rendering.
  - Dependencies: P3-T1
  - Validation command: `npm run test -- tests/unit/markdown-renderer.test.ts`
  - Expected result: Renderer unit tests confirm correct semantic output for all supported node types.

- [x] Implement accessibility semantics for code blocks and heading behavior
  - Task ID: P3-T3
  - Description: Add code-language class/ARIA labeling behavior when language exists and ensure renderer correctly reflects normalized heading levels passed from parser.
  - Dependencies: P3-T2
  - Validation command: `npm run test -- tests/unit/markdown-renderer.test.ts`
  - Expected result: Tests verify language context and heading semantics for people using assistive technologies.

- [x] Add guard tests for absence of HTML injection APIs
  - Task ID: P3-T4
  - Description: Add/extend tests that fail if renderer introduces `v-html` or dynamic HTML insertion patterns.
  - Dependencies: P3-T1
  - Validation command: `npm run test -- tests/unit/markdown-renderer.test.ts`
  - Expected result: Guard tests pass and protect against regression to unsafe rendering approaches.

### Validation
- Run renderer unit tests and ensure semantic output snapshots/assertions are stable.
- Run lint/typecheck to confirm no forbidden rendering patterns.

### Exit Criteria
Done when renderer recursively renders all supported AST nodes with semantic HTML, accessibility semantics, and no HTML injection usage.

## Phase 4: Integrate Safe Pipeline into Comparison Output

### Objective
Replace HTML-based markdown rendering in the comparison panel with parser+AST renderer while preserving visual style and behavior.

### Tasks
- [x] Update `ComparisonOutputPanel.vue` to use AST pipeline
  - Task ID: P4-T1
  - Description: Replace `renderedModel3Html` with `renderedModel3Nodes`, switch imports from `renderMarkdown` to `parseMarkdownSafe` and `MarkdownRenderer`, and wire computed data flow accordingly.
  - Dependencies: P2-T1, P3-T1
  - Validation command: `npm run typecheck`
  - Expected result: Component compiles and Model 3 output path is AST-based.

- [x] Remove HTML injection bindings and lint suppressions
  - Task ID: P4-T2
  - Description: Remove `v-html` usage and related ESLint disable comments from `ComparisonOutputPanel.vue`, ensuring rendering is done only through `MarkdownRenderer`.
  - Dependencies: P4-T1
  - Validation command: `npm run lint`
  - Expected result: Lint passes with `vue/no-v-html` enforced and no local rule suppression in this component.

- [x] Preserve visual parity via prose styling wrapper
  - Task ID: P4-T3
  - Description: Keep existing `prose` utility class stack and wrapper structure so line breaking, spacing, and text color remain consistent with current UI.
  - Dependencies: P4-T1
  - Validation command: `npm run test -- tests/unit/app.ui.test.ts`
  - Expected result: Existing UI tests for output rendering continue to pass without regressions.

- [x] Assess and clean up obsolete markdown sanitizer path if unused
  - Task ID: P4-T4
  - Description: Verify whether `app/utils/render-markdown.ts` and DOMPurify are still referenced. If unused, remove dead references/files and update dependency manifest in scope.
  - Dependencies: P4-T2
  - Validation command: `npm run test`
  - Expected result: Test suite passes and no dead sanitizer path remains in active code.

### Validation
- Execute typecheck, lint, and targeted UI tests after integration.
- Confirm no behavior change outside Model 3 rendering path.

### Exit Criteria
Done when `ComparisonOutputPanel` fully uses the safe AST renderer with unchanged outward panel contract and preserved styling.

## Phase 5: Complete Test Coverage, Security Verification, and Regression Checks

### Objective
Finish required unit/integration/E2E coverage and validate security and accessibility acceptance criteria end-to-end.

### Tasks
- [x] Add parser unit test suite in `tests/unit/parse-markdown-safe.test.ts`
  - Task ID: P5-T1
  - Description: Add tests for all supported syntax, malformed input, unsupported syntax neutralization, and XSS vectors.
  - Dependencies: P2-T4
  - Validation command: `npm run test -- tests/unit/parse-markdown-safe.test.ts`
  - Expected result: New parser suite passes and captures FR/TR/SR parser expectations.

- [x] Add renderer unit test suite in `tests/unit/markdown-renderer.test.ts`
  - Task ID: P5-T2
  - Description: Add tests for all node mappings, recursive rendering, code block language labels, and no-`v-html` guard assertions.
  - Dependencies: P3-T4
  - Validation command: `npm run test -- tests/unit/markdown-renderer.test.ts`
  - Expected result: Renderer suite passes and prevents regression to unsafe rendering.

- [x] Update comparison integration coverage
  - Task ID: P5-T3
  - Description: Update/add tests around `ComparisonOutputPanel` to verify parser+renderer pipeline is used and Model 3 content is rendered correctly.
  - Dependencies: P4-T3
  - Validation command: `npm run test -- tests/unit/model-output-panel.test.ts`
  - Expected result: Integration-adjacent unit coverage passes with safe pipeline assertions.

- [x] Run accessibility and end-to-end regression coverage
  - Task ID: P5-T4
  - Description: Run accessibility and E2E suites relevant to rendered output to ensure semantic heading/list/code structure does not disrupt keyboard flow or contrast assumptions from existing styles.
  - Dependencies: P5-T3
  - Validation command: `npm run test:e2e`
  - Expected result: E2E and accessibility specs pass with no navigation/focus regressions in rendered output.

- [x] Run full quality gate and finalize
  - Task ID: P5-T5
  - Description: Execute complete lint/typecheck/test stack and document any residual risks or follow-up items if removal of legacy sanitizer dependency is deferred.
  - Dependencies: P5-T1, P5-T2, P5-T3, P5-T4
  - Validation command: `npm run lint && npm run test`
  - Expected result: All quality gates pass; implementation is ready for Prompt 5 execution.

### Validation
- Confirm all new tests are deterministic and scoped to behaviors in requirements/design.
- Validate security expectations by asserting no executable payloads render.

### Exit Criteria
Done when all required tests pass and the quality gate verifies safe rendering, accessibility semantics, and no `v-html` usage in the target component.

## Risks, Assumptions, and Dependencies

### Risks
- Inline parser edge cases may create subtle regressions in emphasis/code token boundaries.
- Recursive renderer mistakes can flatten or mis-nest inline formatting.
- Visual parity risks if wrapper structure or prose utility placement changes.

### Assumptions
- Model 3 markdown mostly contains supported syntax in production flows.
- Existing Tailwind prose classes continue to satisfy contrast and typography requirements.

### Dependencies
- Existing Nuxt/Vue/Vitest tooling remains unchanged.
- No new third-party parser/sanitizer dependencies are required.

## Traceability
| Phase / Task ID | Design Section | Notes |
| --------------- | -------------- | ----- |
| P1-T1 | Interfaces | Implements closed AST contracts for FR-1, TR-1, TR-8. |
| P1-T2 | Interfaces, Testing | Validates type-safety boundaries for FR-1 and SR-1. |
| P2-T1 | Interfaces, Architecture | Delivers parser API and core block parsing for FR-2 and TR-2. |
| P2-T2 | Architecture, Testing | Implements inline parsing coverage for FR-2 and TR-7. |
| P2-T3 | Security, Validation/Error Handling | Enforces neutralization/sanitization for TR-4, SR-1, SR-2. |
| P2-T4 | Validation/Error Handling, Accessibility | Adds malformed-input resilience and heading/list normalization for TR-5 and AR-1. |
| P3-T1 | Interfaces, Architecture | Creates typed recursive renderer surface for FR-3 and TR-3. |
| P3-T2 | Architecture, Testing | Implements semantic mapping coverage for FR-3 and TR-7. |
| P3-T3 | Accessibility | Adds language and semantic accessibility behavior for AR-1 and AR-2. |
| P3-T4 | Security, Testing | Protects against HTML injection regressions for SR-1 and SR-3. |
| P4-T1 | Architecture, Interfaces | Integrates parser+renderer in panel for FR-4 and SR-3. |
| P4-T2 | Security | Removes `v-html` path and lint suppressions for FR-4, SR-3. |
| P4-T3 | Data, Testing | Preserves visual/prose behavior for FR-5 and AR-4. |
| P4-T4 | Security | Handles dependency-surface reduction for TR-6 and SR-3. |
| P5-T1 | Testing, Security | Completes parser and XSS validation coverage for TR-7, SR-1, SR-2. |
| P5-T2 | Testing, Accessibility | Completes renderer and accessibility coverage for TR-7, AR-1, AR-2. |
| P5-T3 | Testing | Confirms panel integration behavior for FR-4 and FR-5. |
| P5-T4 | Accessibility, Testing | Confirms keyboard/flow and a11y expectations for AR-3 and AR-4. |
| P5-T5 | Testing, Security | Final quality gate and readiness verification across all requirement categories. |

## Run History

> **Prompt 6 run — 2026-05-06:** No unresolved discrepancies found. Workflow complete.
