Activate the Dev Lead agent and run the new component pipeline (SKILL OA7).

Component to build: $ARGUMENTS
(Expected format: ComponentName layer [story-ID] — e.g. "LoanStatusCard frontend FE-008" or "LoanApplicationService backend BE-012")

Steps to follow:
1. Read the HITL audit trail to confirm Gate 5 is approved. If not, stop.
2. Parse: component name, layer (frontend or backend), story ID if provided.
3. Determine pipeline variant:
   - Frontend: first check if the component calls a backend API that does not exist yet. If yes, stop and instruct: "Run /new-api for [method] [path] first. Return here after that PR is merged."
   - Backend: proceed directly to the backend service pipeline.
4. Execute SKILL OA7 — new component pipeline for the identified layer type.

Key rules:
- Frontend: QA Engineer writes Angular component spec (unit tests) before implementation. Mock only at the HttpClient boundary.
- Backend: QA Engineer writes unit tests + integration test before implementation. No database mocks in integration tests.
- QA Engineer is always first — tests drive the implementation.
