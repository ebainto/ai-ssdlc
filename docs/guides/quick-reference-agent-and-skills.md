# Agent and Skills — Quick Reference

Training highlights. For full documentation, see [`agents-and-skills-guide.md`](agents-and-skills-guide.md).

---

## RDE complete harness coverage

| # | Layer | Status | Evidence |
|---|---|---|---|
| 1 | Instructions | ✅ Present | Root `CLAUDE.md` + 6 layer `CLAUDE.md` files + `~/.claude/CLAUDE.md` |
| 2 | Context Delivery | ✅ Present | `docs/guides/` knowledge base + layer `CLAUDE.md` files (auto-loaded) |
| 3 | Context Management | ✅ Present | `.claudeignore`, progressive disclosure in `CLAUDE.md`, layer isolation |
| 4 | Tool Interface | ✅ Present | `.claude/settings.json` allowlist (git, mvn, npm, docker-compose) |
| 5 | Execution Environment | ❌ Absent | No build, test or lint tooling ships with the template — the layer folders are empty by design. You add the toolchain for your stack. |
| 6 | Durable State | ✅ Present | Layer `CLAUDE.md` files, `ssdlc/` phase outputs, `docs/architecture/adr/`, findings register |
| 7 | Orchestration | ✅ Present | 9 slash commands, Dev Lead as sole orchestrator with `Agent` tool |
| 8 | Subagents | ✅ Present | 6 specialist agents in `.claude/agents/` |
| 9 | Skills | ✅ Present | Implemented inline in the 6 agent bodies; 29 written specs in `docs/agent-skills/` (reference only — not loaded) |
| 10 | Verification & Observability | ⚠️ Partial | Jest test suite (9 tests + 17+ reference patterns), test guides, coverage reporting; Prometheus/Grafana/Alertmanager/Loki scaffolded but not configured |

**Score: 8.5/10 fully present.**

### Status Summary — Why Present vs Partial

| Layer | Status | Why |
|---|---|---|
| 1. Instructions | ✅ Present | All three context layers defined: project root + 6 layer-specific + global override. Complete instruction coverage. |
| 2. Context Delivery | ✅ Present | Knowledge base in `docs/guides/` (5 master guides) + auto-loaded layer CLAUDE.md files. All context delivered to Claude on session start. |
| 3. Context Management | ✅ Present | Mechanisms for controlling context size: `.claudeignore` filters, progressive disclosure in CLAUDE.md, strict layer isolation prevents unnecessary files from loading. |
| 4. Tool Interface | ✅ Present | `.claude/settings.json` defines exactly which CLI tools are allowed (git, mvn, npm, docker-compose). Permissions explicitly configured and enforced. |
| 5. Execution Environment | ⚠️ Partial | **Dev execution complete** (npm scripts, Jest, TypeScript build). **Production execution scaffolded** (Docker Compose, Nginx, Vault folders exist but configs not populated). Non-critical gap — app code and container configs are project-specific, not template. |
| 6. Durable State | ✅ Present | Persistent storage across sessions: layer CLAUDE.md files, `ssdlc/` phase outputs (versioned), `docs/architecture/adr/` (ADRs), `security/pen-test/internal-findings-register.md`. No data loss on session break. |
| 7. Orchestration | ✅ Present | 9 slash commands (`/new-feature`, `/code-review`, `/run-tests`, etc.) route work to specialist agents. Dev Lead is single orchestrator — no conflicting agent routing. |
| 8. Subagents | ✅ Present | 6 specialist agents defined in `.claude/agents/`: Dev Lead (OA), Code Reviewer (CR), QA Engineer (QA), Security Auditor (SA), Tech Researcher (TR), Infrastructure Agent (IA). Each has defined role and tool access. |
| 9. Skills | ✅ Present | 29 skill specs across 6 agents: OA1–OA7 (orchestration), CR1–CR4 (review), QA1–QA5 (testing), SA1–SA4 (security audit), TR1–TR5 (research), IA1–IA4 (infrastructure). Complete skill inventory with no gaps. |
| 10. Verification & Observability | ⚠️ Partial | **Verification ✅ Complete:** Jest test suite (9 tests), test guides (4 docs), coverage reporting (`npm test -- --coverage`), GitHub Actions CI/CD. **Observability ❌ Missing:** Prometheus/Grafana/Alertmanager/Loki scaffolded in `infrastructure/monitoring/` but configs not created. |

