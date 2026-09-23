# Agent skill specifications

Detailed, per-skill specifications for the six agents in `.claude/agents/`.

## Read this first: these files do not load

**Nothing in this folder is loaded by Claude Code.** These are design
specifications for humans, kept under `docs/` precisely so that is obvious.

They previously lived in `.claude/skills/<agent>/<ID>-<slug>.md`, which looked
like harness configuration but was not. Claude Code loads a skill only from
`.claude/skills/<name>/SKILL.md` — one folder per skill, with that exact
filename and YAML frontmatter. A file at `.claude/skills/dev-lead/OA6-….md`
matches no loader and was silently inert, while `.claude/skills/README.md`
described these files as "the authoritative definition". The authoritative
definition was the copy that never ran.

## What is authoritative

| Artifact | Loads? | Status |
|---|---|---|
| `.claude/agents/<agent>.md` | Yes — as a subagent definition | **Authoritative.** This is what executes. |
| `.claude/commands/<name>.md` | Yes — as a slash command | **Authoritative.** Entry points. |
| `docs/agent-skills/**` | No | Reference specification only. |

Each agent body contains its skills inline as `### SKILL <ID>` sections. That
inline copy is the one the model reads at runtime, so **when a spec here and an
agent body disagree, the agent body wins** — and the spec should be updated to
match, not the reverse.

Note on numbering: a spec here numbers its preamble steps in the same sequence as
its pipeline steps, while the agent body numbers preamble and pipeline
separately. A spec showing "8 steps" against an agent body showing "6 steps" is
usually this convention difference, not missing content. Compare substance, not
step counts.

## Why keep them

They carry fuller rationale, output templates and worked examples than belongs in
an agent system prompt, where every line costs context on every spawn. Use them
when changing how an agent behaves: edit the spec to think it through, then apply
the change to the agent body, which is what actually runs.

## Folder structure

```
docs/agent-skills/
  dev-lead/           OA1–OA7   Dev Lead coordinator
  code-reviewer/      CR1–CR4   Code Reviewer Agent
  qa-engineer/        QA1–QA5   QA Engineer Agent
  security-auditor/   SA1–SA4   Security Auditor Agent
  tech-researcher/    TR1–TR5   Tech Researcher Agent
  infrastructure/     IA1–IA4   Infrastructure Agent
```

Naming: `[SKILL-ID]-[short-slug].md` — e.g. `QA1-write-tests.md`.

## If you want these to actually load

Convert one to `.claude/skills/<skill-name>/SKILL.md` with frontmatter:

```markdown
---
name: qa-write-tests
description: Write AC-driven tests for a story before implementation begins
---
```

Be deliberate about it. These are *agent-internal* procedures: a skill loaded in
the main session does not reach a subagent, which takes its instructions from its
agent file. For most of these the agent body is the correct home, which is why
they are documentation here rather than skills.
