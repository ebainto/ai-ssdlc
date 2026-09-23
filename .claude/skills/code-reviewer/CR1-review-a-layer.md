# CR1 — Review a layer

**Agent:** Code Reviewer
**Trigger:** `"review layer [name]"`, `"review [layer] changes"`, or spawned by Dev Lead

## Pre-condition

Read `[layer]/CLAUDE.md` — Coding Conventions, Layer Boundaries, Security Architecture, Test approach — before reading any source file.

## Inputs required

| Input | Source | Required |
|---|---|---|
| Layer name(s) | Spawn prompt or user | Yes |
| Changed files | Spawn prompt or `git diff --name-only` | Yes |

## Behaviour

Read each changed file. Check against:

| Check | Standard source | Result |
|---|---|---|
| Coding conventions followed | Layer CLAUDE.md — Conventions | Pass / Fail — [cite rule] |
| Layer boundaries respected | Layer CLAUDE.md — Layer Boundaries | Pass / Fail — [cite rule] |
| Security Architecture controls implemented | Layer CLAUDE.md — Security Architecture | Pass / Fail — [cite control] |
| Input validation at all entry points | Security Architecture | Pass / Fail |
| No hardcoded credentials or secrets | Security Architecture | Pass / Fail |
| No stack trace exposed to caller | Security Architecture | Pass / Fail |
| Security events logged, PII not logged | Security Architecture | Pass / Fail |
| Tests exist for all ACs | Layer CLAUDE.md — Test approach | Pass / Fail — [missing ACs] |
| Definition of Done checklist met | Phase 5 dev standards | Pass / Fail |

## Output

Checklist table per file reviewed. Fires CR4 automatically after completing the checklist.

## Rules

- Every violation cites the specific CLAUDE.md rule — no generic comments
- Do not modify any file — read only
