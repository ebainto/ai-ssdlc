# AI-SSDLC Project Structure — Quick Reference

A concise training guide covering what this template is, how it works, and why each part exists.
Full detail: `docs/guides/template-guide.md`

---

## What this template is

A reusable project scaffold that combines two things:

1. **A standardised six-layer application structure** — every project your team builds starts from the same foundation
2. **A Claude Code context system** — teaches Claude your project's stack, business rules, and security controls so it gives accurate, layer-aware assistance without repeating yourself in every prompt

**Target audience:** Enterprise-grade, regulated, multi-team applications. Not suited to small or prototype projects.

---

## The six application layers

```
+------------------+    Browser / mobile client
|    frontend/     |
+------------------+
         |  Angular HttpClient only — no direct DB or third-party access
         v
+------------------+    REST API + all business logic
|    backend/      |
+------------------+
         |  JDBC / Hibernate only          |  via integration/ layer only
         v                                  v
+------------------+            +------------------+
|    database/     |            |   integration/   |    External APIs, events
+------------------+            +------------------+
         ^                                  ^
         |_________ infrastructure/ _________|
                  Servers, Docker, Nginx, Vault
                  (provisions the environment — no app code)

+------------------+
|    security/     |    Cross-cutting — policies, SAST, threat model, pen test
+------------------+    All layers align to this. Never layer-specific code here.
```

**Layer boundary rule:** each layer calls only what the arrow above permits. Violations break the architecture contract and introduce security risks.

---

## How Claude loads context — the CLAUDE.md hierarchy

Claude Code auto-loads every `CLAUDE.md` from the current directory up to the project root on every conversation. No manual referencing needed.

```
Developer opens backend/src/.../LoanService.java
         |
         v
+---------------------------------------+
|  Root CLAUDE.md                       |  Always loaded — project-wide rules,
|  (project root)                       |  layer map, SSDLC phase sequence
+---------------------------------------+
         +
+---------------------------------------+
|  backend/CLAUDE.md                    |  Auto-loaded because file is in backend/ —
|  (layer guide)                        |  Spring Boot stack, domain model,
|                                       |  security controls, boundary rules
+---------------------------------------+
         =
  Claude has full, accurate context
  for this layer with no extra prompting
```

**The filename is mandatory.** Auto-loading only works for files named exactly `CLAUDE.md`. Any other name breaks it.

**Inline content + @import stack together.** Content written directly in the file and documents pulled in via `@./path/to/file.md` are combined into one context — Claude sees no difference.

---

## How security context reaches every layer — the propagation model

`security/CLAUDE.md` is **not** @imported into the root `CLAUDE.md`. It is only auto-loaded when working directly inside `security/`. This is intentional.

Cross-cutting security rules travel to every other layer through a deliberate three-step propagation chain:

```
  security/CLAUDE.md
  (auto-loaded in security/ only)
  - Compliance obligations table
  - STRIDE cross-cutting controls
  - Remediation SLA
  - Encryption policy reference
         |
         | Phase 5 — Security Architect reads and translates
         | each rule into a stack-specific control per layer
         |
         +------------------+------------------+------------------+
         |                  |                  |                  |
         v                  v                  v                  v
  backend/CLAUDE.md  frontend/CLAUDE.md  database/CLAUDE.md  integration/CLAUDE.md
  Security Arch.     Security Arch.      Security Arch.      Security Arch.
  "JWT RS256 via     "CSP header,        "Always Encrypted   "mTLS on all
  JwtDecoder;        no localStorage,    on PII columns;     outbound calls;
  @PreAuthorize      XSS encoding via    RLS per user"       HMAC webhook
  on all endpoints"  Angular DomSanitizer"                   validation"
         |                  |                  |                  |
         v                  v                  v                  v
  Claude writes secure code by default in every layer —
  no security instructions needed in each prompt
```

**Why not @import `security/CLAUDE.md` into root `CLAUDE.md`?**

Loading it globally would inject SAST suppression rules, pen test tracking context, and full compliance tables into every conversation — including when writing Angular components or SQL migrations where that content is irrelevant noise. Scoped context keeps Claude focused.

**When to reference `security/CLAUDE.md` explicitly from another layer:**

```
@security/CLAUDE.md
I'm adding a new external payment API — does this require a threat model update
based on the STRIDE triggers defined in the cross-cutting controls?
```

Use an explicit reference when: adding a new external integration, changing the auth model, adding a new PII data field, or checking remediation SLA before raising a security finding.

---

## Supporting documents — connecting team artifacts to Claude

Business requirements, technical designs, and vendor API guides live in `docs/<layer>/`. Two access patterns:

```
+---------------------------+        +---------------------------+
|  docs/<layer>/            |        |  docs/<layer>/            |
|  requirements/            |        |  design/                  |
|  spec.md                  |        |  diagram.pdf              |
+---------------------------+        +---------------------------+
         |                                      |
   @import in CLAUDE.md                  Explicit @ in prompt
   (auto-loaded every conversation)      (loaded for that conversation only)
         |                                      |
         v                                      v
  Claude always knows it          Claude reads it when you ask

Use @import for:                   Use prompt-only @ for:
  - Business requirements (.md)      - Wireframes and diagrams (PDF/image)
  - Data dictionaries (.md)          - Full vendor API guides (100+ pages)
  - Integration design docs (.md)    - ER diagrams
  - ASVS control mappings (.md)      - Regulatory PDFs
```

**Format rule:** `.md` files — @importable. PDF/images — prompt-only. `.docx`/`.xlsx` — convert to `.md` first; Claude cannot read binary formats.

---

## The three security locations — not duplicates

```
+-------------------------------------------+
|  docs/security/                           |
|  INPUT — delivered by external parties    |
|  - Regulatory PDFs (GDPR, ISO 27001)      |
|  - OWASP ASVS gap analysis                |  Auditor / Legal / Security Architect
|  - ISO 27001 gap analysis                 |  → delivers these documents
+-------------------------------------------+
                    |
                    | Security engineer reads and authors
                    v
+-------------------------------------------+
|  security/policies/                       |
|  OUTPUT — authored by your team           |
|  - secure-coding-standard.md             |  Security Engineer
|  - encryption-policy.md                  |  → writes these from the inputs
+-------------------------------------------+
                    |
                    | Each layer derives implementation rules from here
                    v
+-------------------------------------------+
|  <layer>/CLAUDE.md Security Architecture  |
|  IMPLEMENTATION — layer-specific          |
|  - "JWT RS256 via Spring JwtDecoder"      |  Tech Lead + Security Architect
|  - "Always Encrypted on PII columns"      |  → fills in at Phase 5
+-------------------------------------------+
                    |
                    | CI enforces (once you wire it up)
                    v
+-------------------------------------------+
|  security/sast/semgrep.yml                |
|  ENFORCEMENT — you create this file       |
|  and the CI job that runs it              |
+-------------------------------------------+
```

| Location | Created by | What it is |
|---|---|---|
| Each layer's Security Architecture section | Tech Lead + Security Architect | How *this layer* implements security |
| `security/` root layer | Security engineer | Cross-cutting policies, SAST tooling, threat model, pen test |
| `docs/security/` | External parties | Reference inputs — regulatory documents, gap analyses |
| `security/policies/` | Your security engineer | Internal policies authored from those inputs |

---

## The STRIDE threat model — and why there are two copies

STRIDE answers: **"what could go wrong, and what stops it?"**

| Letter | Threat | Example |
|---|---|---|
| S | Spoofing | Forged JWT token to access another user's data |
| T | Tampering | SQL injection to change a loan status to APPROVED |
| R | Repudiation | Approver denies a decision; no audit log exists |
| I | Information disclosure | PII columns returned to an unauthorised user |
| D | Denial of service | API flooded with unauthenticated requests |
| E | Elevation of privilege | Regular user reaches an admin endpoint |

**Two copies — different purposes:**

```
SSDLC Phase 2
     |
     | Security Architect runs threat modelling
     v
+------------------------------------------+     +------------------------------------------+
|  ssdlc/[system]_threat-model_vN.md       |     |  security/threat-model/stride-model.md   |
|                                          |     |                                          |
|  PHASE-GATED SNAPSHOT                    |     |  OPERATIONAL WORKING COPY                |
|  - Produced at Phase 2                   |     |  - Updated every sprint                  |
|  - Approved at Gate 2                    |     |  - Maintained by security engineer       |
|  - Versioned, never overwritten          |     |  - Reflects current system state         |
|  - Audit and governance record           |     |  - Feeds Security Architecture sections  |
+------------------------------------------+     +------------------------------------------+
        |                                                      |
   Auditors read this                              Developers reference this
   (what was approved at Gate 2)                  (what applies today)
```

Trigger a new Phase 2 snapshot when: new external integration, auth model change, new data store, new PII classification, or a High/Critical pen test finding reveals an unmodelled threat.

---

## The SSDLC phase sequence

