# AI-SSDLC Project Template Guide

## Who this guide is for

Every developer, tech lead, security architect, and solutions architect working on a project that uses this template. Read this before writing any code or configuring any tooling.

---

## What this template is

This is a reusable project scaffold for building secure applications. It combines two things:

1. **A standardised folder structure** for six application architecture layers (Frontend, Backend, Database, Infrastructure, Integration, Security)
2. **A Claude Code context system** that teaches Claude the architecture, tech stack, business rules, and security controls of your specific project — so you get accurate, layer-aware assistance without repeating yourself in every prompt

The template is designed to be filled in progressively as your project moves through its SSDLC phases. Nothing is invented upfront. The structure exists; the content is added as decisions are made.

---

## Table of contents

- [Who this guide is for](#who-this-guide-is-for)
- [What this template is](#what-this-template-is)
- [Project folder structure at a glance](#project-folder-structure-at-a-glance)
- [Storing supporting documents — Word, PDF, and other team artifacts](#storing-supporting-documents--word-pdf-and-other-team-artifacts)
  - [The fundamental distinction: documents for Claude vs documents for humans](#the-fundamental-distinction-documents-for-claude-vs-documents-for-humans)
  - [Where to store documents — the `docs/<layer>/` structure](#where-to-store-documents--the-docslayer-structure)
  - [How to make Claude automatically aware of a supporting document](#how-to-make-claude-automatically-aware-of-a-supporting-document)
  - [Practical examples — what the business team delivers and what to do with it](#practical-examples--what-the-business-team-delivers-and-what-to-do-with-it)
  - [Example: connecting a business requirements document to Claude](#example-connecting-a-business-requirements-document-to-claude)
  - [Common mistakes](#common-mistakes)
- [The Claude context system — one file per layer](#the-claude-context-system--one-file-per-layer)
  - [Root `CLAUDE.md` — project-wide context](#root-claudemd--project-wide-context)
  - [`<layer>/CLAUDE.md` — layer working guide](#layerclaudemd--layer-working-guide)
  - [How Claude loads context when you're coding](#how-claude-loads-context-when-youre-coding)
  - [The Layer Boundaries section — why it sits inside `<layer>/CLAUDE.md`](#the-layer-boundaries-section--why-it-sits-inside-layerclaudemd)
- [Why this template uses multiple CLAUDE.md files](#why-this-template-uses-multiple-claudemd-files)
  - [What Claude Code actually does with CLAUDE.md files](#what-claude-code-actually-does-with-claudemd-files)
  - [Our recommendation: keep multiple `CLAUDE.md` files for this template](#our-recommendation-keep-multiple-claudemd-files-for-this-template)
  - [When multiple `CLAUDE.md` files are the right call](#when-multiple-claudemd-files-are-the-right-call)
  - [Is this template for small projects?](#is-this-template-for-small-projects)
  - [Pros of the multiple `CLAUDE.md` approach](#pros-of-the-multiple-claudemd-approach)
  - [Understanding the three security locations](#understanding-the-three-security-locations)
  - [`security/policies/` vs `docs/security/` — input and output, not duplicates](#securitypolicies-vs-docssecurity--input-and-output-not-duplicates)
  - [Summary](#summary)
- [Update sequence — both file types on one timeline](#update-sequence--both-file-types-on-one-timeline)
  - [The two file types — one-line summary each](#the-two-file-types--one-line-summary-each)
  - [The update sequence — visualised](#the-update-sequence--visualised)
  - [The same sequence as a table](#the-same-sequence-as-a-table)
  - [What "fully populated" looks like at each step](#what-fully-populated-looks-like-at-each-step)
  - [Why you must not skip ahead](#why-you-must-not-skip-ahead)
- [Adapting this template to your project scope](#adapting-this-template-to-your-project-scope)
  - [The rule: delete unused layers, never leave them blank](#the-rule-delete-unused-layers-never-leave-them-blank)
  - [Common project configurations — what to keep and delete](#common-project-configurations--what-to-keep-and-delete)
  - [What to update in root `CLAUDE.md` when you remove a layer](#what-to-update-in-root-claudemd-when-you-remove-a-layer)
  - [What to update in adjacent layers' `CLAUDE.md` when you remove a layer](#what-to-update-in-adjacent-layers-claudemd-when-you-remove-a-layer)
  - [Partial layer use — when you keep the folder but not all sub-folders](#partial-layer-use--when-you-keep-the-folder-but-not-all-sub-folders)
  - [Checklist: adapting the template at project kickoff](#checklist-adapting-the-template-at-project-kickoff)
- [How to use this template for a new project](#how-to-use-this-template-for-a-new-project)
  - [Step 1 — Project kickoff](#step-1--project-kickoff-solutions-architect--tech-lead)
  - [Step 2 — SSDLC Phase 3: Requirements approved](#step-2--ssdlc-phase-3-requirements-approved-tech-lead--business-analyst)
  - [Step 3 — SSDLC Phase 4: Design approved](#step-3--ssdlc-phase-4-design-approved-tech-lead--architects)
  - [Step 4 — SSDLC Phase 5: Dev Standards approved](#step-4--ssdlc-phase-5-dev-standards-approved-tech-lead--security-architect)
  - [Step 5 — Ongoing](#step-5--ongoing-all-team-members)
- [The Security Architecture section — why it matters](#the-security-architecture-section--why-it-matters)
- [The threat model — what it is and why there are two copies](#the-threat-model--what-it-is-and-why-there-are-two-copies)
  - [What is the threat model?](#what-is-the-threat-model)
  - [Why the threat model matters](#why-the-threat-model-matters)
  - [Why there are two copies](#why-there-are-two-copies)
  - [When to trigger a new Phase 2 snapshot](#when-to-trigger-a-new-phase-2-snapshot)
- [Quick reference — who does what](#quick-reference--who-does-what)
- [Common mistakes to avoid](#common-mistakes-to-avoid)
- [Further reading](#further-reading)

---

## Project folder structure at a glance

```
project-root/
│
├── CLAUDE.md                        ← Project-wide guidance (always loaded by Claude)
├── README.md                        ← Project overview for humans
│
├── .claude/                         ← Claude Code configuration
│   ├── settings.json                ← Permissions and tool settings
│   └── commands/                    ← Custom slash commands (add your own here)
│
├── frontend/                        ← UI layer (Angular)
│   ├── CLAUDE.md                    ← Layer working guide (auto-loaded by Claude)
│   ├── src/
│   ├── public/
│   └── tests/
│
├── backend/                         ← API + business logic (Spring Boot)
│   ├── CLAUDE.md
│   ├── src/
│   ├── api/
│   └── tests/
│
├── database/                        ← Schema and migrations (SQL Server)
│   ├── CLAUDE.md
│   ├── migrations/
│   ├── schemas/
│   └── seeds/
│
├── infrastructure/                  ← On-prem servers, Docker, Nginx, Vault
│   ├── CLAUDE.md
│   ├── docker/
│   ├── nginx/
│   ├── vault/
│   ├── monitoring/
│   └── scripts/
│
├── integration/                     ← External connectors and messaging
│   ├── CLAUDE.md
│   ├── apis/
│   ├── events/
│   └── tests/
│
├── security/                        ← Cross-cutting security artifacts
│   ├── CLAUDE.md
│   ├── policies/
│   ├── sast/
│   ├── pen-test/
│   └── threat-model/
│
├── docs/                            ← Project documentation
│   ├── guides/                      ← Developer guides (you are here)
│   ├── architecture/                ← Architecture decision documents
│   │   └── adr/                     ← Architecture Decision Records
│   │
│   ├── frontend/                    ← Frontend supporting documents
│   │   ├── requirements/            ←   Business/UX requirements (convert to .md for Claude)
│   │   └── design/                  ←   UI wireframes, design specs (PDF/images — human reference)
│   │
│   ├── backend/                     ← Backend supporting documents
│   │   ├── requirements/            ←   Business requirements (convert to .md for Claude)
│   │   └── design/                  ←   Technical design docs (convert to .md for Claude)
│   │
│   ├── database/                    ← Database supporting documents
│   │   ├── requirements/            ←   Data requirements, entity glossary
│   │   └── design/                  ←   ER diagrams, data dictionary (PDF — human reference)
│   │
│   ├── integration/                 ← Integration supporting documents
│   │   ├── requirements/            ←   Third-party API specs received from vendors
│   │   └── design/                  ←   Integration design docs, sequence diagrams
│   │
│   └── security/                    ← Security supporting documents
│       ├── requirements/            ←   Compliance briefs, regulatory guidance (PDF)
│       └── design/                  ←   Security design docs (convert to .md for Claude)
│
└── ssdlc/                           ← SSDLC phase outputs (threat model, user stories, etc.)
```

---

## Storing supporting documents — Word, PDF, and other team artifacts

Business teams and tech teams produce documents throughout a project: requirements briefs, API specifications, data dictionaries, vendor integration guides, regulatory guidance, UX wireframes. This section explains where to store them and — critically — how to make Claude aware of them.

---

### The fundamental distinction: documents for Claude vs documents for humans

Claude Code auto-loads only `CLAUDE.md` files. Every other file format — Word, PDF, Markdown, images — is **not** loaded automatically. Whether Claude can read them at all depends on the format.

| Format | Claude can read it? | Auto-loads? | What to do |
|---|---|---|---|
| `.md` (Markdown) | Yes — natively and fully | Only if `@imported` inside a `CLAUDE.md` | Preferred format for all Claude-accessible docs |
| `.pdf` | Yes — via the Read tool | No — must be explicitly referenced | Use `@docs/backend/requirements/spec.pdf` in the prompt when needed, or convert to `.md` |
| `.docx` (Word) | No — binary format; Claude cannot read it | No | Always convert to PDF or Markdown before expecting Claude to use it |
| `.xlsx` (Excel) | No — binary format | No | Convert to Markdown table or CSV |
| Images (PNG, JPG) | Yes — Claude is multimodal and can view images | No | Reference explicitly in prompt; diagrams with text should be converted to `.md` |

**The practical rule:** if a document needs to influence how Claude writes code in a layer, it must be in Markdown format, stored in `docs/<layer>/`, and `@imported` into that layer's `CLAUDE.md`. Everything else is human reference only.

---

### Where to store documents — the `docs/<layer>/` structure

Supporting documents live in `docs/` with a sub-folder per layer. Each layer sub-folder has two standard sub-folders:

| Sub-folder | What goes here | Format |
|---|---|---|
| `docs/<layer>/requirements/` | Business requirements, functional specs, acceptance criteria, regulatory briefs | Convert to `.md` — Claude needs to read these |
| `docs/<layer>/design/` | Technical design documents, ER diagrams, sequence diagrams, wireframes | `.md` where possible; PDF/image for diagrams Claude does not need to read |

**Example for a backend layer:**

```
docs/
└── backend/
    ├── requirements/
    │   ├── loan-application-requirements.md     ← converted from Word; Claude reads this
    │   └── loan-application-requirements.docx   ← original Word file; human reference only
    └── design/
        ├── loan-service-design.md               ← technical design; Claude reads this
        └── loan-service-sequence-diagram.pdf    ← diagram; human reference only
```

Keep both the original and the Markdown conversion so the business team's source document is preserved.

---

### How to make Claude automatically aware of a supporting document

Storing a document in `docs/backend/requirements/` does nothing on its own — Claude will not read it unless you tell it to.

There are two ways to connect a document to Claude:

---

#### Method 1 — `@import` in the layer's `CLAUDE.md` (auto-loaded every time)

Use this when the document contains information Claude needs in every conversation for that layer — for example, a business requirements document that defines the domain model and user flows.

Add an `@import` line to the layer's `CLAUDE.md`, in the Application Specification section:

```markdown
## Application Specification

@../docs/backend/requirements/[system]_business-requirements_v1.md

<!-- The rest of your Application Specification content -->
```

Claude will now load the requirements document automatically whenever it opens any file in the `backend/` folder — the same way it loads `backend/CLAUDE.md` itself.

**When to use `@import`:**
- Business requirements that define what the layer does (imported at Phase 3)
- API specifications that define the contracts Claude must implement (imported at Phase 4)
- Data dictionaries that define entity names and field definitions (imported at Phase 4)

**When NOT to use `@import`:**
- Large documents (hundreds of pages) — they consume context window on every conversation even when irrelevant
- Documents that are only occasionally needed (vendor reference guides, regulatory PDFs)
- Binary formats — `@import` only works with text-based files (Markdown, plain text)

---

#### Method 2 — Explicit `@` reference in the prompt (on-demand)

Use this when a document is only needed for specific tasks, or when it is too large to auto-load.

```
@docs/backend/design/loan-service-sequence-diagram.pdf
Can you review this sequence diagram and tell me if the error handling in LoanApplicationService.java matches it?
```

Claude will read the document for that conversation only. It is not loaded in future conversations unless you reference it again.

**When to use explicit `@` reference:**
- Large reference documents (vendor API guides, regulatory PDFs)
- Documents only relevant to a specific task (a single migration design, a pen test report)
- PDF or image files that cannot be `@imported`

---

### Practical examples — what the business team delivers and what to do with it

| Document delivered | Format | Where to store | What to do for Claude |
|---|---|---|---|
| Business requirements document | Word (.docx) | `docs/backend/requirements/` | Convert to `.md` → `@import` in `backend/CLAUDE.md` Application Specification |
| API specification from tech lead | Word or PDF | `docs/backend/design/` | Convert to `.md` → `@import` in `backend/CLAUDE.md` |
| Third-party vendor API guide | PDF | `docs/integration/requirements/` | Keep as PDF; reference with `@` in prompt when writing connector code |
| Data dictionary from DBA | Excel | `docs/database/design/` | Convert to Markdown table → `@import` in `database/CLAUDE.md` Data Model section |
| Regulatory compliance brief | PDF | `docs/security/requirements/` | Keep as PDF; key obligations transcribed manually into `security/CLAUDE.md` Compliance Obligations section |
| UX wireframes | PDF or images | `docs/frontend/design/` | Keep as-is; reference with `@` in prompt when building specific screens |
| Sequence diagrams | PDF | `docs/backend/design/` | Keep as PDF; reference with `@` in prompt when reviewing logic |
| ER diagram | PDF or image | `docs/database/design/` | Keep as-is; convert entity list and relationships to Markdown in `database/CLAUDE.md` Data Model section |

---

### Example: connecting a business requirements document to Claude

**Scenario:** The business team delivers `Loan_Application_Requirements_v2.docx`. It defines user flows, business rules, and data fields for the loan application process.

**Step 1 — Convert to Markdown**
```
docs/backend/requirements/loan-application-requirements-v2.md
```
Copy the key content — user flows, business rules, entity definitions — into Markdown format. You do not need to convert every page; focus on what Claude needs to write correct code.

**Step 2 — `@import` into `backend/CLAUDE.md`**

In `backend/CLAUDE.md`, in the Application Specification section:
```markdown
## Application Specification

@../docs/backend/requirements/[system]_business-requirements_v2.md

### Domain Areas
...rest of your existing content...
```

**Step 3 — Store the original**
```
docs/backend/requirements/Loan_Application_Requirements_v2.docx
```
Keep the original Word file in the same folder. It is the business team's authoritative source; the `.md` is your working extract for Claude.

**Step 4 — Update `backend/CLAUDE.md` when the requirements change**

When the business team delivers `_v3.docx`, update the Markdown extract and change the `@import` path to point at `_v3.md`. Do not delete older versions — they are your audit trail.

---

### Common mistakes

| Mistake | Why it matters | What to do instead |
|---|---|---|
| Storing a Word file and expecting Claude to read it | Claude cannot read `.docx` — it is a binary format | Convert to PDF or Markdown first |
| Putting a large PDF in `@import` | Consumes the entire context window on every conversation for that layer | Use explicit `@` reference in the prompt only when that document is needed |
| Storing requirements documents inside `src/` or `api/` | Mixes reference documents with code — confusing for both humans and Claude | Always store supporting documents in `docs/<layer>/` |
| Forgetting to update the Markdown extract when a new version arrives | Claude acts on stale requirements while the team works from updated ones | Update the `.md` extract and `@import` path whenever a new document version is delivered |
| `@importing` a PDF into `CLAUDE.md` | `@import` only works with text-based files | Convert to Markdown first, then `@import` the `.md` version |

---

## The Claude context system — one file per layer

There are two types of Claude context files in this template. Both are automatically loaded — no manual referencing needed.

### Root `CLAUDE.md` — project-wide context

Loaded by Claude in **every conversation** in this project, regardless of which file you are editing.

**Contains:** Project purpose, tech stack summary, full layer map with folder annotations, layer boundary rules, SSDLC phase sequence, artifact naming convention.

**Reusability:** Update the project purpose and tech stack table when starting a new project. The rest is largely reusable.

---

### `<layer>/CLAUDE.md` — layer working guide

Loaded by Claude **automatically** whenever you open any file inside that layer's folder. Stacks on top of the root `CLAUDE.md`.

**Contains everything Claude needs to work in that layer:**

| Section | What it tells Claude |
|---|---|
| Tech Stack | Frameworks, libraries, versions — Claude generates compatible code |
| Commands | How to run, test, build this layer — Claude uses these when asked |
| Application Specification | What the app does, user flows, business rules — Claude understands context |
| Security Architecture | STRIDE threat → stack-specific control — Claude writes secure code by default |
| Key Entry Points | Real file paths — Claude navigates the codebase accurately |
| Conventions | Team patterns — Claude follows them without being asked |
| **Layer Boundaries** | What this layer can/cannot call, integration points — Claude never suggests crossing a boundary |

**Reusability:** The structure is reusable. The content is replaced for every new project.

---

### How Claude loads context when you're coding

```
You open:  backend/src/main/java/.../LoanApplicationService.java

Claude automatically reads:
  1. CLAUDE.md (root)       ← project-wide: layer map, tech stack, phase rules
  2. backend/CLAUDE.md      ← Spring Boot stack, domain model, security controls,
                               boundary rules, integration points

Result: Claude knows your stack, business rules, security controls,
        and boundary constraints — without you explaining any of it in the prompt.
```

This is the same for every layer. Editing `frontend/src/app/apply/apply.component.ts` loads root + `frontend/CLAUDE.md`. Editing `database/migrations/V001__init.sql` loads root + `database/CLAUDE.md`.

---

### The Layer Boundaries section — why it sits inside `<layer>/CLAUDE.md`

Each layer's CLAUDE.md ends with a **Layer Boundaries** section. This is where the architectural rules live — what the layer is responsible for, what it can call (inbound/outbound), what it must never do, and which services it integrates with.

Keeping boundary rules inside the layer's own CLAUDE.md means **one file is the complete reference for that layer** — stack, business rules, security, and boundaries all in one place. Claude loads it automatically. Your team reads one file. Nothing is split across two locations.

---

## Why this template uses multiple CLAUDE.md files

This is a deliberate architectural decision, not an accident. This section explains what the pattern is, why we chose it, and when you should use it — or not.

---

### What Claude Code actually does with CLAUDE.md files

Claude Code's hierarchical loading behaviour is a first-class, documented feature of the tool:

> **Claude Code loads every `CLAUDE.md` file it finds in the current directory and all parent directories, up to the project root — automatically, on every conversation.**

Source: [Claude Code documentation — CLAUDE.md files](https://docs.anthropic.com/en/docs/claude-code/memory#claudemd-files)

This means when a developer opens `backend/src/main/java/.../LoanService.java`, Claude receives:
- Root `CLAUDE.md` — project-wide rules (always)
- `backend/CLAUDE.md` — Spring Boot stack, domain model, security controls, boundary rules (because the file is in `backend/`)

Both files stack. Claude has the full picture for that layer with no manual referencing.

**The filename is mandatory.** The auto-loading behaviour only triggers for files named exactly `CLAUDE.md`. Renaming to `backend-guide.md` or `BACKEND_CONTEXT.md` breaks auto-loading entirely — those files would have to be explicitly `@`-referenced in every prompt.

---

### Our recommendation: keep multiple `CLAUDE.md` files for this template

**Recommendation: one `CLAUDE.md` per layer, plus the root.**

This is the right choice for this template. Here is why.

---

### When multiple `CLAUDE.md` files are the right call

Use one per layer when **layers have genuinely different stacks, tooling, and security controls**. That is the case here:

| Layer | Tech stack | Why a shared file would be noisy |
|---|---|---|
| Frontend | Angular 17, TypeScript, RxJS, Angular Material | Angular-specific patterns (HttpClient, interceptors, AuthGuard, CSP) have nothing in common with Spring Boot |
| Backend | Spring Boot 3.2, Java 21, Hibernate, Spring Security | Spring-specific patterns (@PreAuthorize, @Valid, Logback, WebClient) do not apply to the frontend |
| Database | SQL Server 2022, Flyway, Always Encrypted, Temporal Tables | T-SQL, migration conventions, and column-level encryption are specific to the database layer |
| Infrastructure | Ubuntu, Docker, Nginx, HashiCorp Vault, Jenkins | Server hardening, Docker Compose flags, Nginx TLS config are infrastructure-only concerns |
| Integration | Spring WebClient, RabbitMQ, Resilience4j | Event schemas, circuit breaker config, and webhook validation patterns are specific to this layer |
| Security | Semgrep, SpotBugs, ESLint security plugin | Cross-cutting policy documentation, suppression rules, and SLA tables apply to all layers |

A single root `CLAUDE.md` covering all of the above would be 2,000+ lines. Claude would receive all of it in every conversation — including sections that are irrelevant to the layer being worked on — adding noise and increasing the chance Claude applies the wrong layer's patterns.

With six focused files of 200–400 lines each, Claude receives only what is relevant for the layer being edited.

---

### Is this template for small projects?

No. This template is not suited to small or simple projects, and you should not use it for them.

Consider what this template assumes: six architecture layers with different stacks, a seven-gate SSDLC with mandatory human sign-off, GDPR/ISO 27001/OWASP ASVS compliance obligations, HashiCorp Vault for secrets, Jenkins CI/CD pipelines, STRIDE threat modelling, pen testing scope, Always Encrypted database columns, Spring Cloud Contract consumer tests, and RabbitMQ event schemas. A small project team would spend more time filling in CLAUDE.md files than writing the application.

**This template targets:**
- Enterprise-grade applications with regulated data (financial, healthcare, legal, government)
- Multi-team projects where frontend, backend, database, and infra are owned by different people
- Applications with formal compliance obligations (GDPR, ISO 27001, PCI-DSS, OWASP ASVS)
- Projects following a structured SSDLC with security architect involvement

**For smaller projects**, start with a single root `CLAUDE.md` and add layer-level files only if and when the project grows to the point where context separation provides clear value. A well-structured single file is the right choice when:
- The project has one developer or a very small team
- All layers use the same language and framework (e.g. a Next.js full-stack app)
- There are no formal compliance obligations requiring structured security phases
- The project is a proof-of-concept or prototype

The multiple `CLAUDE.md` structure in this template is justified by the enterprise scope it is designed for — not by any general preference for complexity.

---

### Pros of the multiple `CLAUDE.md` approach

| Benefit | Detail |
|---|---|
| **Scoped context** | Claude only receives what is relevant to the layer being worked on — no cross-layer noise |
| **Layer team ownership** | Each team (frontend, backend, infra) owns and maintains their own file independently |
| **Security controls are specific** | The Security Architecture section in each file maps STRIDE threats to that layer's specific library and framework — not generic advice |
| **Easier to maintain** | A 300-line focused file is easier to keep accurate than a 2,000-line combined file |
| **Boundary enforcement** | Layer Boundaries live in the same file as the stack guide — Claude sees the constraints in the same context as the code patterns |
| **Progressive population** | Each file is filled in as that layer's SSDLC phase is approved — content is never invented upfront |
| **Claude Code native pattern** | Hierarchical loading is documented and officially supported — the template uses the tool as designed |

---

### Understanding the three security locations

New project teams often ask whether the three security-related locations in this template are redundant. They are not — each serves a distinct purpose.

**The three locations:**

| Location | What it is | Purpose |
|---|---|---|
| Each layer's `CLAUDE.md` — Security Architecture section | Inline section inside a layer file | Describes how *that layer* implements security using its own stack |
| `security/` root folder | Sixth application layer — live working files | Cross-cutting policies, tooling, and compliance artifacts that govern *all* layers |
| `docs/security/` | Documentation folder — reference inputs | Regulatory PDFs, compliance gap analysis, OWASP ASVS mapping delivered by legal/auditors |

**Concrete example — JWT authentication:**

- `backend/CLAUDE.md` Security Architecture → "JWT RS256 validated using Spring Security `JwtDecoder`; token claims extracted in `SecurityContext`" ← backend implementation detail
- `security/policies/encryption-policy.md` → "All inter-service tokens must use RS256 asymmetric signing. HS256 is not permitted." ← the cross-cutting policy that drove that backend decision
- `docs/security/design/[system]_asvs-mapping_v1.md` → "ASVS V3.5.1 — tokens must be invalidated on logout — Status: Gap" ← the compliance input that revealed the requirement

**Why you cannot collapse them:**

- The SAST config belongs at `security/sast/semgrep.yml` — an executable config your CI runs, so it cannot live in a docs folder. **Not shipped with this template: you create it and wire it into CI.**
- The ISO 27001 gap analysis PDF delivered by the auditor cannot live in `security/` — it is a reference document, not a working file.
- The Spring `@PreAuthorize` pattern belongs in `backend/CLAUDE.md` not `security/` — it is backend-specific and irrelevant to the frontend or database layers.

**The rule of thumb:**

- Does it apply to **one layer only**? → Put it in that layer's `CLAUDE.md` Security Architecture section.
- Does it apply to **all layers** or create obligations across the project? → Put it in `security/`.
- Was it **delivered by an external team** (legal, auditors, security architect) as a reference document? → Put it in `docs/security/`.

---

### `security/policies/` vs `docs/security/` — input and output, not duplicates

A common question once teams understand the three locations: is `security/policies/` a duplicate of `docs/security/`? Both relate to security policy — but they sit on opposite sides of the same process.

| | `docs/security/` | `security/policies/` |
|---|---|---|
| **Created by** | External parties — auditors, legal, security architects | Your security engineer |
| **What it is** | Reference inputs delivered to your team | Internal working policies authored and enforced by your team |
| **Format** | PDF (regulatory standards, audit reports), or Markdown gap analysis | Markdown — version-controlled, referenced by all layer CLAUDE.md files |
| **Changes when** | An auditor delivers a new gap analysis; a regulator updates a standard | The team tightens a rule, adds a new control, or updates an algorithm requirement |
| **Used by** | Claude via `@import` in `security/CLAUDE.md`; humans for compliance reference | All layers — each layer's Security Architecture section derives its rules from here; CI enforces them via SAST config in `security/sast/` |

**Concrete example — encryption algorithm choice:**

1. Auditor delivers OWASP ASVS L2 mapping → saved to `docs/security/design/[system]_asvs-mapping_v1.md`
2. Security engineer reads it, sees ASVS V6.2.2 prohibits SHA-1 → writes the rule into `security/policies/encryption-policy.md`: *"SHA-1 is prohibited for all cryptographic purposes"*
3. Backend team reads `security/policies/encryption-policy.md` and adds to `backend/CLAUDE.md` Security Architecture: *"SHA-1 prohibited — use SHA-256 minimum (encryption-policy.md V6.2.2)"*
4. CI pipeline enforces it via a Semgrep rule in `security/sast/semgrep.yml` *(you must author this file and the CI job — neither ships with the template)*

`docs/security/` → `security/policies/` → each layer's `CLAUDE.md` → `security/sast/` is the chain. Each step is a different artifact serving a different purpose.

**What NOT to put in `security/policies/`:**
- Full regulatory PDFs → `docs/security/requirements/`
- Gap analysis documents produced by auditors → `docs/security/design/`
- Layer-specific implementation details (e.g. "use `@PreAuthorize` in Spring") → that layer's `CLAUDE.md` Security Architecture section

**Template files provided:** `security/policies/secure-coding-standard.md` and `security/policies/encryption-policy.md` — fill these in at SSDLC Phase 5 (Dev Standards), after the threat model and design are approved.

---

### Summary

| Question | Answer |
|---|---|
| Is this template for small projects? | No — it is designed for enterprise-grade, regulated, multi-team applications |
| Can I rename layer `CLAUDE.md` files? | No — must be `CLAUDE.md` for auto-loading |
| Is multiple `CLAUDE.md` a workaround? | No — it is a documented, first-class Claude Code feature used as designed |
| Should I add a `CLAUDE.md` to every subfolder? | Only if that subfolder has genuinely different context to provide. `frontend/CLAUDE.md` yes; `frontend/src/components/CLAUDE.md` almost certainly no |
| Is `security/` redundant to each layer's Security Architecture section? | No — `security/` owns cross-cutting policies and tooling; each layer's section owns that layer's implementation |
| Is `docs/security/` redundant to `security/`? | No — `security/` holds live working files; `docs/security/` holds reference documents delivered by external teams |
| Is `security/policies/` a duplicate of `docs/security/`? | No — `docs/security/` is the input (delivered by auditors/legal); `security/policies/` is the output your team authors from that input |

---

## Update sequence — both file types on one timeline

This is the section that answers the question: **"I have a new project — what do I update, in what order, and when?"**

There are two file types. They are updated at different times, by different people, for different reasons.

---

### The two file types — one-line summary each

| File type | What it is | Think of it as |
|---|---|---|
| **Root `CLAUDE.md`** | Project-wide context loaded by Claude in every conversation | The project passport — who you are, what you're building, how the layers connect |
| **`<layer>/CLAUDE.md`** | Working guide for one layer — tech stack, commands, business rules, security controls, and boundary rules | The developer handbook — specific to this project's stack, requirements, and architectural constraints |

> **Note:** Boundary rules (what each layer can and cannot call) live at the bottom of each layer's own `CLAUDE.md` in the **Layer Boundaries** section. There is no separate context file — everything Claude needs to understand a layer is in one file.

---

### The update sequence — visualised

```
NEW PROJECT STARTS
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1 — PROJECT KICKOFF                                                   │
│  Who: Solutions Architect + Tech Lead                                       │
│                                                                             │
│  UPDATE:  Root CLAUDE.md                                                    │
│           └── Replace project purpose description                           │
│           └── Update layer map if any layers added or removed               │
│                                                                             │
│  REVIEW:  <layer>/CLAUDE.md → Layer Boundaries section (bottom of each)     │
│           └── Usually copy as-is — boundary rules are reusable              │
│           └── Only change if your architecture deviates from the pattern    │
│                                                                             │
│  DO NOT fill remaining <layer>/CLAUDE.md sections yet — stack not confirmed │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼  SSDLC Phase 1 → Gate 1 → Phase 2 → Gate 2
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2 — AFTER PHASE 3 GATE (Requirements approved)                        │
│  Who: Tech Lead + Business Analyst                                          │
│                                                                             │
│  UPDATE:  <layer>/CLAUDE.md — Application Specification section ONLY        │
│           └── frontend/CLAUDE.md  → routes, user flows, UI business rules   │
│           └── backend/CLAUDE.md   → domain services, API structure, rules   │
│           └── database/CLAUDE.md  → entities, relationships, status flows   │
│           └── integration/CLAUDE.md → external services, event catalogue   │
│                                                                             │
│  DO NOT touch:  Root CLAUDE.md (already done at kickoff)                    │
│  DO NOT fill:   Tech Stack, Commands, Security Architecture yet             │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼  SSDLC Phase 4 → Gate 4
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3 — AFTER PHASE 4 GATE (Design approved)                              │
│  Who: Tech Lead                                                             │
│                                                                             │
│  UPDATE:  <layer>/CLAUDE.md — Tech Stack + Key Entry Points sections        │
│           └── Fill in confirmed framework names and versions                │
│           └── Fill in real file paths for your codebase                     │
│                                                                             │
│  DO NOT fill:   Commands, Security Architecture, Conventions yet            │
│                 (dev standards not approved, threat model not mapped)        │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼  SSDLC Phase 5 → Gate 5
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4 — AFTER PHASE 5 GATE (Dev Standards approved)                       │
│  Who: Tech Lead + Senior Developers + Security Architect                    │
│                                                                             │
│  UPDATE:  <layer>/CLAUDE.md — Commands + Security Architecture + Conventions│
│           └── Commands: actual run/test/build commands for confirmed stack  │
│           └── Security Architecture: Phase 2 STRIDE threats mapped to      │
│               stack-specific controls (most critical section)               │
│           └── Conventions: team-agreed coding patterns                      │
│                                                                             │
│  UPDATE:  security/CLAUDE.md                                                │
│           └── Compliance Obligations (confirmed regulatory scope)           │
│           └── Cross-cutting controls (aligned to all layer security rules)  │
│           └── SAST tool configuration                                       │
│                                                                             │
│  At this point: both file types are fully populated.                        │
│  Claude now has everything it needs to assist accurately in every layer.    │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼  Development sprints begin
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5 — ONGOING (during development)                                      │
│  Who: Whoever makes the change that triggers the update                     │
│                                                                             │
│  Root CLAUDE.md            → update if project scope or layer structure changes │
│  <layer>/CLAUDE.md         → update when: new flows, new services, stack        │
│    └── Layer Boundaries    → update if architectural boundary rules change      │
│    └── other sections      → update for: stack upgrades, security changes,      │
│                              new entities, new compliance obligations            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### The same sequence as a table

| Step | When | File updated | Sections updated | Who |
|---|---|---|---|---|
| 1 | Project kickoff | **Root `CLAUDE.md`** | Project purpose, layer map | Solutions Architect |
| 1 | Project kickoff | **`<layer>/CLAUDE.md` — Layer Boundaries** | Review; adjust only if architecture deviates | Solutions Architect |
| 2 | After Gate 3 (Requirements) | **`<layer>/CLAUDE.md`** | Application Specification only | Tech Lead + BA |
| 3 | After Gate 4 (Design) | **`<layer>/CLAUDE.md`** | Tech Stack + Key Entry Points | Tech Lead |
| 4 | After Gate 5 (Dev Standards) | **`<layer>/CLAUDE.md`** | Commands + Security Architecture + Conventions | Tech Lead + Security Architect |
| 4 | After Gate 5 (Dev Standards) | **`security/CLAUDE.md`** | Compliance obligations, cross-cutting controls, SAST config | Security Architect |
| 5 | Ongoing | Both file types as needed | Whichever section reflects the change made | Whoever made the change |

---

### What "fully populated" looks like at each step

**After Step 1 (kickoff) — Claude knows:**
- What this project is and what layers exist (root `CLAUDE.md`)
- What each layer is allowed to call and what it must not do (Layer Boundaries section in each `<layer>/CLAUDE.md`)
- Nothing about the tech stack, business rules, or security controls yet

**After Step 2 (Gate 3) — Claude additionally knows:**
- What the application does — user flows, business rules, domain entities, external services
- Still no stack-specific guidance (it will use generic patterns until Step 3)

**After Step 3 (Gate 4) — Claude additionally knows:**
- What frameworks and libraries are in use and where the key files are
- Can now write stack-compatible code, but security controls are still generic

**After Step 4 (Gate 5) — Claude additionally knows:**
- Exactly how to run, test, and build each layer
- Which STRIDE threat each security control mitigates, and how to implement it in the specific stack
- Your team's agreed coding conventions
- This is when Claude becomes fully effective as a development assistant

---

### Why you must not skip ahead

Filling in Security Architecture before the threat model (Phase 2) means writing controls with no threat to mitigate — they become generic checklists rather than targeted defences.

Filling in Tech Stack before design is approved (Phase 4) means Claude may generate code for a stack that gets changed, and all that generated code is now inconsistent.

Filling in Application Specification before requirements are approved (Phase 3) means Claude's understanding of the business rules may not match what the team agreed — and it will generate features that miss the mark.

**The template is designed to be filled in progressively. An empty section is better than a wrong one.**

---

## Adapting this template to your project scope

This template ships with six layers. Most projects will not use all six. This section tells you exactly what to do when your project only needs some of them — and what happens if you get it wrong.

---

### The rule: delete unused layers, never leave them blank

**Never leave a layer's `CLAUDE.md` blank or half-empty when that layer does not exist in your project.**

Claude loads every `CLAUDE.md` it finds automatically. A blank file is loaded and provides nothing — it is pure noise. Worse, a partially filled file with leftover example content (loan application flows, Equifax API references) will cause Claude to generate code referencing entities and services that do not exist in your project.

| What you might be tempted to do | What to do instead |
|---|---|
| Leave `frontend/CLAUDE.md` blank because you have no frontend | Delete the entire `frontend/` folder |
| Copy the template and clear only some sections | Delete the folders for layers you will never use |
| Keep all six folders "just in case" | Remove unused folders at project kickoff; add them back if scope expands |
| Put a placeholder like "N/A" in the Tech Stack section | Delete the layer folder; update root `CLAUDE.md` to remove it from the layer map |

---

### Common project configurations — what to keep and delete

#### Configuration A: Backend API + Database only
*Example: Internal data processing service, microservice with no UI, batch job API*

```
KEEP:
  CLAUDE.md (root)        ← update layer map to show only backend + database
  backend/CLAUDE.md       ← fill per SSDLC phases
  database/CLAUDE.md      ← fill per SSDLC phases
  infrastructure/CLAUDE.md ← keep if you own the deployment environment
  security/CLAUDE.md      ← always keep — compliance and cross-cutting controls apply

DELETE:
  frontend/               ← no UI layer
  integration/            ← no external API connectors or messaging
```

**Root `CLAUDE.md` layer map after deletion:**
```
backend/          # API + business logic
├── CLAUDE.md
├── src/
└── tests/

database/         # Schema and migrations
├── CLAUDE.md
├── migrations/
└── schemas/

infrastructure/   # Deployment environment
└── CLAUDE.md

security/         # Cross-cutting security artifacts
└── CLAUDE.md
```

**Layer boundary rules to update in root `CLAUDE.md`:**
```
Remove: "Frontend → calls backend/api/ only via Angular HttpClient"
Remove: "Integration → translates and forwards to/from external services only"
Keep:   "Backend → only layer that reads/writes the database"
Keep:   "Database → accessed by backend only via JDBC/Hibernate"
Keep:   "Infrastructure → provisions the environment"
Keep:   "Security → cross-cutting; policies here are the source of truth"
```

---

#### Configuration B: Backend + Database + External integrations (no UI)
*Example: Headless API consumed by a third-party client, webhook receiver, event-driven service*

```
KEEP:
  CLAUDE.md (root)
  backend/CLAUDE.md
  database/CLAUDE.md
  integration/CLAUDE.md   ← third-party APIs, webhooks, or messaging
  infrastructure/CLAUDE.md
  security/CLAUDE.md

DELETE:
  frontend/               ← no UI — the consuming client owns its own frontend
```

---

#### Configuration C: Full-stack (Frontend + Backend + Database, no external integrations)
*Example: Internal tool, employee portal, admin dashboard with no third-party APIs*

```
KEEP:
  CLAUDE.md (root)
  frontend/CLAUDE.md
  backend/CLAUDE.md
  database/CLAUDE.md
  infrastructure/CLAUDE.md
  security/CLAUDE.md

DELETE:
  integration/            ← no external services, messaging, or webhooks
```

---

#### Configuration D: Full six-layer (all layers active)
*Example: Customer-facing financial application, loan portal, payment platform*

```
KEEP: All six layers — this is what the template ships as
```

This is the configuration the template example (loan application) is built around.

---

### What to update in root `CLAUDE.md` when you remove a layer

The root `CLAUDE.md` has two places that must be updated when you delete a layer:

**1. The layer map code block** — remove the deleted layer's folder and its `CLAUDE.md` entry.

**2. The layer boundary rules** — remove any boundary rule that references the deleted layer.

Example: deleting `frontend/` and `integration/` for a backend-only service:

```
BEFORE (full template):
  - Frontend → calls backend/api/ only via Angular HttpClient
  - Backend → only layer that reads/writes the database; calls integration/ for all external services
  - Database → accessed by backend only via JDBC/Hibernate
  - Infrastructure → provisions the environment
  - Integration → translates and forwards to/from external services only
  - Security → cross-cutting; source of truth for all layer security rules

AFTER (backend + database only):
  - Backend → only layer that reads/writes the database; no direct external API calls without integration layer
  - Database → accessed by backend only via JDBC/Hibernate
  - Infrastructure → provisions the environment
  - Security → cross-cutting; source of truth for all layer security rules
```

---

### What to update in adjacent layers' `CLAUDE.md` when you remove a layer

Each `CLAUDE.md` ends with a Layer Boundaries section that lists integration points. If you remove a layer, any remaining layer that referenced it needs its Layer Boundaries section updated.

| Layer removed | Adjacent layers to update | What to remove |
|---|---|---|
| `frontend/` | `backend/CLAUDE.md` | Remove "Frontend" from Inbound section of Layer Boundaries |
| `integration/` | `backend/CLAUDE.md` | Remove "Integration layer" from Outbound section; note backend now calls external services directly if needed |
| `frontend/` + `integration/` | `backend/CLAUDE.md` | Update both Inbound and Outbound; backend becomes the sole consumer-facing layer |
| `infrastructure/` | All remaining layers | Remove infrastructure references from the "Provisions" rows in each Layer Boundaries |

---

### Partial layer use — when you keep the folder but not all sub-folders

Sometimes you need a layer but only part of what the template provides. In that case, keep the folder and `CLAUDE.md`, delete the sub-folders you do not need, and annotate the `CLAUDE.md` sections you are not using.

**Example: Infrastructure layer — no HashiCorp Vault (using a different secrets manager)**

```
KEEP:
  infrastructure/docker/
  infrastructure/nginx/
  infrastructure/monitoring/
  infrastructure/scripts/

DELETE:
  infrastructure/vault/    ← replaced by AWS Secrets Manager or Azure Key Vault

UPDATE in infrastructure/CLAUDE.md:
  Tech Stack section:    Replace "HashiCorp Vault 1.15" with your actual secrets manager
  Security Architecture: Update the "Secrets in config files" control row to reflect the new tool
  Sub-folder table:      Remove the vault/ row; add a row for the replacement
```

**Example: Security layer — no pen test yet (early project stage)**

```
KEEP:
  security/policies/
  security/sast/
  security/threat-model/

DELETE or leave empty:
  security/pen-test/       ← not yet commissioned; add back at SSDLC Phase 6

UPDATE in security/CLAUDE.md:
  Sub-folder purpose table: Mark pen-test/ as "[Not yet active — scheduled for Phase 6]"
```

---

### Checklist: adapting the template at project kickoff

Run through this checklist at Step 1 (project kickoff) before filling in any CLAUDE.md sections:

```
[ ] Confirmed which of the six layers this project actually uses
[ ] Deleted all unused layer folders entirely (not blanked — deleted)
[ ] Updated root CLAUDE.md — layer map code block reflects only active layers
[ ] Updated root CLAUDE.md — layer boundary rules remove all deleted layer references
[ ] Updated adjacent layers' CLAUDE.md — Layer Boundaries sections no longer reference deleted layers
[ ] Confirmed security/CLAUDE.md is kept (always required — compliance applies regardless of scope)
[ ] Confirmed infrastructure/CLAUDE.md status (keep if team owns deployment; delete if platform team owns it)
[ ] Replaced template example content markers with "[TBD — populate at Phase N]" for sections not yet ready
```

---

## How to use this template for a new project

Follow these steps in order. Do not fill in `<layer>/CLAUDE.md` files before the relevant SSDLC phase is complete — you will be guessing, and Claude will act on wrong information.

---

### Step 1 — Project kickoff (Solutions Architect / Tech Lead)

**Files to review:** `<layer>/CLAUDE.md` → **Layer Boundaries section** (bottom of each file)

The Layer Boundaries section in each layer's CLAUDE.md defines the architectural boundary rules — what the layer is responsible for, what it can call, what it must not do. For most projects using this template, these can be used as-is. Only update them if your architecture deviates from the standard pattern.

| Situation | Action |
|---|---|
| Same layered pattern (Frontend → Backend → DB) | Review as-is. No changes needed |
| Adding a new layer (e.g. a BFF between frontend and backend) | Create a new `<layer>/CLAUDE.md` for the new layer. Update adjacent layers' Layer Boundaries sections to reference the new layer |
| Removing a layer (e.g. no integration layer) | Delete that layer's folder. Update adjacent layers' Layer Boundaries sections to remove references |
| Integration pattern changes (e.g. GraphQL instead of REST) | Update the Layer Boundaries sections in `backend/CLAUDE.md` and `frontend/CLAUDE.md` |

**Also update at this step:**
- Root `CLAUDE.md` — replace the project purpose description and update the layer map if layers were added or removed
- `security/CLAUDE.md` — fill in the Compliance Obligations section (which regulations apply to this project)

---

### Step 2 — SSDLC Phase 3: Requirements approved (Tech Lead + Business Analyst)

**Files to update:** `<layer>/CLAUDE.md` — **Application Specification section only**

This is when you know what the application does. Replace the loan application example with your project's actual flows, entities, and business rules.

| Layer file | What to fill in |
|---|---|
| `frontend/CLAUDE.md` | Key routes, user flows, business validation rules enforced at UI |
| `backend/CLAUDE.md` | Domain areas, service responsibilities, REST API structure, authoritative business rules |
| `database/CLAUDE.md` | Entities, relationships, status workflows, temporal/audit requirements |
| `integration/CLAUDE.md` | External services list, event catalogue, message routing |
| `security/CLAUDE.md` | Confirm or update the compliance obligations table |

**Do not fill in** Tech Stack, Commands, or Security Architecture yet — the stack has not been confirmed and the threat model is not complete.

---

### Step 3 — SSDLC Phase 4: Design approved (Tech Lead + Architects)

**Files to update:** `<layer>/CLAUDE.md` — **Tech Stack and Key Entry Points sections**

This is when the component design is signed off and the stack is confirmed.

| Section | What to fill in |
|---|---|
| Tech Stack | Exact framework names, library versions, and tooling confirmed in Phase 4 |
| Key Entry Points | Real file paths in your codebase (not example paths from the template) |

**Do not fill in** Commands or Security Architecture yet — those depend on Phase 5 (dev standards sign-off and threat model → stack mapping).

---

### Step 4 — SSDLC Phase 5: Dev Standards approved (Tech Lead + Security Architect)

**Files to update:** `<layer>/CLAUDE.md` — **Commands, Security Architecture, and Conventions sections**

This is the most critical update. After Phase 5 gate approval, every `<layer>/CLAUDE.md` should be fully populated.

| Section | Who fills it in | Source |
|---|---|---|
| Commands | Tech Lead / Senior Developer | Confirmed build tooling from Phase 4 design |
| Security Architecture | Security Architect + Tech Lead | Phase 2 STRIDE threat model → mapped to Phase 4 stack decisions |
| Conventions | Tech Lead | Team agreements from Phase 5 dev standards document |

**The Security Architecture section is stack-specific, not generic.** Do not write "use secure coding practices." Write the specific control tied to the specific STRIDE threat, implemented in the specific library being used. See the example below.

**Example of correct Security Architecture entry (backend):**

| Threat | Control | Implementation |
|---|---|---|
| Broken authentication (STRIDE-S) | JWT RS256 + refresh rotation | `nimbus-jose-jwt` issues RS256 tokens; access token 15 min; refresh token hashed in DB, rotated every use; reuse triggers full session invalidation |

**Example of incorrect entry (too generic — Claude cannot act on this):**
```
✗ "Use secure authentication"
✗ "Protect against injection attacks"
✗ "Validate all inputs"
```

---

### Step 5 — Ongoing (all team members)

**Files to keep updated:** All `<layer>/CLAUDE.md` files and `security/CLAUDE.md`

| Event | File to update |
|---|---|
| New user flow added | `frontend/CLAUDE.md` and `backend/CLAUDE.md` — Application Specification |
| New external service added | `integration/CLAUDE.md` — External Services table + new `integration/apis/<service>.md` |
| New entity or table added | `database/CLAUDE.md` — Data Model and Data Classification tables |
| New server or environment added | `infrastructure/CLAUDE.md` — Server Topology table |
| Threat model updated (see triggers in `security/CLAUDE.md`) | `security/CLAUDE.md` + relevant layer's Security Architecture section |
| Tech stack version upgrade | Relevant `<layer>/CLAUDE.md` — Tech Stack section |
| New compliance obligation identified | `security/CLAUDE.md` — Compliance Obligations table |

---

## The Security Architecture section — why it matters

The Security Architecture section in each `<layer>/CLAUDE.md` is what makes Claude write secure code by default, without you having to add security instructions to every prompt.

When it is filled in correctly:
- Claude writing a new Angular component will automatically use the correct token storage pattern and not suggest `localStorage`
- Claude writing a new Spring Boot endpoint will automatically add `@PreAuthorize`, use a typed DTO with `@Valid`, and avoid logging PII fields
- Claude writing a new SQL Server migration will automatically flag if you add a PII column without an Always Encrypted entry in the data classification table

When it is empty or generic: Claude falls back to general best practices, which may not match your stack, your threat model, or your compliance requirements.

**The Security Architecture section is populated at Phase 5 and owned by the Security Architect in collaboration with the Tech Lead.** It is the team's primary mechanism for embedding security into every line of Claude-assisted code.

---

## The threat model — what it is and why there are two copies

### What is the threat model?

The threat model answers one question: **"what could go wrong with this system, and what stops it?"**

STRIDE is the framework used to think through attack categories systematically — so nothing obvious is missed before the system is built.

| Letter | Threat category | What an attacker does | Example for a loan portal |
|---|---|---|---|
| **S** | Spoofing | Impersonates a legitimate user or service | Forges a JWT token to access another applicant's loan data |
| **T** | Tampering | Modifies data in transit or at rest without authorisation | Injects SQL to change a loan application status to APPROVED |
| **R** | Repudiation | Denies performing an action; no proof exists | Approver denies authorising a loan; no audit log exists to prove otherwise |
| **I** | Information disclosure | Reads data they should not have access to | PII columns returned to a user who only has read access to their own record |
| **D** | Denial of service | Makes the system unavailable to legitimate users | API flooded with unauthenticated requests, taking the service down |
| **E** | Elevation of privilege | Gains access beyond what they are authorised for | Regular user accesses an admin endpoint with no role check enforced |

For every component in the system, the model works through each STRIDE category and records the threat, which component is affected, how likely and severe the attack is, and — critically — **which specific control stops it** (named code, config, or infrastructure — not a generic description).

### Why the threat model matters

- Forces the team to think like an attacker *before* building, not after a pen test reveals gaps
- Every "mitigated" row is a traceable link between a threat and the control that stops it — if that control is removed or misconfigured, the threat is live again
- Directly feeds the Security Architecture section in each layer's `CLAUDE.md` — each control named in the threat model becomes the specific control Claude enforces when writing code for that layer
- Feeds the security test plan (Phase 6) — every STRIDE category needs at least one test type covering it
- Is primary evidence auditors request under ISO 27001 (A.8.8) and OWASP ASVS (V1.1)

### Why there are two copies

| Copy | Location | Purpose | Who updates it | When it changes |
|---|---|---|---|---|
| **Phase-gated snapshot** | `ssdlc/[system]_threat-model_vN.md` | Governance record — approved at SSDLC Gate 2; versioned, never overwritten | SSDLC Agent (Phase 2) | Only when a formal Phase 2 re-run is approved through Gate 2 |
| **Operational working copy** | `security/threat-model/stride-model.md` | Living document — updated sprint by sprint as the application evolves | Security engineer | Any sprint that adds a new integration, data store, auth change, or architectural change |

The SSDLC snapshot is a governance artifact — auditors use it to see exactly what was reviewed and approved at each gate. It must remain unchanged.

The working copy is a living engineering artifact — it must stay accurate as the codebase changes. Keeping them separate means the audit trail is clean and the working document is always current.

### When to trigger a new Phase 2 snapshot

Not every change to `security/threat-model/stride-model.md` requires a new Gate 2 approval. Trigger a formal Phase 2 re-run when:

| Change | Action |
|---|---|
| New external API integration added | New trust boundary — re-run Phase 2, produce new snapshot, re-approve Gate 2 |
| Authentication model changed | New Spoofing / Elevation threats likely — re-run Phase 2 |
| New PII or financial data field added | New Information Disclosure threats likely — re-run Phase 2 |
| New data store introduced | New Tampering and Information Disclosure threats — re-run Phase 2 |
| Pen test finds an unmodelled threat | Add to working copy immediately; schedule Phase 2 re-run if High or Critical |
| Routine sprint with no architectural change | Update working copy only — no new snapshot needed |

**Template file:** `security/threat-model/stride-model.md` — includes trust boundary map, threat register, open threats tracker, critical gap list, and re-review trigger log. Fill in at SSDLC Phase 2.

---

## Quick reference — who does what

| File | Written by | Updated when |
|---|---|---|
| Root `CLAUDE.md` | Solutions Architect | Project kickoff; layer structure changes |
| `<layer>/CLAUDE.md` — **Layer Boundaries** | Solutions Architect | Architectural pattern changes (rare) |
| `<layer>/CLAUDE.md` — Application Specification | Tech Lead + BA | Phase 3 requirements approved |
| `<layer>/CLAUDE.md` — Tech Stack + Entry Points | Tech Lead | Phase 4 design approved |
| `<layer>/CLAUDE.md` — Commands + Conventions | Tech Lead + Senior Dev | Phase 5 standards approved |
| `<layer>/CLAUDE.md` — Security Architecture | Security Architect + Tech Lead | Phase 5 (from Phase 2 threat model + Phase 4 stack) |
| `security/CLAUDE.md` — Compliance Obligations | Security Architect | Project kickoff; new regulatory requirements |
| `security/CLAUDE.md` — Cross-cutting controls | Security Architect | Phase 5; threat model updates |

---

## Common mistakes to avoid

| Mistake | Why it matters | What to do instead |
|---|---|---|
| Filling in Security Architecture before Phase 2 (threat model) | Security controls without threat context are generic and often wrong for your stack | Wait until the STRIDE threat model is approved at Gate 2, then map each threat to a stack-specific control |
| Writing generic security rules ("validate all inputs") | Claude cannot act on vague instructions — it will apply generic patterns that may not match your stack | Write specific controls: library name, configuration, which STRIDE threat it mitigates |
| Adding a new layer but only updating its own CLAUDE.md | Adjacent layers still have stale boundary rules — Claude may suggest calling the new layer from a layer that should not | Update the new layer's CLAUDE.md Layer Boundaries section AND the adjacent layers' Layer Boundaries sections to reference the new layer |
| Leaving example content (loan application) in the files when starting a new project | Claude will generate code referencing loan application entities and flows that do not exist in your project | Replace all example content in Phase 3 (Application Specification) before writing any feature code |
| Treating `security/policies/` as optional | Layer CLAUDE.md security rules have no authoritative source to align to — they drift independently per layer | Write `security/policies/` documents at Phase 5; they are the source of truth that all layer security rules must align to |
| Updating only the working copy (`security/threat-model/stride-model.md`) after a significant architectural change without triggering a Phase 2 re-run | The Gate 2 snapshot becomes stale — auditors see an approved model that no longer reflects the system, and new threats go unreviewed | When a new external integration, authentication change, new data store, or new data classification is added, trigger a Phase 2 re-run and produce a new approved snapshot |
| Writing a pen test finding into the findings register but not updating the working threat model | The threat model has a gap for a threat that has been confirmed in production — future design decisions will not account for it | When a pen test finding reveals an unmodelled threat, add it to `security/threat-model/stride-model.md` immediately; schedule a Phase 2 re-run if the finding is High or Critical |
| Using the `ssdlc/` threat model snapshot as the day-to-day working reference | The snapshot is frozen at Gate 2 approval and becomes outdated as the system evolves — developers making architectural decisions will reference stale threat context | Use `security/threat-model/stride-model.md` as the live working reference; the `ssdlc/` snapshot is for governance and audit only |
| Treating threat modelling as a one-time Phase 2 activity | Threats evolve as the application grows — a model that was complete at Gate 2 may miss threats introduced by later features or integrations | Update `security/threat-model/stride-model.md` on every sprint that changes trust boundaries, data classification, or external integrations |

---

## Further reading

### Start here

| Document | Location | Purpose |
|---|---|---|
| **Quick reference** | `docs/guides/quick-reference.md` | Short training guide — key points, visual flows, all sections at a glance |
| **Full template guide** | `docs/guides/template-guide.md` | This document — complete detail for every decision in the template |
| **Agents and skills guide** | `docs/guides/agents-and-skills-guide.md` | Six specialist Claude Code agents and 29 skill specs — design rationale, implementation, and operational guidance |
| **Agent quick reference** | `docs/guides/quick-reference-agent-and-skills.md` | One-page cheat sheet for agents, skills, commands, and @import state |

### Layer guides

| Document | Location | Purpose |
|---|---|---|
| Frontend layer detail | `frontend/CLAUDE.md` | Angular stack, flows, security controls |
| Backend layer detail | `backend/CLAUDE.md` | Spring Boot stack, domain model, security controls |
| Database layer detail | `database/CLAUDE.md` | SQL Server, migrations, data classification |
| Infrastructure detail | `infrastructure/CLAUDE.md` | On-prem servers, Docker, Nginx, Vault |
| Integration detail | `integration/CLAUDE.md` | External services, RabbitMQ, contract tests |
| Security cross-cutting | `security/CLAUDE.md` | Compliance, SAST rules, threat model triggers |
| Architectural boundaries | `<layer>/CLAUDE.md` → Layer Boundaries section | What each layer can and cannot do |

### Supporting document guides — how to connect team documents to Claude

| Document | Location | Purpose |
|---|---|---|
| Frontend supporting docs | `docs/frontend/README.md` | UX requirements, wireframes, screen annotations |
| Backend supporting docs | `docs/backend/README.md` | Business requirements, OpenAPI specs, sequence diagrams |
| Database supporting docs | `docs/database/README.md` | Data dictionaries, ER diagrams, entity glossary |
| Infrastructure supporting docs | `docs/infrastructure/README.md` | Network design, topology diagrams, capacity plans |
| Integration supporting docs | `docs/integration/README.md` | Vendor API summaries, integration design docs |
| Security supporting docs | `docs/security/README.md` | Compliance inputs, ASVS mapping, regulatory guidance |
| Architecture decision records | `docs/architecture/README.md` | ADR format, when to write one, naming convention |

### Security layer templates

| Document | Location | Purpose |
|---|---|---|
| Security layer overview | `security/README.md` | What the security layer is, the three-location distinction, sub-folder contents |
| Secure coding standard | `security/policies/secure-coding-standard.md` | Rules for input validation, auth, secrets, encryption, logging — with compliance control refs |
| Encryption policy | `security/policies/encryption-policy.md` | Approved algorithms, key lengths, prohibited algorithms |
| SAST suppression register | `security/sast/suppression-rules.md` | Active suppression tracker with 90-day review cycle |
| Pen test findings register | `security/pen-test/internal-findings-register.md` | Per-engagement findings tracker with SLA compliance table |
| STRIDE threat model (working copy) | `security/threat-model/stride-model.md` | Operational threat model with trust boundary map and re-review triggers |

### SSDLC artifacts

| Document | Location | Purpose |
|---|---|---|
| SSDLC phase outputs | `ssdlc/` | Threat model snapshot, user stories, design specs, HITL audit trail |
| Architecture inputs | `architecture/` | Target architecture documents that feed Phase 1 |
| Architecture Decision Records | `docs/architecture/adr/` | Significant decisions — what was chosen, why, and what alternatives were rejected |
