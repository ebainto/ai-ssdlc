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

- `<N>` — 1 to 7
- `<decision>` — `approved`, `rejected`, or `approved-with-conditions`
- `<YYYY-MM-DD>` — date of the decision
- `<approver>` — name or email of the human who decided
- `<conditions>` — required when decision is `approved-with-conditions`, else `-`

Examples:

```
Gate 1: approved | 2026-09-23 | erwin.bainto@rrd.com | -
Gate 2: approved-with-conditions | 2026-09-24 | erwin.bainto@rrd.com | DoS threats deferred to v2; residual risk accepted
Gate 3: rejected | 2026-09-25 | erwin.bainto@rrd.com | No story covers GDPR erasure
```

## How a command checks a gate

A gated command greps for the latest row for that gate:

```bash
grep -E "^Gate 5:" ssdlc/*_hitl-audit-trail_v1.md | tail -1
```

- No file, or no matching row  → gate is **not approved**. Stop.
- Row says `approved`           → proceed.
- Row says `approved-with-conditions` → proceed, and echo the conditions to the
  developer before doing anything else.
- Row says `rejected`           → stop, and quote the conditions as the reason.

## Why a plain grep

The check has to work from a slash command with no code execution beyond Bash,
and it has to be auditable by a human reading the file directly. A fixed-shape
line satisfies both. Anything richer (YAML, JSON) would need a parser the
harness does not have.
