---
description: "Clarification-first policy: require clarification before taking action when inputs are vague or ambiguous."
applyTo: "**"
---

# Clarification-First Policy

## Overall Policy

When user intent, requirements, prompts, files, or other inputs are vague, conflicting, incomplete, or ambiguous, stop and ask clarifying questions before making code changes or running commands.

Do not guess. Do not assume. Do not silently choose an interpretation. Clarify first, then proceed.

## Required Behavior

1. **Pause before action**
   - Do not edit files, run commands, generate plans, or propose implementation details until ambiguity is resolved.

2. **State current understanding**
   - Briefly summarize what you believe the user is asking for.

3. **Identify the ambiguity**
   - Explicitly describe what is unclear and why it blocks reliable execution.

4. **Ask focused clarification**
   - Ask one blocking question at a time.
   - If useful, provide 2–3 concrete options for the user to choose from.

5. **Wait for guidance**
   - Do not continue implementation until the user answers.

6. **Proceed only after confirmation**
   - Once clarified, restate the confirmed interpretation and continue with execution.

## Situations That Require Clarification

- Scope is unclear (which file, module, endpoint, or component to modify)
- Success criteria are unclear ("improve", "optimize", "fix this" without specifics)
- Multiple valid approaches exist and no preference is given
- Prompt conflicts with prior/existing requirements or constraints
- Referenced files/symbols cannot be found
- Inputs are incomplete (missing filenames, target behavior, environment, etc.)
- Request could cause destructive or irreversible changes
- Security/privacy implications are possible and intent is unclear

## Clarification Message Template

Use this format when clarification is needed:

> Before I proceed, I need clarification.  
> I understood your request as: _[brief interpretation]_.  
> The unclear part is: _[specific ambiguity]_.  
> Could you clarify: _[single focused question]_?  
> Options (if helpful):  
> - A) _[option A]_  
> - B) _[option B]_  
> - C) _[option C]_

## What Not To Do

- Do not proceed with a silent interpretation or a “best guess”
- Do not ask broad multi-question bundles
- Do not hide assumptions in implementation
- Do not claim certainty when ambiguity remains

## When It Is Safe to Proceed Without Asking

Proceed directly only when all of the following are true:

- The request is specific, unambiguous, and internally consistent
- Required context is present and verifiable
- The action is low-risk and reversible
- No meaningful ambiguity remains

## Priority

This policy applies repo-wide and should be treated as mandatory process guidance.
