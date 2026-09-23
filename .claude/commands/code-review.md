---
description: Review a layer, file set or story against its layer CLAUDE.md standards
argument-hint: layer <name> | files <paths> | story <ID>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Activate the Code Reviewer Agent and review the specified layer or files.

Scope: $ARGUMENTS
(Expected format: "layer [name]" or "files [path1] [path2]" or "story [ID]" — e.g. "layer backend", "story BE-012", "files backend/src/loans/LoanService.java")

Steps to follow:
1. Confirm Gate 5 is approved before doing anything else.
   Find the chronologically-latest row (not position-latest):
   
   `grep -E "^Gate 5:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   Check the decision field (2nd field after `|`):
   - `approved` → proceed
   - `approved-with-conditions` → proceed, echo conditions first
   - `rejected` or no row → stop
   
   Reference: `ssdlc/GATE-FORMAT.md` (Gate 5 = dev standards sign-off).
   - No trail file, or no row for this gate → stop:
     "Gate 5 is not approved. No HITL audit trail entry exists. Run `/gate status`
     to see current gate state, then `/gate 5 approve` once the human has
     signed off."
   - Row says `rejected` → stop, and quote the reason from the row.
   - Row says `approved-with-conditions` → proceed, but echo the conditions to
     the developer first.
   - Row says `approved` → proceed.
   Never infer approval from any other gate, and never approve a gate yourself —
   `/gate` is the only command that writes decisions.
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

Note: The reviewer reads your current working tree, including uncommitted
changes — that is deliberate, since uncommitted work is usually what needs
reviewing. Its independence comes from being a fresh agent with no memory of the
implementation session, not from filesystem isolation. To get the same review as
part of a full pipeline (tests first, then infra, review and audit in sequence),
use `/new-feature`, `/new-api` or `/new-component` instead.
