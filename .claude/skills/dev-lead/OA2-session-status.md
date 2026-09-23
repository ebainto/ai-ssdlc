# OA2 — Session status

**Agent:** Dev Lead
**Trigger:** `"what have we done"`, `"session status"`, `"show progress"`

## Inputs required

None — reads from current conversation context and HITL audit trail.

## Behaviour

1. Read `ssdlc/*_hitl-audit-trail_*.md` for gate status.
2. Review conversation context for sub-agents spawned and their outputs.
3. Output the session tracker table.

## Output format

| Task | Agent spawned | Status | Output file | Next step |
|---|---|---|---|---|

Below the table:
- **Completed:** [list of outputs ready]
- **In progress:** [started but not finished]
- **Blocked:** [cannot proceed — reason]
- **Recommended next action:** [one specific: Agent + Skill]
