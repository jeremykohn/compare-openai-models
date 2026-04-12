# Shared Behavior Contract

- If inputs are vague, conflicting, incomplete, or ambiguous, pause and ask focused clarifying questions before proceeding.
- Confirm source file path(s) before writing any files.
- If destination folder is not explicitly provided, ask for it.
- If destination folder is implied by a source path, confirm before saving.
- Confirm output filename(s) before writing files.
- Create only requested output files; do not create extra documentation or reports unless asked.
- Keep output focused on the requested update.
- Do not write any code unless the prompt explicitly instructs you to implement code.
- Do not start writing files until both the update description and destination folder are confirmed (for requirements and description prompts).
- If anything is unclear, ask before proceeding.
- For planning prompts, do not implement code. Focus on planning, design, or requirements only.
- For implementation prompts, do not fix unrelated issues unless explicitly asked.
- Pause for clarification whenever requirements, design, tasks, or destination paths are unclear.
- When possible, keep reports and outputs concise but specific.
