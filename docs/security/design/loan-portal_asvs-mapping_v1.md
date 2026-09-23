# Loan Portal — OWASP ASVS Level 2 Control Mapping v1

Target assurance level: ASVS 4.0.3 Level 2 (standard security for applications that process sensitive personal or financial data).

This document maps each ASVS Level 2 requirement to its implementation in this project. Requirements marked `N/A` are not applicable due to the application's scope (e.g. PCI-DSS exclusion, no payment card data).

---

## V1 — Architecture, Design and Threat Modelling

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V1.1.1 | Secure SDLC in use | ✅ Met | SSDLC gates 1–7 documented; HITL audit trail in `ssdlc/` |
| V1.2.1 | Authentication controls use a trusted enforced component | ✅ Met | Auth0 as IdP; Spring Security filter chain enforces JWT validation on all protected routes |
| V1.4.1 | Access controls enforced on trusted service layer | ✅ Met | `@PreAuthorize` RBAC at method level in Spring Boot; frontend guards are UX only |
| V1.5.1 | Input/output trust boundaries documented and enforced | ✅ Met | Defined in each layer's CLAUDE.md → Layer Boundaries section |
| V1.6.1 | Cryptographic key management policy defined | ✅ Met | RS256 key pair in Vault; rotation policy documented in `security/policies/` |
| V1.9.1 | Communications between application components encrypted | ✅ Met | TLS 1.2+ on all external; VLAN isolation + TLS for internal SQL Server connection |
| V1.11.1 | All components use tested and updated libraries | ✅ Met | OWASP Dependency-Check + `npm audit` in Jenkins — Critical CVEs block deployment |

---

## V2 — Authentication

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V2.1.1 | Passwords ≥ 12 characters | ✅ Met | Auth0 enforces password policy at registration |
| V2.2.1 | Anti-automation controls prevent brute force | ✅ Met | Auth0 rate limiting + account lockout after 10 failed attempts |
| V2.3.1 | Credential reset requires current credential or OTP | ✅ Met | Auth0 password reset flow — email OTP required |
| V2.5.1 | Credential recovery does not expose current credential | ✅ Met | Auth0 reset sends link, not password hint |
| V2.7.1 | OOB authenticators use randomised tokens with 10+ minute expiry | ✅ Met | Auth0 email OTP: 6-digit, 10-minute expiry |
| V2.8.1 | Time-based OTP seeds use approved algorithms (RFC 6238) | N/A | TOTP MFA optional; Auth0 implements RFC 6238 if enabled |
| V2.10.1 | Integration secrets are not hardcoded — rotated on schedule | ✅ Met | All secrets in Vault; 90-day rotation enforced by Vault lease |

---

## V3 — Session Management

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V3.2.1 | Access tokens are opaque or short-lived | ✅ Met | Access token: RS256 JWT, 15-minute expiry |
| V3.2.3 | Access tokens expire after inactivity | ✅ Met | 15-minute access token + 15-minute frontend idle timeout |
| V3.3.1 | Logout invalidates the session | ✅ Met | Logout revokes refresh token in DB; access token expires naturally (15 min max) |
| V3.4.1 | Cookie attributes: Secure, HttpOnly, SameSite=Strict | ✅ Met | Refresh token cookie set by backend: `HttpOnly; Secure; SameSite=Strict` |
| V3.5.1 | Stateless tokens signed and validated correctly | ✅ Met | JWT RS256 — `nimbus-jose-jwt` validates signature, issuer, audience, and expiry |
| V3.7.1 | Sessions invalidated on password change | ✅ Met | Auth0 triggers token revocation on password change; backend refresh token revocation on next refresh attempt |

---