---

**Why Layer 5 is Partial (acceptable):**
- Production infrastructure configs (docker-compose.yml, nginx configs, vault policies) are meant to be customized per project deployment. The scaffolding is intentional — a template that projects populate with their own infrastructure needs.
- Dev execution (npm test, npm build) is fully functional and used daily during development.
- This is a template project, not a deployed application. Production config population happens when projects fork from this template.

**Why Layer 10 is Partial (not yet Present):**
- **Verification ✅ Complete:** Jest test suite (9 passing tests) + comprehensive test documentation (4 guides) + coverage reporting + GitHub Actions CI/CD pipeline. Verification is systematic and automated.
- **Observability ❌ Not Implemented:** Prometheus, Grafana, Alertmanager, Loki folders exist but configuration files not created. Missing: scrape configs, dashboard templates, alert rules, log aggregation setup, health checks, metrics collection endpoints.
- **To reach Present:** Need to create `infrastructure/monitoring/prometheus.yml`, `infrastructure/monitoring/grafana/dashboards/`, `infrastructure/monitoring/alertmanager.yml`, and wire up application metrics endpoints.

---

## Project setup

```
ai-ssdlc/
├── .claude/
│   ├── agents/        ← 6 specialist agents
│   ├── skills/        ← 29 skill playbooks
│   ├── commands/      ← 9 slash commands
│   └── settings.json  ← shared team permissions
├── .claudeignore      ← filters Claude's context
├── CLAUDE.md          ← project instructions (auto-loaded)
├── docs/guides/       ← 5 knowledge base docs + this guide
├── frontend/CLAUDE.md ← layer guide (auto-loaded)
├── backend/CLAUDE.md  ← layer guide (auto-loaded)
├── database/CLAUDE.md ← layer guide (auto-loaded)
├── infrastructure/CLAUDE.md ← layer guide (auto-loaded)
├── integration/CLAUDE.md    ← layer guide (auto-loaded)
├── security/CLAUDE.md       ← cross-cutting (explicit @import only)
├── ssdlc/             ← SSDLC phase outputs
├── architecture/      ← architecture documents
├── diagrams/          ← box diagrams and Mermaid exports
└── compliance/        ← regulatory compliance outputs
```

---

## ai-ssdlc specialist agents

Slash commands are the trigger. Skills run internally — never typed directly.

| Agent | Trigger slash command (skills) | Specialist in |
|---|---|---|
| **dev-lead** | `/new-feature` `/new-api` `/new-component` | Feature planning, multi-agent coordination, gate enforcement |
| **code-reviewer** | `/code-review` | Layer CLAUDE.md compliance, boundary checks, security control verification |
| **qa-engineer** | `/run-tests` | JUnit, Jasmine/Karma, AC-driven TDD, real-database integration tests |
| **security-auditor** | `/security-audit` | STRIDE verification, SAST suppression audit, pen test cross-reference |
| **tech-researcher** | `/research` `/write-adr` | Upgrade spikes, CVE checks, ADR authoring |
| **infrastructure-agent** | `/infra-check` | Docker Compose, HashiCorp Vault, Nginx, Prometheus/Grafana |

> Slash commands = skills. The `/command-name` you type IS the skill trigger. See "Working with Commands" below.

---

## Skills reference — all 27

