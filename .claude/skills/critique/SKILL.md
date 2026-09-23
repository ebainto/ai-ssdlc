---
name: critique
description: Adversarial multi-perspective review of the ai-ssdlc repository — one artifact (a layer CLAUDE.md, an SSDLC phase output, a gate, the worked example, the .claude/ harness, the guides, uncommitted changes) or `report` for a full sweep rendered as a filterable HTML page. Self-contained; requires no external governance system.
---

Adversarial review of one artifact in **this** repository. Several named
perspectives read the same artifact and each raises specific, severity-rated
findings. Nothing is graded on a curve — the point is to find what is wrong.

Target: the argument passed to this skill, e.g. `harness`, `layer backend`,
`phase 2`, `gate 5`, `example`, `guides`, `changes`. If none was given, follow
the no-argument rule below.

## Scope — this repository only

This command reviews artifacts that exist in this repo. It has no dependency on
any external governance system, spec folder or constitution file, and must not
create one. If the target names something outside this repository, stop and say
so rather than inventing a structure to hold it.

Valid targets:

| Target | Reviews |
|---|---|
| `layer <name>` | `<name>/CLAUDE.md` — one of frontend, backend, database, infrastructure, integration, security |
| `phase <N>` | The Phase N output in `ssdlc/` (1–7) |
| `gate <N>` | Gate N readiness: the artifact that gate signs off, plus the trail entry |
| `example` | `examples/loan-portal/` — the worked reference set |
| `harness` | `.claude/` — agents, commands, the gate mechanism |
| `guides` | `docs/guides/` — accuracy against what is on disk |
| `changes` | Uncommitted changes, or `git diff <ref>` if a ref is given |
| `report` | **Full-repository sweep**, aggregated and rendered as a filterable HTML page. See *Report mode* below. |

No argument: list the targets that currently have content, and stop.

## Steps

1. **Resolve the target.** Confirm the file or folder exists. If it does not,
   stop and name what is missing — never review from memory or assumption.

2. **Read it.** Read the actual content, in full. Every finding must cite a real
   line, table row, code block or filename. A finding you cannot point at is not
   a finding.

3. **Check gate state, for context only.** Run
   `grep -hE "^Gate [1-7]:" ssdlc/*_hitl-audit-trail_v1.md 2>/dev/null | tail -10`
   (format contract: `ssdlc/GATE-FORMAT.md`). An unapproved gate does **not**
   block a critique — reviewing early is the cheapest time to find problems. But
   say which gates are approved, because a finding against an approved artifact
   is more serious than one against a draft.

4. **Run every perspective for the target**, in order. Announce each as
   `**[Role]'s perspective:**`, then give 1–3 findings. Never skip a
   perspective: if the artifact is thin, that perspective's job is to say what
   is absent.

   | Target | Perspectives |
   |---|---|
   | `layer frontend` | Security Architect, Accessibility Advocate, Senior Angular Developer |
   | `layer backend` | Security Architect, Senior Developer, API Consumer |
   | `layer database` | DBA, Data Protection Officer, Migration Engineer |
   | `layer infrastructure` | SRE, Security Architect, Cost Owner |
   | `layer integration` | Integration Architect, Data Protection Officer, Resilience Engineer |
   | `layer security` | Security Architect, Auditor, Layer Implementer |
   | `phase <N>` / `gate <N>` | Gate Approver, Security Architect, Implementer, Auditor |
   | `example` | Adopting Team Member, Security Reviewer, Auditor |
   | `harness` | Claude Code Practitioner, New Team Member, Adversarial Tester |
   | `guides` | New Team Member, Fact Checker, Maintainer |
   | `changes` | Independent Code Reviewer, Security Analyst, Regression Hunter |

5. **Rate every finding.**
   - `high` — blocks correctness, safety, compliance or feasibility. Resolve
     before the relevant gate is approved.
   - `medium` — degrades quality, maintainability or usability. Should resolve.
   - `low` — style, completeness, future risk. Nice to fix.

6. **Verify before reporting.** For each finding, re-check the artifact and
   confirm it is real. Drop anything you cannot substantiate, and say how many
   you dropped. A critique that inflates its count is worthless.

7. **Write the log.** Append to `./ssdlc/[system]_critique-log_vN.md`, following
   this repo's convention: never overwrite, increment `vN` if the file exists,
   `mkdir -p ./ssdlc` if absent. Include the date, target, perspectives,
   findings table, gate state at time of review, and how many candidate
   findings were dropped in step 6.

8. **Report** in the conversation: the counts by severity, the high-severity
   findings in full, and the single most important thing to fix first.

## Report mode

`report` sweeps the whole repository and emits a self-contained HTML page. This
is the mode that reproduces `docs/guides/ai-ssdlc-adversarial-review.html`.

### 1. Sweep

Review each area below. Run them as parallel subagents when the Agent tool is
available — independent reviewers with no shared context catch more than one
pass does, because each reads its area cold. Otherwise review them in sequence.