## V4 — Access Control

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V4.1.1 | AC enforced server-side | ✅ Met | `@PreAuthorize` on all endpoints; no client-side enforcement |
| V4.1.3 | Principle of least privilege | ✅ Met | Role hierarchy: `APPLICANT < REVIEWER < ADMIN`; custom `@ResourceOwner` for record ownership |
| V4.2.1 | Sensitive data protected from unauthorised access | ✅ Met | RLS on `loan_applications` and `documents`; Always Encrypted on PII columns |
| V4.3.1 | Admin interfaces do not allow access from internet | ✅ Met | Admin endpoints on internal VLAN only — no internet-facing admin route |

---

## V5 — Validation, Sanitisation, and Encoding

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V5.1.1 | Server-side input validation on all inputs | ✅ Met | `@Valid` on all controller DTO parameters; Jakarta Bean Validation |
| V5.2.1 | Unstructured data sanitised or rejected | ✅ Met | Free-text fields limited by `maxLength` constraints; no HTML rendering of user input |
| V5.3.1 | Output encoding context-aware | ✅ Met | Angular default interpolation escaping; Spring Boot JSON serialisation via Jackson |
| V5.4.1 | Type-safe parameters prevent injection | ✅ Met | Hibernate parameterised queries — no native query with string concatenation |
| V5.5.3 | SQL injection prevention | ✅ Met | JPA/Hibernate generates `sp_executesql` with typed params; enforced via SAST (SpotBugs find-sec-bugs) |

---

## V6 — Stored Cryptography

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V6.2.1 | Regulated data encrypted at rest | ✅ Met | PII columns: SQL Server Always Encrypted (AES-256). Keys in Azure Key Vault. |
| V6.2.3 | Encryption keys not hardcoded | ✅ Met | Keys stored in Azure Key Vault (for Always Encrypted column master key); Vault for application secrets |
| V6.2.7 | Random values generated with approved CSPRNG | ✅ Met | `java.security.SecureRandom`; token IDs use `UUID.randomUUID()` |
| V6.3.1 | Random GUIDs use UUID v4 or better | ✅ Met | `UUID.randomUUID()` (v4) for all application-generated IDs; `NEWSEQUENTIALID()` in SQL for PK performance |
| V6.4.1 | Password hashing: bcrypt, scrypt, or Argon2 | ✅ Met | BCrypt via Spring Security `BCryptPasswordEncoder` (cost factor 12) |

---

## V7 — Error Handling and Logging

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V7.1.1 | No credentials or sensitive data in logs | ✅ Met | Logback PatternLayout masks `email`, `phone`, `dateOfBirth`. MDC: `correlationId` and `userId` only |
| V7.1.2 | No PII in logs | ✅ Met | Same LogFilter — masks all PII fields before log appender receives the event |
| V7.2.1 | Security events logged | ✅ Met | `@AuditLog` AOP aspect: auth success/fail, access decisions, state changes |
| V7.3.1 | Logs protected from injection | ✅ Met | Logback encodes log messages; no direct user input written to log without encoding |
| V7.4.1 | Error messages to user do not expose stack traces | ✅ Met | `GlobalExceptionHandler` maps exceptions to typed `ErrorResponse` DTO — no stack trace exposed |

---

## V8 — Data Protection

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V8.1.1 | Sensitive data identified and classified | ✅ Met | Data Classification table in `database/CLAUDE.md`; policy in `security/policies/data-classification-policy.md` |
| V8.2.1 | Client-side sensitive data not persisted unnecessarily | ✅ Met | Access token in NgRx store (in-memory only). No localStorage or sessionStorage for auth tokens |
| V8.3.1 | Sensitive data not sent in HTTP GET parameters | ✅ Met | Auth token only in `Authorization` header; no credentials in URL parameters |
| V8.3.4 | Sensitive business data protected from direct object reference | ✅ Met | GUID-based IDs (not sequential integers); `@ResourceOwner` prevents horizontal access |

---

