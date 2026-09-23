# AI-SSDLC Project Template

A reusable project template for building secure applications using a structured, phase-gated Secure Software Development Lifecycle (SSDLC). Security is built in at every stage — from architecture validation through to production release — not added at the end.

This template combines a standardised six-layer application structure with a Claude Code context system that gives AI-assisted development accurate, layer-aware guidance without requiring repeated explanation in every prompt.

**New to this template?** Start with `docs/guides/quick-reference.md` for a short visual overview, then `docs/guides/template-guide.md` for full detail.

---

## Template tech stack (example — replace for your project)

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript, RxJS, Angular Material |
| Backend | Spring Boot 3.2, Java 21, Spring Security, Hibernate |
| Database | Microsoft SQL Server 2022, Flyway migrations |
| Infrastructure | On-premises Ubuntu servers, Docker, Nginx, HashiCorp Vault |
| Integration | Spring WebClient, RabbitMQ, Resilience4j, Spring Cloud Contract |
| Security | Semgrep (SAST), OWASP Dependency-Check (SCA), Trivy (containers) |

---

## Project structure

```
project-root/
│
├── CLAUDE.md                        ← Claude Code project-wide context (auto-loaded always)
├── README.md                        ← This file
├── .gitignore
├── .claudeignore
│
├── .claude/                         ← Claude Code configuration
│   ├── settings.json                ← Permissions and allowed commands
│   └── commands/                    ← Custom slash commands
│
├── frontend/                        ← Layer 1: UI — Angular (browser/mobile client)
│   ├── CLAUDE.md                    ← Layer guide — auto-loaded by Claude when working here
│   ├── src/                         ← Components, pages, HTTP client wrappers
│   ├── public/                      ← Static assets
│   └── tests/                       ← Component and user-flow tests
│
├── backend/                         ← Layer 2: API + business logic — Spring Boot
│   ├── CLAUDE.md
│   ├── src/                         ← Services, repositories, domain model
│   ├── api/                         ← Route definitions (one file per resource)
│   └── tests/                       ← Unit and integration tests
│
├── database/                        ← Layer 3: Schema and migrations — SQL Server
│   ├── CLAUDE.md
│   ├── migrations/                  ← Flyway T-SQL scripts (append-only — never edit)
│   ├── schemas/                     ← Canonical schema definitions
│   └── seeds/                       ← Reference data and test fixtures
│
├── infrastructure/                  ← Layer 4: On-prem servers, Docker, Nginx, Vault
│   ├── CLAUDE.md
│   ├── docker/                      ← Dockerfiles and Docker Compose (dev/staging/prod)
│   ├── nginx/                       ← Reverse proxy config and TLS virtual hosts
│   ├── vault/                       ← HashiCorp Vault Agent config and access policies
│   ├── monitoring/                  ← Prometheus, Grafana, Loki, Alertmanager configs
│   └── scripts/                     ← Server hardening, cert renewal, DB backup scripts
│
├── integration/                     ← Layer 5: External connectors and async messaging
│   ├── CLAUDE.md
│   ├── apis/                        ← Third-party API contracts (one file per service)
│   ├── events/                      ← RabbitMQ event schemas versioned in events/schemas/v<N>/
│   └── tests/                       ← Spring Cloud Contract consumer-driven contract tests
│
├── security/                        ← Layer 6: Cross-cutting security workbench
│   ├── CLAUDE.md                    ← Cross-cutting controls, compliance obligations, SLAs
│   ├── README.md                    ← What this layer is — read before adding files here
│   ├── policies/                    ← Team-authored policies: secure-coding-standard.md,
│   │                                    encryption-policy.md — source of truth for all layers
│   ├── sast/                        ← SAST/SCA tool config, Semgrep rules, suppression register
│   ├── pen-test/                    ← Pen test scope, findings register, remediation tracking
│   │                                    (CONFIDENTIAL — confirm .gitignore with security lead)
│   └── threat-model/                ← STRIDE threat model — operational working copy
│                                        (phase-gated snapshot lives in ssdlc/)
│
├── docs/                            ← Supporting documents and guides
│   │
│   ├── guides/                      ← Developer guides
│   │   ├── quick-reference.md       ← Short visual overview — start here
│   │   └── template-guide.md        ← Full guide — every file, every decision explained
│   │
│   ├── architecture/                ← System-level architecture documents
│   │   ├── README.md                ← ADR format, when to write one, naming convention
│   │   └── adr/                     ← Architecture Decision Records
│   │                                    Named: [system]_ADR-NNN_[title]_vN.md
│   │
│   ├── frontend/                    ← Frontend supporting docs
│   │   ├── README.md                ← How to connect team docs to Claude for this layer
│   │   ├── requirements/            ← UX requirements — convert to .md; @import into frontend/CLAUDE.md
│   │   └── design/                  ← Screen annotations (.md — @import); wireframes (PDF — prompt-only)
│   │
│   ├── backend/                     ← Backend supporting docs
│   │   ├── README.md
│   │   ├── requirements/            ← Business requirements — convert to .md; @import into backend/CLAUDE.md
│   │   └── design/                  ← OpenAPI specs, API design docs (.md — @import);
│   │                                    sequence diagrams (PDF — prompt-only)
│   │
│   ├── database/                    ← Database supporting docs
│   │   ├── README.md
│   │   ├── requirements/            ← Entity glossary, data requirements — convert to .md; @import
│   │   └── design/                  ← Data dictionaries (.md — @import); ER diagrams (PDF — prompt-only)
│   │
│   ├── infrastructure/              ← Infrastructure supporting docs
│   │   ├── README.md
│   │   ├── requirements/            ← Infrastructure requirements, SLA targets — convert to .md; @import
│   │   └── design/                  ← Network design, Vault policy design (.md — @import);
│   │                                    topology diagrams (PDF — prompt-only)
│   │
│   ├── integration/                 ← Integration supporting docs
│   │   ├── README.md
│   │   ├── requirements/            ← Vendor API summaries (extract → .md — @import);
│   │   │                                full vendor PDFs kept here for prompt-only reference
│   │   └── design/                  ← Integration design docs (.md — @import);
│   │                                    sequence/event flow diagrams (PDF — prompt-only)
│   │
│   └── security/                    ← Security layer supporting docs
│       ├── README.md                ← Why this is NOT the same as security/policies/
│       ├── requirements/            ← Regulatory PDFs (GDPR, ISO 27001, PCI-DSS) — prompt-only reference
│       └── design/                  ← ASVS mapping, ISO gap analysis, risk assessment (.md — @import);
│                                        security architecture diagrams (PDF — prompt-only)
│
├── ssdlc/                           ← SSDLC phase-gated outputs (versioned, never overwritten)
│   ├── [system]_hitl-audit-trail_vN.md    ← Gate approval log — updated after every gate
│   ├── [system]_threat-model_vN.md        ← Phase 2 snapshot (working copy in security/threat-model/)
│   ├── [system]_user-stories_vN.md        ← Phase 3
│   ├── [system]_component-design_vN.md    ← Phase 4
│   ├── [system]_dev-standards_vN.md       ← Phase 5
│   ├── [system]_security-test-plan_vN.md  ← Phase 6
│   └── [system]_release-checklist_vN.md   ← Phase 7
│
├── architecture/                    ← Architecture input documents (feed Phase 1)
└── diagrams/                        ← Box diagrams (.md) and Mermaid exports (.mmd)
```

