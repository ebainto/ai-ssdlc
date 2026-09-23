# Security Layer

The `security/` folder is the **sixth application layer** — not a documentation folder and not a duplicate of each layer's Security Architecture section. It is the cross-cutting security workbench: the place where policies, tooling, and compliance artifacts that govern every other layer are defined and maintained.

---

## Why this layer exists alongside each layer's Security Architecture section

Every other layer (`frontend/`, `backend/`, `database/`, etc.) has a Security Architecture section in its `CLAUDE.md`. Those sections describe how *that layer* implements security. They are layer-specific.

This folder handles what those sections cannot — security concerns that cut across all layers at once.

| | Each layer's Security Architecture section | `security/` root layer |
|---|---|---|
| **Scope** | That layer only | All layers |
| **What it defines** | How this layer implements security (e.g. Spring `@PreAuthorize`, Angular CSP, SQL Server Always Encrypted) | Policies, tooling, and compliance artifacts that govern every layer |
| **Examples** | JWT validation in backend, XSS encoding in frontend, RLS in database | SAST config, compliance obligations, STRIDE threat model, pen test findings, remediation SLAs |
| **Lives in** | Inline in each layer's `CLAUDE.md` | Real working files in this folder |

**The rule:** if a security decision applies to only one layer, it belongs in that layer's Security Architecture section. If it applies to all layers — or creates obligations that all layers must satisfy — it belongs here.

---

## Why this layer is not the same as `docs/security/`

| | `security/` (this folder) | `docs/security/` |
|---|---|---|
| **What it is** | Live working files — actively used by CI/CD and the team | Reference documents — inputs delivered by legal, auditors, or the security architect |
| **Changed by** | The security engineer as the application evolves | When a new regulatory document or compliance analysis arrives |
| **Examples** | `sast/semgrep.yml` (CI pipeline runs this), `pen-test/findings-register.md` (active remediation tracker), `threat-model/stride-model.md` (updated each sprint) | ISO 27001 gap analysis, OWASP ASVS mapping, regulatory PDFs |
| **Claude access** | Via `security/CLAUDE.md` — auto-loaded when working in this folder | Via `@import` in `security/CLAUDE.md` or prompt-only `@` reference |

---

## Is `security/policies/` a duplicate of `docs/security/`?

No. They are input and output of the same process:

| | `docs/security/` | `security/policies/` |
|---|---|---|
| **Created by** | External parties — auditors, legal, security architects | Your security engineer |
| **What it is** | Reference inputs — regulatory PDFs, ASVS mapping, ISO gap analysis delivered by outside teams | Internal working policies authored and enforced by your team |
| **Example** | Auditor delivers OWASP ASVS L2 gap analysis → `docs/security/design/` | Security engineer reads it and writes the project encryption policy → `security/policies/encryption-policy.md` |
| **Used by** | Claude via `@import`; humans for reference | All layers derive security rules from here; CI enforces them |

`docs/security/` is the **input**. `security/policies/` is the **output** your team produces from that input.

---

## Sub-folder contents and templates

| Sub-folder | What goes here | Template provided |
|---|---|---|
| `policies/` | Secure coding standards, encryption policy, secrets management rules — the source of truth all layers align to | `secure-coding-standard.md`, `encryption-policy.md` |
| `sast/` | SAST tool configurations (Semgrep rules), SCA configurations (OWASP Dependency-Check), suppression rules register | `suppression-rules.md` |
| `pen-test/` | Pen test scope documents, findings register, remediation tracking — **confidential**; confirm `.gitignore` with your security lead | `findings-register.md` |
| `threat-model/` | Operational STRIDE threat model — working copy maintained between SSDLC phases; phase-gated version lives in `ssdlc/` | `stride-model.md` |

### `policies/` templates

- **`secure-coding-standard.md`** — rules for input validation, output encoding, auth, secrets, encryption, error handling, logging, dependencies, and code review requirements. Each rule references the compliance control (ASVS, ISO, PCI-DSS) that requires it.
- **`encryption-policy.md`** — approved algorithms and key lengths for data in transit, data at rest, hashing, and key management. Includes a prohibited algorithms table.

### `sast/` template

- **`suppression-rules.md`** — register of every SAST suppression added to the codebase. Every suppression must have an entry here before it can be merged. Includes how-to instructions and a 90-day review cycle.

### `pen-test/` template

- **`findings-register.md`** — one register per engagement. Tracks every finding with severity, CVSS score, affected component, remediation owner, due date, and verification status. Includes re-test summary and SLA compliance table. **Confidential — never reference in PR descriptions.**

### `threat-model/` template

