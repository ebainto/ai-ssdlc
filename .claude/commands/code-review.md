Activate the Code Reviewer Agent and review the specified layer or files.

Scope: $ARGUMENTS
(Expected format: "layer [name]" or "files [path1] [path2]" or "story [ID]" — e.g. "layer backend", "story BE-012", "files backend/src/loans/LoanService.java")

Steps to follow:
1. Read the HITL audit trail to confirm Gate 5 is approved. If not, stop: "Gate 5 (dev standards) must be approved before code review. Coding standards and Security Architecture must exist."
2. Parse the scope: identify the layer(s) and files to review.
3. Read the layer CLAUDE.md for each layer in scope before reading any source file.
4. Execute the full review:
   - SKILL CR1 — layer review checklist
   - SKILL CR2 — security control verification (always)
   - SKILL CR3 — test coverage check (if a story ID was provided)
5. Fire SKILL CR4 — produce the structured review report.

Key rules:
- Never modify files. Read only.
- Every violation must cite the specific CLAUDE.md rule.
- RESULT is APPROVED only when Critical and High violation lists are both empty.
- If any finding warrants a Security Auditor entry, flag it in the Security note — do not create the entry yourself.

Note: This command invokes the Code Reviewer directly without worktree isolation. The reviewer reads your current working tree. For automatic isolated review as part of a full pipeline, use /new-feature, /new-api, or /new-component — the Dev Lead spawns the Code Reviewer with worktree isolation.
