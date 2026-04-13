# Shared Behavior Contract

- If anything in any prompts, requirements, design, tasks, or other input is unclear, vague, conflicting, incomplete, or ambiguous, pause and ask focused clarifying questions before proceeding.
- Confirm source file path(s) before writing any files.
- If destination folder is not explicitly provided, ask for it.
- If destination folder is implied by a source path, confirm before saving.
- Confirm output filename(s) before writing files.
- Do not overwrite any files. If a file already exists and the instructions seem to require overwriting the file, pause and ask what to do.
- Create only requested output files; do not create extra documentation or reports unless asked.
- Keep output focused on the requested update.
- Do not write any code unless the prompt explicitly instructs you to implement code.
- Do not start writing files until both the update description and destination folder are confirmed (for requirements and description prompts).
- For planning prompts, do not implement code. Focus on planning, design, or requirements only.
- For implementation prompts, do not fix unrelated issues unless explicitly asked.
- When possible, keep reports and outputs concise but specific.
