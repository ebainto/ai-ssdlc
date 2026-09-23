---
description: Run the new-API pipeline for one endpoint, contract test first
argument-hint: METHOD /path [story-ID]
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Run the new-API pipeline (SKILL OA6) in this session, as the Dev Lead
coordinator. See `/dev-lead` for the full coordinator role and gate
pre-conditions.

API to build: $ARGUMENTS
(Expected format: METHOD /path/to/endpoint [story-ID] — e.g. "POST /api/v1/loans/apply BE-012")

Steps to follow:
1. Confirm Gate 2, Gate 3 and Gate 5 are approved before doing anything else.
   For each gate, find the chronologically-latest row (not position-latest):
   
   **Gate 2:** `grep -E "^Gate 2:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   **Gate 3:** `grep -E "^Gate 3:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   **Gate 5:** `grep -E "^Gate 5:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   For each row, check the decision field (2nd field after `|`):
   - `approved` → proceed
   - `approved-with-conditions` → proceed, echo conditions first
   - `rejected` or no row → stop
   
   Reference: `ssdlc/GATE-FORMAT.md` (Gate 2 = threat model sign-off; Gate 3 = requirements sign-off; Gate 5 = dev standards sign-off).
   - This pipeline always spawns QA Engineer (Gate 3), Security Auditor (Gate 2)
     and Code Reviewer (Gate 5), so all three are required up front. The
     Infrastructure Agent is conditional and is checked against Gate 1 only if
     it is actually spawned.
   - No trail file, or no row for a required gate → stop and name which gates are
     missing: "Run `/gate status` to see current gate state, then `/gate <N>
     approve` for each once the human has signed off."
   - Any required row says `rejected` → stop, and quote that row's reason.
   - `approved-with-conditions` → proceed, but echo the conditions first.
   Conditionally-spawned specialists are gate-checked again at spawn time — see
   the Gate pre-conditions table in `/dev-lead`. Never infer one gate's approval
   from another, and never approve a gate yourself; `/gate` is the only writer.
2. Parse the arguments: HTTP method, path, and story ID if provided.
3. Check that an OpenAPI spec file exists in docs/backend/design/. If missing, stop: "Add the OpenAPI spec to docs/backend/design/ before implementing. The spec is the contract."
4. Execute SKILL OA6 — new API pipeline: QA Engineer first (unit tests + consumer contract test), then infrastructure check, then Code Reviewer, then Security Auditor (always required for new endpoints), then the PR hand-off.

Every new endpoint must have: auth annotation, input validation, audit log on state changes.
Do not skip the Security Auditor — every new endpoint is a new attack surface.
