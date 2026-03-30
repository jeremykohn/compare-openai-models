# Implementation Plan: Allow `bootstrap-new-repo.sh` to use an existing destination folder

## Objective

Modify `call-openai-api/scripts/bootstrap-new-repo.sh` so it can target an already-existing folder (specifically `/workspaces/compare-openai-models`) instead of hard-failing with:

- `❌ Destination already exists: ...`

while preserving safety (no accidental destructive overwrite), reproducibility, and clear operator feedback.

## Current Behavior (Baseline)

The script currently computes:

- `SOURCE=/workspaces/call-openai-api`
- `DEST=/workspaces/compare-openai-models`

and exits early when `DEST` exists:

- `if [[ -e "$DEST" ]]; then ... exit 1`

This assumes a fresh directory is always required.

## Desired Behavior

When `DEST` already exists, the script should proceed in a controlled way by supporting an explicit **existing-folder mode**.

Recommended default behavior:

- If `DEST` does not exist: keep current flow (create/scaffold as today).
- If `DEST` exists and is a directory: allow use **only when explicitly requested** (or via a safe default policy defined below).
- If `DEST` exists and is not a directory (file/symlink to file): fail with a clear error.

## Design Decisions

### 1) Introduce a destination policy flag

Add a variable near the top of the script:

- `DEST_MODE="reuse-empty"`

Supported values:

- `new-only`: current strict behavior (fail if destination exists).
- `reuse-empty`: allow existing destination only if directory is empty.
- `reuse-safe`: allow existing destination if directory is empty **or** a git repo with no local modifications.
- `force-overwrite`: destructive option; only if user opts in explicitly.

For the immediate requirement (`compare-openai-models` already exists), `reuse-empty` or `reuse-safe` should solve the problem safely.

### 2) Add guardrails before any write operations

Before scaffolding/writing files, add checks in this order:

1. Validate `SOURCE` exists (existing logic stays).
2. Evaluate destination path type:
   - exists + not directory => hard fail.
   - does not exist => create as today.
   - exists + directory => apply `DEST_MODE` logic.
3. Ensure script runs with clear messages about selected mode and action.

### 3) Handle existing directory by mode

#### `new-only`

- Keep current error-and-exit behavior.

#### `reuse-empty`

- If directory is empty (`find "$DEST" -mindepth 1 -print -quit` returns nothing), continue.
- If non-empty, fail with guidance to choose `reuse-safe` or `force-overwrite`.

#### `reuse-safe`

- If empty, continue.
- If non-empty:
  - Require `DEST/.git` to exist.
  - Require clean working tree (`git -C "$DEST" status --porcelain` empty).
  - Optional safety: require branch not detached and no in-progress merge/rebase.
  - If checks pass, continue; otherwise fail with actionable message.

#### `force-overwrite`

- Require explicit opt-in variable (e.g., `ALLOW_DESTRUCTIVE=true`).
- Remove generated files/dirs that script owns (preferred) or wipe contents (fallback).
- Never run destructive action without an explicit confirmation variable.

## Flow Changes to Main Script

### A) Replace hard fail block

Replace this block:

```bash
if [[ -e "$DEST" ]]; then
  echo "❌ Destination already exists: $DEST"
  echo "   Remove it first or change REPO_NAME in this script."
  exit 1
fi
```

with a destination resolution function, for example:

- `resolve_destination_state()`
- `assert_reusable_destination()`

that decides whether to:

- scaffold new folder,
- reuse existing folder,
- or stop safely.

### B) Adjust Nuxt scaffold step

Current scaffold step assumes destination does not exist:

- `npx nuxi@latest init "$REPO_NAME" ...`

When reusing existing directory, use one of these approaches:

1. **Preferred:** initialize into destination path directly (if `nuxi` supports path argument safely for existing empty dir).
2. **Fallback (robust):** scaffold into a temporary directory, then sync into `DEST`.

Temporary-directory approach is safer and deterministic:

