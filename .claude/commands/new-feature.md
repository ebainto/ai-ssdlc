Activate the Dev Lead agent and run the new feature pipeline (SKILL OA5).

Story or feature to build: $ARGUMENTS

Steps to follow:
1. Read the HITL audit trail to confirm Gate 3 and Gate 5 are approved. If not, stop and state what gate is missing.
2. Read the user story from ssdlc/*_user-stories_*.md using the story ID or description provided.
3. Execute SKILL OA5 — new feature pipeline in full sequence: QA Engineer first (tests before code), then infrastructure check, then Code Reviewer, then Security Auditor if needed, then instruct developer to run /create-pr.

Do not skip any step. Do not proceed past a failed gate check.
