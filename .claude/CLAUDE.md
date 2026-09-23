# AI-SSDLC Project — Claude Code Instructions

**This is a standalone SSDLC template project. It does NOT use the global MyArchitecture workbench.**

This file overrides the global `~/.claude/CLAUDE.md` for this project only.

---

## Project Context

- **Project name:** ai-ssdlc
- **Purpose:** Reusable Secure Software Development Lifecycle template
- **Tech stack:** See root `CLAUDE.md` and layer-specific `CLAUDE.md` files
- **Structure:** 6 capability layers + plugin eval + security artifacts

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

### Plugin Eval
- Plugin source: `plugin/`
- Test suites: `plugin-eval/suites/`
- Configuration: `plugin-eval/eval.config.json`
- Docs: `plugin-eval/QUICKSTART.md`, `plugin-eval/README.md`

### SSDLC Outputs
- Phase artifacts: `ssdlc/`
- Architecture: `architecture/`
- Diagrams: `diagrams/`
- Compliance: `compliance/`

### Documentation
- **Start here:** `docs/guides/template-guide.md`
- **Plugin eval guide:** `docs/guides/plugin-eval-guide.md`

---

## How Claude Code Works Here

1. **In a layer directory** (e.g., `backend/`) → Load that layer's CLAUDE.md
2. **In root or other dirs** → Load this file (project-level rules)
3. **Global rules** → NOT loaded (this project is standalone)

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
    ↓ (use plugin to generate models)
Phase 3: Requirements
    ↓
Phase 4: Design
    ↓ (use plugin to assess security)
Phase 5: Development Standards
    ↓ (plugin eval runs in CI)
Phase 6: Security Testing
    ↓
Phase 7: Release
```

All phases documented in root `CLAUDE.md`.

---

## Getting Help

**For layer-specific work:** Refer to that layer's `CLAUDE.md`

**For SSDLC phases:** See `ssdlc/` folder and phase documentation

**For plugin eval:** See `plugin-eval/QUICKSTART.md`

**For general project guidance:** See root `CLAUDE.md` and `docs/guides/`

---

**This project is self-contained. No global MyArchitecture system is loaded.**
