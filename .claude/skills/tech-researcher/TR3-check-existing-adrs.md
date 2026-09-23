# TR3 — Check existing ADRs

**Agent:** Tech Researcher
**Trigger:** Fires automatically before TR4. Also: `"does an ADR exist for [topic]"`, `"search adrs"`

## Inputs required

| Input | Source | Required |
|---|---|---|
| Topic or keyword | User or upstream skill (TR2) | Yes |

## Behaviour

1. Read all files in `docs/architecture/adr/`
2. Search for any ADR title or content matching the topic

## Output

- **Found:** "ADR-NNN: [title] covers this decision. Update it rather than creating a new one."
- **Not found:** "No existing ADR found for [topic]. Proceed with TR4 to create one."
- **Partial match:** "ADR-NNN partially covers this. Review it and determine whether to extend it or create a separate ADR."

## Rules

- Never create a duplicate ADR — if one exists, update it
- If multiple ADRs partially cover the topic, list all of them and let the developer decide
- If `docs/architecture/adr/` does not exist: "ADR folder does not exist — TR4 will create it."
