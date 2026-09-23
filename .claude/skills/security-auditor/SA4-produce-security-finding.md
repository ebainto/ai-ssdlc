# SA4 — Produce security finding

**Agent:** Security Auditor
**Trigger:** Fires automatically when SA1, SA2, or SA3 identifies a violation. Never triggered directly from outside.

## CONFIDENTIALITY — absolute rule

Finding details are NEVER shown in the conversation. They are ONLY written to `security/pen-test/findings-register.md`.

Conversation-visible output after SA4 completes: "1 finding recorded — see findings register (confidential)."

## Behaviour

1. Assign the next sequential Finding ID: read the register to find the highest SF-NNN, increment by 1.
2. Produce the finding card.
3. Append to `security/pen-test/findings-register.md`.

## Finding card format

```
SECURITY FINDING — CONFIDENTIAL
================================
Finding ID:      SF-[NNN]
Date:            [today]
Identified by:   Security Auditor Agent
Story / PR:      [ID from spawn prompt — or "standalone audit"]
Severity:        Critical / High / Medium / Low
CVSS estimate:   [score — or ASSUMED if not calculable]
CWE:             [CWE-NNN]
OWASP:           [category — e.g. A01:2021 Broken Access Control]
Affected:        [layer / component / file:line]
Description:     [what the vulnerability is — sufficient to locate and fix, no exploit steps]
Evidence:        [minimum code reference — file path and line range only]
Remediation:     [specific, actionable fix]
SLA:             [from security/CLAUDE.md remediation SLA table: Critical=24h, High=7d, Medium=30d, Low=90d]
Status:          Open
```

## Save instruction

Append to `security/pen-test/findings-register.md` — never overwrite.
Create the file if it does not exist with this header:
```
# Security Findings Register — CONFIDENTIAL
# System: [system name from root CLAUDE.md]
# Do not include in PR descriptions, commit messages, or public channels.
# ---------------------------------------------------------------
```

## Severity guidance

| Severity | Criteria |
|---|---|
| Critical | Remote code execution, auth bypass, mass data exposure — fix within 24h |
| High | Privilege escalation, significant data leak, STRIDE threat unmitigated — fix within 7 days |
| Medium | Limited data exposure, missing non-critical control — fix within 30 days |
| Low | Defence-in-depth gap, information disclosure low impact — fix within 90 days |
