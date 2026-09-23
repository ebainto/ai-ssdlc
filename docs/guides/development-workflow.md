# Development Workflow — Typical Session Patterns

How to use Claude Code in the ai-ssdlc project. Session patterns, commands, and expected behavior.

---

## Session Entry Points

### Pattern 1: Starting a Development Session

```
You (in Claude Code):
"dev mode" or "/new-feature BE-042"

Claude responds:
[Dev Lead coordinator runs]

Dev Lead:
1. Checks gate status (reads ssdlc/hitl-audit-trail)
2. Confirms current gate is passed
3. Routes you to next action
```

**What happens next:**
- ✅ Gates 1-5 already approved → Dev Lead routes you to QA Engineer
- ⚠️ Gate 3 (Requirements) not approved → Dev Lead blocks: "Gate 3 not approved yet"
- 🚫 Gate 5 (Dev Standards) not approved → Dev Lead blocks: "Gate 5 required before code work"

---

### Pattern 2: Code Review Session

```
You:
"/code-review"

Claude responds:
[Code Reviewer Agent activates - FRESH context, no prior session data]

Code Reviewer:
1. Reads your recent changes (git diff)
2. Reads layer CLAUDE.md for that layer
3. Checks against security policies
4. Produces CR4 report: APPROVED / CHANGES REQUIRED / REJECTED
```

**Key rule:** Code Reviewer is always a fresh agent. Even if you reviewed the same file 5 minutes ago, this is a new review with fresh eyes.

---

### Pattern 3: Security Audit Session

```
You:
"/security-audit" or "/security-audit full project scan"

Claude responds:
[Security Auditor Agent activates - FRESH context]

Security Auditor:
1. Reads your recent changes
2. Reads threat model (from ssdlc/threat-model_vN.md)
3. Cross-references STRIDE mitigations
4. Any findings → written ONLY to security/pen-test/internal-findings-register.md
5. Returns: "N findings recorded to register" (no details in chat)
```

**Critical rule:** Findings are confidential. Never output to conversation, PR, or commit.

---

### Pattern 4: Test Writing Session

```
You:
"/run-tests BE-042" or "write tests for story InvoiceImportService"

Claude responds:
[QA Engineer Agent activates - FRESH context]

QA Engineer:
1. Reads acceptance criteria from user story
2. Reads layer CLAUDE.md (test framework, folder structure, naming)
3. Writes tests BEFORE any implementation
4. Returns: Test file with passing + failing cases per AC
5. Security AC always has explicit security test
```

**Sequence enforced:** Tests first, code after. Dev Lead pipeline always spawns QA before Dev.

---

### Pattern 5: Research / ADR Session

```
You:
"/research spring-boot upgrade" or "/write-adr JWT vs session cookies"

Claude responds:
[Tech Researcher Agent activates - NO gate dependency]

Tech Researcher:
1. For "/research": TR1/TR2 skills (version check, upgrade path, breaking changes)
2. For "/write-adr": TR3 skill (check existing), then TR4 (write new)
3. Returns: Decision document or upgrade recommendation
4. No gates required — research anytime
```

---

### Pattern 6: Infrastructure Planning Session

```
You:
"/infra-check plan BE-042" (feature that needs infrastructure changes)

Claude responds:
[Infrastructure Agent activates - requires Gate 1]

Infrastructure Agent:
1. Reads story
2. Maps to infrastructure config changes needed (Vault, Docker, Nginx, Prometheus)
3. Produces IA4 document saved to infrastructure/change-requests/
4. May require IA3 monitoring validation
```

**Gate requirement:** Gate 1 (Architecture) must be approved first.

---

## Within-Session Workflow: Typical Feature Development

### The Complete Feature Pipeline

```
You start with:
/new-feature BE-042

Developer: Implement user story for invoice import with duplicate detection

┌─────────────────────────────────────────────────────┐
│ Dev Lead receives story (OA1 triage)                │
├─────────────────────────────────────────────────────┤
│ ✅ Check: Gate 3 (Requirements) approved?          │ YES → Continue
│ ✅ Check: Gate 5 (Dev Standards) approved?         │ YES → Continue
│ ✅ Check: Story in approved backlog?               │ YES → Continue
└─────────────────────────────────────────────────────┘
                        ↓
        Dev Lead routes to QA Engineer
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 1: QA Engineer writes tests (QA1/QA2)         │
├─────────────────────────────────────────────────────┤
│ • AC 1: Detects duplicate by hash → test passes    │
│ • AC 2: Updates existing record → test passes      │
│ • Security AC: Logs all imports → test passes      │
│ Result: tests/InvoiceImportServiceTest.java        │
└─────────────────────────────────────────────────────┘
                        ↓
        Developer implements code
                        ↓
┌─────────────────────────────────────────────────────┐
│ Step 2: Dev Lead spawns Code Reviewer (fresh)      │
├─────────────────────────────────────────────────────┤
│ Code Reviewer audits against:                       │
│ • backend/CLAUDE.md layer rules                     │
│ • backend/design/openapi-spec (API changed?)       │
│ • security/CLAUDE.md security rules (auth check)   │
│ • Test coverage (all ACs tested?)                   │
│ Result: CR4 report                                  │
└─────────────────────────────────────────────────────┘
              ↓                    ↓
         APPROVED          CHANGES REQUIRED
              ↓                    ↓
      Proceed to audit      Developer fixes & re-review
              ↓
┌─────────────────────────────────────────────────────┐
│ Step 3: Dev Lead spawns Security Auditor (fresh)   │
├─────────────────────────────────────────────────────┤
│ Security Auditor checks:                            │
│ • Threat model (STRIDE for invoice import)?        │
│ • Auth/authz on /api/invoices/import endpoint?     │
│ • Input validation (file upload safety)?           │
│ • Audit logging of PII (invoice data)?             │
│ • SAST scan for injection vulnerabilities          │
│ Finding? → Written to findings-register only       │
│ No findings → Approval for PR                       │
└─────────────────────────────────────────────────────┘
                        ↓
         All approvals confirmed
                        ↓
         Dev Lead: "Ready to create PR"
                        ↓
         You: gh pr create
                        ↓
    PR merged, feature deployed to staging
```

