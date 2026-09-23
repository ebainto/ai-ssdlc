# Remaining Adversarial Review Fixes — Tracker

**Status:** 39/65 issues fixed. 26 remaining.
**Session Date:** 2026-09-23
**Last Updated:** After pushing to GitHub

---

## SECURITY ARTIFACTS (D1–D11) — 11 ISSUES

### Compliance & Standards (Critical)

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **D1** | ASVS IDs mis-cited (8 cases) | secure-coding-standard.md, encryption-policy.md | Verify all IDs against ASVS 4.0.3 spec; update if wrong | Security Lead | 🔴 Pending |
| **D2** | ISO 27001 uses 2013 numbering (withdrawn) | security/CLAUDE.md, encryption-policy.md | Update all A.x.x refs to 2022 numbering | Security Lead | 🔴 Pending |
| **D5** | PCI cited as control but marked [Yes/No] | encryption-policy.md | Either: (a) keep PCI [Yes/No] and remove PCI citations, or (b) document applicability | Team Decision | 🔴 Pending |

### Security Controls (High)

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **D3** | Four incompatible SAST suppression schemas | CLAUDE.md, suppression-rules.md, SA2 skill | Standardize on one format across all files | Security Lead | 🔴 Pending |
| **D4** | ESLint suppression format doesn't suppress | security/CLAUDE.md | Move eslint-disable directive after comment lines or use block comment | Security Lead | 🔴 Pending |
| **D6** | mTLS contradiction + wrong JDBC property | encryption-policy.md, infrastructure/CLAUDE.md | (1) Fix JDBC: `encrypt` not `Encrypted` (2) RabbitMQ: require mTLS or document exception | Security Lead | 🔴 Pending |

### Infrastructure & Operational (Medium)

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **D8** | README asserts non-existent Semgrep CI config | security/README.md | Update: "CI runs Semgrep (you configure)" not "CI enforces Semgrep" | Security Lead | 🔴 Pending |
| **D9** | Pen-test registers in git-ignored dir (don't ship) | .gitignore, security/CLAUDE.md | Create template outside ignored dir OR unignore and document confidentiality | Security Lead | 🔴 Pending |

### Specification Clarifications (Lower)

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **D7** | Identity designs mutually exclusive | encryption-policy.md | **PARTIALLY FIXED via C1–C4**. Verify no lingering contradictions. | — | ✅ 80% |
| **D10** | HS256 forbidden but HMAC required (same primitive) | encryption-policy.md, integration/CLAUDE.md | Clarify: forbid HS256 for JWT; permit HMAC-SHA256 for webhooks | Security Lead | 🔴 Pending |
| **D11** | Semgrep example targets React (Angular project) | security/sast/suppression-rules.md | Replace React example with `bypassSecurityTrustHtml` (Angular) | Security Lead | 🔴 Pending |

---

## GUIDE CONTRADICTIONS (E3, E5, E9–E11) — 5 ISSUES

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **E3** | Backlog table duplicates Implemented items | docs/guides/agents-and-skills-guide.md | Remove or replace with genuinely future items | — | 🔴 Pending |
| **E5** | Layer CLAUDE.md marked "fully populated" but has 70 placeholders | docs/guides/quick-reference-agent-and-skills.md | Change to "⚠️ Template shape — 70 placeholders to replace" | — | 🔴 Pending |
| **E9** | Table headed "all 27" (fixed to 29) + transposed descriptions | quick-reference-agent-and-skills.md | Verify OA3/OA4 and QA2/QA3 descriptions are correct | — | 🟡 90% (count fixed) |
| **E10** | `isolation: "worktree"` documented but not implemented | agents-and-skills-guide.md | Remove isolation claim; explain independence via fresh start | — | 🔴 Pending |
| **E11** | Broken cross-references, dead TOC anchors, empty table | agents-and-skills-guide.md | Fix section numbering (7→8), resolve anchors, remove empty table | — | 🔴 Pending |

---

## WORKED EXAMPLE (F) — ~5 ISSUES

| ID | Issue | File | Action Required | Owner | Status |
|---|---|---|---|---|---|
| **F1–F5** | Internal inconsistencies in examples/loan-portal/ | examples/loan-portal/README.md | Review claims vs. actual state; update or correct | — | 🔴 Pending |

---

## TEAM DECISIONS REQUIRED — 1 ISSUE

| ID | Issue | Context | Decision Needed | Consequence |
|---|---|---|---|---|
| **C15** | Auto-loaded template asserts ISO 27001, financial sector, Australian Privacy Act as fact | security/CLAUDE.md lines 99–102 | Keep as template claims OR convert to [Yes/No] placeholders? | If template claims remain, every fork inherits unverified compliance assertions. If placeholders, teams must explicitly decide. |

---

## Recommendations

### Quick Wins (2–3 hours)
- **E3, E5, E10, E11:** Guide contradictions — document updates, no logic changes
- **E9:** Verify transposed descriptions (likely already correct after previous fixes)

### Medium Effort (4–6 hours)
- **D11, D4, D3:** SAST documentation and suppression format standardization
- **D8, D9:** Infrastructure documentation updates

### High Effort / Team Input Required (6+ hours)
- **D1, D2:** ASVS/ISO standards verification and updates
- **D5, D6, D7, D10:** Security architecture reconciliation
- **C15:** Compliance assertions — requires team/legal review
- **F1–F5:** Worked example review and correction

---

## Next Steps

1. **Immediate:** Fix guide contradictions (E3, E5, E9–E11) — high ROI, low effort
2. **This Week:** Security artifact clarifications (D8, D9, D11, D4) — documentation updates
3. **Planned:** D1, D2 standards verification and C15 team decision
4. **Backlog:** D5, D6, D7, D10 security architecture reconciliation + F worked example

---

**Last session:** Fixed 39/65 issues (60% complete)
**Remaining:** 26 issues (40%)
**Repository:** https://github.com/ebainto/ai-ssdlc
