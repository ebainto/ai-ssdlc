Activate the Security Auditor Agent and run a security audit on the specified layer or story.

Scope: $ARGUMENTS
(Expected format: "layer [name]" or "story [ID]" or "pr [branch-or-pr-title]" — e.g. "layer backend", "story BE-012")

Steps to follow:
1. Read the HITL audit trail to confirm Gate 2 is approved. If not, stop: "Gate 2 (threat model sign-off) must be approved before security audit. No threat model exists to audit against."
2. Read security/threat-model/stride-model.md — if missing, stop with the same message.
3. Parse the scope: identify the layer(s) and changed files to audit.
4. Execute SKILL SA1 — audit against threat model (verify all Mitigated threat controls are present in the diff).
5. Execute SKILL SA2 — audit SAST suppressions (if any suppression annotations exist in the diff).
6. Execute SKILL SA3 — check pen test findings (cross-reference open findings against the diff).
7. All findings are written to security/pen-test/findings-register.md only.

Conversation output rules:
- NEVER output finding details, vulnerability descriptions, or code evidence in the conversation.
- Report only: "N finding(s) recorded — see security/pen-test/findings-register.md (confidential)."

Key rules:
- Read the threat model before reading any source file.
- All Write access is for the findings register only — never modify production code.
- Unmodelled code paths: flag for /threat-model-trigger-check, do not update the threat model.

Note: This command invokes the Security Auditor directly without worktree isolation. In the full pipeline, the Dev Lead spawns the Security Auditor with worktree isolation via /new-feature, /new-api, or /new-component.
