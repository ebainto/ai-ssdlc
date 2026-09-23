# CR3 — Review test coverage

**Agent:** Code Reviewer
**Trigger:** `"review test coverage"`, `"check tests in this PR"`, or added to CR1 when a story ID is provided

## Inputs required

| Input | Source | Required |
|---|---|---|
| Acceptance criteria list | Spawn prompt or story from `ssdlc/*_user-stories_*.md` | Yes |
| Test files to check | Inferred from changed layers | Yes |

## Behaviour

1. Read the acceptance criteria for the story.
2. Read the test files for the layers changed.
3. For each AC, check: does a test cover it?

## Output format

| AC ID | Acceptance criterion | Test file | Test name | Passing case | Failing case | Security AC | Verdict |
|---|---|---|---|---|---|---|---|
| | | | | Yes / No | Yes / No | Yes / No / N/A | Pass / Fail |

- Uncovered functional AC = **High** — Definition of Done violation
- Uncovered security AC = **Critical** — non-negotiable

Fires CR4 with coverage table included.

## Rules

- Check both the coverage comment block and the actual test bodies
- A test that exists but does not assert the AC = not covered
- Security ACs with no test are always Critical regardless of context
