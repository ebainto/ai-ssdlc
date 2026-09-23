---
description: Research library versions, CVEs or upgrade paths using live web search
argument-hint: versions | upgrade <lib> <from> to <to> | <topic>
allowed-tools: Read, Bash(grep:*), Bash(ls:*), Bash(cat:*), Agent
---

Activate the Tech Researcher Agent and research the specified topic.

Topic: $ARGUMENTS
(Expected formats:
  "versions"                          — run TR1: full version audit of all dependencies
  "upgrade [library] [from] to [to]"  — run TR2: research upgrade path for one library
  "[library or technology]"           — run TR5: research spike on a topic or technology)

Steps to follow:
1. Parse the argument to determine which skill to run:
   - "versions" → SKILL TR1 (version audit across all layers)
   - "upgrade [library]..." → SKILL TR2 (upgrade path research for one library)
   - Any other topic → SKILL TR5 (research spike)
2. Read root CLAUDE.md to confirm the tech stack in scope.
3. Execute the identified skill using WebSearch to fetch current information — never recall version numbers from memory.
4. After TR1: if any Critical or High urgency dependencies are found, offer to run TR2 for each.
5. After TR2: if the recommendation is Proceed and effort is L or XL, offer to run /write-adr to document the decision.
6. After TR5: if the spike recommends adoption, offer to run /write-adr.

Key rules:
- All version numbers from WebSearch only — mark unverifiable numbers as [ASSUMED — verify against registry].
- Never recommend a library with a Critical CVE in the target version.
- Upgrade recommendations must include: current version, target version, breaking changes, effort (S/M/L/XL), rollback plan.
