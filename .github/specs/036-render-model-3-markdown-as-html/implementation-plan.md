# Implementation Plan

## Phase 1 — Install dependencies

### P1-T1: Install `marked` and `dompurify` (+ types)
- **Command**:
  ```bash
  npm install marked dompurify
  npm install --save-dev @types/dompurify
  ```
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: `package.json` and `package-lock.json` updated; typecheck passes with new packages on the module path.

### P1-T2: Install `@tailwindcss/typography`
- **Command**:
  ```bash
  npm install --save-dev @tailwindcss/typography
  ```
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Typography plugin available for import in `tailwind.config.ts`.

## Phase 2 — Add `renderMarkdown` utility

### P2-T1: Create `app/utils/render-markdown.ts`
- **File**: `app/utils/render-markdown.ts` (new)
- **Change**: Wrap `marked.parse` + `DOMPurify.sanitize` into a single exported `renderMarkdown(input: string): string` function.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Utility compiles without type errors; `marked` and `dompurify` imports resolve.

## Phase 3 — Enable Tailwind typography plugin

### P3-T1: Update `tailwind.config.ts`
- **File**: `tailwind.config.ts`
- **Change**: Import `@tailwindcss/typography` and add it to the `plugins` array.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Config compiles; `prose` classes become available in CSS output.

## Phase 4 — Update `ComparisonOutputPanel.vue`

### P4-T1: Replace plain-text binding with `v-html` on rendered Markdown
- **File**: `app/components/ComparisonOutputPanel.vue`
- **Change**:
  - Import `renderMarkdown` from `../utils/render-markdown`.
  - Add `renderedModel3Html` computed ref that calls `renderMarkdown(props.model3Data)` when `model3Status === 'success' && model3Data`.
  - Replace `<p … >{{ model3Data }}</p>` with `<div … v-html="renderedModel3Html" />` using `prose prose-sm max-w-none` Tailwind classes.
- **Validation command**:
  ```bash
  npm run typecheck
  ```
- **Expected result**: Component compiles; `v-html` binding resolves to typed string.

## Phase 5 — Update tests

### P5-T1: Update unit test assertions for Model 3 response HTML
- **File**: `tests/unit/app.ui.test.ts`
- **Change**:
  - Assertions using `.text()` on `comparison-model3-response` continue to work unmodified (happy-dom strips HTML tags for text extraction).
  - Add a focused test case for `ComparisonOutputPanel` mounting directly with Markdown content (e.g. `"## Heading\n- item"`) and asserting `wrapper.find('h2')` and `wrapper.find('li')` exist inside the response element.
- **Validation command**:
  ```bash
  npm test
  ```
- **Expected result**: All unit tests pass including new Markdown-to-HTML assertion.

### P5-T2: Update or extend E2E assertions for Model 3 response
- **File**: `tests/e2e/app.spec.ts`
- **Change**:
  - Existing `.toContainText()` assertions continue to work because Playwright matches visible text regardless of element boundaries.
  - Verify that E2E mock response value (`"Hello from ChatGPT"`) is still located by existing locators. If needed, update the locator from `p` to `div` or remove any tag-specific selector.
  - Update any locator in `app.spec.ts` or `accessibility.spec.ts` that uses `p.whitespace-pre-wrap` within the comparison panel to match the new `div` container.
- **Validation command**:
  ```bash
  npm run test:e2e -- tests/e2e/app.spec.ts
  ```
- **Expected result**: E2E test suite passes.

## Phase 6 — Full quality gate verification

### P6-T1: Run complete checks
- **Validation command**:
  ```bash
  npm run typecheck && npm test && npm run lint
  ```
- **Expected result**: All checks pass.

## Post-Phase Find-and-Fix

After each phase:
1. Resolve any type or test failures before moving to the next phase.
2. Keep changes restricted to the files listed; do not touch Model 1/Model 2 rendering paths.
3. Re-run failing checks before proceeding.

## Run History

**Prompt 5 run — 2026-05-05:** Implemented Model 3 Markdown rendering as sanitized HTML. Added dependencies: `marked`, `dompurify`, `@tailwindcss/typography` (and `@types/dompurify` dev type package). Added `app/utils/render-markdown.ts` for Markdown parsing + sanitization. Updated `app/components/ComparisonOutputPanel.vue` to render Model 3 success content via `v-html` from a computed `renderedModel3Html` value and applied Tailwind prose classes with overflow-safe code block styling. Enabled typography plugin in `tailwind.config.ts`. Added tests in `tests/unit/render-markdown.test.ts` and extended `tests/unit/app.ui.test.ts` + `tests/e2e/app.spec.ts` for Markdown structure rendering and sanitization expectations. Updated `README.md` feature list. Validation passed: `npm run test:unit`, `npm run typecheck && npm test && npm run lint`, and `npm run test:e2e -- tests/e2e/app.spec.ts`.

**Prompt 6 run — 2026-05-05:** Performed discrepancy review against `description.md`, `requirements.md`, and `design.md` using the current repository state (including latest edits in `tests/e2e/app.spec.ts` and this plan file). Verified Model 3 success output is rendered as sanitized Markdown HTML in `app/components/ComparisonOutputPanel.vue` via `app/utils/render-markdown.ts`; verified `marked`/`dompurify` dependencies and `@tailwindcss/typography` plugin registration; verified coverage in `tests/unit/render-markdown.test.ts`, `tests/unit/app.ui.test.ts`, and `tests/e2e/app.spec.ts`; verified Model 1/2 rendering and Model 3 loading/error behavior remain unchanged. No discrepancies found; no code changes required.
