# Example: consumer loan portal

A worked reference showing the **depth and shape** the SSDLC template expects
from a real project's design documents. Read it to calibrate how thorough your
own documents should be, then write your own.

## This is illustrative. Do not wire it into your project.

Nothing here is loaded by Claude Code. These files sit outside `docs/` precisely
so no layer `CLAUDE.md` `@import`s them by accident — an earlier revision of this
template did import them, which meant Claude treated a loan domain model as the
active project's domain on every prompt, whatever the team was actually building.

Copy the *structure*, not the content:

| File | What to learn from it |
|---|---|
| `backend/loan-portal_openapi-spec_v1.yaml` | Endpoint contract as the single source of truth; multipart upload done safely |
| `database/loan-portal_data-dictionary_v1.md` | Per-column data classification, encryption mode chosen per access pattern, RLS and temporal tables |
| `infrastructure/loan-portal_infrastructure-design_v1.md` | Server inventory, VLAN segmentation, firewall rules, Vault secret paths, monitoring targets |
| `integration/loan-portal_external-services_v1.md` | One contract per external provider: auth method, exact PII sent, lawful basis, error codes |
| `security/loan-portal_asvs-mapping_v1.md` | Requirement-by-requirement control mapping with an honest status column |

## Known limits of this example

It is a **design set with no implementation**. So:

- Every ASVS row is `Planned`, never `Met`. There is no code, so no control can
  be evidenced. This is the honest state, and it is the point: a mapping whose
  rows all claim `Met` with nothing to show fails the moment an auditor asks.
- The infrastructure design names Jenkins, on-prem Ubuntu hosts and specific
  VLANs. That is this example's stack, not a template requirement.
- Component counts and SLA figures are illustrative, not measured.

## Defects that were fixed here, and worth checking for in your own design

Each of these was present in an earlier revision. They are listed because they
are easy to reproduce, not because they remain:

1. **Client-supplied storage path.** `CreateDocumentRequest` took a
   `fileReference` string that was persisted as a NAS UNC path. A caller could
   point it at any SMB share — path traversal, SSRF onto internal file servers,
   and NTLM credential capture via an attacker-controlled host. Now a
   `multipart/form-data` upload where the server derives the entire path.
2. **Two irreconcilable auth models.** The backend did password login and issued
   its own JWTs while every other layer described an external IdP — and the
   project's own secure coding standard forbids rolling your own auth. Now one
   model: the IdP issues, the backend validates.
3. **Encryption mode that made login impossible.** `email` was Randomized
   Always Encrypted, which cannot satisfy an equality lookup, so
   `WHERE email = ?` could never match. Now Deterministic, with the equality
   leak stated as the accepted trade.
4. **Salted hash in a lookup column.** `token_hash` was BCrypt, which salts per
   call, so looking a refresh token up by hash could never match. Now SHA-256.
5. **Guessable identifiers.** All ids used `NEWSEQUENTIALID()` while the IDOR
   defence assumed unguessable v4 GUIDs. Now `NEWID()`.
6. **A claimed control with no endpoint.** ASVS V3.3.1 (logout invalidates the
   session) was marked met with no logout route. Now `POST /api/v1/auth/logout`.
7. **Mis-cited requirement IDs.** Password hashing cited V6.4.1 (secrets
   management) instead of V2.4.1; SQL injection cited V5.5.3 (deserialization)
   instead of V5.3.4; CSP cited V14.4.6 (Referrer-Policy) instead of V14.4.3;
   REST CSRF cited V13.2.1 (HTTP methods) instead of V13.2.3.
8. **CSP that breaks the UI and drops a control.** `default-src 'self'` alone
   breaks Angular Material, which needs inline styles and `data:` images, and
   `frame-ancestors` was set in a `<meta>` tag, where browsers ignore it.
9. **Deploy order that broke every schema change.** The pipeline rolled new
   code to both production hosts and *then* ran Flyway, so new code queried
   columns that did not exist yet for the whole rollout window. Migrations now
   run first, with an expand/contract rule for backward compatibility.
10. **mTLS required but not used.** The encryption policy demanded mTLS for all
    service-to-service calls while nginx proxied to the backend over plain
    HTTP, and its permitted-suite list named only TLS 1.3 suites while the
    minimum version was 1.2. Policy and config now agree, with the same-host
    hop recorded as an explicit exception.

## Gaps left open on purpose, and flagged in place

These are unresolved in the design and marked where they occur, because closing
them needs product decisions rather than corrections:

- **GDPR erasure has no path.** No `DELETE` operation, unclassified file
  contents on the NAS, and system-versioned history that cannot be deleted while
  versioning is on. The conflict between an immutable audit trail and the right
  to erasure has to be decided, not patched.
- **REVIEWER is an untested privilege boundary.** It has a role value and a
  `reviewer_notes` column but no endpoint and no RLS predicate branch.
- **Components with no host.** A Redis dedup cache and two workers are depended
  on by the integration design but absent from the server inventory, and
  RabbitMQ runs as one container per app host — two independent brokers, not a
  cluster.