| Skill | Used by | Does |
|---|---|---|
| OA1 — Triage and route | dev-lead | Checks gate pre-conditions, identifies what you need, routes to the right skill |
| OA2 — Session status | dev-lead | Table of work done this session and what's next |
| OA3 — Check gate status | dev-lead | Maps a story to affected layers and recommended execution sequence |
| OA4 — Plan a feature | dev-lead | Reads HITL audit trail, reports all 7 gates and any outstanding conditions |
| OA5 — New feature pipeline | dev-lead | Full pipeline: QA first → implement → review → audit → PR |
| OA6 — New API pipeline | dev-lead | Spec check → QA → implement → review → security audit → PR |
| OA7 — New component pipeline | dev-lead | Layer-aware pipeline: frontend component or backend service variant |
| CR1 — Review a layer | code-reviewer | Checklist: conventions, boundaries, security controls, tests, DoD |
| CR2 — Review security controls | code-reviewer | Per-control verification table — missing control = Critical violation |
| CR3 — Review test coverage | code-reviewer | AC to test mapping — missing security AC = Critical DoD violation |
| CR4 — Review report | code-reviewer | Structured verdict: APPROVED / CHANGES REQUIRED / REJECTED |
| QA1 — Write unit tests | qa-engineer | One passing + one failing case per AC; security ACs always included |
| QA2 — Write contract tests | qa-engineer | Real database only — no persistence-layer mocks |
| QA3 — Write integration tests | qa-engineer | Consumer-driven, matches OpenAPI spec exactly |
| QA4 — Audit test coverage | qa-engineer | AC to test gap table — flags DoD and Gate 6 blockers |
| QA5 — Write security acceptance tests | qa-engineer | Auth, input validation, audit log, PII exclusion, rate limit |
| SA1 — Audit threat model | security-auditor | Verifies every Mitigated STRIDE control is present in the diff |
| SA2 — Audit SAST suppressions | security-auditor | Checks justification blocks — missing block = Critical blocker |
| SA3 — Check pen test findings | security-auditor | Cross-references open findings against the diff |
| SA4 — Produce security finding | security-auditor | Confidential finding card — appended to findings register only |
| TR1 — Check library versions | tech-researcher | Current vs latest stable + CVEs via web search |
| TR2 — Research upgrade path | tech-researcher | Breaking changes, migration guide, effort rating, rollback plan |
| TR3 — Check existing ADRs | tech-researcher | Scans `docs/architecture/adr/` — always runs before TR4 |
| TR4 — Write or update ADR | tech-researcher | Full ADR with alternatives table — status always starts as Proposed |
| TR5 — Research spike | tech-researcher | Time-boxed technology investigation with adoption recommendation |
| IA1 — Plan infrastructure | infrastructure-agent | Maps feature to Vault, Nginx, Docker Compose, monitoring config needed |
| IA2 — Review infrastructure | infrastructure-agent | Vault policy, Docker config, Nginx, monitoring — per-rule citations |
| IA3 — Validate monitoring | infrastructure-agent | Service × Prometheus × alerts × dashboard — any gap = deployment blocker |
| IA4 — Infrastructure change request | infrastructure-agent | Structured document saved to `infrastructure/change-requests/` |

---

## Agent roster

| Agent | File | Trigger | Tools | When to use |
|---|---|---|---|---|
| **Dev Lead** | `.claude/agents/dev-lead.md` | `/new-feature`, `/new-api`, `/new-component`, `"dev mode"` | Read, Bash, Agent, Write | Start every development session here. Plans work, checks gates, and coordinates all other agents. |
| **Code Reviewer** | `.claude/agents/code-reviewer.md` | `/code-review`, `"review layer [name]"` | Read only | Review code against layer CLAUDE.md standards. Fresh instance — no prior context. |
| **QA Engineer** | `.claude/agents/qa-engineer.md` | `/run-tests`, `"write tests for story [ID]"` | Read, Write | Write tests BEFORE implementation. AC-driven. Never mocks the database. |
| **Security Auditor** | `.claude/agents/security-auditor.md` | `/security-audit`, `"audit against threat model"` | Read, Write (findings register only) | Verify STRIDE mitigations. All findings confidential → findings register only. |
| **Tech Researcher** | `.claude/agents/tech-researcher.md` | `/research [topic]`, `/write-adr [decision]` | Read, Write, WebSearch | Version audits, upgrade paths, research spikes, ADR authoring. No gate dependency. |
| **Infrastructure Agent** | `.claude/agents/infrastructure-agent.md` | `/infra-check plan [story]`, `/infra-check review`, `/infra-check monitoring` | Read, Write | Plan and review Vault, Nginx, Docker, monitoring changes. Requires Gate 1. |

---

## The three-folder model

```
.claude/
  agents/     Agent definitions (identity, tools, system prompt)       ← Claude Code native
  commands/   Slash command entry points (/new-feature, /run-tests)    ← Claude Code native
  skills/     Standalone skill definition files (one per skill)        ← Project convention
```

- Type `/name` → Claude Code reads `.claude/commands/name.md` → activates the instruction
- Skill files in `docs/agent-skills/` are documentation only — Claude Code never loads them. The copy that runs is the `### SKILL <ID>` section in the agent body
- Skills are implemented inside `.claude/agents/` files; the skills folder documents them

---

## Slash commands — cheat sheet