- `TMP_DIR="$(mktemp -d)"`
- scaffold into `$TMP_DIR/$REPO_NAME`
- `rsync` into `DEST` with explicit include/exclude rules
- remove temp dir on exit via `trap`.

This avoids edge cases where tooling refuses existing paths.

### C) Git initialization behavior

Current logic always runs:

- `git init`
- maybe initial commit

For existing destination:

- If `.git` exists, do **not** re-run `git init`.
- If no `.git`, initialize as before.
- Commit behavior should remain conditional on configured git identity.
- Optional: in reuse mode, use a distinct commit message (e.g., `chore: bootstrap repository contents`).

### D) File-write idempotency

The script writes many files via `cat > file <<EOF`.
In reuse mode, this will overwrite existing tracked files.

Plan for predictable behavior:

- Keep overwrite behavior, but only after passing destination safety checks.
- Print a concise warning list before first overwrite operation.
- Optionally back up overwritten files when `BACKUP_ON_OVERWRITE=true`.

## Safety and UX Enhancements

1. Add startup summary output:
   - destination path
   - selected mode
   - whether destination exists / empty / git-clean
2. Improve failures with remediation:
   - tell user exactly which mode to set.
3. Add `--dry-run` style variable (`DRY_RUN=true`) to print actions without writing.
4. Add `trap` cleanup for temporary resources.

## Concrete Step-by-Step Work Plan

1. **Introduce configuration variables**
   - Add `DEST_MODE` and optional `ALLOW_DESTRUCTIVE`, `DRY_RUN`, `BACKUP_ON_OVERWRITE` defaults near existing constants.

2. **Refactor destination validation**
   - Implement small helper functions:
     - `is_dir_empty(path)`
     - `is_git_clean(path)`
     - `validate_dest_for_mode(path, mode)`

3. **Replace early destination hard-fail**
   - Route to helper validation; print mode-aware messages.

4. **Refactor scaffold stage**
   - Add branching for fresh-vs-existing destination.
   - Prefer temp-dir scaffold + sync for reuse modes.

5. **Refactor git stage**
   - Skip `git init` when repo already exists.
   - Keep commit conditional behavior.

6. **Add logging and dry-run hooks**
   - Add uniform log helpers (`info`, `warn`, `error`) and dry-run wrappers for destructive commands.

7. **Validate with scenario matrix**
   - New destination (non-existent)
   - Existing empty directory
   - Existing non-empty non-git directory
   - Existing git directory clean
   - Existing git directory dirty

8. **Document usage**
   - Update script header comments with examples:
     - `DEST_MODE=reuse-empty bash ...`
     - `DEST_MODE=reuse-safe bash ...`

## Test Plan (Manual)

From `/workspaces`:

1. **Baseline parity**
   - Remove destination folder, run script, confirm behavior unchanged.

2. **Existing empty dir**
   - `mkdir -p /workspaces/compare-openai-models`
   - run with `DEST_MODE=reuse-empty`
   - expect success.

3. **Existing non-empty non-git dir**
   - add dummy file
   - run with `reuse-empty` => fail
   - run with `reuse-safe` => fail with guidance.

4. **Existing clean git repo**
   - `git init`, ensure clean
   - run with `reuse-safe` => success.

5. **Existing dirty git repo**
   - modify/add file
   - run with `reuse-safe` => fail with clean-tree instruction.

6. **Force mode (if implemented)**
   - verify destructive operations only run when `ALLOW_DESTRUCTIVE=true`.

## Acceptance Criteria

- Script no longer unconditionally fails when `/workspaces/compare-openai-models` exists.
- Safe default mode prevents accidental overwrite of non-empty/dirty directories.
- Existing fresh-path flow remains functional.
- User-facing error messages clearly explain next action.
- Script behavior is deterministic across reruns.

## Recommended Minimal First Iteration

If implementing in small increments, deliver this MVP first:

1. Add `DEST_MODE` with `new-only` and `reuse-empty` only.
2. Allow existing destination only when empty.
3. Keep all other behavior unchanged.

Then expand to `reuse-safe` and optional `force-overwrite` in a second pass.
