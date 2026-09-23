# HITL Audit Trail — [System name]

> Copy this file to `ssdlc/[system-name]_hitl-audit-trail_v1.md` and delete this
> notice. One file per system. Append-only — never edit or delete a past row.
> Format contract: `ssdlc/GATE-FORMAT.md`

| Field | Value |
|---|---|
| System | [system-name] |
| Architecture source | [Greenfield output / Brownfield output / external doc] |
| Trail opened | [YYYY-MM-DD] |
| Owner | [name / email] |

---

## Gate decisions

Each decision is one append-only line in the format defined by
`ssdlc/GATE-FORMAT.md`:

```
Gate <N>: <approved|rejected|approved-with-conditions> | <YYYY-MM-DD> | <approver> | <conditions or ->
```

Write decisions below this line. Nothing here yet means **no gate is approved**,
and every gated command will correctly refuse to run.

<!-- BEGIN GATE DECISIONS — /gate appends below this marker -->

<!-- END GATE DECISIONS -->

---

## Gate reference

| Gate | Name | Phase it closes | Commands it unblocks |
|---|---|---|---|
| 1 | Architecture sign-off | 1 — Architecture Intake & Validation | `/infra-check` |
| 2 | Threat model sign-off | 2 — Security Threat Modelling | `/security-audit` |
| 3 | Requirements sign-off | 3 — Requirements & User Stories | `/run-tests`, `/new-feature` |
| 4 | Design sign-off | 4 — Secure Design Specifications | — |
| 5 | Standards sign-off | 5 — Development Standards & Scaffolding | `/new-feature`, `/new-api`, `/new-component`, `/code-review` |
| 6 | Test plan sign-off | 6 — Security Testing Plan | — |
| 7 | Release sign-off | 7 — Release Readiness Review | — |

`/research` and `/write-adr` have no gate dependency — research may begin at any
time.

---

## Decision log detail

For each decision above, record the supporting detail here. The one-line entry
is what commands parse; this section is what an auditor reads.

### Gate [N] — [name]

| Field | Value |
|---|---|
| Decision | [approved / rejected / approved-with-conditions] |
| Date | [YYYY-MM-DD] |
| Approver | [name / email] |
| Artifact reviewed | [file path and version, e.g. `ssdlc/loan-portal_threat-model_v2.md`] |
| Conditions | [if any — these must also appear in the one-line entry] |
| Notes | [what was checked, what was accepted, what was deferred] |
