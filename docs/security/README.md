# Security Supporting Documents

Supporting documents for the **`security/` layer** — regulatory guidance, compliance briefs, and security design documents delivered by the business team, legal team, or external auditors.

---

## This folder is for the security layer only

`docs/security/` holds policy-level and compliance-level inputs that feed `security/CLAUDE.md`. It is **not** a catch-all for all security-related documents across the project.

| What goes here | What goes elsewhere |
|---|---|
| Regulatory PDFs (GDPR, ISO 27001, PCI-DSS) | Spring Security auth flow design → `docs/backend/design/` |
| OWASP ASVS control mapping for this project | Angular CSP and XSS controls → `docs/frontend/design/` |
| ISO 27001 / PCI-DSS gap analysis for this project | SQL Server Always Encrypted design → `docs/database/design/` |
| Risk assessment from the security architect | Auth0 integration design → `docs/integration/design/` |
| Pen test reports (stored in `security/pen-test/`) | Network security diagram → `docs/infrastructure/design/` |

**The rule:** documents about *what the security policy requires* go in `docs/security/`. Documents about *how a specific layer implements security* go in that layer's own `docs/[layer]/design/` folder.

Security implementation details for each layer are also captured inline in each layer's `CLAUDE.md` Security Architecture section — that is the first place to look before creating a separate design document.

---

## Folder structure

| Folder | What goes here | Format |
|---|---|---|
| `requirements/` | Regulatory guidance PDFs, compliance briefs from legal, audit findings, external pen test reports | PDF: keep as-is — human reference and audit evidence |
| `design/` | Control framework mappings, risk assessments, OWASP ASVS project mapping | Convert to `.md` for Claude; keep PDF originals for audit trail |

---

## How inline content and @imported documents work together

The `security/CLAUDE.md` works as both at the same time — content you write directly into the file and documents you `@import` are loaded together as one combined context. Claude sees no difference between the two.

```
security/CLAUDE.md (what Claude loads)
│
├── Inline content — written directly into the file
│   └── Compliance Obligations table, Cross-Cutting Controls,
│       Remediation SLA, SAST Suppression Rules,
│       Threat Model Re-review Triggers — stable, structured
│       content maintained here permanently
│
└── @import statements — pull in external documents
    └── @../docs/security/design/[system]_asvs-mapping_v1.md
        → Claude reads this file and treats it as part of
          security/CLAUDE.md — indistinguishable from inline content
```

---

## What goes inline vs what goes in @imported documents

| What goes inline in `security/CLAUDE.md` | What goes in `@imported` documents |
|---|---|
| Compliance Obligations table (specific obligations that apply to this project) | OWASP ASVS control mapping for this project (if maintained as a separate document) |
| Cross-Cutting Controls table (STRIDE → stack controls across all layers) | ISO 27001 control gap analysis specific to this project |
| Remediation SLA (Critical/High/Medium/Low timeframes) | Risk assessment document from the security architect |
| SAST Suppression rules and suppression format | Any security design document that versions independently |
| Threat Model Re-review Triggers | — |
| Security Control Ownership table | — |
| Layer Boundaries and sub-folder purpose | — |

**Critical rule for regulatory documents:** Never `@import` full regulatory PDFs (GDPR text, ISO 27001 standard, PCI-DSS requirements). They are hundreds of pages and mostly irrelevant. Instead, transcribe only the **specific obligations that apply to this project** into the Compliance Obligations table inline in `security/CLAUDE.md`.

---

## How to connect a compliance document to Claude

**For project-specific compliance analysis (what to @import):**

```
docs/security/design/
├── [system]_asvs-mapping_v1.md      ← OWASP ASVS L2 controls mapped to this project's stack; @import this
├── [system]_iso27001-gap-analysis_v1.md  ← Gap analysis for this project; @import this
└── [system]_risk-assessment_v1.md    ← Risk register for this project; @import if needed
```

Add `@import` to `security/CLAUDE.md` Application Specification section:

```markdown
## Application Specification — Compliance Obligations

@../docs/security/design/[system]_asvs-mapping_v1.md

| Framework | Applies | Reason | Key obligation |  ← your inline table continues here
```

**Step — When a new version arrives, update one line**

```markdown
<!-- change this: -->
@../docs/security/design/[system]_asvs-mapping_v1.md

<!-- to this: -->
@../docs/security/design/[system]_asvs-mapping_v2.md
```

---

## How to use the `design/` folder

Store project-specific security analysis, control mapping documents, and risk assessments here. These are documents your team or security architect produces — not the regulatory standards themselves.

### Control framework mappings (Markdown — @importable)

A control framework mapping translates a regulatory standard into the specific controls that apply to this project, mapped to the tech stack. This is the most valuable document to make Claude-accessible — it tells Claude which controls apply, where, and what evidence is required.