---

## Gate Decision Points

### Before Each Gate Approval

**Gate 1 — Architecture**
```
You type:
"Check gate status"

Dev Lead:
[Reads ssdlc/hitl-audit-trail_vN.md]

Gate 1: Architecture Sign-Off — [status]
  Date approved: 2026-09-20
  Decision: approve
  Conditions: None

Gate 2-7: Pending
```

**When ready to proceed to next phase:**
```
You provide architecture document, then ask:
"Request Gate 1 approval"

Dev Lead presents:
---
⏸ HUMAN APPROVAL REQUIRED — Gate 1: Architecture Sign-Off

What I have produced:
  - All 8 capability layers defined ✅
  - Security layer includes auth, secrets, encryption ✅
  - DevSecOps pipeline designed ✅
  - Monitoring and observability designed ✅

What I need from you:
  Type ONE of these responses:
    approve
    reject
    approve with conditions: [your notes]

I will not proceed until one of these exact responses is received.
---

You type (exactly):
approve

[Gate logged to audit trail with timestamp]
✅ Gate 1 APPROVED — Proceed to Gate 2 (Threat Modeling)
```

---

## Save Discipline — Always Applies

### After Every Skill Output

**You see:**
```
---
Save instruction:
  File:    ./ssdlc/[system]_threat-model_v2.md
  Version: v2 — if v1 exists, save as v2 (never overwrite)
  Create folder if absent: mkdir -p ./ssdlc
---
```

**What you do:**
1. Read the save instruction block
2. **BEFORE proceeding to next skill**, save the file to exactly that path
3. Verify file was created: `ls -la ./ssdlc/[system]_threat-model_v2.md`
4. **Then** move to next step

**If you don't save:**
- ❌ Work is lost if session breaks
- ❌ Audit trail incomplete
- ❌ Phase gate cannot be logged

**Best practice:** Copy-paste the exact path into your terminal before asking Claude for the next phase.

---

## Layer Switching — How Context Changes

### When You Change Directories

```
Scenario 1: Working in backend/

You're in backend/ → backend/CLAUDE.md auto-loads
  • Spring Boot rules
  • API contract (openapi-spec_v1.yaml @imported)
  • Security Architecture rules (from security/CLAUDE.md)
  • "Backend only layer that writes DB" rule enforced

You switch to frontend/

frontend/CLAUDE.md auto-loads
  • Angular rules
  • Same API contract (frontend must match)
  • Frontend security rules (no hardcoded secrets)
  • "Frontend calls backend only" rule enforced
```

### Security Context — Special Case

```
Backend developer asks:
"@security/CLAUDE.md — does this new JWT claim require threat model update?"

Claude:
1. Loads security/CLAUDE.md explicitly
2. Answers the question
3. Returns to backend/CLAUDE.md context

Security folder developer works:
backend/CLAUDE.md does NOT load security/ automatically
security/CLAUDE.md loads only in security/ directory
(Intentional: prevents noise in other layers)
```

---

## Error Scenarios & Recovery

### Scenario 1: Gate Bypass Attempt

```
You:
"/code-review BE-042"

Dev Lead blocks:
"Gate 5 (Development Standards) not approved yet.
Code review requires:
  • Coding standards defined ✅
  • CI/CD pipeline approved ✅
  • Definition of Done confirmed ✅
  
Current status: Gate 5 PENDING

Cannot spawn Code Reviewer until Gate 5 is approved.
Request: Run '/gate status 5' to see what's missing."
```

### Scenario 2: Test Skipped (TDD Violation)

```
You (developer):
"Implement invoice import feature"

Dev Lead blocks:
"Tests must be written first (TDD requirement).
Your next step: /run-tests BE-042

Correct sequence:
  1. /run-tests → QA writes tests ✅
  2. Developer implements code
  3. /code-review → Code Reviewer reviews
  4. /security-audit → Security Auditor audits
  5. gh pr create → Create PR

I cannot spawn implementation before tests."
```

### Scenario 3: Session Break (Recovery)

