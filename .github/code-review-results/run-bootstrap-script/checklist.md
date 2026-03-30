# Prioritized Fix Order Checklist

## Goal
Address the highest-impact issues first so the repository becomes reliably testable, secure-by-default, and easier to maintain.

## Fix Order

- [ ] **P0 — Unblock CI by resolving empty test-suite failures**
  - **Why first**: `npm run test:unit` and `npm run test:integration` currently fail (`exit 1`) because no test files exist, which makes CI red by default.
  - **Scope**:
    - Add minimal baseline tests for `tests/unit`, `tests/integration`, and `tests/e2e`, **or**
    - Temporarily adjust scripts/workflows so empty suites do not fail CI until tests land.
  - **Validation**:
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run test:e2e` (if enabled)
    - CI workflow passes on PR.

- [ ] **P1 — Align app implementation with repo purpose**
  - **Why now**: `app/app.vue` still renders `NuxtWelcome`, while project docs describe an OpenAI model-comparison app.
  - **Scope**:
    - Replace starter UI with a minimal production-intent shell (prompt input, loading/progress state, response/error state).
    - Keep OpenAI calls server-side only.
  - **Validation**:
    - Manual smoke test in browser.
    - Unit tests for UI states and error handling.

- [ ] **P1 — Complete repo instructions and operational docs**
  - **Why now**: `.github/copilot-instructions.md` contains placeholders (`<paths>`, `<command>`, `<rules>`) which leads to ambiguous automation and inconsistent onboarding.
  - **Scope**:
    - Replace placeholders with real entry points, commands, conventions, and docs links.
    - Ensure README reflects current app status and run/test commands.
  - **Validation**:
    - New contributor can run install/dev/test from docs only.

- [ ] **P2 — Improve bootstrap script portability and safety controls**
  - **Why now**: `scripts/bootstrap-new-repo.sh` is tied to `/workspaces` and `SOURCE_REPO=call-openai-api`, reducing portability and increasing operational friction.
  - **Scope**:
    - Parameterize source/destination paths via env vars or flags.
    - Keep safe defaults and clear preflight checks.
    - Preserve no-auto-commit behavior by design.
  - **Validation**:
    - Script works in current devcontainer and at least one alternate path layout.

- [ ] **P3 — Add formatting guardrails for generated/vendor content**
  - **Why now**: Running Prettier broadly touched generated/non-source files; this increases noise and review risk.
  - **Scope**:
    - Add `.prettierignore` entries for generated/build/vendor paths (`.nuxt/`, `node_modules/`, etc.).
    - Optionally tighten formatter scripts to source-controlled project files only.
  - **Validation**:
    - `npm run lint` / `npm run lint:fix` avoids formatting generated artifacts.

- [ ] **P3 — Confirm CI runtime version strategy**
  - **Why now**: CI pins Node `24`; ensure this matches runtime/support policy.
  - **Scope**:
    - Either document and keep Node 24 intentionally, or pin to team-approved LTS.
  - **Validation**:
    - CI green with selected version; local dev docs match CI version.

## Suggested Execution Sequence

1. Resolve P0 first (tests/CI reliability).
2. Implement minimal real app shell (P1).
3. Update instructions/docs (P1).
4. Refactor bootstrap portability (P2).
5. Add formatting guardrails and CI version hardening (P3).

## Definition of Done

- CI passes on PR without bypasses.
- Repo behavior matches stated purpose.
- Docs are complete and executable.
- Bootstrap process is safer and more portable.
- Formatting and version policy are predictable.
