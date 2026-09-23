---
name: critique
description: Adversarial multi-perspective review of an artifact in the ai-ssdlc repository — layer CLAUDE.md files, SSDLC phase outputs, gates, the worked example, the .claude/ harness, the guides, or uncommitted changes. Self-contained; requires no external governance system.
---

Adversarial review of one artifact in **this** repository. Several named
perspectives read the same artifact and each raises specific, severity-rated
findings. Nothing is graded on a curve — the point is to find what is wrong.

Target: the argument passed to this skill, e.g. `harness`, `layer backend`,
`phase 2`, `gate 5`, `example`, `guides`, `changes`. If none was given, follow
the no-argument rule below.

## Scope — this repository only

This command reviews artifacts that exist in this repo. It has no dependency on
any external governance system, spec folder or constitution file, and must not
create one. If the target names something outside this repository, stop and say
so rather than inventing a structure to hold it.

Valid targets:

| Target | Reviews |
|---|---|
| `layer <name>` | `<name>/CLAUDE.md` — one of frontend, backend, database, infrastructure, integration, security |
| `phase <N>` | The Phase N output in `ssdlc/` (1–7) |
| `gate <N>` | Gate N readiness: the artifact that gate signs off, plus the trail entry |
| `example` | `examples/loan-portal/` — the worked reference set |
| `harness` | `.claude/` — agents, commands, the gate mechanism |
| `guides` | `docs/guides/` — accuracy against what is on disk |
| `changes` | Uncommitted changes, or `git diff <ref>` if a ref is given |

No argument: list the targets that currently have content, and stop.

## Steps

1. **Resolve the target.** Confirm the file or folder exists. If it does not,
   stop and name what is missing — never review from memory or assumption.

2. **Read it.** Read the actual content, in full. Every finding must cite a real
   line, table row, code block or filename. A finding you cannot point at is not
   a finding.

3. **Check gate state, for context only.** Run
   `grep -hE "^Gate [1-7]:" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -10`
   (format contract: `ssdlc/GATE-FORMAT.md`). An unapproved gate does **not**
   block a critique — reviewing early is the cheapest time to find problems. But
   say which gates are approved, because a finding against an approved artifact
   is more serious than one against a draft.

4. **Run every perspective for the target**, in order. Announce each as
   `**[Role]'s perspective:**`, then give 1–3 findings. Never skip a
   perspective: if the artifact is thin, that perspective's job is to say what
   is absent.

   | Target | Perspectives |
   |---|---|
   | `layer frontend` | Security Architect, Accessibility Advocate, Senior Angular Developer |
   | `layer backend` | Security Architect, Senior Developer, API Consumer |
   | `layer database` | DBA, Data Protection Officer, Migration Engineer |
   | `layer infrastructure` | SRE, Security Architect, Cost Owner |
   | `layer integration` | Integration Architect, Data Protection Officer, Resilience Engineer |
   | `layer security` | Security Architect, Auditor, Layer Implementer |
   | `phase <N>` / `gate <N>` | Gate Approver, Security Architect, Implementer, Auditor |
   | `example` | Adopting Team Member, Security Reviewer, Auditor |
   | `harness` | Claude Code Practitioner, New Team Member, Adversarial Tester |
   | `guides` | New Team Member, Fact Checker, Maintainer |
   | `changes` | Independent Code Reviewer, Security Analyst, Regression Hunter |

5. **Rate every finding.**
   - `high` — blocks correctness, safety, compliance or feasibility. Resolve
     before the relevant gate is approved.
   - `medium` — degrades quality, maintainability or usability. Should resolve.
   - `low` — style, completeness, future risk. Nice to fix.

6. **Verify before reporting.** For each finding, re-check the artifact and
   confirm it is real. Drop anything you cannot substantiate, and say how many
   you dropped. A critique that inflates its count is worthless.

7. **Write the log.** Append to `./ssdlc/[system]_critique-log_vN.md`, following
   this repo's convention: never overwrite, increment `vN` if the file exists,
   `mkdir -p ./ssdlc` if absent. Include the date, target, perspectives,
   findings table, gate state at time of review, and how many candidate
   findings were dropped in step 6.

8. **Report** in the conversation: the counts by severity, the high-severity
   findings in full, and the single most important thing to fix first.

## Rules

- **Cite or drop it.** Every finding names a file and a line, row or block.
- **Never invent structure.** This command creates no folder other than
  `ssdlc/`, and no governance scaffolding of any kind.
- **Never approve a gate.** `/gate` is the only writer of gate decisions. A
  critique reports; it does not sign off.
- **Never edit the artifact under review.** Write findings to the critique log
  only. Fixing is a separate, deliberate step.
- **Declare a conflict of interest.** If the artifact under review was written
  in this same session, say so in the report — a self-review is weaker evidence
  than an independent one, and the reader should know which they have.
- **Report zero findings honestly** if that is the result. Do not pad.