- **`stride-model.md`** — operational STRIDE threat model with trust boundary map, threat register, open threats tracker, critical gap register, and re-review trigger list. Updated as the application evolves; a formal Phase 2 re-run is triggered when trust boundaries change.

See the full explanation below: [What is the threat model and why does it matter?](#what-is-the-threat-model-and-why-does-it-matter)

---

## What is the threat model and why does it matter?

The threat model answers one question: **"what could go wrong with this system, and what stops it?"**

STRIDE is the framework used to think through attack categories systematically — so nothing obvious is missed before the system is built.

### The STRIDE framework

| Letter | Threat category | What an attacker does | Example for a loan portal |
|---|---|---|---|
| **S** | Spoofing | Impersonates a legitimate user or service | Forges a JWT token to access another applicant's loan data |
| **T** | Tampering | Modifies data in transit or at rest without authorisation | Injects SQL to change a loan application status to APPROVED |
| **R** | Repudiation | Denies performing an action; no proof exists | Approver denies authorising a loan; no audit log exists to prove otherwise |
| **I** | Information disclosure | Reads data they should not have access to | PII columns returned to a user who only has read access to their own record |
| **D** | Denial of service | Makes the system unavailable to legitimate users | API flooded with unauthenticated requests, taking the service down |
| **E** | Elevation of privilege | Gains access beyond what they are authorised for | Regular user accesses an admin endpoint with no role check enforced |

### What the `stride-model.md` contains

For every component in the system, the model works through each STRIDE category and records:

| Field | What it captures |
|---|---|
| Threat | What an attacker could do |
| Affected component | Which service, endpoint, or data store is at risk |
| Trust boundary crossed | Where the attack enters (External → Internal, Internal, etc.) |
| Likelihood | How probable the attack is (High / Medium / Low) |
| Impact | How severe the consequence is if it succeeds (Critical / High / Medium / Low) |
| Mitigation control | The specific control that stops it — named code, config, or infrastructure |
| Control owner | Which layer owns and maintains that control |
| Status | Mitigated / Partially mitigated / Open / Risk accepted |

**Every mitigated threat names a real control.** If that control is later removed or misconfigured, the threat row is immediately out of date — which is why the model is reviewed on every significant architectural change.

### Why it matters practically

- Forces the team to think like an attacker *before* building, not after a pen test reveals gaps
- Every "mitigated" row is a traceable link between a threat and the code or config that stops it
- Feeds the security test plan (SSDLC Phase 6) — every STRIDE category needs at least one test type covering it
- Is primary evidence auditors request under ISO 27001 (A.8.8 — management of technical vulnerabilities) and OWASP ASVS (V1.1)
- A finding in a pen test with no corresponding threat model entry means the model is incomplete — add it immediately

### The two copies and why both exist

| Copy | Location | Purpose | Who updates it | When it changes |
|---|---|---|---|---|
| **Phase-gated snapshot** | `ssdlc/[system]_threat-model_vN.md` | Point-in-time record approved at SSDLC Gate 2 — versioned, never overwritten | SSDLC Agent (Phase 2) | Only when a formal Phase 2 re-run is approved through Gate 2 |
| **Operational working copy** | `security/threat-model/stride-model.md` | Living document maintained sprint by sprint as the application evolves | Security engineer | Any sprint that adds a new integration, data store, auth change, or architectural change |

**Why not just one copy?**

The SSDLC snapshot is a governance artifact — it is what was formally reviewed and approved at a gate. It must remain unchanged so auditors can see exactly what was approved and when.

The working copy is a living engineering artifact — it must stay accurate as the codebase changes. Keeping them separate means the audit trail is clean and the working document is always current.

**When to trigger a new Phase 2 snapshot:**

| Change | Action required |
|---|---|
| New external API integration added | New trust boundary — re-run Phase 2, produce new snapshot, re-approve Gate 2 |
| Authentication model changed | New Spoofing/Elevation threats likely — re-run Phase 2 |
| New PII or financial data field added | New Information Disclosure threats likely — re-run Phase 2 |
| New data store introduced | New Tampering and Information Disclosure threats — re-run Phase 2 |
| Pen test finds an unmodelled threat | Add to working copy immediately; schedule Phase 2 re-run if High or Critical |
| Routine sprint with no architectural change | Update working copy only; no new snapshot needed |

---

## How to use `security/CLAUDE.md`

`security/CLAUDE.md` is auto-loaded by Claude when you work in this folder. It defines:
- Compliance Obligations table (specific obligations for this project)
- Cross-Cutting Controls (STRIDE → stack controls across all layers)
- Remediation SLA
- SAST suppression rules and format
- Security Control Ownership (which layer owns what)

Supporting documents from `docs/security/` are connected to it via `@import`. See `docs/security/README.md` for how to do this.
