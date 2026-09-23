# CR2 — Review security controls

**Agent:** Code Reviewer
**Trigger:** `"review security controls"`, `"check security in this PR"`, or added to CR1 when story touches auth/data/integration

## Pre-condition

Read the Security Architecture section of each affected layer's CLAUDE.md.

## Behaviour

For every security control defined in Security Architecture:
1. Is the control implemented in the diff?
2. Is it implemented correctly (right pattern, right placement)?
3. Is there any code path that bypasses the control?

## Output format

| Control | Defined in | Present in diff | Correctly implemented | Bypass path found | Verdict |
|---|---|---|---|---|---|
| [control name] | [layer/CLAUDE.md] | Yes / No | Yes / No / Partial | None / [path] | Pass / Critical Fail / High Fail |

- Missing or bypassed control = **Critical** — blocks merge
- Partially implemented control = **High** — must fix before merge

Fires CR4 with control verification table included.

## Rules

- Every finding cites the specific control from Security Architecture
- Do not flag personal preference — only documented controls
- Do not create a security finding entry — flag for Security Auditor in the CR4 Security note
