---
description: Run the new-API pipeline for one endpoint, contract test first
argument-hint: METHOD /path [story-ID]
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Activate the Dev Lead agent and run the new API pipeline (SKILL OA6).

API to build: $ARGUMENTS
(Expected format: METHOD /path/to/endpoint [story-ID] — e.g. "POST /api/v1/loans/apply BE-012")

Steps to follow:
1. Confirm Gate 5 is approved before doing anything else.
   Run: `grep -hE "^Gate 5:" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -5`
   The **last** matching row wins. Format contract:
   `ssdlc/GATE-FORMAT.md` (Gate 5 = dev standards sign-off).
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
2. Parse the arguments: HTTP method, path, and story ID if provided.
3. Check that an OpenAPI spec file exists in docs/backend/design/. If missing, stop: "Add the OpenAPI spec to docs/backend/design/ before implementing. The spec is the contract."
4. Execute SKILL OA6 — new API pipeline: QA Engineer first (unit tests + consumer contract test), then infrastructure check, then Code Reviewer, then Security Auditor (always required for new endpoints), then the PR hand-off.

Every new endpoint must have: auth annotation, input validation, audit log on state changes.
Do not skip the Security Auditor — every new endpoint is a new attack surface.
