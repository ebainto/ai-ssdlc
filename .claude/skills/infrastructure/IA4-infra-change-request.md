# IA4 — Produce infrastructure change request

**Agent:** Infrastructure Agent
**Trigger:** Fires automatically at the end of IA1. Also: `"produce infra change request"`, `"document infra changes"`

## CONFIDENTIALITY

Infrastructure change requests are internal planning documents. Do not include security-sensitive details (secret paths, credentials, internal IPs) in PR descriptions or commit messages — save to file only.

## Inputs required

Story ID and infrastructure change list from IA1.

## Output format

```
Infrastructure Change Request
==============================
Feature / Story: [ID]
Requested by:    Infrastructure Agent (SKILL IA1)
Date:            [today]

Changes required:
  1. [config file] — [what to add or change — specific enough to implement]
  2. [config file] — [what to add or change]

Vault changes:
  - New secret path: [path]
  - Policy update: [policy file] — add read on [path]

Docker changes:
  - New service: [name] — image [image:tag], port [N], health check [endpoint]
  - Resource limits: mem_limit [X], cpus [Y]

Nginx changes:
  - [New location block or upstream — exact config snippet]

Monitoring additions:
  - Prometheus scrape: [job name, target address]
  - Alert rule: [name, condition, severity]
  - Grafana panel: [dashboard, panel description]

Security implications:
  - [New trust boundary or secret path — flag explicitly]

Trust boundary flag: YES / NO
[If YES: "Raise a threat-model update request with the SSDLC owner before implementation"]

Next step: Implement the changes above, then run /infra-check review to verify.
```

## Save instruction

File: `infrastructure/change-requests/[story-id]_infra-change-request_v1.md`
Create folder if absent: `mkdir -p ./infrastructure/change-requests`

## Rules

- Specific enough that a developer can implement without asking follow-up questions
- Every Vault change must name the exact path and policy file
- Every Docker change must name the exact image and tag — never `latest`
- Trust boundary flag must always be present — YES or NO, never omitted
