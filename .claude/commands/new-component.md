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
2. Parse: component name, layer (frontend or backend), story ID if provided.
3. Determine pipeline variant:
   - Frontend: first check if the component calls a backend API that does not exist yet. If yes, stop and instruct: "Run /new-api for [method] [path] first. Return here after that PR is merged."
   - Backend: proceed directly to the backend service pipeline.
4. Execute SKILL OA7 — new component pipeline for the identified layer type.

Key rules:
- Frontend: QA Engineer writes Angular component spec (unit tests) before implementation. Mock only at the HttpClient boundary.
- Backend: QA Engineer writes unit tests + integration test before implementation. No database mocks in integration tests.
- QA Engineer is always first — tests drive the implementation.
