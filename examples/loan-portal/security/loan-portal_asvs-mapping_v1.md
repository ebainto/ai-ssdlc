# Loan Portal — OWASP ASVS Level 2 Control Mapping v1

Target assurance level: ASVS 4.0.3 Level 2 (standard security for applications that process sensitive personal or financial data).

This document maps each ASVS Level 2 requirement to its **intended**
implementation. Requirements marked `N/A` are out of scope for this
application (e.g. no payment card data).

> **Every row below is `Planned`, not `Met`.**
>
> This is an illustrative example: the repository contains no application code,
> so not one of these controls can be evidenced. An earlier revision marked all
> 66 rows `○ Planned`, which is exactly the failure mode an ASVS mapping exists to
> prevent — an auditor asks "show me", and there is nothing to show.
>
> Promote a row to `Met` only when you can point an auditor at the specific
> code, config or test that implements it, and name that artifact in the
> Implementation column. Until then the correct status is `Planned`.
>
> The Implementation column below therefore describes *design intent* — what the
> control will be, not what exists.

---

## V1 — Architecture, Design and Threat Modelling

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V1.1.1 | Secure SDLC in use | ○ Planned | SSDLC gates 1–7 documented; HITL audit trail in `ssdlc/` |
| V1.2.1 | Authentication controls use a trusted enforced component | ○ Planned | An external IdP issues tokens; the Spring Security filter chain validates them against the IdP's JWKS on every protected route. This service is **not** its own identity provider — see `secure-coding-standard.md`: never roll your own authentication |
| V1.4.1 | Access controls enforced on trusted service layer | ○ Planned | `@PreAuthorize` RBAC at method level in Spring Boot; frontend guards are UX only |
| V1.5.1 | Input/output trust boundaries documented and enforced | ○ Planned | Defined in each layer's CLAUDE.md → Layer Boundaries section |
| V1.6.1 | Cryptographic key management policy defined | ○ Planned | RS256 key pair in Vault; rotation policy documented in `security/policies/` |
| V1.9.1 | Communications between application components encrypted | ○ Planned | TLS 1.2+ on all external; VLAN isolation + TLS for internal SQL Server connection |
| V1.11.1 | All components use tested and updated libraries | ○ Planned | OWASP Dependency-Check + `npm audit` in Jenkins — Critical CVEs block deployment |

---

## V2 — Authentication

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V2.1.1 | Passwords ≥ 12 characters | ○ Planned | Auth0 enforces password policy at registration |
| V2.2.1 | Anti-automation controls prevent brute force | ○ Planned | Auth0 rate limiting + account lockout after 10 failed attempts |
| V2.3.1 | Credential reset requires current credential or OTP | ○ Planned | Auth0 password reset flow — email OTP required |
| V2.5.1 | Credential recovery does not expose current credential | ○ Planned | Auth0 reset sends link, not password hint |
| V2.7.1 | OOB authenticators use randomised tokens with 10+ minute expiry | ○ Planned | Auth0 email OTP: 6-digit, 10-minute expiry |
| V2.8.1 | Time-based OTP seeds use approved algorithms (RFC 6238) | N/A | TOTP MFA optional; Auth0 implements RFC 6238 if enabled |
| V2.10.1 | Integration secrets are not hardcoded — rotated on schedule | ○ Planned | All secrets in Vault; 90-day rotation enforced by Vault lease |

---

## V3 — Session Management

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V3.2.1 | Access tokens are opaque or short-lived | ○ Planned | Access token: RS256 JWT, 15-minute expiry |
| V3.2.3 | Access tokens expire after inactivity | ○ Planned | 15-minute access token + 15-minute frontend idle timeout |
| V3.3.1 | Logout invalidates the session | ○ Planned | `POST /api/v1/auth/logout` revokes the refresh token server-side and clears the cookie; the access token then expires naturally within 15 minutes. A mapping that claims this control must ship an actual logout endpoint |
| V3.4.1 | Cookie attributes: Secure, HttpOnly, SameSite=Strict | ○ Planned | Refresh token cookie set by backend: `HttpOnly; Secure; SameSite=Strict` |
| V3.5.1 | Stateless tokens signed and validated correctly | ○ Planned | JWT RS256 — `nimbus-jose-jwt` validates signature, issuer, audience, and expiry |
| V3.7.1 | Sessions invalidated on password change | ○ Planned | Auth0 triggers token revocation on password change; backend refresh token revocation on next refresh attempt |

