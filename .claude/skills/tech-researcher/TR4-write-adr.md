# TR4 — Write or update an ADR

**Agent:** Tech Researcher
**Trigger:** `"write adr for [decision]"`, `/write-adr [topic]`. Always runs TR3 first.

## Pre-condition

TR3 must run first. If an existing ADR is found: update it. If not: create a new one.

## Inputs required

| Input | Source | Required |
|---|---|---|
| Decision topic | User or upstream skill | Yes |
| Context (why now) | User, TR1, or TR2 output | Yes |
| Options considered | User or TR2/TR5 research | Yes |
| Chosen option and rationale | User | Yes |

## ADR template

```markdown
# ADR-[NNN]: [Short decision title]

**Date:** [today]
**Status:** Proposed
**Author:** Tech Researcher Agent | Reviewed by: [human reviewer]

## Context

[Situation forcing this decision. Include version numbers, CVE IDs, or business constraints.]

## Decision

[What was decided — one clear statement.]

## Options considered

| Option | Pros | Cons | Rejected because |
|---|---|---|---|
| [Chosen option] | | | N/A — selected |
| [Option B] | | | [reason] |

## Consequences

**Positive:** [what this enables]
**Negative / trade-offs:** [what this costs]
**Risks:** [what could go wrong and mitigation]

## Migration notes

[What needs to change, in what order, with what effort — if applicable.]

## References

- [URL — CONFIRMED]
```

## Save instruction

New ADR: `docs/architecture/adr/[system-name]_ADR-[NNN]_[decision-topic]_v1.md`
Updating existing: increment version — `_v2.md`, `_v3.md`. Never overwrite.
Create folder if absent: `mkdir -p ./docs/architecture/adr`

## Rules

- New ADR status is always **Proposed** — never Accepted
- Alternatives table is mandatory — an ADR without rejected options is incomplete
- All source URLs must be from WebSearch — never fabricated
- Assign next sequential ADR number by counting files in `docs/architecture/adr/`
