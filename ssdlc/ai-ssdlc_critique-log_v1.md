# ai-ssdlc — Critique Log

## 2026-09-23 — target `report` (full-repository sweep) — six independent reviewers

**Perspectives:** Claude Code Practitioner / Adversarial Tester (`.claude/` harness), Gate Approver /
Auditor (gate mechanism), Security Architect / Layer Implementer (six layer `CLAUDE.md`), Auditor
(security artifacts), Fact Checker / New Team Member (guides), Security Reviewer / Adopting Team
Member (worked example).

**Gate state at time of review:** no audit trail exists; **zero gates approved**. Every finding is
therefore against a draft, not an approved artifact — which lowers their governance severity but not
their technical severity, since the template ships in this state.

**Method:** six subagents, one per area, each with a self-contained brief, no session context, and a
cite-or-drop rule. 85 candidates returned; **6 merged as cross-reviewer duplicates**, leaving **79**.
Every `high` was re-verified against the file by the aggregator; gate findings were reproduced in a
scratch fixture. Standards IDs checked against published ASVS 4.0.3 / ISO 27001:2022 / PCI-DSS v4.0.

**Conflict of interest:** every area was written or edited by the aggregator earlier the same day.
Nine findings are defects that session introduced (B1, B2, B6, C11, C15, E3, E8, E9, E11, F2, plus
A7 against the review skill itself). Reviewing was delegated for exactly this reason.

**Totals:** 29 high, 41 medium, 9 low.

**Report:** `docs/guides/ai-ssdlc_adversarial-review_v1.html` (local file, not published).

**Findings**