```
docs/security/design/
├── [system]_asvs-mapping_v1.md          ← OWASP ASVS L2 controls mapped to Spring Boot/Angular
├── [system]_iso27001-gap-analysis_v1.md ← Gap analysis specific to this project's current state
└── [system]_compliance-control-map_v1.md ← Cross-framework control map (GDPR + PCI-DSS + ISO)
```

**Example Markdown control mapping format:**

```markdown
## OWASP ASVS L2 — Loan Portal Control Mapping

| ASVS Ref | Control description | Layer | Implementation | Status |
|---|---|---|---|---|
| V2.1.1 | Passwords ≥ 12 chars | Backend | Auth0 password policy | Implemented |
| V2.2.1 | MFA required for sensitive operations | Backend + Frontend | Auth0 MFA + Angular guard | Implemented |
| V3.3.1 | Session logout invalidates server-side session | Backend | Spring Security session invalidation | Implemented |
| V4.1.1 | Enforce PoLP — users only access what they own | Backend | @PreAuthorize on all endpoints | Implemented |
| V7.1.1 | Log all auth decisions | Backend | Spring Security audit logger | Gap — in progress |
```

Add `@import` to `security/CLAUDE.md`:

```markdown
## Application Specification — Compliance Obligations

@../docs/security/design/[system]_asvs-mapping_v1.md
@../docs/security/design/[system]_iso27001-gap-analysis_v1.md

| Framework | Applies | Reason | Key obligation |  ← your inline table continues here
```

**Example — asking Claude to verify a control is implemented:**

```
Based on the ASVS mapping in my context, does the current implementation of
LoanApplicationController.java satisfy V4.1.1 (principle of least privilege)?
Check that users can only access their own loan_applications records.
```

### Risk assessment documents (Markdown — @importable when scoped)

A project-specific risk register that identifies technical security risks and mitigations can be `@imported` when it is concise and focused on this project. Import it when asking Claude to implement mitigations:

```
docs/security/design/
└── [system]_risk-assessment_v1.md
```

Only `@import` if the document is focused on this project and under ~10 pages. A generic 50-page risk assessment framework document is not appropriate to `@import` — extract the relevant risks into a project-specific summary first.

### Security architecture diagrams (prompt-only)

Security architecture diagrams (trust boundary diagrams, network security diagrams, data flow with security overlays) **cannot be `@imported`**. Reference them in the prompt when implementing a specific control or reviewing a security boundary:

```
docs/security/design/
└── [system]_security-architecture-diagram_v1.pdf    ← prompt-only
```

**Example — implementing a control from the security architecture:**

```
@docs/security/design/[system]_security-architecture-diagram_v1.pdf
The security architecture diagram on page 2 shows a WAF in front of the API Gateway.
Our current Nginx config in infrastructure/nginx/ does not implement the rate limiting
rules shown. Help me add rate limiting per the diagram.
```

---

## Regulatory PDFs — prompt-only reference, never @import

Full regulatory documents stay in `docs/security/requirements/` as human reference and audit evidence. Do not `@import` them.

Reference them in the prompt only when asking a specific compliance question:

```
@docs/security/requirements/gdpr-recitals.pdf
Does our current audit logging approach satisfy Recital 49 on network security monitoring?
```

```
@docs/security/requirements/owasp-asvs-4.0.3.pdf
What does ASVS V2.2.1 require for multi-factor authentication? Does our current Auth0 implementation satisfy it?
```

---

## Pen test reports — special handling

Pen test reports are confidential. They reveal active vulnerabilities and must be handled with care:

- Store in `security/pen-test/` (not in `docs/security/`) — that folder is already in `.gitignore` if your repo is private; confirm with your security lead
- Never reference pen test reports in PR descriptions or commit messages
- Reference in the prompt only when remediating a specific finding:

```
@security/pen-test/[system]_pentest-report_2026-Q1.pdf
Finding PT-07 describes a broken object-level authorisation issue on GET /api/v1/applications/{id}.
Help me fix the authorisation check in LoanApplicationController.java.
```

---

## File naming convention

`[system-name-or-framework]_[document-type]_v[N].[ext]`

| Example filename | What it is |
|---|---|
| `[system]_asvs-mapping_v1.md` | OWASP ASVS control mapping — @import into `security/CLAUDE.md` |
| `[system]_iso27001-gap-analysis_v1.md` | ISO 27001 gap analysis — @import into `security/CLAUDE.md` |
| `[system]_risk-assessment_v1.md` | Project risk register — @import if Claude needs context |
| `gdpr-recitals.pdf` | Full GDPR text — prompt-only reference |
| `owasp-asvs-4.0.3.pdf` | OWASP ASVS standard — prompt-only reference |
| `pci-dss-v4.0.pdf` | PCI-DSS requirements — prompt-only reference |