| Command | Activates | Gate required | What it does |
|---|---|---|---|
| `/new-feature [story-ID]` | Dev Lead → OA5 | Gate 3 + Gate 5 | Full feature pipeline: QA first → implement → review → audit → PR |
| `/new-api [METHOD] [path]` | Dev Lead → OA6 | Gate 5 | API pipeline: spec check → QA → implement → review → security audit → PR |
| `/new-component [Name] [layer]` | Dev Lead → OA7 | Gate 5 | Component pipeline: layer-aware (frontend vs backend variant) |
| `/code-review [scope]` | Code Reviewer | Gate 5 | Direct code review without Dev Lead pipeline |
| `/run-tests [story-ID or component]` | QA Engineer | Gate 3 | Write tests directly for a story or component |
| `/security-audit [scope]` | Security Auditor | Gate 2 | Direct security audit without Dev Lead pipeline |
| `/research [topic or "versions" or "upgrade X"]` | Tech Researcher | None | Version audit (TR1), upgrade research (TR2), or spike (TR5) |
| `/write-adr [decision topic]` | Tech Researcher | None | Check existing ADRs (TR3) then write or update one (TR4) |
| `/infra-check plan [story]` | Infrastructure Agent | Gate 1 | Plan infra requirements for a feature (IA1 + IA4) |
| `/infra-check review [scope]` | Infrastructure Agent | Gate 1 | Review infra-as-code changes (IA2) |
| `/infra-check monitoring` | Infrastructure Agent | Gate 1 | Validate monitoring coverage across all services (IA3) |

> All pipeline commands (`/new-feature`, `/new-api`, `/new-component`) spawn all required sub-agents automatically — you do not need to run `/run-tests`, `/code-review`, or `/security-audit` separately when using the pipeline.

---

## Skills per agent — ID reference

### Dev Lead (OA)
| ID | Name | What it does |
|---|---|---|
| OA1 | Triage and route | Identifies what you need, checks gate pre-conditions, routes to the right skill |
| OA2 | Session status | Table of what has been done this session and what's next |
| OA3 | Check gate status | Reads HITL audit trail — reports all 7 gates |
| OA4 | Plan a feature | Maps a story to layers and recommends execution sequence |
| OA5 | New feature pipeline | Full 7-step pipeline for a user story |
| OA6 | New API pipeline | 8-step pipeline for a new endpoint (always includes Security Auditor) |
| OA7 | New component pipeline | Layer-aware pipeline — frontend and backend variants |

### Code Reviewer (CR)
| ID | Name | What it does |
|---|---|---|
| CR1 | Review a layer | Checklist: conventions, boundaries, security controls, tests, DoD |
| CR2 | Review security controls | Per-control verification table — missing control = Critical |
| CR3 | Review test coverage | Maps each AC to a test — missing security AC = Critical |
| CR4 | Review report | Structured report: APPROVED / CHANGES REQUIRED / REJECTED |

### QA Engineer (QA)
| ID | Name | What it does |
|---|---|---|
| QA1 | Write unit tests | AC-driven: passing case + failing case per AC; security AC = explicit security test |
| QA2 | Write contract tests | Consumer-driven contract test matching OpenAPI spec exactly |
| QA3 | Write integration tests | Real database only — no mocks; full stack coverage |
| QA4 | Coverage gap analysis | AC → test mapping table; flags DoD violations |
| QA5 | Test quality review | Audits existing test files against QA standards |

### Security Auditor (SA)
| ID | Name | What it does |
|---|---|---|
| SA1 | Audit threat model | Verifies every Mitigated STRIDE control exists in the diff |
| SA2 | Audit SAST suppressions | Checks suppression justification blocks — missing = Critical |
| SA3 | Check pen test findings | Cross-references open findings against the diff |
| SA4 | Produce security finding | Writes confidential finding card to findings register — never to conversation |

### Tech Researcher (TR)
| ID | Name | What it does |
|---|---|---|
| TR1 | Check library versions | Version audit across all layers — fetches latest stable + CVEs via WebSearch |
| TR2 | Research upgrade path | Breaking changes, migration guide, effort rating, rollback plan for one library |
| TR3 | Check existing ADRs | Searches `docs/architecture/adr/` — must run before TR4 to prevent duplicates |
| TR4 | Write or update an ADR | Full ADR template with alternatives table — status always starts as Proposed |
| TR5 | Research spike | Time-boxed investigation of a technology or library with adoption recommendation |