```
  Architecture document (your approved target architecture)
         |
         v
+-------------------+
|  Phase 1          |  Validate the architecture — all 8 capability layers,
|  Architecture     |  security layer, DevSecOps pipeline, compliance mapping
|  Intake           |
+-------------------+
         |
    GATE 1 — approve / reject / approve with conditions
         |
         v
+-------------------+
|  Phase 2          |  STRIDE threat model — every component, every trust
|  Threat           |  boundary, likelihood, impact, named mitigation control
|  Modelling        |
+-------------------+
         |
    GATE 2 — no unmitigated Critical threats permitted
         |
         v
+-------------------+
|  Phase 3          |  User stories per architecture layer — every story
|  Requirements     |  traces to a layer, a STRIDE threat, and a compliance
|  & User Stories   |  obligation; compliance Must stories in Sprint 1
+-------------------+
         |
    GATE 3 — all compliance obligations covered; ACs testable
         |
         v
+-------------------+
|  Phase 4          |  Component design cards — interface, data owned,
|  Secure Design    |  security controls per component, sequence diagrams
|  Specifications   |  for critical flows
+-------------------+
         |
    GATE 4 — every story has a component; every component has security controls
         |
         v
+-------------------+
|  Phase 5          |  CLAUDE.md files populated — Security Architecture
|  Dev Standards    |  sections filled from Phase 2 threats + Phase 4 stack;
|  & Scaffolding    |  CI/CD pipeline gates configured; Definition of Done
+-------------------+
         |
    GATE 5 — pipeline gates match threat model; team can meet DoD
         |
         v
+-------------------+
|  Phase 6          |  SAST, DAST, SCA, pen test scope, API security testing,
|  Security         |  remediation SLA — Critical 24h / High 7d / Medium 30d
|  Testing Plan     |
+-------------------+
         |
    GATE 6 — all STRIDE categories covered by at least one test type
         |
         v
+-------------------+
|  Phase 7          |  Release readiness checklist — security, quality,
|  Release          |  and operational gates; every ❌ is a hard blocker
|  Readiness        |
+-------------------+
         |
    GATE 7 — Go / No-Go for production deployment
         |
         v
  Production release authorised
```

**Gate response format — exact wording required:**
- `approve` — proceed to next phase
- `reject` — revise current phase output
- `approve with conditions: [notes]` — proceed with documented exceptions

"OK", "yes", or "continue" are not valid gate responses.

---

## CLAUDE.md population sequence — fill in order, not all at once

| Section | Filled at | Who fills it |
|---|---|---|
| Layer Boundaries | Project kickoff (Phase 1) | Solutions Architect |
| Application Specification | Phase 3 — requirements approved | Tech Lead + Business Analyst |
| Tech Stack + Entry Points | Phase 4 — design approved | Tech Lead |
| Commands + Conventions | Phase 5 — dev standards approved | Tech Lead + Senior Dev |
| Security Architecture | Phase 5 — from Phase 2 threat model + Phase 4 stack | Security Architect + Tech Lead |

**Never fill in Security Architecture before Phase 2.** Controls without a threat to mitigate are generic and often wrong for your stack.

---

## Key files at a glance

| File | Purpose |
|---|---|
| `docs/guides/template-guide.md` | Full guide — start here for a new project |
| `docs/guides/quick-reference.md` | This file — short training guide for layer structure, security propagation, SSDLC gates |
| `docs/guides/agents-and-skills-guide.md` | Six development agents and 29 skill specs — design, decision rationale, eval suites, and implementation priority |
| `docs/guides/quick-reference-agent-and-skills.md` | One-page cheat sheet for agents, skills, commands, and @import state |
| `security/README.md` | Security layer overview — three locations explained |
| `security/policies/secure-coding-standard.md` | Coding rules template with compliance control refs |
| `security/policies/encryption-policy.md` | Algorithm and key management requirements |
| `security/sast/suppression-rules.md` | SAST suppression register — every suppression tracked |
| `security/pen-test/internal-findings-register.md` | Pen test findings tracker — confidential |
| `security/threat-model/stride-model.md` | Operational STRIDE working copy |
| `docs/<layer>/README.md` | How to connect team documents to Claude for each layer |
| `ssdlc/` | Phase-gated outputs — threat model snapshot, user stories, design specs, audit trail |
| `docs/architecture/adr/` | Architecture Decision Records — what was decided, why, and what was rejected |

---

## Agent and skills system

This template ships with a five-agent Claude Code AI system plus a Dev Lead coordinator. Every agent is a fresh, specialist context — the Dev Lead is a command-line coordinator role that spins up the other agents as needed: QA Engineer, Code Reviewer, Security Auditor, Infrastructure Agent, and Tech Researcher execute in their domain.

| To learn about | Read |
|---|---|
| Which agents exist, what they do, how they spawn | `docs/guides/agents-and-skills-guide.md` |
| Available slash commands and skills by agent | `docs/guides/quick-reference-agent-and-skills.md` |
| How layer @imports reach the agents | `docs/guides/agents-and-skills-guide.md` → Section 4 |
| How to write evals to test agent behaviour | `docs/guides/agents-and-skills-guide.md` → Section 9 |

**New to the project?** Read `docs/guides/template-guide.md` first, then `docs/guides/agents-and-skills-guide.md` before opening any `.claude/` files.
