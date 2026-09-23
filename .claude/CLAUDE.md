# AI-SSDLC Project — Claude Code Instructions

**This project is self-contained.** Its workflow is the seven-gate SSDLC defined
in the root `CLAUDE.md`, driven by the eleven commands in `.claude/commands/`, the
`/critique` skill in `.claude/skills/`, and the five agents in `.claude/agents/`.
That is the whole surface — if a command,
agent or artifact is not in this repository, it is not part of this workflow.

Note on precedence: Claude Code **concatenates** CLAUDE.md files rather than
overriding them, so a personal `~/.claude/CLAUDE.md`, if you have one, is loaded
alongside this file. No in-project file can unload it. Should that ever conflict
with the rules here, **this project's files win for work inside this
repository** — the layer `CLAUDE.md` files, the gate mechanism and the commands
below are authoritative. Anything a broader instruction set offers that is not
defined in this repository is out of scope for this project.

---

## Project Context

- **Project name:** ai-ssdlc
- **Purpose:** Reusable Secure Software Development Lifecycle template
- **Tech stack:** See root `CLAUDE.md` and layer-specific `CLAUDE.md` files
- **Structure:** 6 capability layers + security artifacts

---

## Layer-Specific Guidance

Claude Code automatically loads context from layer CLAUDE.md files when you work in each directory:

```
frontend/CLAUDE.md          — UI layer rules, frameworks, boundaries
backend/CLAUDE.md           — API layer rules, domain logic, boundaries
database/CLAUDE.md          — Schema, migrations, boundaries
infrastructure/CLAUDE.md    — Servers, containers, deployment, boundaries
integration/CLAUDE.md       — External connectors, event schema, boundaries
security/CLAUDE.md          — Cross-cutting security policies, compliance
```

When working in a layer directory, that layer's `CLAUDE.md` is loaded automatically.

---

## Cross-Cutting Guidance

When working in the project root or non-layer directories:

### SSDLC Outputs
These folders are created on demand by the SSDLC phase that produces the artifact.
None of them exist in the bare template — do not assume their contents.
- Phase artifacts: `ssdlc/`
- Architecture: `architecture/`
- Diagrams: `diagrams/`
- Compliance: `compliance/`

### Documentation
- **Start here:** `docs/guides/template-guide.md`

---

## How Claude Code Works Here

1. **In a layer directory** (e.g., `backend/`) → that layer's CLAUDE.md is added to context
2. **Always** → root `CLAUDE.md` and this file are both in context
3. **Global** → `~/.claude/CLAUDE.md`, if present, is also in context (concatenated, not overridden)

---

## Key Principles

- **Layer boundaries are strict** — See each layer's CLAUDE.md for interaction rules
- **Save discipline** — Act on save instructions before moving to next task
- **Security first** — All layer changes must align with `security/CLAUDE.md` policies
- **Version artifacts** — `[system]_[type]_v[N].[ext]` — never overwrite
- **Self-contained surface** — eleven commands in `.claude/commands/`, the `/critique` skill in `.claude/skills/`, and five agents in `.claude/agents/` are the complete set. Do not invoke workflows, agents or artifact conventions from outside this repository.

---

## Project Workflow

```
Phase 1: Architecture Intake
    ↓
Phase 2: Threat Modeling
    ↓
Phase 3: Requirements
    ↓
Phase 4: Design
    ↓
Phase 5: Development Standards
    ↓
Phase 6: Security Testing
    ↓
Phase 7: Release
```

All phases documented in root `CLAUDE.md`.

---

## Getting Help

**For layer-specific work:** Refer to that layer's `CLAUDE.md`

**For SSDLC phases:** See `ssdlc/` folder and phase documentation

**For general project guidance:** See root `CLAUDE.md` and `docs/guides/`

---

**This project defines its own workflow end to end. Everything it needs is in
this repository; nothing outside it is required or invoked.**