---

## Layer boundary rules

| Layer | Can call | Cannot call |
|---|---|---|
| Frontend | `backend/api/` via Angular `HttpClient` only | Database, infrastructure, third-party APIs directly |
| Backend | `database/` via JDBC/Hibernate; `integration/` for external services | Frontend; infrastructure provisioning |
| Database | Accessed by backend only | Any application layer |
| Infrastructure | Provisions the environment all layers run in | Application code or business logic |
| Integration | External services only — translate and forward | Database directly; no business logic |
| Security | Cross-cutting — policies here govern all layers | Layer-specific implementation (that belongs in each layer's CLAUDE.md) |

---

## The three security locations — not duplicates

A common source of confusion. Each serves a distinct purpose:

| Location | What it is | Created by |
|---|---|---|
| Each layer's `CLAUDE.md` — Security Architecture section | How *that layer* implements security (e.g. Spring `@PreAuthorize`, Angular CSP) | Tech Lead + Security Architect at Phase 5 |
| `security/` root layer | Cross-cutting workbench — policies, SAST tooling, threat model, pen test findings | Security engineer — live working files |
| `docs/security/` | Reference inputs — regulatory PDFs, ASVS mapping, gap analysis from auditors/legal | External parties — reference documents |
| `security/policies/` | Internal policies *authored from* the `docs/security/` inputs | Security engineer — output of reading the inputs |

`docs/security/` is the **input**. `security/policies/` is the **output**. They are not duplicates.

---

## SSDLC phase sequence

Each phase ends with a mandatory human approval gate. Requires an explicit `approve`, `reject`, or `approve with conditions: [notes]` — "OK" or "continue" are not valid responses.

```
Phase 1: Architecture Intake & Validation    → Gate 1
Phase 2: Security Threat Modelling           → Gate 2
Phase 3: Requirements & User Stories         → Gate 3
Phase 4: Secure Design Specifications        → Gate 4
Phase 5: Development Standards & Scaffolding → Gate 5
Phase 6: Security Testing Plan               → Gate 6
Phase 7: Release Readiness Review            → Gate 7
```

Artifact naming convention: `[system-name]_[artifact-type]_v[N].md` — versions increment, never overwrite.

---

## Getting started

1. Copy the full project structure to your new project repository
2. Read `docs/guides/quick-reference.md` — short visual overview of the whole structure
3. Read `docs/guides/template-guide.md` — full detail on every file and decision
4. Follow the five-step population sequence (kickoff → Gate 3 → Gate 4 → Gate 5 → ongoing)
5. Do not fill in `<layer>/CLAUDE.md` files before the relevant SSDLC gate is approved — the template is designed to be populated progressively

---

## Key documents

| Document | Location | Purpose |
|---|---|---|
| Quick reference | `docs/guides/quick-reference.md` | Short visual training guide — start here |
| Full template guide | `docs/guides/template-guide.md` | Every file, every decision, common mistakes |
| Agents and skills guide | `docs/guides/agents-and-skills-guide.md` | Five specialist agents and 18 slash commands — design, decision rationale, and implementation priority |
| Security layer overview | `security/README.md` | What the security layer is and how it relates to the other security locations |
| Secure coding standard | `security/policies/secure-coding-standard.md` | Coding rules with compliance control references |
| Encryption policy | `security/policies/encryption-policy.md` | Approved algorithms and key management requirements |
| SAST suppression register | `security/sast/suppression-rules.md` | Every SAST suppression tracked with 90-day review |
| Pen test findings register | `security/pen-test/findings-register.md` | Per-engagement findings tracker (confidential) |
| Threat model (working copy) | `security/threat-model/stride-model.md` | Operational STRIDE model — updated each sprint |
| Threat model (phase snapshot) | `ssdlc/[system]_threat-model_vN.md` | Gate 2 approved snapshot — governance record |
| Architecture Decision Records | `docs/architecture/adr/` | What was decided, why, and what was rejected |
