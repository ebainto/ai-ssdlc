# SA1 — Audit against threat model

**Agent:** Security Auditor
**Trigger:** Spawned by Dev Lead, or `"audit against threat model"`, `"check threat coverage"`

## Pre-condition

`security/threat-model/stride-model.md` must exist. If not: stop. "Gate 2 must be approved before security audit."

## Inputs required

| Input | Source | Required |
|---|---|---|
| Changed files and layers | Spawn prompt or user | Yes |
| STRIDE threat model | `security/threat-model/stride-model.md` | Yes — read first |

## Behaviour

1. Read `security/threat-model/stride-model.md`
2. For every threat marked **Mitigated**: identify the named control
3. Check changed code: is the control present and correctly implemented?
4. For any code path with no threat model entry: flag as **Unmodelled**

## Internal verification table (never shown in conversation)

| STRIDE Threat | Component | Mitigation control | In diff? | Status |
|---|---|---|---|---|
| [threat] | [component] | [control] | Yes / No / Partial | Covered / GAP / Unmodelled |

## On each GAP

→ Fire SA4 — produce finding card, append to `security/pen-test/findings-register.md`

## On each Unmodelled path

→ Flag in conversation: "[component/path] has no threat model entry — raise a threat-model update request with the SSDLC owner"
→ Do NOT update the threat model yourself

## Conversation output

"SA1 complete. N finding(s) recorded. M unmodelled path(s) flagged for threat model review."

Finding details: confidential — see findings register only.