### Infrastructure Agent (IA)
| ID | Name | What it does |
|---|---|---|
| IA1 | Plan infrastructure | Maps feature changes to config files (Vault, Nginx, Docker, monitoring) — fires IA4 |
| IA2 | Review infrastructure | Checklist review of Vault policies, Docker config, Nginx, monitoring — per-rule citations |
| IA3 | Validate monitoring coverage | Service × Prometheus × alerts × dashboard — any gap = deployment blocker |
| IA4 | Infrastructure change request | Structured document: what to change, where, in which file — saved to `infrastructure/change-requests/` |

---

## SSDLC Gates and HITL approval checkpoints

This project enforces a 7-gate Human-In-The-Loop (HITL) approval sequence. Every gate is a mandatory checkpoint — no phase proceeds until a human explicitly approves it. Gates are recorded in `ssdlc/[system]_hitl-audit-trail_vN.md` in this project.

### The 7 gates

| Gate | SSDLC Phase | What is being approved | Artifact produced | Unlocks |
|---|---|---|---|---|
| **Gate 1** | Phase 1 — Architecture Intake & Validation | Target architecture validated — all 8 capability layers defined, security and DevSecOps present | `ssdlc/[system]_hitl-audit-trail_vN.md` | Infrastructure Agent (`/infra-check`) |
| **Gate 2** | Phase 2 — Security Threat Modelling | STRIDE threat model reviewed — all threats identified, mitigations mapped, no Critical gaps | `ssdlc/[system]_threat-model_vN.md` | Security Auditor (`/security-audit`) |
| **Gate 3** | Phase 3 — Requirements & User Stories | User stories approved — all ACs testable, security ACs present, compliance mapped | `ssdlc/[system]_user-stories_vN.md` | QA Engineer (`/run-tests`) |
| **Gate 4** | Phase 4 — Secure Design Specifications | Component designs and API contracts approved — security controls specified per component | `ssdlc/[system]_component-design_vN.md` | — |
| **Gate 5** | Phase 5 — Development Standards & Scaffolding | Coding standards and CI/CD pipeline approved — Definition of Done confirmed | `ssdlc/[system]_dev-standards_vN.md` | Code Reviewer (`/code-review`), all pipeline commands |
| **Gate 6** | Phase 6 — Security Testing Plan | Security test plan approved — SAST/DAST/pen test scope and pass criteria confirmed | `ssdlc/[system]_security-test-plan_vN.md` | Release readiness |
| **Gate 7** | Phase 7 — Release Readiness Review | Go/No-go for production — all security, quality, and operational checks satisfied | `ssdlc/[system]_release-checklist_vN.md` | Production deployment |

### How to approve a gate

At each gate the SSDLC phase output is presented. You must type one of three responses — no other input counts as approval:

```
approve
reject
approve with conditions: [your notes]
```

`"OK"`, `"yes"`, `"continue"`, `"let's go"` are **not** valid responses. The agent stops and waits until one of the three above is received.

### Gate approval is logged

Every gate decision is appended to `ssdlc/[system]_hitl-audit-trail_vN.md`:

```
| Gate | Name              | Decision    | Conditions noted   | Date       |
|------|-------------------|-------------|-------------------|------------|
|  1   | Architecture      | Approved    |                   | 2026-09-20 |
|  2   | Threat model      | Conditional | Admin endpoint ... | 2026-09-20 |
|  3   | Requirements      | Pending     |                   |            |
```

### How to check gate status

Ask the Dev Lead at any time:
```
"check gate status"
```
Dev Lead runs OA3 — reads `ssdlc/[system]_hitl-audit-trail_vN.md` and reports all 7 gates with dates and any outstanding conditions.

### Gate pre-conditions — quick check

Agents refuse to run if their required gate is not approved. The Dev Lead enforces this automatically.

| Before spawning | Requires | Why |
|---|---|---|
| QA Engineer | Gate 3 | Acceptance criteria must exist before tests can be written |
| Code Reviewer | Gate 5 | Coding standards and Security Architecture must exist before review |
| Security Auditor | Gate 2 | STRIDE threat model must exist before audit |
| Infrastructure Agent | Gate 1 | Architecture must be validated before infra planning |
| Tech Researcher | No gate | Research can begin at any time |

### Gate procedure — checklist per phase

