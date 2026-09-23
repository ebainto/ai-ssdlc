---
description: Run the full new-feature pipeline: tests first, then implement, review, audit
argument-hint: <story-ID or feature description>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Activate the Dev Lead agent and run the new feature pipeline (SKILL OA5).

Story or feature to build: $ARGUMENTS

Steps to follow:
1. Confirm Gate 3 and Gate 5 are approved before doing anything else.
   Run: `grep -hE "^Gate (3|5):" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -5`
   For each required gate the **last** matching row wins. Format contract:
   `ssdlc/GATE-FORMAT.md` (Gate 3 = requirements sign-off; Gate 5 = dev standards sign-off).
   - No trail file, or no row for either required gate → stop:
     "<name the gates that are missing or rejected> not approved. Run `/gate status`
     to see current gate state, then `/gate 3 approve` and `/gate 5 approve` once
     the human has signed off on each."
   - Row says `rejected` → stop, and quote the reason from the row.
   - Row says `approved-with-conditions` → proceed, but echo the conditions to
     the developer first.
   - Row says `approved` → proceed.
   Never infer approval from any other gate, and never approve a gate yourself —
   `/gate` is the only command that writes decisions.
2. Read the user story from ssdlc/*_user-stories_*.md using the story ID or description provided.
3. Execute SKILL OA5 — new feature pipeline in full sequence: QA Engineer first (tests before code), then infrastructure check, then Code Reviewer, then Security Auditor if needed, then instruct developer to run the PR hand-off.

Do not skip any step. Do not proceed past a failed gate check.
