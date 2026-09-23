# QA1 — Write unit tests for a story

**Agent:** QA Engineer
**Trigger:** `"write tests for story [ID]"`, `/run-tests`, or spawned by Dev Lead Agent

## Inputs required

| Input | Source | Required |
|---|---|---|
| Story ID | User or Dev Lead spawn prompt | Yes |
| Acceptance criteria (functional) | `ssdlc/*_user-stories_*.md` or spawn prompt | Yes |
| Acceptance criteria (security) | Same source | Yes — treat as first-class |
| Layer name | Spawn prompt or user | Yes |
| Component name | Spawn prompt or user | Yes |

## Pre-condition

Read `[layer]/CLAUDE.md` before writing any code. Extract:
- Testing framework and version
- Assertion library
- Mock library
- Test file naming convention
- Test folder path

If the layer CLAUDE.md is unpopulated, stop and flag: `[LAYER CLAUDE.md INCOMPLETE]`

## Behaviour

For each **functional AC**:
1. Write a passing case: valid input → expected output or state change
2. Write a failing case: boundary, invalid, or missing input → expected rejection or error

For each **security AC**:
1. Write an explicit security test matching the AC exactly:
   - 403 when role is wrong
   - 401 when token missing or expired
   - PII field absent from response
   - Audit log event emitted
   - Input validation rejects oversized or malformed input

## Output format

Save to: `[layer]/tests/[ComponentName]Test.[ext]`

Start every file with the coverage comment block:
```
// QA Engineer — Coverage map
// Story: [ID] | Layer: [name] | Date: [today]
//
// AC-ID  | Test name                        | Type     | AC covered
// -------|----------------------------------|----------|------------------
```

## Rules

- Mock only at the HTTP client boundary — never the service or repository layer
- Never mock the database — persistence tests belong in QA3
- Every test has at least one meaningful assertion
- Test names follow the layer CLAUDE.md convention

## Return to Dev Lead

After writing: report files written, test count per AC, and any ACs flagged for QA3.
