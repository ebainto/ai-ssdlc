# OA3 — Check gate status

**Agent:** Dev Lead
**Trigger:** `"check gate status"`, `"what gates are approved"`, `"can we proceed to phase N"`

## Inputs required

None — reads the HITL audit trail directly.

## Behaviour

Read `ssdlc/*_hitl-audit-trail_*.md`. Report all seven gates.

## Output format

| Gate | Name | Status | Conditions outstanding | Date |
|---|---|---|---|---|
| 1 | Architecture sign-off | Approved / Pending / Rejected | | |
| 2 | Threat model sign-off | | | |
| 3 | Requirements sign-off | | | |
| 4 | Design sign-off | | | |
| 5 | Dev standards sign-off | | | |
| 6 | Test plan sign-off | | | |
| 7 | Release sign-off | | | |

Flag any gate approved with conditions — list outstanding items.
Flag any gate where conditions exist but are unresolved.