**Before requesting Gate 1 (Architecture):**
```
[ ] All 8 capability layers defined in the architecture document
[ ] Security layer includes: auth, secrets management, encryption
[ ] Data ownership defined per service
[ ] DevSecOps pipeline designed
[ ] Monitoring and observability designed
[ ] Compliance requirements identified
[ ] Architecture principles documented
[ ] Run /gate-readiness-check 1 to verify
```

**Before requesting Gate 2 (Threat model):**
```
[ ] STRIDE table complete — all 6 categories covered
[ ] Every threat has a named mitigation control
[ ] No Critical threats with no mitigation (these block approval)
[ ] Data flow diagram produced showing trust boundaries
[ ] Affected components named (not generic)
[ ] Run /gate-readiness-check 2 to verify
```

**Before requesting Gate 3 (Requirements):**
```
[ ] Every architecture layer has at least one user story
[ ] Every STRIDE threat mitigation has a corresponding story
[ ] Every compliance requirement is covered by a story
[ ] All acceptance criteria are testable (Given/When/Then)
[ ] Security ACs present — not just functional ACs
[ ] Must-priority compliance stories in scope for Sprint 1/2
[ ] Run /gate-readiness-check 3 to verify
```

**Before requesting Gate 4 (Design):**
```
[ ] Component design card exists for every architecture component
[ ] API contracts defined for all service interfaces
[ ] Data models include sensitivity classification (PII, financial, etc.)
[ ] Sequence diagrams produced for top 3 critical flows
[ ] Security controls specified per component (not just at perimeter)
[ ] Every user story from Gate 3 has an implementing component
[ ] Run /gate-readiness-check 4 to verify
```

**Before requesting Gate 5 (Dev standards):**
```
[ ] Repository structure defined
[ ] Secure coding standards written for the languages in the stack
[ ] Branch, PR, and commit standards documented
[ ] CI/CD pipeline stages defined with pass/fail thresholds
[ ] Definition of Done checklist agreed by the team
[ ] Security Architecture sections populated in all layer CLAUDE.md files
[ ] Run /populate-security-arch then /gate-readiness-check 5
```

**Before requesting Gate 6 (Test plan):**
```
[ ] SAST tooling named with pass threshold (no Critical/High)
[ ] Dependency scan tooling named with pass threshold
[ ] DAST scope defined for staging environment
[ ] Pen test scope defined for externally facing components
[ ] Remediation SLAs agreed: Critical 24h, High 7d, Medium 30d, Low 90d
[ ] All STRIDE threat categories have at least one test type covering them
[ ] Run /gate-readiness-check 6 to verify
```

**Before requesting Gate 7 (Release / Go-No-Go):**
```
[ ] SAST scan: zero Critical/High unresolved
[ ] Dependency scan: zero Critical CVEs
[ ] DAST scan on staging: zero Critical findings
[ ] Secrets scan: clean
[ ] Unit test coverage ≥ 80%
[ ] Integration tests passing
[ ] Contract tests passing
[ ] No open P1/P2 bugs
[ ] Monitoring and alerting configured and verified (IA3 passing)
[ ] Rollback plan documented and tested
[ ] All Gate 1–6 approvals recorded in audit trail
[ ] Run /gate-readiness-check 7 to verify
```

---

## Layer CLAUDE.md @imports — current state

When you add an @import to a layer CLAUDE.md, every agent that loads that layer receives the imported document automatically. No agent configuration needed — the layer file is the single update point.

| Layer CLAUDE.md | @imported document | Purpose |
|---|---|---|
| `backend/CLAUDE.md` | `docs/backend/design/openapi-spec_v1.yaml` | API contract — 9 endpoints, request/response schemas |
| `frontend/CLAUDE.md` | `docs/backend/design/openapi-spec_v1.yaml` | Same contract — frontend must conform to backend API |
| `database/CLAUDE.md` | `docs/database/design/loan-portal_data-dictionary_v1.md` | Column-level data dictionary for all 6 tables |
| `infrastructure/CLAUDE.md` | `docs/infrastructure/design/loan-portal_infrastructure-design_v1.md` | Server topology, network design, Vault paths, monitoring |
| `integration/CLAUDE.md` | `docs/integration/requirements/external-services-summary_v1.md` | Auth0, Equifax, SendGrid, DocuSign, RabbitMQ contracts |
| `security/CLAUDE.md` | `docs/security/design/loan-portal_asvs-mapping_v1.md` | OWASP ASVS Level 2 control mapping — all requirements |

