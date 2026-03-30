# Prompts for modifying bootstrap-new-repo.sh

## Prompt 1

Write a clear, detailed implementation plan to modify the script `call-openai-api/scripts/bootstrap-new-repo.sh` so the script can write to an existing repo folder `compare-openai-models`.

Currently the script errors if the folder exists.

```
❌ Destination already exists: /workspaces/compare-openai-models
   Remove it first or change REPO_NAME in this script.
```

Save the plan to /workspaces/implementation-plan-fix-script-1.md.

---

## Prompt 2

Write a clear, detailed implementation plan to modify the script `/workspaces/call-openai-api/scripts/bootstrap-new-repo.sh` so that it modifies the repo, but does not commit any changes using git.

Save the plan to /workspaces/implementation-plan-fix-script-2.md.

---

## Prompt 3

If anything in the plan /workspaces/implementation-plan-fix-script-2.md is vague, unclear, or ambiguous, ask me for clarifications and modify the plan according to these clarifications.

---

(Last part of response from Prompt 3)

If you want a recommended default, I suggest:

keep git init if missing,
remove git add -A,
require no git commit,
require HEAD unchanged.

---

## Prompt 4

Yes, use those recommended defaults.

---

## Prompt 5

Implement the plan /workspaces/implementation-plan-fix-script-2.md for bootstrap-new-repo.sh.

If anything in the plan is vague, unclear, or ambiguous, pause execution and ask me for clarifications.
