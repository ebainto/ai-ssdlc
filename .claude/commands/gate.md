---
description: Show HITL gate status, or record a gate decision in the audit trail
argument-hint: [status | N approve|reject|conditions "<notes>"]
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Edit, Write
---

Read or write the HITL audit trail. This is the only command that writes gate
decisions — every other gated command only reads them.

Request: $ARGUMENTS
(Expected formats:
  "status"                          — show the current decision for all 7 gates
  "status 5"                        — show the current decision for Gate 5
  "5 approve"                       — record Gate 5 as approved
  "5 reject <reason>"               — record Gate 5 as rejected, with reason
  "5 conditions <notes>"            — record Gate 5 as approved-with-conditions)

The format contract is `ssdlc/GATE-FORMAT.md`. Read it before writing anything.

## Steps

1. Locate the trail: `ls ssdlc/*_hitl-audit-trail_v*.md 2>/dev/null`.
   - If none exists and the request is a `status` request: report "No audit
     trail exists. No gate is approved. Copy
     `ssdlc/TEMPLATE-hitl-audit-trail.md` to
     `ssdlc/[system-name]_hitl-audit-trail_v1.md` to open one." Stop.
   - If none exists and the request records a decision: ask for the system name,
     copy the template to `ssdlc/[system-name]_hitl-audit-trail_v1.md`, fill the
     header, then continue.
   - If more than one exists: list them and ask which system. Never guess.

2. For a `status` request, read the current decision for each gate:
   `grep -E "^Gate [1-7]:" <trail> | tail -20`
   For each gate 1-7, the **last** matching row wins. Report as a table:
   gate, name, decision, date, approver, conditions. A gate with no row is
   `not approved`. Then stop — a status request never writes.

3. For a decision request, before writing:
   - Confirm the gate number is 1-7. Anything else: stop.
   - Confirm the decision word is `approve`, `reject` or `conditions`.
   - If `conditions`, require non-empty notes. Conditions with no text is not a
     valid decision — ask for them.
   - Ask the human to confirm their name or email for the approver field. Do not
     invent it, and do not reuse a name from an earlier row without asking.

4. Append one line, in exactly the `ssdlc/GATE-FORMAT.md` shape, immediately
   above the `<!-- END GATE DECISIONS -->` marker:

   ```
   Gate <N>: <approved|rejected|approved-with-conditions> | <YYYY-MM-DD> | <approver> | <conditions or ->
   ```

   Use today's date. Never edit or remove an existing row — superseding a past
   decision means appending a new row for the same gate.

5. Also fill in the matching `### Gate [N]` block in the Decision log detail
   section: artifact reviewed (file path and version), conditions, and notes.
   The one-line entry is what commands parse; this block is what an auditor
   reads. Both must agree.

6. Confirm back to the human: the exact line written, the file it went into, and
   which commands that gate now unblocks (see the Gate reference table in the
   trail).

## Rules

- **Never record a decision the human did not explicitly give.** "Looks fine",
  "go ahead" and "continue" are not decisions. Only an explicit approve, reject
  or conditions instruction counts.
- **Never approve a gate on the human's behalf**, and never approve a gate
  because an earlier gate was approved.
- **Never delete or rewrite history.** The trail is append-only; it is the audit
  evidence.
- A gate approved with conditions is approved. Commands proceed, but must echo
  the conditions before doing anything else.
