# Implementation Plan: Make `bootstrap-new-repo.sh` modify files without creating commits

## Objective

Update `/workspaces/call-openai-api/scripts/bootstrap-new-repo.sh` so it can scaffold and modify the destination repository as it does today, but **never creates a Git commit**.

## Current Behavior (Baseline)

The script currently does these Git operations after scaffolding:

1. `git init` (only if `.git` does not exist)
2. `git add -A`
3. Conditional commit:
   - checks `git config user.name` and `git config user.email`
   - runs `git commit -m "chore: scaffold Nuxt 4 app"` when staged changes exist

This violates the new requirement because it can create commit(s).

## Desired Behavior

- Script still performs all filesystem/package/tooling modifications.
- Script initializes Git metadata only when `.git` is missing (`git init` stays).
- Script must **not call `git commit` anywhere**.
- Script should finish successfully regardless of Git identity config.
- Users should end with uncommitted file changes in the working tree that they can review and commit manually.
- Script should avoid modifying Git index/state (e.g., no automatic staging via `git add -A`).
- `HEAD` must remain unchanged before vs. after script execution.

## Design Decisions

### 1) Remove all automatic commit logic

Refactor the scaffold Git block to remove:

- Git identity checks (`git config user.name`, `git config user.email`)
- Staging checks used only for commit gating (`git diff --cached --quiet` for commit decision)
- `git commit ...`

### 2) Keep repository initialization behavior explicit

Use a fixed policy:

- Keep `git init` only when `.git` is missing (current behavior).
- Do not add a toggle in this iteration.

### 3) Decide whether to keep `git add -A`

Use a fixed policy:

- Remove `git add -A`.
- Leave all file modifications unstaged.
- Do not modify Git index/state files as part of the bootstrap workflow.

### 4) Add clear operator messaging

Replace commit-related output with explicit no-commit messaging, e.g.:

- `==> Git commit step skipped by design (manual commit required).`
- `==> Leaving changes unstaged by design (manual review/commit required).`

## Concrete Code-Change Plan

1. **Locate and refactor the Git block** (right after scaffold step):
   - Keep `cd "$DEST"`
   - Keep/parameterize `git init` behavior
   - Remove identity check block
   - Remove `git commit` call

2. **Adjust staging behavior**
   - Delete `git add -A`.
   - Add log line indicating changes are intentionally left unstaged.

3. **Ensure no hidden commit paths remain**
   - Search entire script for `git commit` and any wrapper invoking commit.
   - Confirm zero commit commands remain.

4. **Preserve non-Git script flow**
   - Keep npm install, playwright install/fallback, config-file writes, copies, test scaffolding, and `nuxi prepare` logic unchanged.

5. **Update header comments**
   - Add short note near the top: script never auto-commits; user commits manually.

## Validation Plan

### Static checks

1. Run bash syntax validation:
   - `bash -n /workspaces/call-openai-api/scripts/bootstrap-new-repo.sh`
2. Verify no commit command remains:
   - `grep -n "git commit" /workspaces/call-openai-api/scripts/bootstrap-new-repo.sh`
   - Expect no matches.

### Runtime checks

1. Prepare reusable destination (`.git`-only or empty) and run:
   - `DEST_MODE=reuse-empty bash /workspaces/call-openai-api/scripts/bootstrap-new-repo.sh`
2. Confirm script exits successfully.
3. Capture `HEAD` before and after run:
   - `before_head="$(git -C /workspaces/compare-openai-models rev-parse HEAD 2>/dev/null || echo NO_HEAD)"`
   - `after_head="$(git -C /workspaces/compare-openai-models rev-parse HEAD 2>/dev/null || echo NO_HEAD)"`
   - Verify `before_head == after_head`.
4. In destination repo, verify:
   - no new commit created by script
   - working tree has modified/untracked files (`git status` shows changes)
   - no staged changes introduced by the script (`git diff --cached --quiet` returns success unless user staged manually).

## Acceptance Criteria

- Script modifies repository files as before.
- Script does not execute `git commit` under any path.
- Script completion is independent of git `user.name`/`user.email` configuration.
- Post-run repository contains uncommitted, unstaged changes for manual review/commit.
- `HEAD` is unchanged before and after script run.

## Recommended Minimal First Iteration

Implement the smallest safe delta first:

1. Remove `git commit` logic entirely.
2. Remove git identity checks.
3. Keep `git init` (if missing).
4. Remove `git add -A` so script never stages changes automatically.

No toggle is needed in this iteration.
