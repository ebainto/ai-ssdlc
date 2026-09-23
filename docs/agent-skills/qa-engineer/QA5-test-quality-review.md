# QA5 — Test quality review

**Agent:** QA Engineer
**Trigger:** `"test quality review"`, `"review these tests"`, `"are these tests good"`

## Inputs required

| Input | Source | Required |
|---|---|---|
| Test file path(s) | User or spawn prompt | Yes |
| Layer | Inferred from file path or provided | Yes |

## Behaviour

Read each test file. Check against:

| Check | Standard | Pass / Fail |
|---|---|---|
| Coverage comment block present and complete | QA Engineer standard | |
| Every test has at least one specific assertion (not `assert true` / `assert not null`) | QA Engineer guardrail | |
| No database mocked in integration tests | QA Engineer guardrail | |
| Security ACs have explicit security tests (403, 401, PII check, audit log) | QA Engineer guardrail | |
| Test names follow layer CLAUDE.md convention | Layer CLAUDE.md | |
| Both passing AND failing cases exist for each AC | QA Engineer guardrail | |
| Tests are independent — no shared mutable state between tests | Testing standard | |
| Mocking only at the correct boundary (HTTP level for unit, real DB for integration) | QA Engineer guardrail | |

## Output format

Per-file quality report:
```
Test Quality Report
===================
File: [path]
Layer: [name]
Tests found: [N]

Findings:
  Critical (DoD violation): [list]
  High (must fix): [list]
  Comments: [list]

Result: PASS / FAIL
```

## Rules

- Every Fail is a Definition of Done violation — flag clearly
- Do not rewrite tests — report findings only; the QA Engineer (or developer) fixes
- If coverage comment block is missing, that alone is a Fail

## Return to Dev Lead

Quality report per file + total Fail count.
