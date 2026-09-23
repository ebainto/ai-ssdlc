# SA2 — Audit SAST suppressions

**Agent:** Security Auditor
**Trigger:** `"audit suppressions"`, `"check sast suppressions"`, or added by Dev Lead when diff contains suppression annotations

## Behaviour

1. Scan changed files for SAST suppression annotations:
   - Java: `@SuppressWarnings`, `// noinspection`
   - Python: `# noqa`
   - Generic: `// nosec`, `// NOSONAR`
2. For each suppression found, verify the full justification block is present:
   ```
   // SAST suppression — [tool name]
   // Rule: [rule ID and name]
   // Justification: [why the rule does not apply here]
   // Approver: [name or role]
   // Review date: [date — must be within 90 days of today]
   ```
3. Check `security/sast/suppression-rules.md` — an entry must exist for this suppression.

## On missing justification block OR missing register entry

→ Fire SA4 — produce Critical finding, append to `security/pen-test/findings-register.md`

## Conversation output

"SA2 complete. N suppression(s) found. M finding(s) recorded."

## Rules

- A suppression without a justification block is always Critical
- A suppression with a review date older than 90 days is High
- Do not add or modify suppressions — report only
