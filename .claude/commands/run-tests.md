Activate the QA Engineer Agent and write tests for the specified story or component.

Scope: $ARGUMENTS
(Expected format: "story [ID]" or "component [Name] [layer]" — e.g. "story BE-012" or "component LoanService backend")

Steps to follow:
1. Read the HITL audit trail to confirm Gate 3 is approved. If not, stop: "Gate 3 (requirements) must be approved before tests can be written. Acceptance criteria must exist."
2. Parse the scope: story ID or component + layer.
3. If a story ID is provided: read the story from ssdlc/*_user-stories_*.md and extract all acceptance criteria (functional and security).
4. Read [layer]/CLAUDE.md to identify the testing framework, naming convention, and test folder.
5. Execute SKILL QA1 — write unit tests for every functional and security AC.
6. If the story touches an API endpoint: also execute SKILL QA2 — consumer contract test.
7. If the story touches persistence: also flag for SKILL QA3 — note: "Integration tests required for [component] — run after test database is confirmed configured."
8. After writing all test files: run SKILL QA4 — coverage gap analysis to confirm all ACs are covered.

Key rules:
- Tests are written BEFORE the developer implements. If implementation already exists, flag this: "TDD sequence violated — implementation exists before tests."
- Never mock the database in integration tests.
- Mock only at the HTTP client boundary in unit tests.
- Every test file must include the QA Engineer coverage comment block.

Note: This command invokes the QA Engineer directly. In the full pipeline, the Dev Lead spawns the QA Engineer automatically as the first step of /new-feature, /new-api, or /new-component.
