# OA7 — New component pipeline

**Agent:** Dev Lead
**Trigger:** `/new-component [name] [layer]`, `"new component"`, `"new frontend component"`, `"new backend service"`
**Entry-point command:** `.claude/commands/new-component.md`

## Pre-conditions

Gate 5 must be approved.

## Inputs required

| Input | Source | Required |
|---|---|---|
| Component name | `/new-component` argument | Yes |
| Layer | `/new-component` argument (frontend or backend) | Yes |
| Story ID | Optional | No |

## Pipeline variants

### Frontend component pipeline

Before Step 1: check if the component calls a backend API that does not yet exist.
If not found: "Run `/new-api [method] [path]` first. Return here after the API PR is merged."

| Step | Action | Agent spawned |
|---|---|---|
| 1 | Spawn QA Engineer → Angular component spec (unit tests). Include: render, input binding, output event, HttpClient call (mock at HTTP boundary), security AC tests | QA Engineer |
| 2 | Developer implements. State: "frontend/CLAUDE.md guides template, styles, HttpClient, DomSanitizer, no-localStorage rule." | None |
| 3 | Spawn Code Reviewer (CR1 + CR3) → CR3 focus: every AC covered in spec file | Code Reviewer |
| 4 | Spawn Security Auditor (SA1) → only if component handles PII display or auth state | Security Auditor |
| 5 | All clean → `"hand off for PR: commit on a branch, push, and open the PR with `gh pr create`"` | None |

### Backend service pipeline

| Step | Action | Agent spawned |
|---|---|---|
| 1 | Spawn QA Engineer → unit tests + integration test (QA1 + QA3) | QA Engineer |
| 2 | Developer implements. State: "backend/CLAUDE.md guides Spring Boot patterns, @Transactional, audit logging, Security Architecture controls." | None |
| 3 | Spawn Code Reviewer (CR1 + CR2) | Code Reviewer |
| 4 | Spawn Security Auditor (SA1) → if service handles PII, financial data, or auth decisions | Security Auditor |
| 5 | All clean → `"hand off for PR: commit on a branch, push, and open the PR with `gh pr create`"` | None |

## Output

Pipeline complete confirmation + variant used (frontend / backend) + any outstanding blockers.
