# AI-SSDLC Project — Claude Code Instructions

**This project's workflow does not use the global MyArchitecture workbench agents.**

Note on precedence: Claude Code **concatenates** CLAUDE.md files rather than
overriding them. If `~/.claude/CLAUDE.md` exists, it is loaded *in addition to*
this file and the root `CLAUDE.md` — all three are in context at once. This file
cannot suppress the global one. It states which workflow this project follows;
it does not and cannot unload anything.

If you need the global workbench agents genuinely out of context, remove or
relocate `~/.claude/CLAUDE.md` — there is no in-project mechanism for it.

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
- **No global agents** — This project does not use MyArchitecture agents (Assessment, Greenfield, Brownfield, SSDLC, etc.)

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

**This project defines its own workflow. It does not invoke the MyArchitecture
workbench agents, but it cannot prevent `~/.claude/CLAUDE.md` from loading.**
