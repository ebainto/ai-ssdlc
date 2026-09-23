# .claude/skills

Standalone skill files for this project's agent system. Each skill is a named, reusable procedure
that belongs to a specific agent. Skills are the atomic units of work; agents orchestrate them.

## Folder structure

```
skills/
  dev-lead/           Skills for the Dev Lead Agent (OA1–OA7)
  code-reviewer/      Skills for the Code Reviewer Agent (CR1–CR4)
  qa-engineer/        Skills for the QA Engineer Agent (QA1–QA5)
  security-auditor/   Skills for the Security Auditor Agent (SA1–SA4)
  tech-researcher/    Skills for the Tech Researcher Agent (TR1–TR5)
  infrastructure/     Skills for the Infrastructure Agent (IA1–IA4)
```

## Naming convention

`[SKILL-ID]-[short-slug].md` — e.g. `QA1-write-tests.md`, `CR4-review-report.md`

## What a skill file contains

Each file is a self-contained procedure: trigger, inputs required, step-by-step behaviour,
and output format. Skill files are the authoritative definition — the agent file's system
prompt references or condenses them.

## Relationship to agents and commands

```
.claude/agents/[name].md      Agent identity, guardrails, tools, and skill references
.claude/skills/[agent]/       Full skill definitions for that agent
.claude/commands/[name].md    Slash command entry points that activate agents or invoke skills
```

Agents own their skills. Commands are the external triggers. Skills are the procedures.
