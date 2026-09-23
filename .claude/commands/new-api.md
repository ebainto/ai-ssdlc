Activate the Dev Lead agent and run the new API pipeline (SKILL OA6).

API to build: $ARGUMENTS
(Expected format: METHOD /path/to/endpoint [story-ID] — e.g. "POST /api/v1/loans/apply BE-012")

Steps to follow:
1. Read the HITL audit trail to confirm Gate 5 is approved. If not, stop.
2. Parse the arguments: HTTP method, path, and story ID if provided.
3. Check that an OpenAPI spec file exists in docs/backend/design/. If missing, stop: "Add the OpenAPI spec to docs/backend/design/ before implementing. The spec is the contract."
4. Execute SKILL OA6 — new API pipeline: QA Engineer first (unit tests + consumer contract test), then infrastructure check, then Code Reviewer, then Security Auditor (always required for new endpoints), then /create-pr.

Every new endpoint must have: auth annotation, input validation, audit log on state changes.
Do not skip the Security Auditor — every new endpoint is a new attack surface.
