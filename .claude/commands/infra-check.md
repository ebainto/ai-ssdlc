---
description: Plan or review infrastructure changes for a feature or API
argument-hint: plan <story-ID> | review <paths>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Activate the Infrastructure Agent and plan or review infrastructure changes.

Scope: $ARGUMENTS
(Expected formats:
  "plan [story-ID or feature description]"  — run IA1: plan infra requirements for a feature
  "review [layer or file]"                  — run IA2: review infra-as-code changes
  "monitoring"                              — run IA3: validate monitoring coverage across all services)

Steps to follow:
1. Confirm Gate 1 is approved before doing anything else.
   Run: `grep -hE "^Gate 1:" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -5`
   The **last** matching row wins. Format contract:
   `ssdlc/GATE-FORMAT.md` (Gate 1 = architecture sign-off).
   - No trail file, or no row for this gate → stop:
     "Gate 1 is not approved. No HITL audit trail entry exists. Run `/gate status`
     to see current gate state, then `/gate 1 approve` once the human has
     signed off."
   - Row says `rejected` → stop, and quote the reason from the row.
   - Row says `approved-with-conditions` → proceed, but echo the conditions to
     the developer first.
   - Row says `approved` → proceed.
   Never infer approval from any other gate, and never approve a gate yourself —
   `/gate` is the only command that writes decisions.
2. Read infrastructure/CLAUDE.md — confirm standards are populated. If unpopulated, stop: "infrastructure/CLAUDE.md is not populated. Populate it before planning or reviewing infra changes."
3. Parse the argument to determine which skill to run:
   - "plan ..." → SKILL IA1 (infrastructure planning) → fires IA4 automatically
   - "review ..." → SKILL IA2 (infrastructure review)
   - "monitoring" → SKILL IA3 (monitoring coverage check)
4. Execute the identified skill.
5. After IA1 + IA4: "Infrastructure change request saved. Run /infra-check review after implementing the changes to verify the config files."

Key rules:
- Never approve secrets in environment variables — all secrets via Vault only.
- Never approve TLS below 1.2 in Nginx config.
- Never approve Docker containers running as root.
- Never approve Docker images tagged "latest".
- Flag any new trust boundary for a threat-model update request to the SSDLC owner.
- A new service with no monitoring is always a deployment blocker.
