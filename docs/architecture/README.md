# Architecture Documents

Architecture-level documents that span the whole system — not specific to a single layer.

---

## Folder structure

| Folder | What goes here | Format |
|---|---|---|
| `docs/architecture/` | System-level architecture documents, target state docs, architecture assessment outputs | `.md` preferred; PDF for externally produced documents |
| `docs/architecture/adr/` | Architecture Decision Records — one file per significant decision made during the project | `.md` only |

---

## Architecture Decision Records (ADRs)

An ADR captures a significant architectural decision: what was decided, why, what alternatives were considered, and what the consequences are. They are the team's permanent record of why the system is built the way it is.

### When to write an ADR

Write an ADR when:
- Choosing a framework, library, or platform (e.g. "why Spring Boot over Quarkus")
- Choosing an architectural pattern (e.g. "why modular monolith over microservices")
- Making a security or compliance decision (e.g. "why RS256 JWT over session cookies")
- Making a data design decision (e.g. "why Always Encrypted over application-level encryption")
- Deviating from an established team or company standard
- Making a decision that will be hard or costly to reverse

### ADR file naming convention

`[system-name]_ADR-[NNN]_[short-decision-title]_v[N].md`

| Example filename | Decision captured |
|---|---|
| `[system]_ADR-001_auth-strategy_v1.md` | Why JWT RS256 was chosen over session-based auth |
| `[system]_ADR-002_database-engine_v1.md` | Why SQL Server was chosen over PostgreSQL |
| `[system]_ADR-003_architecture-style_v1.md` | Why modular monolith over microservices for initial release |
| `[system]_ADR-004_secrets-management_v1.md` | Why HashiCorp Vault over environment variables |

Numbers are sequential and never reused. If a decision is revised, increment the version (`_v2.md`) and note the superseded version inside the file.

---

## Standard ADR format

Every ADR in this project follows this structure:

```markdown
# ADR-[NNN]: [Short decision title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by ADR-[NNN]
**Deciders:** [Names or roles — e.g. Tech Lead, Security Architect]

## Context

What situation or problem forced this decision?
What constraints applied (team size, compliance, timeline, existing stack)?

## Decision

What was decided — one clear statement.

## Rationale

Why this option over the alternatives?
Reference quality attributes (Security, Scalability, Maintainability, etc.) where relevant.

## Alternatives considered

| Option | Reason rejected |
|---|---|
| [Alternative A] | [Why it was not chosen] |
| [Alternative B] | [Why it was not chosen] |

## Consequences

**Positive:** What does this decision enable?
**Negative:** What does this decision cost or constrain?
**Risks:** What could go wrong, and how is it mitigated?

## References

- Link to relevant SSDLC phase output (e.g. Phase 4 component design)
- Link to supporting documents if applicable
```

---

## How to use ADRs with Claude

ADRs are reference documents — they explain the "why" behind the architecture. Reference them in the prompt when asking Claude to work on something that was shaped by a past decision:

```
@docs/architecture/adr/[system]_ADR-001_auth-strategy_v1.md
I need to add a new service-to-service API call between the notification service and the document service.
Should it use JWT bearer token or a different auth method? Follow the decision in this ADR.
```

ADRs are not typically `@imported` into layer `CLAUDE.md` files — they explain decisions already reflected in the layer's Tech Stack and Security Architecture sections. Reference them explicitly when a decision needs revisiting or when Claude needs the rationale behind a constraint.
