# CR4 — Produce review report

**Agent:** Code Reviewer
**Trigger:** Fires automatically at the end of CR1, CR2, or CR3. Also: `"produce review report"`, `"summarise the review"`

## Behaviour

Consolidate all findings from this review session into one structured report.

## Output format

```
Code Review Report
==================
PR / Story:      [ID — or "direct review" if no ID]
Layer(s):        [list]
Files reviewed:  [count]
Reviewer:        Code Reviewer Agent (fresh — no prior development context)
Date:            [today]

RESULT: APPROVED / CHANGES REQUIRED / REJECTED

Critical violations — block merge:
  1. [File:line] [violation] — violates [CLAUDE.md section and rule]
  (None)

High violations — must fix before merge:
  1. [File:line] [violation] — violates [CLAUDE.md section and rule]
  (None)

Comments — non-blocking:
  1. [comment]
  (None)

Test coverage:
  [x] All functional ACs covered
  [x] All security ACs covered
  [ ] [AC ID] — not covered — add test for: [description]

Definition of Done:
  [x] Code reviewed
  [x / ] All ACs tested
  [ ] SAST passing — verify before merge
  [ ] Dependency scan passing — verify before merge

Security note:
  Flag for Security Auditor: [brief description — no exploitable detail]
  — OR —
  No Security Auditor escalation required.

Summary:
  [2–3 sentences: overall quality, most important finding, confidence.]
```

## Result definitions

- `APPROVED` — zero Critical, zero High. Developer may proceed to the PR: commit on a branch, push, then `gh pr create`.
- `CHANGES REQUIRED` — one or more Critical or High. Developer fixes and requests re-review via Dev Lead.
- `REJECTED` — fundamental design or boundary violation requiring rework. Dev Lead re-assesses scope.

## Rules

- Never modify files — produce the report only
- Security note must always be present — either a flag or explicit "none"
- RESULT is APPROVED only when both Critical and High lists are empty
