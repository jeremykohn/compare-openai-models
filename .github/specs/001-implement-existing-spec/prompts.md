---
name: 001-implement-existing-spec
---

## Create implementation plan with tasks based on existing spec

Based on a technical design, create a concrete implementation plan with tasks to implement the design, and save the plan to a new file.

Technical design: 
- .github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md

Implementation plan with tasks:
- .github/specs/001-implement-existing-spec/implementation-plan-tasks-2.md

If anything is vague, unclear, or ambiguous, pause and ask me for guidance before you continue.

The implementation plan should use Test-Driven Development (TDD) including unit tests, integration tests, and end-to-end tests, with a red-green-refactor loop for writing tests and testing code.

In each phase of the implementation plan, describe the approach you will take in detail, and include a list of tasks to implement that phase of the plan. Make sure the tasks are small, specific, independently testable, and ordered by dependency.

Don't write any code yet.

After all this is done, check for inconsistencies or other discrepancies between the implementation plan with tasks and the technical design. Report your findings as a clear, detailed list of discrepancies and save the report to:
- .github/specs/001-implement-existing-spec/discrepancy-reports/implementation-plan-tasks-vs-design-2.md

---

## Revise implementation plan

Revise the implementation plan in order to resolve the discrepancies that were found.

If there are gaps or if anything is vague, unclear, or ambiguous, pause and ask me for guidance before you continue.

For each discrepancy that was resolved, update the discrepancy report to mark that discrepancy as resolved.

---

## Implement technical design by following plan and tasks

Implement a technical design by following an implementation plan with tasks.

Technical design: 
- .github/specs/001-implement-existing-spec/spec-2-for-call-openai-api-repo.md

Implementation plan with tasks:
- .github/specs/001-implement-existing-spec/implementation-plan-tasks-2.md

If anything is vague, unclear, or ambiguous, pause and ask me for guidance before you continue.

After each phase is complete, check the newly modified files for problems, propose how to fix the problems, and implement the proposed fixes.

And, after all phases are complete, check all modified files for problems, propose how to fix the problems, and implement the proposed fixes.

Then run prettier to format all code files that were modified.

After all this is done, check for inconsistencies or other discrepancies between the modifications made and the implementation plan with tasks. Report your findings as a clear, detailed list of discrepancies and save the report to:
- .github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-implementation-plan-tasks-2.md

Also, check for inconsistencies or other discrepancies between the modifications made and the technical design. Report your findings as a clear, detailed list of discrepancies and save the report to:
- .github/specs/001-implement-existing-spec/discrepancy-reports/modifications-vs-design-2.md

---

## Manual Steps

- **Incremental commits:** After each phase (or even after each task), make a commit so progress is trackable and rollback is possible if needed.
- **CI/CD integration:** Run the full test suite on each commit to catch issues early.
- **Code review:** Each phase should be reviewable as a cohesive set of changes before moving to the next phase.
- **Monitoring:** After deployment, monitor for any unexpected behavior or errors in production (e.g., models that fail at response time due to upstream constraints).
