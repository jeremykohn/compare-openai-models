# Implementation Plan

## Overview

Spec 042 is a focused, subtractive change across four locations. All modifications remove or replace existing code — no new logic is introduced.

## Phase 1: Logic and UI

### P1-T1: Update validatePrompt()
**File**: `app/utils/prompt-validation.ts`
- Remove `MAX_PROMPT_MESSAGE` constant.
- Remove the `if (trimmedPrompt.length > 4000)` branch and its return statement.
- No change to function signature or other behavior.

### P1-T2: Update app.vue template
**File**: `app/app.vue`
- Remove `maxlength="4000"` attribute from the shared prompt textarea.
- Remove the `<p id="prompt-help">Maximum 4000 characters.</p>` element.
- Remove `aria-describedby` reference to `prompt-help` from the textarea (or simplify to only reference `prompt-error` when applicable).

## Phase 2: Tests

### P2-T1: Update prompt-validation unit tests
**File**: `tests/unit/prompt-validation.test.ts`
- Remove test: `"returns error for prompt over 4000 chars after trim"`.
- Add test: `"returns valid result for prompt longer than 4000 characters"` — validates a 4001-character prompt returns `{ isValid: true }`.

### P2-T2: Update UI tests
**File**: `tests/unit/app.ui.test.ts`
- Remove or update the assertion `expect(prompt.attributes("maxlength")).toBe("4000")`.

## Task Summary

| Task | File | Change Type |
|------|------|-------------|
| P1-T1 | `app/utils/prompt-validation.ts` | Remove constant + length guard |
| P1-T2 | `app/app.vue` | Remove maxlength attr + help text + aria-describedby ref |
| P2-T1 | `tests/unit/prompt-validation.test.ts` | Remove over-limit test; add long-prompt-passes test |
| P2-T2 | `tests/unit/app.ui.test.ts` | Remove maxlength assertion |

## Run History

> **Prompt 5 run — 2026-05-06:** All 4 tasks implemented. ✓ P1-T1: Removed `MAX_PROMPT_MESSAGE` constant and length guard from `validatePrompt()`. ✓ P1-T2: Removed `maxlength="4000"` attr, `prompt-help` paragraph, and simplified `aria-describedby` in `app.vue`. ✓ P2-T1: Replaced over-limit test with long-prompt-passes test in `prompt-validation.test.ts`. ✓ P2-T2: Updated `app.ui.test.ts` maxlength assertion to `toBeUndefined()`. No editor errors reported.
