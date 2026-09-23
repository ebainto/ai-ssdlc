Activate the Infrastructure Agent and plan or review infrastructure changes.

Scope: $ARGUMENTS
(Expected formats:
  "plan [story-ID or feature description]"  — run IA1: plan infra requirements for a feature
  "review [layer or file]"                  — run IA2: review infra-as-code changes
  "monitoring"                              — run IA3: validate monitoring coverage across all services)

Steps to follow:
1. Read the HITL audit trail to confirm Gate 1 is approved. If not, stop: "Gate 1 (architecture sign-off) must be approved before infrastructure planning. The architecture must be validated first."
2. Read infrastructure/CLAUDE.md — confirm standards are populated. If unpopulated, stop: "infrastructure/CLAUDE.md is not populated. Populate it before planning or reviewing infra changes."
3. Parse the argument to determine which skill to run:
   - "plan ..." → SKILL IA1 (infrastructure planning) → fires IA4 automatically
   - "review ..." → SKILL IA2 (infrastructure review)
   - "monitoring" → SKILL IA3 (monitoring coverage check)
4. Execute the identified skill.
5. After IA1 + IA4: "Infrastructure change request saved. Run /infra-check review after implementing the changes to verify the config files."

Key rules:
- Never approve secrets in environment variables — all secrets via Vault only.
- Never approve TLS below 1.2 in Nginx config.
- Never approve Docker containers running as root.
- Never approve Docker images tagged "latest".
- Flag any new trust boundary for /threat-model-trigger-check.
- A new service with no monitoring is always a deployment blocker.
