# OA6 — New API pipeline

**Agent:** Dev Lead
**Trigger:** `/new-api [METHOD] [path]`, `"new api"`, `"add endpoint"`
**Entry-point command:** `.claude/commands/new-api.md`

## Pre-conditions

Gate 5 must be approved.
OpenAPI spec must exist in `docs/backend/design/` — if missing, stop.

## Inputs required

| Input | Source | Required |
|---|---|---|
| HTTP method | `/new-api` argument | Yes |
| Path | `/new-api` argument | Yes |
| Story ID | Optional — included in argument if provided | No |
| OpenAPI spec | `docs/backend/design/` | Yes — must exist |

## Pipeline sequence

| Step | Action | Agent spawned |
|---|---|---|
| 1 | Confirm method, path, story ID. Check OpenAPI spec exists. | Dev Lead (read) |
| 2 | Identify affected layers: backend always; database if schema change; frontend if new client call; integration if external service | Dev Lead |
| 3 | Spawn QA Engineer → unit tests + consumer contract test (QA1 + QA2) | QA Engineer |
| 4 | Developer implements. State mandatory requirements: `@PreAuthorize` or equivalent, `@Valid` on input DTO, audit log on state change | None (developer) |
| 5 | Spawn Infrastructure Agent (conditional) → if new Vault secret, Nginx route, or monitoring alert needed | Infrastructure Agent |
| 6 | Spawn Code Reviewer (CR1 + CR2) → additional checks: auth annotation, input validation, error response, contract test matches spec | Code Reviewer |
| 7 | Spawn Security Auditor (SA1) → **always for new endpoints** — every new endpoint is a new attack surface | Security Auditor |
| 8 | All clean → `"Run /create-pr"` | None |

## Security Auditor focus for new endpoints

SA1 prompt addition: "Check STRIDE specifically: Spoofing (auth present?), Tampering (input validation?), Information Disclosure (response filtered?), Elevation (RBAC correct?)."

## Output

Pipeline complete confirmation + any outstanding blockers.
