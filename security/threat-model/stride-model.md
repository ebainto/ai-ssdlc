# STRIDE Threat Model — Operational Working Copy
# [System name] | Version: v1 | Date: [YYYY-MM-DD]
# Owner: Security Engineer / Security Architect
# Status: Draft | Approved (Gate 2) | Under review

> **How to use this template:**
> This is the operational working copy of the threat model — maintained here between SSDLC phases as the application evolves. The phase-gated version (produced at SSDLC Phase 2) lives in `ssdlc/[system]_threat-model_vN.md`.
>
> Update this file when:
> - A new external integration is added
> - The authentication model changes
> - A new data store is introduced
> - A new data classification is added
> - A significant architectural change is made
>
> Trigger a formal SSDLC Phase 2 re-run when changes affect trust boundaries or introduce new High/Critical threats.
>
> Delete this notice once the model is in active use.

---

## System overview

**System name:** [System name]
**Purpose:** [One sentence — what the system does]
**Tech stack:** [Brief — e.g. Angular / Spring Boot / SQL Server / HashiCorp Vault]
**Deployment model:** [e.g. On-prem Ubuntu servers behind Nginx reverse proxy]
**Last reviewed:** [YYYY-MM-DD]
**Reviewed by:** [Name / role]

---

## Trust boundary map

```
EXTERNAL ZONE (untrusted — internet-facing)
=========================================================
  [Browser / Mobile client]
         |
         | HTTPS (TLS 1.2+)
         v
  [Nginx Reverse Proxy — DMZ]
         |
=========================================================
INTERNAL ZONE (trusted — private network)
         |
         v
  [API Gateway / Backend Service]
         |           |
         v           v
  [Database]   [Integration Layer]
                     |
=========================================================
EXTERNAL SERVICES ZONE (semi-trusted — third-party APIs)
                     |
                     v
  [External API — e.g. Equifax, Auth0, DocuSign]
=========================================================
```

---

## Threat register (STRIDE)

| ID | Threat category | STRIDE | Affected component | Trust boundary crossed | Attack vector | Likelihood | Impact | Mitigation control | Control owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| T-01 | Spoofing user identity | S | API Gateway | External → Internal | Forged JWT token | Medium | High | RS256 JWT validation via Spring Security `JwtDecoder`; token expiry 15 min | Backend | Mitigated |
| T-02 | Tampering with loan application data | T | Database | Internal | SQL injection via unvalidated input | Low | Critical | Parameterised queries (Hibernate); input validation at service layer | Backend | Mitigated |
| T-03 | Repudiation of financial transaction | R | Backend — loan approval service | Internal | Absence of audit trail | Low | High | Immutable audit log written to append-only table; log forwarded to Loki | Backend | Mitigated |
| T-04 | Information disclosure of PII | I | Database | Internal | Unauthorised DB query returning PII columns | Medium | Critical | Always Encrypted on PII columns; RLS enforcing user-scoped access | Database | Mitigated |
| T-05 | Denial of service — API flooding | D | Nginx / API Gateway | External → Internal | Unauthenticated request flooding | High | High | Rate limiting at Nginx (100 req/s per IP); circuit breaker (Resilience4j) | Infrastructure | Mitigated |
| T-06 | Elevation of privilege — admin endpoint access | E | Backend — admin API | Internal | Missing role check on admin endpoints | Low | Critical | `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints; verified by SAST | Backend | Mitigated |
| T-07 | Information disclosure — secrets in logs | I | Backend | Internal | Developer accidentally logs a JWT or API key | Medium | High | SAST rule flags log statements with credential patterns; log review in code review | Backend | Mitigated |
| T-08 | [Add threat] | | | | | | | | | Open |

**Likelihood:** High / Medium / Low
**Impact:** Critical / High / Medium / Low
**Status:** Mitigated / Partially mitigated / Open / Risk accepted

---

## Open threats

List all threats with status **Open** or **Partially mitigated** here for visibility:

| ID | Threat | Status | Owner | Target resolution date |
|---|---|---|---|---|
| T-08 | [Threat title] | Open | [Name] | [YYYY-MM-DD] |

---

## Threats with no mitigation control (Critical gap)

Any threat with no mitigation control must be resolved before SSDLC Gate 2 approval. List them here:

| ID | Threat | Reason no control exists | Proposed mitigation | Owner |
|---|---|---|---|---|
| — | None currently | — | — | — |

---

## Threat model review triggers

Review this threat model when any of the following occur:

| Trigger | Action |
|---|---|
| New external API integration added | Add threat entries for new trust boundary crossings |
| Authentication model changes | Review all Spoofing and Elevation threats |
| New PII or financial data field added | Review all Information Disclosure threats |
| New data store introduced | Review all Tampering and Information Disclosure threats |
| Pen test finding reveals an unmodelled threat | Add new entry; update control; re-run SSDLC Phase 2 if High/Critical |
| Quarterly scheduled review | Full review of all threats; update Likelihood based on new intelligence |

---

## Re-review log

| Date | Trigger | Changes made | Reviewed by |
|---|---|---|---|
| [YYYY-MM-DD] | Initial model — SSDLC Phase 2 | Full model created | [Name] |

---

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
| v1 | [YYYY-MM-DD] | Initial STRIDE model from SSDLC Phase 2 | [Name / Role] |
