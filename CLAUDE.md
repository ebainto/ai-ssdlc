# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is a reusable SSDLC project template for building secure applications. It provides a standardised six-layer application structure and a Claude Code context system that gives accurate, layer-aware assistance without requiring repeated explanation in every prompt.

Development progresses from an approved target architecture through seven gated phases to a production-ready release, with mandatory human approval (HITL gates 1–7) at each phase boundary.

**New to this template?** Same entry point as the README: start with
`docs/guides/quick-reference.md` for a short visual overview, then
`docs/guides/template-guide.md` for full detail — it explains every file, who
updates what, and the five-step update sequence for a new project.

## Template Tech Stack (example — replace per project)

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript, RxJS, Angular Material |
| Backend | Spring Boot 3.2, Java 21, Hibernate, Spring Security |
| Database | SQL Server 2022, Flyway migrations |
| Infrastructure | On-prem Ubuntu servers, Docker, Nginx, HashiCorp Vault |
| Integration | Spring WebClient, RabbitMQ, Resilience4j |
| Security tooling | Semgrep (SAST), OWASP Dependency-Check (SCA), Trivy |

## Application Layer Structure

Each layer has its own `CLAUDE.md` loaded automatically by Claude when working in that directory. Layer boundary rules, integration points, and architectural constraints are defined at the bottom of each layer's `CLAUDE.md` — one source of truth per layer.

```
frontend/               # UI — browser/mobile client
├── CLAUDE.md           #   Layer guide: Angular stack, flows, security controls, boundaries
├── src/                #   Components, pages, API client wrappers
├── public/             #   Static assets
└── tests/              #   Component and user-flow tests

backend/                # API + business logic
├── CLAUDE.md           #   Layer guide: Spring Boot stack, domain model, security controls, boundaries
├── src/                #   Services, repositories, types
├── api/                #   Route definitions (one file per resource)
└── tests/              #   Service and repository unit tests

database/               # Schema and migrations
├── CLAUDE.md           #   Layer guide: SQL Server, Flyway, data classification, boundaries
├── migrations/         #   Append-only Flyway T-SQL scripts
├── schemas/            #   Canonical schema definitions
└── seeds/              #   Reference data and test fixtures

infrastructure/         # On-prem servers, Docker, Nginx, Vault
├── CLAUDE.md           #   Layer guide: server topology, Docker config, security controls, boundaries
├── docker/             #   Dockerfiles and Docker Compose (dev, staging, prod)
├── nginx/              #   Reverse proxy config, TLS virtual hosts
├── vault/              #   HashiCorp Vault Agent config and access policies
├── monitoring/         #   Prometheus, Grafana, Loki, Alertmanager configs
└── scripts/            #   Server hardening, cert renewal, DB backup scripts

integration/            # External connectors and events
├── CLAUDE.md           #   Layer guide: WebClient, RabbitMQ, resilience patterns, boundaries
├── apis/               #   One contract file per external service
├── events/             #   Event schemas versioned in events/schemas/v<N>/
└── tests/              #   Spring Cloud Contract consumer tests

security/               # Cross-cutting security artifacts
├── CLAUDE.md           #   Layer guide: compliance, control ownership, SAST rules, boundaries
├── policies/           #   Secure coding standards, encryption policy, secrets rules
├── sast/               #   SAST/SCA tool configurations and suppression rules
├── pen-test/           #   Pen test scope, findings register, remediation tracking
└── threat-model/       #   STRIDE threat model (operational copy; phase output in ssdlc/)

docs/                   # Project documentation
├── guides/             #   Developer guides — start with template-guide.md for new projects
├── architecture/       #   Architecture decision documents
│   └── adr/            #   Architecture Decision Records
├── frontend/           #   Frontend supporting docs (requirements/, design/)
├── backend/            #   Backend supporting docs — @import .md files into backend/CLAUDE.md
│   └── design/         #   Includes OpenAPI specs — consumed by backend and frontend teams
├── database/           #   Database supporting docs — data dictionary, ER diagrams
├── infrastructure/     #   Infrastructure supporting docs — network design, topology, capacity plan
├── integration/        #   Integration supporting docs — vendor API specs, sequence diagrams
├── security/           #   Security supporting docs — policy-level and compliance-level inputs only
└── agent-skills/       #   Written specs for each agent skill — reference only, never loaded

examples/               # Worked reference projects — NEVER @imported
└── loan-portal/        #   A full design set showing expected depth. Read it to
                        #   calibrate your own documents; do not wire it in.
```

### Every `docs/<layer>/` folder starts empty

The template ships **no** design documents of its own, and every layer's
`@import` line is **commented out**. That is deliberate: a live import pointing
at a file that does not exist imports nothing silently, and a live import
pointing at *someone else's* domain is worse — Claude would treat that domain as
yours on every prompt.

