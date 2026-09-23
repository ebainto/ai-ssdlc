# Secure Coding Standard
# [System name] | Version: v1 | Date: [YYYY-MM-DD]
# Owner: Security Engineer / Security Architect
# Status: Draft | Approved | Superseded

> **How to use this template:**
> Fill in each section for your project. Every rule must reference the compliance control that requires it (OWASP ASVS, ISO 27001, PCI-DSS, etc.). Rules without a control reference are guidelines, not obligations. Delete this notice when approved.

---

## Purpose

This document defines the secure coding rules for [system name]. All developers must follow these rules. The CI/CD pipeline enforces the automated rules via SAST and dependency scanning. Manual rules are enforced at code review.

These rules derive from:
- Compliance obligations defined in `security/CLAUDE.md`
- OWASP ASVS L[2/3] mapping at `docs/security/design/[system]_asvs-mapping_v1.md`
- ISO 27001 gap analysis at `docs/security/design/[system]_iso27001-gap-analysis_v1.md`

---

## Input Validation

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| Validate all input at every trust boundary — never trust data from the client, message queue, or external API | All layers | ASVS V5.1.1 | Code review |
| Use allowlist validation, not blocklist | Backend, Integration | ASVS V5.1.3 | Code review |
| Reject requests that exceed defined field length limits | Backend | ASVS V5.1.4 | SAST / code review |
| Never use user input directly in SQL queries — use parameterised queries only | Backend, Database | ASVS V5.3.4 / OWASP A03 | SAST |

---

## Output Encoding

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| HTML-encode all dynamic content rendered in the browser | Frontend | ASVS V5.3.1 / OWASP A03 | SAST |
| Use framework-provided encoding — never write custom encoding functions | Frontend | ASVS V5.3.1 | Code review |
| Set `Content-Security-Policy` header on all responses | Infrastructure (Nginx) | ASVS V14.4.3 | Infrastructure config |

---

## Authentication and Session Management

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| **DEFAULT:** Use an external IdP ([Auth0 / Keycloak / Azure AD]) — do NOT build your own auth | All layers | ASVS V2.1.1 | Code review |
| If you must use self-issued credentials (Option B, requires ADR): implement bcrypt ≥12 or Argon2id for password storage | Backend | ASVS V2.4.3 | Code review |
| JWT tokens must use RS256 asymmetric signing; HS256 is not permitted (it requires a shared secret and cannot be rotated securely) | Backend | ASVS V3.5.3 | SAST / code review |
| Access tokens must expire within [15 minutes] | Backend | ASVS V3.3.1 | Code review |
| Invalidate server-side session on logout | Backend | ASVS V3.3.1 | Code review |
| MFA required for [admin roles / all users — specify] | Backend, Frontend | ASVS V2.2.1 | Code review |

---

## Secrets Management

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| Never hardcode credentials, API keys, or tokens in source code or config files | All layers | ASVS V2.10.1 / ISO A.9.4 | SAST (secrets scan, pre-commit hook) |
| All secrets are retrieved from HashiCorp Vault. Vault Agent renders them to a file on a `tmpfs` volume the application reads at startup — **not** into environment variables | All layers | ASVS V2.10.4 | Code review |

> **Why not environment variables.** An environment variable is readable via
> `/proc/<pid>/environ`, appears in `docker inspect`, is inherited by every child
> process, and is commonly captured in crash dumps and error telemetry. A file on
> a `tmpfs` volume with `0400` ownership is readable only by the process that
> needs it and never touches disk.
>
> **A sidecar cannot set a sibling container's environment.** Environment is
> fixed at container creation, so "Vault Agent injects secrets as env vars into
> the app container" is not implementable. The two mechanisms that do work are:
> Vault Agent templates the secret to a shared volume and the app reads the file,
> or Vault Agent runs in the same container as an exec wrapper. If your design
> claims env injection from a sidecar, it has not been built yet.
| Rotate secrets immediately if accidentally committed — do not just delete the commit | All layers | ISO A.9.4 | Incident process |

---

## Encryption

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| All data in transit uses TLS 1.2 minimum — TLS 1.0 and 1.1 are disabled | Infrastructure | ASVS V9.1.1 / PCI Req 4.2 | Infrastructure config |
| PII fields at rest must use [Always Encrypted / AES-256] | Database | ASVS V6.2.1 / GDPR Art 32 | Code review |
| Never use MD5 or SHA-1 for cryptographic purposes | All layers | ASVS V6.2.2 | SAST |
| Encryption key management uses HashiCorp Vault — no static keys in config | All layers | ASVS V6.4.1 | Code review |

See `security/policies/encryption-policy.md` for full algorithm requirements.

---

## Error Handling and Logging

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| Never expose stack traces, internal paths, or database error messages to the client | Backend | ASVS V7.4.1 / OWASP A05 | SAST / code review |
| Return generic error messages to the client; log the detailed error server-side | Backend | ASVS V7.4.1 | Code review |
| Log all authentication events (success and failure) with user ID and timestamp | Backend | ASVS V7.2.1 / ISO A.12.4 | Code review |
| Log all access control decisions for sensitive operations | Backend | ASVS V7.2.2 | Code review |
| Never log PII, credentials, or session tokens | All layers | ASVS V7.1.1 / GDPR Art 32 | SAST / code review |

---

## Dependency Management

| Rule | Applies to | Control ref | Enforcement |
|---|---|---|---|
| No dependency with a Critical CVE may be merged — update or replace before merge | All layers | ASVS V1.14.1 / PCI Req 6.3 | SCA scan (CI gate) |
| Review and update dependencies at least monthly | All layers | ISO A.12.6 | CI weekly SCA scan |
| Pin dependency versions — do not use wildcard version ranges in production builds | All layers | ASVS V1.14.1 | Code review |

---

## Code Review Requirements

| Condition | Minimum reviewers | Notes |
|---|---|---|
| All changes | 2 engineers | Standard pull request |
| Auth, session, or token handling changes | 2 engineers — at least 1 security-aware | Flag in PR description |
| PII data access or storage changes | 2 engineers — at least 1 security-aware | Flag in PR description |
| SAST suppression additions | Security engineer sign-off required | Suppression must cite reason and control ref |

---

## Remediation SLA (from `security/CLAUDE.md`)

| Severity | Maximum time to remediate |
|---|---|
| Critical | 24 hours |
| High | 7 days |
| Medium | 30 days |
| Low | 90 days or next release |

---

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
| v1 | [YYYY-MM-DD] | Initial draft | [Name / Role] |
