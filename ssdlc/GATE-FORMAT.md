# HITL Audit Trail — file format contract

This file defines the format that `/gate` writes and every gated command reads.
It is the contract between the two. Do not change the `Gate N:` line format
without updating `.claude/commands/gate.md` and the seven gated commands.

## File location and naming

```
ssdlc/[system-name]_hitl-audit-trail_v[N].md
```

One file per system. Versions increment (`v1`, `v2`, etc.) when the trail needs to be archived; never overwrite.
It is **append-only**: a new decision is a new row, never an edit to an existing one. Superseding an earlier 
decision means appending a later row for the same gate — the latest row for a gate wins.

## The parsable line

Every gate decision is one line, exactly this shape:

```
Gate <N>: <decision> | <YYYY-MM-DD> | <approver> | <conditions or "-">
```

- `<N>` — 1 to 7. Required. **Validation: exactly one of [1-7].**
- `<decision>` — must be exactly one of: `approved`, `rejected`, `approved-with-conditions`. **Validation: no other values accepted.**
- `<YYYY-MM-DD>` — date of the decision in ISO 8601 format. **Required. Validation: must be a valid date.**
- `<approver>` — name or email of the human who decided. Required.
- `<conditions>` — **Required when decision is `approved-with-conditions` or `rejected` (the reason); else must be `-` for `approved`**. **Validation: no pipe `|` characters, no newlines (single line only).**

Examples:

```
Gate 1: approved | 2026-09-23 | erwin.bainto@rrd.com | -
Gate 2: approved-with-conditions | 2026-09-24 | erwin.bainto@rrd.com | DoS threats deferred to v2; residual risk accepted
Gate 3: rejected | 2026-09-25 | erwin.bainto@rrd.com | No story covers GDPR erasure
```

## How a command checks a gate

A gated command must find the chronologically-latest row for that gate (not position-latest):

```bash
grep -E "^Gate 5:" ssdlc/[system]_hitl-audit-trail_v*.md | sort -t'|' -k2 -r | head -1
```

Parse the matching row by `|` field delimiter: `Gate N | decision | date | approver | conditions`

- No file, or no matching row  → gate is **not approved**. Stop.
- Row decision is `approved`           → proceed.
- Row decision is `approved-with-conditions` → proceed, and echo the conditions to the
  developer before doing anything else.
- Row decision is `rejected`           → stop, and quote the conditions as the reason.

## Design assumptions

**Append-only by convention, not by enforcement.** This template assumes `/gate` is the only writer
and that the trail is never edited. Production deployments should add:
- CI/hook validation to reject edits (e.g., git push hook checking file timestamps)
- Checksum or signature protection
- Commit requirement (`git config commit.gpgsign=true`)

**System scope:** Each system has its own trail file. Commands must verify they are reading the correct 
system's trail before making decisions. A multi-system deployment can check multiple trails but must 
explicitly scope to the system under review (never glob all trails and pick arbitrarily).

## Why a plain grep

The check has to work from a slash command with no code execution beyond Bash,
and it has to be auditable by a human reading the file directly. A fixed-shape
line satisfies both. Anything richer (YAML, JSON) would need a parser the
harness does not have.
