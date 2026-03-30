# GitHub Issue Drafts

Use the following issues as ready-to-copy drafts.

---

## Issue 1
**Title:** P0: Unblock CI by resolving empty test-suite failures

**Labels:** `priority:P0`, `ci`, `tests`

**Summary**
`npm run test:unit` and `npm run test:integration` currently fail with exit code `1` because no test files are present, causing CI to fail by default.

**Problem / Context**
- `tests/unit`, `tests/integration`, and `tests/e2e` are empty.
- CI runs unit and integration jobs by default.

**Scope**
- Add minimal baseline tests for unit/integration/e2e, **or**
- Temporarily update scripts/workflows so empty suites do not fail CI until tests are added.

**Acceptance Criteria**
- `npm run test:unit` passes.
- `npm run test:integration` passes.
- `npm run test:e2e` is either passing or intentionally gated/documented.
- CI workflow passes on pull requests.

**Verification**
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## Issue 2
**Title:** P1: Align app implementation with repo purpose

**Labels:** `priority:P1`, `frontend`, `product-alignment`

**Summary**
`app/app.vue` still renders `NuxtWelcome`, which does not match the repository’s stated purpose (OpenAI model comparison app).

**Problem / Context**
- Current entry UI is starter template output.
- Product behavior described in docs is not represented in runtime UI.

**Scope**
- Replace starter UI with minimal feature shell:
  - Prompt input
  - Loading/progress state
  - Response area
  - Clear error state
- Keep OpenAI calls on server routes/utilities only.

**Acceptance Criteria**
- Default page no longer uses `NuxtWelcome`.
- User can submit prompt via UI shell.
- Loading and error states are visible and testable.

**Verification**
- Manual smoke test in browser.
- Add/execute unit tests for loading and error states.

---

## Issue 3
**Title:** P1: Complete repository instructions and operational docs

**Labels:** `priority:P1`, `documentation`, `developer-experience`

**Summary**
`.github/copilot-instructions.md` still contains placeholders (`<paths>`, `<command>`, `<rules>`), creating ambiguity for contributors and automation.

**Problem / Context**
- Incomplete guidance can cause inconsistent implementations and onboarding friction.

**Scope**
- Replace all placeholders with concrete project values.
- Ensure README has accurate install/run/test/lint commands.
- Ensure docs reflect current repository state.

**Acceptance Criteria**
- No placeholder tokens remain in `.github/copilot-instructions.md`.
- README commands work as documented.
- New contributor can run setup from docs only.

**Verification**
```bash
grep -nE '<paths>|<command>|<rules>|<model>|<item>' .github/copilot-instructions.md || echo "no placeholders"
```

---

## Issue 4
**Title:** P2: Improve bootstrap script portability and safety controls

**Labels:** `priority:P2`, `tooling`, `scripts`

**Summary**
`scripts/bootstrap-new-repo.sh` depends on fixed paths (`/workspaces`, `SOURCE_REPO=call-openai-api`), reducing portability.

**Problem / Context**
- Script is coupled to one environment layout.
- Reuse in other machines/CI contexts is fragile.

**Scope**
- Parameterize source/destination paths via flags/env vars.
- Keep safe defaults and preflight validation.
- Preserve no-auto-commit behavior.

**Acceptance Criteria**
- Script runs successfully in current devcontainer.
- Script can run with alternate source/destination paths.
- Failure messages are explicit and actionable.

**Verification**
```bash
bash scripts/bootstrap-new-repo.sh
SOURCE_REPO=... REPO_NAME=... WORKSPACES_DIR=... bash scripts/bootstrap-new-repo.sh
```

---

## Issue 5
**Title:** P3: Add formatting guardrails for generated/vendor content

**Labels:** `priority:P3`, `tooling`, `formatting`

**Summary**
Broad Prettier runs are touching generated/vendor files, creating noisy diffs and unnecessary risk.

**Problem / Context**
- Generated directories (e.g. `.nuxt`) and vendor content should generally be excluded from formatting.

**Scope**
- Add `.prettierignore` entries (e.g. `.nuxt/`, `node_modules/`, build artifacts).
- Optionally tighten formatter scripts to project source paths.

**Acceptance Criteria**
- Prettier does not write generated/vendor files.
- Formatting commands produce minimal, source-focused diffs.

**Verification**
```bash
npx prettier --check .
```

---

## Issue 6
**Title:** P3: Confirm and document CI Node runtime strategy

**Labels:** `priority:P3`, `ci`, `build`

**Summary**
CI currently pins Node `24`; this should be explicitly confirmed against team/runtime support policy.

**Problem / Context**
- Unclear runtime policy can cause drift between local dev, CI, and deploy environments.

**Scope**
- Confirm intended Node version policy.
- Either keep Node 24 intentionally (with docs) or align CI to approved LTS.
- Update docs to match CI/runtime decision.

**Acceptance Criteria**
- CI Node version policy is explicit and documented.
- Local setup docs match CI runtime.
- CI remains green with selected version.

**Verification**
- Validate workflow runs on the selected version.
- Verify docs mention the same version.
