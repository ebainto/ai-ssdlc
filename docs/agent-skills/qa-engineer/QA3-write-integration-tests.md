# QA3 — Write integration tests

**Agent:** QA Engineer
**Trigger:** `"write integration tests"`, or spawned by Dev Lead for stories touching persistence

## Inputs required

| Input | Source | Required |
|---|---|---|
| Component name | Spawn prompt or user | Yes |
| Layer | Spawn prompt or user | Yes |
| Story ID | Spawn prompt or user | Yes |
| Database schema or migration file | `database/migrations/` | Yes |

## Pre-condition

Read:
1. `[layer]/CLAUDE.md` — integration testing framework, test database config, transaction management
2. `database/migrations/[latest].sql` — confirm the schema being tested

If no test database is configured: stop and flag:
`[TEST DATABASE NOT CONFIGURED — add test datasource to [layer]/CLAUDE.md and environment config before integration tests can run]`

## Behaviour

Write integration tests that:
1. Use a **real database** — test schema or fixtures, never a mock
2. Cover the full stack: service boundary → repository → database → back
3. Test scenarios:
   - Successful write and read-back (data persisted correctly)
   - Constraint violation (duplicate key, null constraint, FK violation)
   - Transaction rollback on error (no partial writes)
   - Concurrent write behaviour (if the story involves concurrent access)
4. Each test cleans up after itself via transaction rollback, test containers, or truncate-on-teardown

## Output format

Save to: `[layer]/tests/integration/[ComponentName]IntegrationTest.[ext]`

Start with the coverage comment block — same format as QA1.

## Rules

- **Never mock the database.** Integration tests require a real database. No exceptions.
- Each test is independent — no shared mutable state between tests
- Teardown is mandatory — tests must not leave data that breaks other tests

## Return to Dev Lead

Report: file written, scenarios covered, any infrastructure gap flagged.
