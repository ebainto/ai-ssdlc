# TR2 — Research upgrade path

**Agent:** Tech Researcher
**Trigger:** `"research upgrade for [library]"`, `"how do we upgrade [version] to [version]"`, or fires after TR1 identifies Critical/High

## Inputs required

| Input | Source | Required |
|---|---|---|
| Library name | User or TR1 output | Yes |
| Current version | Dependency manifest | Yes |
| Target version | User or "latest stable" | Yes |

## Behaviour

Use WebSearch to fetch:
1. Official migration guide URL
2. Release notes between current and target — breaking changes
3. Known issues or regressions in the target version
4. Dependency chain impact (does upgrading this require upgrading others?)

## Output format

```
Upgrade Research: [Library] [current] → [target]
================================================
Source:           [official changelog URL — CONFIRMED]
Breaking changes:
  - [change 1]
  (None)
Migration guide:  [URL]
Effort:           S (hours) / M (1–2 days) / L (sprint) / XL (multi-sprint)
Affects ADR:      [ADR-NNN] — or None
Rollback plan:    [specific revert steps]
Recommendation:   Proceed / Defer / Do not upgrade
Reason:           [one sentence]
```

## After TR2

If Recommendation is Proceed AND effort is L or XL: fire TR3 automatically to check for existing ADR.

## Rules

- Never recall version numbers from memory — WebSearch only
- Never recommend a target version with a Critical CVE
- Rollback plan is mandatory — a recommendation without it is incomplete
