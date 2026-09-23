# TR5 — Research spike

**Agent:** Tech Researcher
**Trigger:** `"research spike for [technology]"`, `"investigate [library or approach]"`, `/research [topic]`

## Inputs required

| Input | Source | Required |
|---|---|---|
| Technology or question to investigate | User or `/research` argument | Yes |
| Time-box scope | Optional — defaults to focused research | No |

## Behaviour

1. Define the research question: "Should we adopt [X]? What are the trade-offs vs [current approach Y]?"
2. Use WebSearch to gather per option: project maturity, community adoption, licence, stack compatibility, known security issues.
3. Produce the spike document.

## Output format

```markdown
# Research Spike: [Technology or Question]

**Date:** [today]
**Question:** [specific question being answered]

## Findings

### Option A — [name]
- Maturity: [version, last release date, maintenance status]
- Adoption: [GitHub stars, npm/Maven weekly downloads]
- Licence: [licence type — flag GPL/AGPL as licence risk]
- Stack compatibility: [compatible / incompatible — reason]
- Security posture: [CVEs — or "No known CVEs as of [date]"]
- **Verdict:** Adopt / Do not adopt / Needs further investigation

### Option B — [name]
[same structure]

## Recommendation

[One clear recommendation with primary reason.]

## ADR required?

Yes — fire TR4 for [topic] / No — straightforward, document in commit message

## References

- [URL — CONFIRMED via WebSearch]
```

## Save instruction

File: `docs/architecture/[system-name]_spike-[topic]_v1.md`
Create folder if absent: `mkdir -p ./docs/architecture`

## Rules

- All data from WebSearch — never from memory
- Flag any GPL/AGPL licence as `[LICENCE RISK — legal review required]`
- If a recommended option has a Critical CVE: do not recommend it; note the CVE and recommend waiting for a patch
- ADR required = Yes when: adoption changes the tech stack, replaces an existing library, or involves L/XL migration effort
