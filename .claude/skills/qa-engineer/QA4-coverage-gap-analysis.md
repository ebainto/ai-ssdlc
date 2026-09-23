# QA4 — Coverage gap analysis

**Agent:** QA Engineer
**Trigger:** `"coverage gap analysis"`, `"what's not tested"`, `"check ac coverage"`, or spawned by Dev Lead before code review

## Inputs required

| Input | Source | Required |
|---|---|---|
| Story ID | Spawn prompt or user | Yes |
| Acceptance criteria list | `ssdlc/*_user-stories_*.md` or spawn prompt | Yes |
| Layers in scope | Spawn prompt or user | Yes |

## Behaviour

1. Read the ACs for the story
2. Read all test files for the layers in scope
3. For each AC, determine: does a test exist that covers it?

## Output format

Coverage gap table:

| AC ID | Acceptance criterion | Test file | Test name | Passing case | Failing case | Security AC | Status |
|---|---|---|---|---|---|---|---|
| | | | | Yes / No | Yes / No | Yes / No / N/A | Covered / Gap / Partial |

After the table:
- Count: X covered, Y gaps, Z partial
- For each gap: "Missing: [AC ID] — needs [QA1 unit / QA2 contract / QA3 integration] — [one line describing what the test should assert]"

## Rules

- Every Gap or Partial row is a Definition of Done violation
- Security ACs with a gap are flagged as **Critical DoD violation**
- Do not suggest skipping any AC gap — flag and route to the correct QA skill

## Return to Dev Lead

Coverage gap table + gap count + recommended actions.