```
Session breaks mid-development

You restart, type:
"dev mode"

Dev Lead checks:
1. Last gate approved?
2. Current work in progress?
3. Unfinished artifacts?

Dev Lead responds:
"Session resumed. Status:
  • Gate 5: APPROVED (2026-09-20)
  • QA wrote tests for BE-042 → tests/InvoiceImportServiceTest.java ✅
  • You were implementing service layer
  • Ready to: Implement InvoiceImportService.java
  
Recommendation: Continue implementation, then /code-review"
```

---

## Commands at a Glance

| Command | When to Use | Result |
|---------|-----------|--------|
| `/new-feature BE-042` | Start feature work | QA → Dev → Review → Audit → PR |
| `/new-api GET /invoices/{id}` | Add new API endpoint | Spec → QA → Dev → Review → Audit → PR |
| `/new-component PaymentForm frontend` | New UI/backend component | Layer-aware pipeline |
| `/code-review` | Review code changes | Code Reviewer (fresh) produces CR4 report |
| `/run-tests BE-042` | Write tests for story | QA Engineer writes before code |
| `/security-audit` | Security check | Security Auditor (fresh) → findings register |
| `/research spring-boot upgrade` | Investigate tech choice | Version audit, breaking changes, rollback plan |
| `/write-adr JWT vs session` | Document decision | Tech Researcher checks existing ADRs, writes new |
| `/infra-check plan BE-042` | Infrastructure needed | Infrastructure Agent maps config changes |
| `/infra-check monitoring` | Check observability | IA3 validates all services are monitored |
| `/gate status 1` | Pre-gate validation | Current decision for Gate 1 |
| `/gate 1 approve` | Record a gate decision | Appends to the HITL audit trail — the only writer |
| `/adversarial-review layer backend` | Adversarial review | Named perspectives raise severity-rated findings |
| `/adversarial-review changes` | Review uncommitted work | Independent reviewer, security analyst, regression hunter |
| `/adversarial-review report` | Full-repo adversarial sweep | Filterable HTML page in `docs/guides/[system]_adversarial-review_vN.html` |
| `/dev-lead BE-042` | Plan and coordinate | Checks gates, enforces TDD order, spawns specialists |
| `check gate status` | Where are we? | Read audit trail, show current gate |
| `dev mode` | Resume session | Dev Lead restarts orchestration |

---

## Best Practices — What Works Best

### ✅ DO:

- ✅ **Start every session** with `/new-feature`, `/new-api`, or `dev mode`
- ✅ **Wait for tests first** — QA writes before you implement
- ✅ **Read gate checklists** — `/gate status N` before requesting approval
- ✅ **Save immediately** after phase outputs — don't proceed without saving
- ✅ **Use fresh reviews** — Code Reviewer and Security Auditor are intentionally fresh agents
- ✅ **Log gate decisions** — Always approve/reject/conditional, never "OK" or "continue"
- ✅ **Reference layer CLAUDE.md** — Each layer has the truth about conventions

### ❌ DON'T:

- ❌ Skip gate approvals — All 7 gates are mandatory
- ❌ Write code before tests — TDD is enforced
- ❌ Use fuzzy gate responses — "Yes", "OK", "let's go" don't count
- ❌ Include security findings in PRs — Findings go to register only
- ❌ Bypass Code Reviewer/Security Auditor — They're fresh for a reason
- ❌ Overwrite versioned artifacts — Always increment v1 → v2 → v3
- ❌ Hardcode secrets — All secrets from Vault
- ❌ Skip save instructions — Work is lost without saving

---

## Session Timeline Example

```
14:00 — You start
        "dev mode"
        Dev Lead: "Gate 5 approved. Ready for feature work?"

14:02 — QA Engineer writes tests
        "/run-tests BE-042"
        QA: Tests written to backend/src/test/.../InvoiceImportServiceTest.java

14:15 — You implement
        (Manual work — Claude is waiting)

14:45 — Code review
        "/code-review"
        Code Reviewer: "APPROVED — all ACs have tests, layer boundaries respected"

14:50 — Security audit
        "/security-audit"
        Security Auditor: "1 finding recorded. No blockers. Ready for PR."

14:52 — Create PR
        "gh pr create"
        PR created and linked

15:00 — Session end
        All work saved to git with versioned artifacts
        HITL audit trail updated
```

---

## Getting Unstuck

| Problem | Solution |
|---------|----------|
| "Which command should I use?" | `/dev-lead` with a plain description — it triages and routes (SKILL OA1) |
| "What's required for this gate?" | `/gate status N` → current decision for that gate |
| "Did I follow TDD?" | `/run-tests` always before code. If skipped, start over. |
| "Where's my work?" | `git log` shows all commits + versions in `ssdlc/` folder |
| "Can I bypass Gate 3?" | No. All gates mandatory. Read gate checklist first. |
| "Session restarted, lost progress" | `git diff HEAD~1` shows what changed. `ssdlc/hitl-audit-trail` shows gate status. |

---

**Last updated:** 2026-09-21  
**For reference:** See `quick-reference-agent-and-skills.md` for one-page daily lookup  
**For details:** See `agents-and-skills-guide.md` for full skill specifications
