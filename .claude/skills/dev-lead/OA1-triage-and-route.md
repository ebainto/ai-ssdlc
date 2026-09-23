# OA1 — Triage and route

**Agent:** Dev Lead
**Trigger:** `"orchestrate"`, `"dev mode"`, `"what next"`, `"where do I start"`, any vague development request

## Inputs required

None — gathers context through one question.

## Behaviour

1. Ask one question: "What are you working on — (a) building a feature or story, (b) adding a specific API endpoint, (c) adding a specific component, (d) researching a library or upgrade, or (e) something else?"
2. Read `ssdlc/*_hitl-audit-trail_*.md` — check gate status for the requested route.
3. If gate pre-conditions are not met: stop. State which gate must be approved and name the command to check it.
4. If met: output routing instruction.

## Output format

```
Routing you to: [Agent name]
Skill to invoke: [SKILL ID] — [Skill name]
What to say:     "[Trigger phrase]"
Gate status:     [Gate N — Approved / Pending]
```

## Gate pre-conditions

| Route to | Requires |
|---|---|
| Code Reviewer Agent | Gate 5 approved |
| Security Auditor Agent | Gate 2 approved |
| QA Engineer Agent | Gate 3 approved |
| Infrastructure Agent | Gate 1 approved |
| Tech Researcher Agent | No gate dependency |