## V9 — Communications

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V9.1.1 | TLS used for all communications | ✅ Met | Nginx: TLS 1.2/1.3 enforced; HTTP → HTTPS redirect; HSTS header set |
| V9.1.2 | Cipher suites updated; weak ciphers disabled | ✅ Met | Nginx: `ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256` only |
| V9.1.3 | Certificate validity verified | ✅ Met | Internal CA; Alertmanager alerts at 30 days and 7 days before expiry |
| V9.2.1 | mTLS for sensitive backend connections | ✅ Met | Equifax API: mTLS with client cert from Vault |

---

## V10 — Malicious Code

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V10.2.1 | Source controlled and compared against known-good baseline | ✅ Met | Git; all changes via PR with mandatory code review |
| V10.3.1 | Auto-update mechanism uses signed packages | ✅ Met | Docker images pinned by digest (`@sha256:`); Trivy scans before deploy |
| V10.3.2 | Compiler warnings treated as errors | ✅ Met | Maven: `<failOnWarning>true</failOnWarning>` in compiler plugin config |

---

## V11 — Business Logic

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V11.1.1 | Business logic flows sequential, no bypass | ✅ Met | Application status machine enforced in `LoanApplicationService` — state transitions validated against current status |
| V11.1.2 | Business limits validated server-side | ✅ Met | Loan amount range, 3-application limit, DRAFT-only edits — all enforced in service layer |
| V11.1.4 | Anti-automation for sensitive business flows | ✅ Met | Auth0 rate limiting on auth; application submission rate limited in `LoanApplicationService` |

---

## V12 — Files and Resources

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V12.1.1 | File size limits enforced | ✅ Met | Spring Boot: `spring.servlet.multipart.max-file-size=10MB`; Angular validator also checks |
| V12.2.1 | Files validated for expected content type | ✅ Met | MIME type checked in `DocumentService`; Angular frontend checks `file.type` (UX gate only) |
| V12.3.1 | User-supplied file paths not used in filesystem operations | ✅ Met | File path constructed from `applicant_id` + `document_id` — never from user input |
| V12.6.1 | Web application does not include and execute arbitrary functionality | ✅ Met | No dynamic code eval; CSP blocks inline scripts |

---

## V13 — API and Web Service

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V13.1.1 | All REST endpoints protected by authentication | ✅ Met | Spring Security defaults to `authenticated()`; public routes listed explicitly in `SecurityConfig.permitAll()` |
| V13.1.2 | HTTP method validation | ✅ Met | Spring MVC `@GetMapping`, `@PostMapping` etc. — only declared methods accepted |
| V13.2.1 | REST services not vulnerable to CSRF | ✅ Met | JWT Bearer token in `Authorization` header — not cookie-based; CSRF not applicable for token-auth APIs |
| V13.4.1 | GraphQL not used without query depth limiting | N/A | Application uses REST, not GraphQL |

---

## V14 — Configuration

| Req ID | Requirement (summary) | Status | Implementation |
|---|---|---|---|
| V14.1.1 | Build and deployment performed in a consistent and repeatable manner | ✅ Met | Jenkins pipeline; Docker images pinned by digest |
| V14.2.1 | All components up to date | ✅ Met | OWASP Dependency-Check + npm audit in CI; Trivy for Docker images |
| V14.3.1 | Debug mode disabled in production | ✅ Met | Spring Boot: `application-prod.yml` sets `logging.level.root=WARN`; no `spring.jpa.show-sql` in prod |
| V14.3.2 | HTTP server-side error messages non-verbose | ✅ Met | `GlobalExceptionHandler` returns typed `ErrorResponse`; Nginx does not expose version in headers |
| V14.4.1 | HTTP security headers set | ✅ Met | Nginx: HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP |
| V14.4.6 | CSP restricts resource origins | ✅ Met | CSP: `default-src 'self'; script-src 'self'; frame-ancestors 'none'` |
| V14.5.1 | Authorised HTTP request methods only | ✅ Met | Spring MVC method-specific mappings; Nginx `limit_except` on sensitive paths |