**Rules:** YAML and Markdown files can be @imported directly. Convert Word docs to Markdown first. Large PDFs (100+ pages): reference with `@` in the prompt only. When a document updates, increment its version suffix and update the @import line in the relevant layer CLAUDE.md files.

---

## Evals — testing agent behaviour

**What is an eval?** A YAML test file that asks an agent a prompt and checks whether the response is correct. The same idea as a unit test — but for agent behaviour, not application code.

**Why the team needs evals:** When a skill file is edited, the agent may quietly stop following the old rule. No error is shown. The first sign of a problem is an agent routing to the wrong layer, missing a security check, or leaking a finding into the chat. Evals catch this before it reaches a real session.

| | Skills | Evals |
|---|---|---|
| **What** | What the agent must do | Does the agent actually do it |
| **Format** | Markdown instruction file | YAML test cases |
| **Lives in** | `docs/agent-skills/[agent]/` | `evals/[agent]/` (project root) |
| **Run** | Loaded at session start automatically | `claude plugin eval evals/` — run manually after skill changes |

**Both are always required.** Skills without evals are untested. Evals without skills have nothing to test.

---

### The five eval suites — at a glance

| Suite | Agent | Cases | What it protects the team from |
|---|---|---|---|
| `dev-lead/triage-routing.yaml` | Dev Lead | 8 | Wrong routing (backend story → wrong layer), gate bypass (spawning Code Reviewer before Gate 5), Dev Lead giving advice instead of routing |
| `dev-lead/pipeline-coordination.yaml` | Dev Lead | 8 | Developer implementing before QA writes tests, Security Auditor not triggered on auth/PII changes, pipeline not closing with `/create-pr` |
| `qa-engineer/tdd-gate.yaml` | QA Engineer | 9 | Tests written after implementation (defeats TDD), database mocked in unit tests (masks real bugs), QA writing implementation code instead of tests |
| `code-reviewer/layer-review.yaml` | Code Reviewer | 9 | Hardcoded secrets passing review, missing `@PreAuthorize` on endpoints, PII logged, layer boundary violations, reviewer modifying source files |
| `security-auditor/confidentiality.yaml` | Security Auditor | 10 | Finding details in conversation or PR descriptions, register overwritten, wrong SLA assigned to severity, exploit steps produced in chat |

---

### Running evals

```bash
# Run a single suite
claude plugin eval evals/dev-lead/triage-routing.yaml

# Run all suites for one agent
claude plugin eval evals/dev-lead/

# Run all evals in the project (do this before committing any skill change)
claude plugin eval evals/
```

### Reading the output

```
✅ route-backend-feature           PASS
❌ gate-block-code-review-without-gate5   FAIL
     Expected: contains "Gate 5"
     Got:      "Sure — let me spawn the Code Reviewer now."
```

| Result | Action |
|---|---|
| `✅ PASS` | Nothing — move on |
| `❌ FAIL — Expected: contains X` | Open the named skill file → find missing behaviour → make it explicit |
| `❌ FAIL — Got: Y (not_contains X)` | Confidentiality or safety violation — fix skill before any other work |

**Fix rule: never edit the eval to make a wrong behaviour pass. Fix the skill.**

### Adding a regression eval case

When an agent makes a mistake in a real session, add a case to the relevant eval file immediately:

```yaml
  - id: regression-2026-09-21-dev-lead-wrote-code-directly
    description: "Regression: Dev Lead wrote controller code instead of routing to QA Engineer"
    input: "Implement the GET /applicants/me endpoint for story BE-042"
    expect:
      contains_all:
        - "QA Engineer"
      not_contains_any:
        - "@GetMapping"
```

### Who does what

| Role | Action |
|---|---|
| Tech Lead | Runs `claude plugin eval evals/` after any skill change. Writes eval cases for new skills. |
| Security Lead | Adds regression cases to `evals/security-auditor/confidentiality.yaml` when a new confidentiality pattern is found. |
| Any team member | Reports the exact prompt used when an agent makes a mistake — Tech Lead writes the regression eval. |
| Everyone | Never edit an eval to pass wrong behaviour. The eval is the specification. |

---

## Key rules — never forget

