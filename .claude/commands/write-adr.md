---
description: Write or update an Architecture Decision Record
argument-hint: <decision topic>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Agent
---

Activate the Tech Researcher Agent and write or update an Architecture Decision Record.

Decision topic: $ARGUMENTS
(Expected format: "[decision topic]" — e.g. "upgrade spring-boot 3.2 to 3.3" or "adopt resilience4j for circuit breaking")

Steps to follow:
1. Read docs/architecture/adr/ to scan existing ADRs — run SKILL TR3.
   - If an existing ADR covers this topic: "ADR-NNN covers this decision. Updating it rather than creating a new one."
   - If not found: proceed to create a new one.
2. Gather what is needed for the ADR:
   - If the topic relates to a library upgrade: check if /research has already been run. If yes, use those findings. If no, run SKILL TR2 first.
   - If the topic is a new architecture decision: ask the user: "What options were considered and why was this option chosen?"
3. Execute SKILL TR4 — write or update the ADR using the standard template.
4. Save to: docs/architecture/adr/[system-name]_ADR-[NNN]_[topic]_v1.md
   New ADR status is always "Proposed" — a human must approve before it becomes "Accepted".

Key rules:
- TR3 always runs before TR4 — never create a duplicate ADR.
- Never mark a new ADR as Accepted — status starts as Proposed.
- All source URLs must be verified (WebSearch) — never fabricated.
- Include an alternatives table — an ADR without rejected options is incomplete.