| Area | Brief |
|---|---|
| `.claude/` harness | Do the commands, agents and gate mechanism actually run? Frontmatter, tool grants, referenced files, phantom commands. |
| Six layer `CLAUDE.md` | Live `@import`s resolve? Placeholders consistent? Security Architecture rows match a policy that exists? |
| `security/` | Policies internally consistent and consistent with the layers? Placeholder content mixed with concrete claims? |
| `docs/guides/` | Every claim checked against disk: counts, file paths, ticked checkboxes, command names. |
| `examples/` | Does the worked example contain anything a team would copy and regret? |
| `ssdlc/` + gates | Is the gate mechanism coherent? Does each artifact the gates reference exist or is it honestly marked absent? |

Each reviewer returns findings only, in the finding shape below. They do not fix
anything and they do not write files.

### 2. Aggregate

- Merge, then **dedupe**: the same defect found by two reviewers is one finding.
- Assign stable ids: area letter + number (`A1`, `B3`).
- Re-verify every finding against the file before keeping it. Drop what you
  cannot substantiate and record how many you dropped.
- Build the `inventory` rows by comparing a documented claim with what is on
  disk — that table is the most persuasive part of the report, so prefer counts
  you have actually measured over prose.

### 3. Render

Copy `.claude/skills/critique/report-template.html` to
`docs/guides/[system]_adversarial-review_vN.html` (increment `vN`; never
overwrite a previous report), then replace the contents of the
`<script type="application/json" id="review-data">` island with the data object.

Schema — every field is required unless marked optional:

```json
{
  "title": "short name, 2-4 words",
  "date": "YYYY-MM-DD",
  "scope": "what was reviewed",
  "lede": "one or two sentences stating the headline finding",
  "method": "how it was produced, including how many candidate findings were dropped",
  "inventory": [["Item", "Claimed", "Actual"]],
  "groups": {"A": {"name": "Area name", "note": "optional context for the group"}},
  "categories": {"broken": "Broken wiring", "false": "False claim"},
  "findings": [{
    "id": "A1", "sec": "A", "severity": "high|medium|low",
    "cat": "key from categories", "title": "one line",
    "detail": "what is wrong and why it matters",
    "refs": ["path/file.md:12"]
  }],
  "keep": ["what holds up and is worth correcting rather than discarding"],
  "plan": [["Step name", "What to do"]]
}
```

**Escape `<` and `>` as `\u003c` and `\u003e` throughout the JSON.** A literal
`</script>` anywhere in the data closes the island early and silently breaks the
whole page — this is the one mistake that will cost you the report. Backticks in
`title`, `detail`, `note`, `keep` and `plan` render as inline code; everything
else is HTML-escaped, so raw markup in the data is displayed, not executed.

### 4. Verify the page before reporting success

```bash
python3 - <<'CHECK'
import json, re, sys, glob
p = sorted(glob.glob("docs/guides/*adversarial-review*.html"))[-1]
s = open(p).read()
m = re.search(r'<script type="application/json" id="review-data">(.*?)</script>', s, re.S)
d = json.loads(m.group(1))
assert "</script>" not in m.group(1), "literal </script> in data island"
assert s.count("<script") == s.count("</script>"), "unbalanced script tags"
ids = [f["id"] for f in d["findings"]]
assert len(ids) == len(set(ids)), "duplicate finding ids"
for f in d["findings"]:
    for k in ("id","sec","severity","title","detail"):
        assert k in f, f"{f.get('id')} missing {k}"
    assert f["severity"] in ("high","medium","low"), f"{f['id']} bad severity"
    assert f["sec"] in d["groups"], f"{f['id']} has no group"
    assert f.get("cat") in d["categories"] or "cat" not in f, f"{f['id']} bad category"
print(f"OK {p}: {len(d['findings'])} findings, {len(d['groups'])} groups")
CHECK
```

If any assertion fails, fix the data and re-run. Never report a page as produced
without this passing.

### 5. Report

Give the severity counts, every `high` finding in full, how many candidates were
dropped in step 2, and the path to the page. State plainly that the page is a
local file — it is not published anywhere and contains no live data.

## Rules

- **Cite or drop it.** Every finding names a file and a line, row or block.
- **Never invent structure.** This command creates no folder other than
  `ssdlc/`, and no governance scaffolding of any kind.
- **Never approve a gate.** `/gate` is the only writer of gate decisions. A
  critique reports; it does not sign off.
- **Never edit the artifact under review.** Write findings to the critique log
  only. Fixing is a separate, deliberate step.
- **Declare a conflict of interest.** If the artifact under review was written
  in this same session, say so in the report — a self-review is weaker evidence
  than an independent one, and the reader should know which they have.
- **Report zero findings honestly** if that is the result. Do not pad.
- **In report mode, never overwrite a previous report.** Increment `vN`. Past
  reports are the record of what was true when they were written.
- **Never publish a report anywhere.** It is a local file in `docs/guides/`.
  Publishing a findings list is the user's decision, not this skill's.
