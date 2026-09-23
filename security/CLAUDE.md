# Security Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `security/` folder. It gives Claude the context it needs to work with cross-cutting security artifacts — policies, tool configurations, pen test records, and the threat model — without applying them incorrectly to a specific application layer.

**As a developer, you use this file to:**
- Understand which security controls are owned centrally (here) versus per-layer (in each layer's CLAUDE.md)
- Define the policies that all other layers derive their security rules from
- Track security findings (pen test, SAST suppressions) with full audit trail
- Maintain the threat model as the application evolves

**When to update this file:**
- New compliance obligations are added (update Compliance Obligations section)
- A new SAST tool is adopted or a rule set changes
- The threat model scope changes (new external integrations, auth model changes, new data stores)
- Remediation SLAs are renegotiated

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — architectural scope, control ownership, and what this layer must not contain
- Each layer's `CLAUDE.md` → Security Architecture section — layer-specific application of the policies defined here
- `ssdlc/` — phase-gated security deliverables (threat model, security test plan); `security/threat-model/` is the operational working copy maintained between SSDLC phases

---

## Layer Boundaries

**Responsibility:** Owns all cross-cutting security artifacts. Policies here are the source of truth — all other layer security rules must align to them.

| Direction | Detail |
|---|---|
| **Applies to** | All layers — frontend, backend, database, infrastructure, integration |
| **Must not** | Contain application code or infrastructure provisioning scripts |
| **Relationship to `ssdlc/`** | `ssdlc/` holds phase-gated deliverables (threat model, test plan). `security/` holds the operational working copies used day-to-day during development |

**Security control ownership by layer:**

| Control | Owner layer | Defined in |
|---|---|---|
| CSP headers, XSS prevention | Frontend | `frontend/CLAUDE.md` → Security Architecture |
| Auth token storage | Frontend + Backend | Both CLAUDE.md Security Architecture sections |
| Input validation | Backend | `backend/CLAUDE.md` → Security Architecture |
| RBAC / authorisation | Backend | `backend/CLAUDE.md` → Security Architecture |
| Data encryption at rest | Database + Infrastructure | Both CLAUDE.md Security Architecture sections |
| Secrets management | Infrastructure | `infrastructure/CLAUDE.md` → Security Architecture |
| Webhook signature validation | Integration | `integration/CLAUDE.md` → Security Architecture |
| SAST / SCA pipeline gates | All layers | `security/sast/` config + Jenkins pipeline |
| Pen test scope and findings | Cross-cutting | `security/pen-test/` |
| Threat model (operational) | Cross-cutting | `security/threat-model/` |

---

## Sub-folder Purpose

| Folder | Contents | Owner | Populated at |
|---|---|---|---|
| `security/policies/` | Secure coding standards (Java, TypeScript), encryption policy, data classification policy, secrets management rules | Security lead | SSDLC Phase 5 (Dev Standards) |
| `security/sast/` | Semgrep rule sets, SpotBugs config, ESLint security plugin config, suppression files with justifications | Security engineer | SSDLC Phase 5 (Dev Standards) |
| `security/pen-test/` | Pen test scope definition, findings register, remediation tracking, external firm reports | Security lead + external firm | SSDLC Phase 6 (Security Test Plan) |
| `security/threat-model/` | STRIDE threat model (operational working copy — updated as architecture evolves) | Security lead | SSDLC Phase 2 (Threat Model) |

---

## Application Specification — Compliance Obligations

<!--
  HOW TO CONNECT COMPLIANCE DOCUMENTS TO CLAUDE
  ──────────────────────────────────────────────
  Store regulatory guidance and compliance briefs in:

    docs/security/requirements/   ← regulatory PDFs, compliance briefs from legal team
    docs/security/design/         ← control framework mappings, risk assessments (.md)

  Do NOT @import full regulatory PDFs (GDPR text, ISO 27001 standard) — they are hundreds
  of pages and mostly irrelevant to Claude. Instead, transcribe only the specific obligations
  that apply to this project into the Compliance Obligations table below.

  For project-specific compliance mappings (e.g. OWASP ASVS control mapping), @import here:
  @../docs/security/design/loan-portal_asvs-mapping_v1.md

  Reference regulatory PDFs explicitly only when asking a specific compliance question:
    @docs/security/requirements/gdpr-recitals.pdf
    Does our audit logging approach satisfy Recital 49?

  Rules:
  - Regulatory PDFs stay in docs/security/requirements/ — never @import them
  - Project-specific compliance analysis documents: convert to .md and @import
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

@../docs/security/design/loan-portal_asvs-mapping_v1.md

| Framework | Applies | Reason | Key obligation |
|---|---|---|---|
| GDPR (EU 2016/679) | Yes | Application processes EU resident personal data (loan applicants) | Lawful basis for processing; data subject rights (access, erasure); breach notification within 72 hours to supervisory authority |
| ISO 27001:2022 | Yes | Organisation holds ISO 27001 certification | ISMS controls apply to this application; annual surveillance audit |
| OWASP ASVS Level 2 | Yes | Target assurance level for a financial application | All Level 2 requirements must be verified before production release |
| PCI-DSS v4.0 | No | Payment processing fully delegated to a PCI-compliant third party (DocuSign + bank) | Out of scope — application does not store, process, or transmit cardholder data |
| Privacy Act 1988 (AU) | Yes | Application serves Australian residents | APP 11 — security of personal information; APP 1 — open and transparent management |

---

## Security Architecture — Cross-Cutting Controls

> These controls apply to ALL layers. Each layer's CLAUDE.md specifies how to implement them in that layer's stack.
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Control | Applies to | Standard | Implementation across stacks |
|---|---|---|---|
| Authentication | Frontend (Angular), Backend (Spring Boot) | OWASP ASVS V2 | JWT RS256 (15 min access token) + refresh token rotation; httpOnly cookie at browser boundary; Auth0 as IdP |
| Authorisation | Backend (Spring Boot) | OWASP ASVS V4 | `@PreAuthorize` RBAC at method level; `@ResourceOwner` annotation for record ownership checks |
| Transport encryption | All layers | TLS 1.2+ | Nginx enforces TLS 1.2/1.3 externally; backend ↔ SQL Server uses Encrypted=true in JDBC URL; RabbitMQ uses TLS 1.2 |
| Secrets management | All layers | OWASP ASVS V2.10 | HashiCorp Vault via Vault Agent sidecar; no secrets in `application.yml`, `.env`, Dockerfiles, or Compose files |
| Input validation | Backend (Spring Boot) | OWASP ASVS V5 | Jakarta Bean Validation (`@Valid` on all DTOs); JSON Schema for event payloads; HMAC for inbound webhooks |
| Output encoding / XSS | Frontend (Angular) | OWASP ASVS V5 | Angular interpolation `{{ }}` escapes by default; `bypassSecurityTrustHtml` banned via ESLint |
| Audit logging | Backend (Spring Boot) | ISO A.8.15 | Spring AOP `@AuditLog` aspect logs all state-changing operations: `userId`, `action`, `entityId`, `correlationId`, `timestamp` |
| Data classification | Database (SQL Server) | GDPR Art 32 / ISO A.8.2 | PII columns encrypted via SQL Server Always Encrypted; classification table maintained in `database/CLAUDE.md` |
| Static analysis (SAST) | Backend (Java), Frontend (TypeScript) | OWASP ASVS V14 | Backend: SpotBugs + find-sec-bugs plugin (Maven verify phase). Frontend: ESLint with `@angular-eslint/security` rules. Both block PR merge on Critical/High |
| Dependency scanning (SCA) | Backend (Maven), Frontend (npm) | OWASP ASVS V14 | OWASP Dependency-Check (Maven plugin) + `npm audit` in Jenkins pipeline. Critical CVEs block deployment |
| Container scanning | Infrastructure (Docker) | OWASP ASVS V14 | Trivy scans all Docker images in Jenkins pipeline; Critical CVEs block deployment |
| Penetration test | Full application | OWASP ASVS V14.3 | Annual external pen test + after every major release; scope in `security/pen-test/scope.md` |

---

## Remediation SLA

| Severity | Maximum time to remediate | Escalation if missed |
|---|---|---|
| Critical | 24 hours | Immediate CTO + Security Lead notification; incident declared |
| High | 7 days | Weekly security review agenda item |
| Medium | 30 days | Monthly security review |
| Low | 90 days or next planned release | Quarterly review |

---

## SAST Suppression Rules

> Every suppression must have a justification. Claude must never add a suppression without a documented reason.

**Java (SpotBugs / find-sec-bugs) — suppression format:**
```java
@SuppressFBWarnings(
    value = "SQL_INJECTION_JDBC",
    justification = "Column name comes from a hardcoded whitelist validated at line 45 — not user input. Accepted by: Jane Smith, 2024-03-15. Review: 2024-06-15"
)
public List<Applicant> findBy(String whitelistedColumn) { ... }
```

**TypeScript (ESLint) — suppression format:**
```typescript
// eslint-disable-next-line @angular-eslint/no-bypassSecurityTrustHtml
// Justification: Content is sanitised by DomPurify at the service layer before reaching this binding.
// Accepted by: Jane Smith, 2024-03-15. Review: 2024-06-15
this.trustedHtml = this.sanitizer.bypassSecurityTrustHtml(sanitisedContent);
```

**Format rules:**
- Must include: the specific rule being suppressed, the justification, the approver name and date, and a review date (max 90 days)
- Suppressions with no justification comment are a SAST finding in themselves — they will be flagged in the next scan
- Review date must be tracked in `security/sast/suppression-register.md`

---

## Threat Model Re-review Triggers

The threat model in `security/threat-model/` must be reviewed and updated when any of the following occur:

- A new external service integration is added (new trust boundary)
- The authentication or authorisation model changes
- A new data store or data type is introduced
- A new environment or deployment topology is added
- A security incident or near-miss reveals an unmodelled threat
- A new compliance obligation is identified that changes the data classification

Re-review is performed by the security lead with sign-off from the engineering lead. The updated threat model is versioned (`threat-model-v<N>.md`) and the change is logged in `ssdlc/[system]_hitl-audit-trail_vN.md`.

---

## What Claude Should Know When Working Here

- **Policies in `security/policies/` override layer-level rules.** If a layer's CLAUDE.md security rule conflicts with a policy document, the policy wins — update the layer CLAUDE.md to match.
- **Pen test findings in `security/pen-test/` are confidential** — never include in public repositories, PR descriptions, or commit messages.
- **A finding is not closed** until there is a linked remediation commit or a documented, approved risk acceptance signed by the security lead.
- **SAST suppressions require a justification comment** in the same commit — Claude must never suppress a finding without the full comment block above.
- **Threat model is a living document** — it is not completed once at Phase 2 and forgotten. It is updated at every trigger event listed above.
