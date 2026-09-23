---
description: Run the new-component pipeline for one component, tests first
argument-hint: ComponentName layer [story-ID]
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Run the new-component pipeline (SKILL OA7) in this session, as the Dev Lead
coordinator. See `/dev-lead` for the full coordinator role and gate
pre-conditions.

Component to build: $ARGUMENTS
(Expected format: ComponentName layer [story-ID] — e.g. "LoanStatusCard frontend FE-008" or "LoanApplicationService backend BE-012")

Steps to follow:
1. Confirm Gate 3 and Gate 5 are approved before doing anything else.
   For each gate, find the chronologically-latest row (not position-latest):
   
   **Gate 3:** `grep -E "^Gate 3:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   **Gate 5:** `grep -E "^Gate 5:" ssdlc/*_hitl-audit-trail_v*(N) 2>/dev/null | sort -t'|' -k2 -r | head -1`
   
   For each row, check the decision field (2nd field after `|`):
   - `approved` → proceed
   - `approved-with-conditions` → proceed, echo conditions first
   - `rejected` or no row → stop
   
   Reference: `ssdlc/GATE-FORMAT.md` (Gate 3 = requirements sign-off; Gate 5 = dev standards sign-off).
   - This pipeline always spawns QA Engineer (Gate 3) and Code Reviewer (Gate 5).
     Security Auditor and Infrastructure are conditional and are gate-checked at
     spawn time if used.
   - No trail file, or no row for a required gate → stop and name which gates are
     missing: "Run `/gate status` to see current gate state, then `/gate <N>
     approve` for each once the human has signed off."
   - Any required row says `rejected` → stop, and quote that row's reason.
   - `approved-with-conditions` → proceed, but echo the conditions first.
   Conditionally-spawned specialists are gate-checked again at spawn time — see
   the Gate pre-conditions table in `/dev-lead`. Never infer one gate's approval
   from another, and never approve a gate yourself; `/gate` is the only writer.
2. Parse: component name, layer (frontend or backend), story ID if provided.
3. Determine pipeline variant:
   - Frontend: first check if the component calls a backend API that does not exist yet. If yes, stop and instruct: "Run /new-api for [method] [path] first. Return here after that PR is merged."
   - Backend: proceed directly to the backend service pipeline.
4. Execute SKILL OA7 — new component pipeline for the identified layer type.

Key rules:
- Frontend: QA Engineer writes Angular component spec (unit tests) before implementation. Mock only at the HttpClient boundary.
- Backend: QA Engineer writes unit tests + integration test before implementation. No database mocks in integration tests.
- QA Engineer is always first — tests drive the implementation.
