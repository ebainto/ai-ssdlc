# SAST Suppression Rules Register
# [System name] | Version: v1 | Date: [YYYY-MM-DD]
# Owner: Security Engineer
# Status: Active

> **How to use this template:**
> Every SAST suppression added to the codebase must have a corresponding entry in this register. A suppression without a register entry will be rejected at code review.
>
> **Why this register exists:** Suppressions hide findings from the CI pipeline. An untracked suppression is indistinguishable from a finding that was deliberately buried. This register is the audit trail that proves every suppression is intentional, reviewed, and time-limited.
>
> Delete this notice once the register is in active use.

---

## How to add a suppression

**Step 1 — Confirm the finding is a genuine false positive.** A suppression is never the right response to a real vulnerability.

**Step 2 — Add the inline suppression comment in code using the format for your tool:**

```java
// Semgrep — Java example
// nosemgrep: java.lang.security.audit.formatted-sql-string
String query = "SELECT id FROM [your_table] WHERE status = '" + status + "'";
// ^ safe: status is validated against a strict allowlist before reaching this point (see ApplicationValidator.java:47)
```

```typescript
// Semgrep — TypeScript example
// nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml
```

```yaml
# OWASP Dependency-Check — suppress in dependency-check-suppressions.xml
<suppress>
  <notes>CVE-2024-XXXXX — only affects the X feature which is not used in this project</notes>
  <cve>CVE-2024-XXXXX</cve>
</suppress>
```

**Step 3 — Add an entry to this register before raising your pull request.**

**Step 4 — Get security engineer sign-off on the suppression at code review.**

---

## Active suppressions

| ID | Tool | Rule / CVE | File / Dependency | Reason for suppression | False positive confirmed by | Added date | Review date | Added by |
|---|---|---|---|---|---|---|---|---|
| SUP-001 | [Semgrep / OWASP DC / Trivy] | [rule ID or CVE] | [file path or dependency name] | [why this is a false positive] | [Name / role] | [YYYY-MM-DD] | [YYYY-MM-DD + 90 days] | [Name] |

---

## Suppression review log

All suppressions are reviewed every 90 days. Record each review outcome here.

| Suppression ID | Review date | Outcome | Reviewer | Notes |
|---|---|---|---|---|
| SUP-001 | [YYYY-MM-DD] | Retained / Removed — vulnerability resolved / Removed — suppression no longer valid | [Name] | |

---

## Suppression policy

| Rule | Detail |
|---|---|
| Security engineer sign-off required | No suppression merged without security engineer review |
| Must include reason in code comment | The inline comment must explain why it is a false positive |
| Must have register entry | Suppression with no register entry is rejected at code review |
| Review every 90 days | All active suppressions reviewed quarterly; remove when no longer needed |
| No suppression for real vulnerabilities | A suppression is never the correct response to a genuine finding — fix the code |
| CVE suppressions require proof of non-applicability | Document which feature or code path makes the CVE inapplicable |

---

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
| v1 | [YYYY-MM-DD] | Initial register | [Name / Role] |
