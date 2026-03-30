# Code Review Summary — `run-bootstrap-script`

## Scope Reviewed

- Project configuration and scripts: `package.json`, `nuxt.config.ts`, `playwright.config.ts`, `vitest.config.ts`, `vitest.unit.config.ts`
- Application entry: `app/app.vue`
- Automation script: `scripts/bootstrap-new-repo.sh`
- CI/security workflows: `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`
- Project guidance: `.github/copilot-instructions.md`

## High-Level Assessment

Repository scaffolding is mostly in place, but several foundational gaps prevent reliable delivery workflows right now:

1. CI test jobs fail in the current state due to empty suites.
2. App implementation is still starter/template-level (`NuxtWelcome`), not aligned with stated product goal.
3. Project instruction metadata contains unresolved placeholders.
4. Bootstrap automation remains environment-specific and not fully portable.

## Findings (Prioritized)

### 🔴 Critical

- **CI test scripts fail by default**
  - **Evidence**:
    - `npm run test:unit` → `No test files found, exiting with code 1`
    - `npm run test:integration` → `No test files found, exiting with code 1`
    - `tests/unit`, `tests/integration`, and `tests/e2e` are empty.
  - **Impact**:
    - PRs cannot reliably pass CI if these jobs are enforced.
  - **Recommendation**:
    - Add baseline tests immediately or temporarily gate/adjust workflows until tests are added.

### 🟡 Important

- **Product/doc mismatch at app entrypoint**
  - **Evidence**: `app/app.vue` renders `NuxtWelcome`.
  - **Impact**:
    - Repo purpose (OpenAI model comparison app) is not represented in runtime behavior.
  - **Recommendation**:
    - Replace starter UI with minimal feature shell and explicit loading/error states.

- **Instruction file is incomplete**
  - **Evidence**: `.github/copilot-instructions.md` contains placeholders such as `<paths>`, `<command>`, and `<rules>`.
  - **Impact**:
    - Ambiguous conventions and lower-quality automation guidance.
  - **Recommendation**:
    - Fill all placeholders with concrete values and keep updated with repository evolution.

- **Bootstrap script portability risk**
  - **Evidence**: `scripts/bootstrap-new-repo.sh` assumes `/workspaces` and `SOURCE_REPO="call-openai-api"`.
  - **Impact**:
    - Script reliability depends on specific local layout; harder for collaborators/CI reuse.
  - **Recommendation**:
    - Parameterize paths and add robust preflight validation with actionable errors.

### 🟢 Suggestions

- **Formatting scope guardrails**
  - **Observation**: Broad Prettier runs can include generated/vendor artifacts.
  - **Recommendation**:
    - Add `.prettierignore` for `.nuxt/`, `node_modules/`, and other generated folders.

- **Node version policy clarity**
  - **Observation**: CI pins `node-version: 24`.
  - **Recommendation**:
    - Confirm this is intentional and aligned with team/runtime policy; otherwise pin to agreed LTS.

## Positive Notes

- Security workflow baseline exists (`CodeQL`, `npm-audit` workflow present).
- Bootstrap script now explicitly avoids auto-commit behavior.
- TypeScript strict mode and lint/test scripts are present.

## Recommended Next Actions

1. Fix test/CI reliability first.
2. Implement minimal app shell matching product objective.
3. Complete instruction/docs placeholders.
4. Harden bootstrap portability.
5. Add formatter ignore policy and confirm Node strategy.

## Quick Verification Commands

```bash
npm run test:unit
npm run test:integration
npm run lint
```

Use these after each remediation step to keep feedback loops short.