| Rule | Why |
|---|---|
| QA Engineer is ALWAYS first | Tests drive implementation (TDD). Dev Lead enforces this in OA5/OA6/OA7. |
| Code Reviewer and Security Auditor are always fresh agents | No prior context = unbiased review. Never fork these agents. |
| Security Auditor findings are confidential | Goes to `security/pen-test/internal-findings-register.md` only. Never in conversation, PR, or commit. |
| Never mock the database in integration tests | Mock at HTTP boundary only. Real database for persistence tests. |
| Every violation cites a CLAUDE.md rule | "Bad practice" is not a finding. "Violates backend/CLAUDE.md Security Architecture — Audit Logging" is. |
| Security ACs are never optional | A security AC with no test = Critical DoD violation. Non-negotiable. |
| Read layer CLAUDE.md before any review or test | Framework, naming, and standards are discovered from the file — never assumed. |
| Skills define behaviour — evals verify it | Write evals for every skill that gates a pipeline stage before going to production. |

---

## Working with Commands

**Basic usage:** type any slash command followed by a description of what you want.

```
/new-feature — add loan status tracking to the payment dashboard
/new-api GET /api/v1/invoices/{invoiceNr} — retrieve a single invoice by composite key
/run-tests InvoiceImportService — focus on duplicate detection and chunk boundary
/security-audit — full project scan including auth config
/code-review — review my current changes and prepare a PR
/research spring-boot upgrade
/write-adr — JWT vs session cookies for the auth approach
/infra-check plan BE-012
```

Pipeline commands (`/new-feature`, `/new-api`, `/new-component`) spawn all sub-agents automatically — QA first, then Code Reviewer, then Security Auditor. You do not need to run `/run-tests`, `/code-review`, or `/security-audit` separately when using a pipeline command.

---

## Typical session flow

```
Developer starts:
  "dev mode" or /new-feature BE-012
      ↓
Dev Lead checks gate status (OA3)
      ↓
Dev Lead reads the user story (OA5 Step 1)
      ↓
Dev Lead spawns QA Engineer → tests written (QA1)
      ↓
Developer implements
      ↓
Dev Lead spawns Code Reviewer → CR1 + CR2 + CR3 → CR4 report
      ↓
  If APPROVED:
    Dev Lead spawns Security Auditor (if triggered) → SA1 → "N findings recorded"
      ↓
    "Run /create-pr"
  If CHANGES REQUIRED:
    Relay findings → developer fixes → Code Reviewer spawned again
```

---

## New team member — where to start

Read in this order. Each step takes less than 30 minutes.

| Step | Action |
|---|---|
| 1 | Read `docs/guides/template-guide.md` — project layers, CLAUDE.md hierarchy, SSDLC phases |
| 2 | Read `docs/guides/quick-reference.md` — security propagation model, SSDLC gates summary |
| 3 | Read `docs/guides/agents-and-skills-guide.md` — agents, skills, calling sequences |
| 4 | Read this file — one-page daily reference |
| 5 | Open Claude Code in project root, type `/new-feature` and describe what you want to build |

**Three things to know before writing any code:**
1. Never hardcode a secret — all secrets come from Vault via the sidecar (see `infrastructure/CLAUDE.md`)
2. Never write a security finding in a PR or commit — findings go to `security/pen-test/internal-findings-register.md` only
3. Never approve a gate without reading what it produced — `ssdlc/[system]_hitl-audit-trail_vN.md` is the record

---

## Production readiness — at a glance

| Component | Status |
|---|---|
| All 6 layer CLAUDE.md files (populated) | ✅ Complete |
| All 6 layers have @imported design documents | ✅ Complete |
| 6 specialist agents + 29 skill specs | ✅ Complete |
| 9 slash commands | ✅ Complete |
| Security policy files (5) | ✅ Complete |
| SSDLC 7-gate structure enforced | ✅ Complete |
| `evals/` — 5 suites defined, to be created via `claude plugin eval` | ⚠️ Pending — recreate in `evals/` at project root |
| App code (`src/`) + Jenkinsfile | ⚠️ Template scaffolds — project-specific |

**RDE score: 8 of 10.** Evals moved to `evals/` (project root) — recreate all five suites via `claude plugin eval`. App code and Jenkinsfile being empty is expected — project-specific. See `agents-and-skills-guide.md` Section 12 for the full assessment.

---

*Full documentation: [`agents-and-skills-guide.md`](agents-and-skills-guide.md)*
*Last updated: 2026-09-21 — removed `.claude/evals/` (wrong location); evals now live in `evals/` at project root, run via `claude plugin eval`*