Write your own documents into `docs/<layer>/design/` or
`docs/<layer>/requirements/`, then uncomment the matching `@import` in that
layer's `CLAUDE.md`. Paths are relative to the importing file, so the correct
form is `@../docs/...` — `@./docs/...` resolves to `<layer>/docs/<layer>/...`
and fails silently.

### Layer `CLAUDE.md` files contain placeholders, not a domain

Names in `[square brackets]` — `[actors]`, `[core_records]`, `[CoreRecord]Service`
— are yours to replace. They are placeholders on purpose. The surrounding
patterns (temporal tables, Row-Level Security, the Spring Security filter chain,
resilience settings) are reusable as-is; only the names change.

### Layer boundary rules
- **Frontend** → calls `backend/api/` only via Angular `HttpClient`; no direct DB, infra, or third-party API access
- **Backend** → only layer that reads/writes the database; calls `integration/` for all external services; no static asset serving
- **Database** → accessed by backend only via JDBC/Hibernate; no business logic; no direct frontend or integration access
- **Infrastructure** → provisions the environment all other layers run in; never contains application code or business logic
- **Integration** → translates and forwards to/from external services only; business decisions belong in backend
- **Security** → cross-cutting; policies here are the source of truth that all layer security rules must align to

### SSDLC artifact naming convention

`[system-name]_[artifact-type]_v[N].[ext]` — versions increment, never overwrite.

### SSDLC phase outputs

```
ssdlc/            # Phase outputs (threat model, user stories, design specs, etc.)
architecture/     # Architecture input documents
diagrams/         # Box diagrams (.md) and Mermaid exports (.mmd)
compliance/       # Regulatory and compliance mapping outputs
```

## SSDLC Phase Sequence

```
Phase 1: Architecture Intake & Validation    → Gate 1
Phase 2: Security Threat Modelling           → Gate 2
Phase 3: Requirements & User Stories         → Gate 3
Phase 4: Secure Design Specifications        → Gate 4
Phase 5: Development Standards & Scaffolding → Gate 5
Phase 6: Security Testing Plan               → Gate 6
Phase 7: Release Readiness Review            → Gate 7
```

Each gate requires an explicit `approve`, `reject`, or `approve with conditions: [notes]` response before the next phase begins. "OK" or "continue" are not valid gate responses.

## Key Artifacts

These are the phase outputs the gated commands read. **You produce them** — no
command in this project generates them, and none ship with the template.

| Artifact | Folder | Produced by | Read by |
|---|---|---|---|
| HITL audit trail | `./ssdlc/` | `/gate` — the only writer of gate decisions | every gated command |
| Threat model | `./ssdlc/` | you, at Phase 2 (operational copy: `security/threat-model/stride-model.md`) | `/security-audit` (SA1) |
| User stories | `./ssdlc/` | you, at Phase 3 | `/run-tests`, `/new-feature` |
| Component design specs | `./ssdlc/` | you, at Phase 4 | `/new-component`, `/code-review` |
| Dev standards | `./ssdlc/` | you, at Phase 5 (layer rules live in each layer's `CLAUDE.md`) | `/code-review` |
| Security test plan | `./ssdlc/` | you, at Phase 6 | `/run-tests` |
| Release checklist | `./ssdlc/` | you, at Phase 7 | Gate 7 review |

Audit trail format contract: `ssdlc/GATE-FORMAT.md`. Template to copy:
`ssdlc/_TEMPLATE_hitl-audit-trail_v1.md`.

Earlier versions of this table credited skills `S3`–`S9` of an "SSDLC Agent".
That agent belongs to a separate global workbench and is **not** part of this
project — there is no `S`-prefixed skill here. The commands in
`.claude/commands/` are the whole surface.

## Security context — how it reaches every layer

`security/CLAUDE.md` is **not** @imported here. It is auto-loaded only when working directly inside the `security/` folder. This is intentional.

Cross-cutting security rules propagate to other layers through the **Security Architecture section** in each layer's `CLAUDE.md`. At Phase 5, the security architect reads `security/CLAUDE.md` and translates each rule into a stack-specific control for that layer. That translation is the designed mechanism — not a global @import.

**When to reference `security/CLAUDE.md` explicitly from another layer:**

```
@security/CLAUDE.md
[Your question — e.g. does this new JWT claim require a threat model update?]
```

Use an explicit reference when:
- Adding a new external integration and checking threat model triggers
- Making an auth or session change that may affect cross-cutting controls
- Verifying a new data field against the compliance obligations table
- Checking remediation SLA before raising a security finding

**Do not** @import `security/CLAUDE.md` into other layer CLAUDE.md files — SAST suppression rules, pen test context, and compliance obligation tables are irrelevant noise when writing Angular components or SQL migrations.

## Save Discipline

After every skill output: act on the **Save instruction block** immediately. Never proceed to the next skill without saving. If running `/compact`, save all open outputs first.
