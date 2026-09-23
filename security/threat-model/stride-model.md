# STRIDE Threat Model — ai-ssdlc Template Example

**This is an example/reference threat model for the ai-ssdlc template.** It demonstrates the expected shape and depth of a threat model for a loan portal system. It is **not operational** — the template itself (ai-ssdlc) does not implement these controls; each adopting team will replace it with their own real threats and operational controls.

**Version:** template-v1 | **Date:** 2026-09-23 | **Status:** Example — reference only | **Owner:** Security architect (your team) | **Phase:** 2 (Threat Modelling)

---

## For Adopting Teams

When you fork this template and start your project:

1. **Copy this file** to `ssdlc/[your-system-name]_threat-model_v1.md` (or keep this as the operational copy in `security/threat-model/`)
2. **Replace the System Overview section** with your actual system details
3. **Replace each threat row** with threats specific to your architecture, data, and business logic
4. **Set Status honestly:** `Mitigated` only when the control is implemented in your codebase and can be verified by a reviewer
5. **Run `/security-audit`** after populating your real threats — it will verify that each `Mitigated` control actually exists in the code

Before your **first security audit**, every threat must have a Status of either `Mitigated` (control implemented and reviewable), `Planned` (control designed, not yet built), or `Open` (no control yet — resolve before Gate 2 approval).

---

## How to Use This (Template Reference Model)

This example threat model demonstrates:
- **Trust boundaries** — how to model the zones in your system
- **STRIDE categories** — one threat per category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation)
- **Control ownership** — which layer owns each control (backend, database, infrastructure)
- **Likelihood and Impact** — how to assess risk
- **Status values** — Mitigated, Planned, Open, Risk accepted

Use this as a **template for your own threat model**. Replace the system overview, trust boundary map, and threat rows with your actual system's threats and controls.

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
  [External API — name each third party you call]
=========================================================
```

---

## Threat register (STRIDE)

| ID | Threat category | STRIDE | Affected component | Trust boundary crossed | Attack vector | Likelihood | Impact | Mitigation control | Control owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| T-01 | Spoofing user identity | S | API Gateway | External → Internal | Forged JWT token | Medium | High | RS256 JWT validation via Spring Security `JwtDecoder`; token expiry 15 min | Backend | Planned (example) |
| T-02 | Tampering with loan application data | T | Database | Internal | SQL injection via unvalidated input | Low | Critical | Parameterised queries (Hibernate); input validation at service layer | Backend | Planned (example) |
| T-03 | Repudiation of financial transaction | R | Backend — loan approval service | Internal | Absence of audit trail | Low | High | Immutable audit log written to append-only table; log forwarded to Loki | Backend | Planned (example) |
| T-04 | Information disclosure of PII | I | Database | Internal | Unauthorised DB query returning PII columns | Medium | Critical | Always Encrypted on PII columns; RLS enforcing user-scoped access | Database | Planned (example) |
| T-05 | Denial of service — API flooding | D | Nginx / API Gateway | External → Internal | Unauthenticated request flooding | High | High | Rate limiting at Nginx (100 req/s per IP); circuit breaker (Resilience4j) | Infrastructure | Planned (example) |
| T-06 | Elevation of privilege — admin endpoint access | E | Backend — admin API | Internal | Missing role check on admin endpoints | Low | Critical | `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints; verified by SAST | Backend | Planned (example) |
| T-07 | Information disclosure — secrets in logs | I | Backend | Internal | Developer accidentally logs a JWT or API key | Medium | High | SAST rule flags log statements with credential patterns; log review in code review | Backend | Planned (example) |
| T-08 | [Add threat] | | | | | | | | | Open |

**Likelihood:** High / Medium / Low
**Impact:** Critical / High / Medium / Low
**Status:** Mitigated / Partially mitigated / Planned / Open / Risk accepted

- `Mitigated` — control is implemented and a reviewer can point at it in code.
  Only use this once that is true; `/security-audit` treats it as a claim to verify.
- `Planned` — control is designed but not yet built. Audits will not raise a
  finding against it, because there is no code to find it missing from.
- `Partially mitigated` — implemented for some paths only; name which in the row.

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