| # | Area | Finding | Severity |
|---|---|---|---|
| A1 | Harness and commands | security-auditor must read a diff but has no git tool | medium |
| A2 | Harness and commands | security-auditor must append to the confidential register but has Write, not Edit | medium |
| A3 | Harness and commands | infrastructure-agent is told to run `mkdir` with no Bash tool granted | medium |
| A4 | Harness and commands | `/research` and `/write-adr` instruct WebSearch and a file save their allowed-tools omit | medium |
| A5 | Harness and commands | Three pipeline commands order “Execute SKILL OA5/OA6/OA7” without loading where those skills are defined | medium |
| A6 | Harness and commands | dev-lead's OA6/OA7 pre-checks are weaker than the commands that invoke them | medium |
| A7 | Harness and commands | The review skill's own mandatory verifier validates the wrong file | medium |
| A8 | Harness and commands | `/new-feature` frontmatter has an unquoted colon, making it invalid YAML | low |
| B1 | Gate mechanism | The trail template matches the discovery glob, so `/gate` writes real decisions into the shipped template | high |
| B2 | Gate mechanism | `tail -5` / `tail -8` on multi-gate greps silently discards approvals and blocks the pipeline | high |
| B3 | Gate mechanism | The gate check is fail-open across systems — one system's approval unblocks another's commands | high |
| B4 | Gate mechanism | `/gate status` reports approved gates as not approved once the trail exceeds 20 rows | high |
| B5 | Gate mechanism | Any line starting `Gate N:` and containing “approved” is an approval — no validation exists | high |
| B6 | Gate mechanism | Every gate check hardcodes `_v1.md` while the project's own convention says versions increment | high |
| B7 | Gate mechanism | The format contract documents a check no command implements, and its example breaks its own line shape | medium |
| B8 | Gate mechanism | “Latest row wins” is resolved by file position, never by date | medium |
| B9 | Gate mechanism | “Append-only” and “`/gate` is the only writer” are prose with nothing enforcing them | medium |
| B10 | Gate mechanism | Gates 4, 6 and 7 are defined but no command consumes them | medium |
| B11 | Gate mechanism | The contract contradicts itself on the conditions field for a rejected row | medium |
| B12 | Gate mechanism | No escaping rule, so a `|` or a newline in a conditions note corrupts the row | medium |
| B13 | Gate mechanism | Three incompatible spellings of the conditional-approval response | medium |
| B14 | Gate mechanism | `2>/dev/null` does not suppress the glob failure under the project's own shell | low |
| C1 | Layer context files | Three-way contradiction on the refresh-token model | high |
| C2 | Layer context files | The database layer hard-codes the self-issued-IdP data model as non-negotiable | high |
| C3 | Layer context files | Frontend ships a `<meta>` CSP that infrastructure and the policy both say is wrong, with a conflicting value | high |
| C4 | Layer context files | Frontend declares a CSRF implementation no backend control validates | high |
| C5 | Layer context files | The ufw allowlist blocks the monitoring path the same file describes | high |
| C6 | Layer context files | RabbitMQ and Redis are load-bearing but have no host, container or firewall rule | high |
| C7 | Layer context files | Three layer files name an authoritative policy file that does not exist | medium |
| C8 | Layer context files | Flyway commands point at the wrong location and run Maven from a directory with no POM | medium |
| C9 | Layer context files | The local JDBC URL omits both the TLS and Always Encrypted settings its own controls require | medium |
| C10 | Layer context files | Backend↔SQL Server crosses hosts, so the policy requires mTLS, but no exception is recorded | medium |
| C11 | Layer context files | All 18 `@import`s sit inside HTML comments and every target is absent | medium |
| C12 | Layer context files | Backend publishes its API contract at `docs/api/`; the frontend reads it from `docs/backend/design/` | medium |
| C13 | Layer context files | The circuit-breaker threshold is specified twice with incompatible values | medium |
| C14 | Layer context files | Production is described as active-active while the frontend runs on one node | medium |
| C15 | Layer context files | An auto-loaded template file asserts an ISO certification, a sector and a jurisdiction as fact | medium |
| C16 | Layer context files | The integration layer's context file can never load for the code it governs | medium |
| C17 | Layer context files | The Jenkinsfile location contradicts itself and neither path exists | low |
| C18 | Layer context files | The “3-step” breaking-change migration is described as four steps in the same file | low |
| D1 | Security artifacts | ASVS requirement IDs are systematically mis-cited across both policy files | high |
| D2 | Security artifacts | ISO controls are cited in withdrawn 2013 numbering while 27001:2022 is declared applicable | high |
| D3 | Security artifacts | Four mutually incompatible SAST suppression schemas, and the enforcing agent scans for none of them | high |
| D4 | Security artifacts | The mandated ESLint suppression format does not suppress anything | medium |
| D5 | Security artifacts | PCI and GDPR are cited as live control refs while their applicability is an unfilled placeholder | medium |
| D6 | Security artifacts | The mTLS rule is contradicted by the control table, and the JDBC property named is not real | medium |
| D7 | Security artifacts | The two policies mandate mutually exclusive identity designs with no conditional | medium |
| D8 | Security artifacts | The README asserts a CI-enforced Semgrep config that does not exist | medium |
| D9 | Security artifacts | Both pen-test registers sit in a git-ignored directory, so they do not ship | medium |
| D10 | Security artifacts | The prohibited-algorithms table forbids a primitive another layer mandates | low |
| D11 | Security artifacts | The Semgrep example targets a React rule in an Angular-only project | low |
| E1 | Guides | Jest suite, coverage reporting and GitHub Actions CI are claimed; none exist | high |
| E2 | Guides | “6 specialist agents” and `.claude/agents/dev-lead.md` — the sixth agent file does not exist | high |
| E3 | Guides | A backlog table headed “none of these exist yet” lists 11 items marked Implemented ten lines above | high |
| E4 | Guides | “All 6 layers have @imported design documents — Complete” is false | high |
| E5 | Guides | “All 6 layer CLAUDE.md — fully populated” while three carry a FILL THIS IN banner | high |
| E6 | Guides | One RDE layer is rated three mutually exclusive ways in the same file | high |
| E7 | Guides | Five eval suites are presented as existing with case counts, then denied in the same files | high |
| E8 | Guides | The “out of the box” tree invents four folders and lists `skills/` twice | medium |
| E9 | Guides | A table headed “all 27” has 29 rows, and four skill descriptions are attached to the wrong ID | medium |
| E10 | Guides | `isolation: “worktree”` is documented for three agents, contradicted by the same guide and by dev-lead | medium |
| E11 | Guides | Broken cross-references, dead TOC anchors and an empty table | medium |
| E12 | Guides | “5 knowledge base docs + this guide” over-counts, and an “11 slash commands” row lists 9 | low |
| E13 | Guides | `dev mode` is promoted as a session entry point with no mechanism behind it | low |
| E14 | Guides | Duplication between the two agent guides measured at 20.6% | low |
| F1 | Worked example | The two-auth-model defect the README claims was fixed is still fully present | high |
| F2 | Worked example | The GUID rationale is garbled and states the opposite of the truth | high |
| F3 | Worked example | Roughly a third of ASVS IDs in the mapping cite a different requirement | high |
| F4 | Worked example | Two substituted ASVS IDs silently delete the control they were meant to cover | high |
| F5 | Worked example | Row-Level Security is FILTER PREDICATE only, so cross-tenant writes are unblocked | high |
| F6 | Worked example | The firewall table blocks the traffic the rest of the design depends on | high |
| F7 | Worked example | The frontend runs on only one of two load-balanced production hosts | high |
| F8 | Worked example | Refresh-token transport contradicts itself and logout cannot revoke anything | medium |
| F9 | Worked example | Vault delivery is specified two incompatible ways, and a private key is put in an env var | medium |
| F10 | Worked example | Financial and PII columns have a classification but no protection | medium |
| F11 | Worked example | Deterministic Always Encrypted on NVARCHAR with a unique index cannot be created as specified | medium |
| F12 | Worked example | The plaintext nginx hop the README says is “recorded as an explicit exception” is recorded nowhere | medium |
| F13 | Worked example | The API contract drifts from the data model, and PATCH bypasses a claimed business limit | medium |
| F14 | Worked example | A PII field is sent to a third party that exists in no table, against a consent record with no store | medium |

**Resolution:** pending