---

## V4 — Access Control

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V4.1.1 | AC enforced server-side | ○ Planned | `@PreAuthorize` on all endpoints; no client-side enforcement |
| V4.1.3 | Principle of least privilege | ○ Planned | Role hierarchy: `APPLICANT < REVIEWER < ADMIN`; custom `@ResourceOwner` for record ownership |
| V4.2.1 | Sensitive data protected from unauthorised access | ○ Planned | RLS on `loan_applications` and `documents`; Always Encrypted on PII columns |
| V4.3.1 | Admin interfaces do not allow access from internet | ○ Planned | Admin endpoints on internal VLAN only — no internet-facing admin route |

---

## V5 — Validation, Sanitisation, and Encoding

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V5.1.1 | Server-side input validation on all inputs | ○ Planned | `@Valid` on all controller DTO parameters; Jakarta Bean Validation |
| V5.2.1 | Unstructured data sanitised or rejected | ○ Planned | Free-text fields limited by `maxLength` constraints; no HTML rendering of user input |
| V5.3.1 | Output encoding context-aware | ○ Planned | Angular default interpolation escaping; Spring Boot JSON serialisation via Jackson |
| V5.4.1 | Type-safe parameters prevent injection | ○ Planned | Hibernate parameterised queries — no native query with string concatenation |
| V5.3.4 | SQL injection prevention — parameterised queries | ○ Planned | JPA/Hibernate generates `sp_executesql` with typed params; enforced via SAST (SpotBugs find-sec-bugs) |

---

## V6 — Stored Cryptography

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V6.2.1 | Regulated data encrypted at rest | ○ Planned | PII columns: SQL Server Always Encrypted (AES-256). Keys in Azure Key Vault. |
| V6.2.3 | Encryption keys not hardcoded | ○ Planned | Keys stored in Azure Key Vault (for Always Encrypted column master key); Vault for application secrets |
| V6.2.7 | Random values generated with approved CSPRNG | ○ Planned | `java.security.SecureRandom`; token IDs use `UUID.randomUUID()` |
| V6.3.1 | Random GUIDs use UUID v4 or better | ○ Planned | `UUID.randomUUID()` (v4) for all application-generated IDs; `NEWSEQUENTIALID()` in SQL for PK performance |
| V2.4.1 | Password hashing: bcrypt, scrypt, Argon2 or PBKDF2 | ○ Planned | BCrypt via Spring Security `BCryptPasswordEncoder` (cost factor 12) |

---

## V7 — Error Handling and Logging

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V7.1.1 | No credentials or sensitive data in logs | ○ Planned | Logback PatternLayout masks `email`, `phone`, `dateOfBirth`. MDC: `correlationId` and `userId` only |
| V7.1.2 | No PII in logs | ○ Planned | Same LogFilter — masks all PII fields before log appender receives the event |
| V7.2.1 | Security events logged | ○ Planned | `@AuditLog` AOP aspect: auth success/fail, access decisions, state changes |
| V7.3.1 | Logs protected from injection | ○ Planned | Logback encodes log messages; no direct user input written to log without encoding |
| V7.4.1 | Error messages to user do not expose stack traces | ○ Planned | `GlobalExceptionHandler` maps exceptions to typed `ErrorResponse` DTO — no stack trace exposed |

---

## V8 — Data Protection

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V8.1.1 | Sensitive data identified and classified | ○ Planned | Data Classification table in `database/CLAUDE.md`; policy in `security/policies/data-classification-policy.md` |
| V8.2.1 | Client-side sensitive data not persisted unnecessarily | ○ Planned | Access token in NgRx store (in-memory only). No localStorage or sessionStorage for auth tokens |
| V8.3.1 | Sensitive data not sent in HTTP GET parameters | ○ Planned | Auth token only in `Authorization` header; no credentials in URL parameters |
| V8.3.4 | Sensitive business data protected from direct object reference | ○ Planned | GUID-based IDs (not sequential integers); `@ResourceOwner` prevents horizontal access |

---

## V9 — Communications

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V9.1.1 | TLS used for all communications | ○ Planned | Nginx: TLS 1.2/1.3 enforced; HTTP → HTTPS redirect; HSTS header set |
| V9.1.2 | Cipher suites updated; weak ciphers disabled | ○ Planned | Nginx: `ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256` only |
| V9.1.3 | Certificate validity verified | ○ Planned | Internal CA; Alertmanager alerts at 30 days and 7 days before expiry |
| V9.2.1 | mTLS for sensitive backend connections | ○ Planned | Equifax API: mTLS with client cert from Vault |

