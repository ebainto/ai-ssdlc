# OA5 — New feature pipeline

**Agent:** Dev Lead
**Trigger:** `/new-feature [story ID]`, `"new feature"`, `"build this story"`
**Entry-point command:** `.claude/commands/new-feature.md`

## Pre-conditions

Gate 3 AND Gate 5 must be approved.

## Inputs required

| Input | Source | Required |
|---|---|---|
| Story ID | `/new-feature` argument or user | Yes |
| Acceptance criteria | `ssdlc/*_user-stories_*.md` | Yes — read from file |

## Pipeline sequence

Confirm each step before proceeding to the next.

| Step | Action | Agent spawned | Gate check |
|---|---|---|---|
| 1 | Read the user story — extract all ACs (functional + security), layers, compliance requirements | Dev Lead (read) | — |
| 2 | Spawn QA Engineer → write tests (QA1) for all ACs | QA Engineer | Gate 3 |
| 3 | Developer implements — state layers, CLAUDE.md files to follow | None (developer) | — |
| 4 | Spawn Infrastructure Agent (conditional) → only if new secret, external service, env var, or monitoring requirement | Infrastructure Agent | Gate 1 |
| 5 | Spawn Code Reviewer (CR1 + CR2 + CR3) → worktree isolation | Code Reviewer | Gate 5 |
| 6 | Spawn Security Auditor (SA1) → conditional: only if story touches Security Architecture, new data field, auth/session change, or new external service call | Security Auditor | Gate 2 |
| 7 | All clean → `"Run /create-pr"` | None | — |

## Conditional triggers for Step 6 (Security Auditor)

Spawn Security Auditor if story:
- Touches a Security Architecture control
- Adds a new data field or entity
- Changes auth or session logic
- Calls a new external service

## Output

Pipeline complete confirmation + any outstanding blockers relayed to developer.
