---
description: Audit a layer or story against the STRIDE threat model (findings stay confidential)
argument-hint: layer <name> | story <ID> | pr <branch>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Activate the Security Auditor Agent and run a security audit on the specified layer or story.

Scope: $ARGUMENTS
(Expected format: "layer [name]" or "story [ID]" or "pr [branch-or-pr-title]" — e.g. "layer backend", "story BE-012")

Steps to follow:
1. Confirm Gate 2 is approved before doing anything else.
   Run: `grep -hE "^Gate 2:" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -5`
   The **last** matching row wins. Format contract:
   `ssdlc/GATE-FORMAT.md` (Gate 2 = threat model sign-off).
   - No trail file, or no row for this gate → stop:
     "Gate 2 is not approved. No HITL audit trail entry exists. Run `/gate status`
     to see current gate state, then `/gate 2 approve` once the human has
     signed off."
   - Row says `rejected` → stop, and quote the reason from the row.
   - Row says `approved-with-conditions` → proceed, but echo the conditions to
     the developer first.
   - Row says `approved` → proceed.
   Never infer approval from any other gate, and never approve a gate yourself —
   `/gate` is the only command that writes decisions.
2. Read security/threat-model/stride-model.md — if missing, stop with the same message.
3. Parse the scope: identify the layer(s) and changed files to audit.
4. Execute SKILL SA1 — audit against threat model (verify all Mitigated threat controls are present in the diff).
5. Execute SKILL SA2 — audit SAST suppressions (if any suppression annotations exist in the diff).
6. Execute SKILL SA3 — check pen test findings (cross-reference open findings against the diff).
7. All findings are written to security/pen-test/internal-findings-register.md only.

Conversation output rules:
- NEVER output finding details, vulnerability descriptions, or code evidence in the conversation.
- Report only: "N finding(s) recorded — see security/pen-test/internal-findings-register.md (confidential)."

Key rules:
- Read the threat model before reading any source file.
- All Write access is for the findings register only — never modify production code.
- Unmodelled code paths: raise a threat-model update request with the SSDLC owner, do not update the threat model.

Note: The auditor reads your current working tree, including uncommitted
changes. Its independence comes from being a fresh agent with no prior
implementation context. To run the audit as part of a full pipeline, use
`/new-feature`, `/new-api` or `/new-component`.