---

## V10 — Malicious Code

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V10.2.1 | Source controlled and compared against known-good baseline | ○ Planned | Git; all changes via PR with mandatory code review |
| V10.3.1 | Auto-update mechanism uses signed packages | ○ Planned | Docker images pinned by digest (`@sha256:`); Trivy scans before deploy |
| V10.3.2 | Compiler warnings treated as errors | ○ Planned | Maven: `<failOnWarning>true</failOnWarning>` in compiler plugin config |

---

## V11 — Business Logic

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V11.1.1 | Business logic flows sequential, no bypass | ○ Planned | Application status machine enforced in `LoanApplicationService` — state transitions validated against current status |
| V11.1.2 | Business limits validated server-side | ○ Planned | Loan amount range, 3-application limit, DRAFT-only edits — all enforced in service layer |
| V11.1.4 | Anti-automation for sensitive business flows | ○ Planned | Auth0 rate limiting on auth; application submission rate limited in `LoanApplicationService` |

---

## V12 — Files and Resources

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V12.1.1 | File size limits enforced | ○ Planned | Spring Boot: `spring.servlet.multipart.max-file-size=10MB`; Angular validator also checks |
| V12.2.1 | Files validated for expected content type | ○ Planned | MIME type checked in `DocumentService`; Angular frontend checks `file.type` (UX gate only) |
| V12.3.1 | User-supplied filename metadata not used in filesystem operations | ○ Planned | Upload is `multipart/form-data`; the server derives the whole path from the authenticated `applicant_id` and a generated `document_id`. No path segment comes from the request, and the original filename is stored for display only, never used on the filesystem |
| V12.6.1 | Web application does not include and execute arbitrary functionality | ○ Planned | No dynamic code eval; CSP blocks inline scripts |

---

## V13 — API and Web Service

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V13.1.1 | All REST endpoints protected by authentication | ○ Planned | Spring Security defaults to `authenticated()`; public routes listed explicitly in `SecurityConfig.permitAll()` |
| V13.1.2 | HTTP method validation | ○ Planned | Spring MVC `@GetMapping`, `@PostMapping` etc. — only declared methods accepted |
| V13.2.3 | RESTful services using cookies are protected from CSRF | ○ Planned | The access token travels in the `Authorization` header, so those calls need no CSRF token. The **refresh** token is an httpOnly cookie, so `POST /api/v1/auth/refresh` and `/auth/logout` **do** need CSRF protection: `SameSite=Strict` plus a double-submit token. "Not applicable" is only true when nothing is cookie-borne — verify which of yours are |
| V13.4.1 | GraphQL not used without query depth limiting | N/A | Application uses REST, not GraphQL |

---

## V14 — Configuration

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V14.1.1 | Build and deployment performed in a consistent and repeatable manner | ○ Planned | Jenkins pipeline; Docker images pinned by digest |
| V14.2.1 | All components up to date | ○ Planned | OWASP Dependency-Check + npm audit in CI; Trivy for Docker images |
| V14.3.1 | Debug mode disabled in production | ○ Planned | Spring Boot: `application-prod.yml` sets `logging.level.root=WARN`; no `spring.jpa.show-sql` in prod |
| V14.3.2 | HTTP server-side error messages non-verbose | ○ Planned | `GlobalExceptionHandler` returns typed `ErrorResponse`; Nginx does not expose version in headers |
| V14.4.1 | HTTP security headers set | ○ Planned | Nginx: HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP |
| V14.4.3 | CSP response header restricts resource origins | ○ Planned | Sent as a **response header**, not a `<meta>` tag — `frame-ancestors` is ignored in a meta tag, so clickjacking protection silently disappears there. A policy for an Angular Material app needs more than `default-src 'self'`: Material injects inline styles and inlines SVG data URIs, so `style-src 'self' 'unsafe-inline'` and `img-src 'self' data:` are required or the UI renders broken. Keep `connect-src` same-origin when the API is served under `/api/` on the same host |
| V14.5.1 | Authorised HTTP request methods only | ○ Planned | Spring MVC method-specific mappings; Nginx `limit_except` on sensitive paths |
