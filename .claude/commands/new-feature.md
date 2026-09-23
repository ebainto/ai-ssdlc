---
description: Run the full new-feature pipeline: tests first, then implement, review, audit
argument-hint: <story-ID or feature description>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Agent
---

Run the new-feature pipeline (SKILL OA5) in this session, as the Dev Lead
coordinator. See `/dev-lead` for the full coordinator role and gate
pre-conditions. The pipeline runs here, not in a subagent, because it has to
wait on you between steps; the specialists it spawns are subagents.

Story or feature to build: $ARGUMENTS

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
   - No trail file, or no row for either required gate → stop:
     "<name the gates that are missing or rejected> not approved. Run `/gate status`
     to see current gate state, then `/gate 3 approve` and `/gate 5 approve` once
     the human has signed off on each."
   - This pipeline always spawns QA Engineer (Gate 3) and Code Reviewer (Gate 5).
     Security Auditor (Gate 2) and Infrastructure (Gate 1) are conditional and are
     gate-checked at spawn time — see the Gate pre-conditions table in `/dev-lead`.
   - Row says `rejected` → stop, and quote the reason from the row.
   - Row says `approved-with-conditions` → proceed, but echo the conditions to
     the developer first.
   - Row says `approved` → proceed.
   Never infer approval from any other gate, and never approve a gate yourself —
   `/gate` is the only command that writes decisions.
2. Read the user story from ssdlc/*_user-stories_*.md using the story ID or description provided.
3. Execute SKILL OA5 — new feature pipeline in full sequence: QA Engineer first (tests before code), then infrastructure check, then Code Reviewer, then Security Auditor if needed, then instruct developer to run the PR hand-off.

Do not skip any step. Do not proceed past a failed gate check.
