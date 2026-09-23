# IA2 — Review infrastructure changes

**Agent:** Infrastructure Agent
**Trigger:** `"review infra changes"`, `"review vault policy"`, `"review docker config"`, or spawned by Dev Lead

## Pre-condition

Read `infrastructure/CLAUDE.md` before reviewing any file.

## Behaviour

Read each changed infra config file. Check per component:

**Vault policy:**
- Least privilege — `read` only on exactly the paths needed
- No wildcard `*` paths unless documented
- No `write` access to secret paths from application accounts

**Docker / Docker Compose:**
- No `privileged: true` without documented exception
- No `user: root` in Dockerfile final stage
- Health check on every service
- No secrets in `environment:` — Vault-injected only
- Resource limits defined (`mem_limit`, `cpus`)
- Image pinned to specific version tag — no `latest`

**Nginx:**
- `ssl_protocols TLSv1.2 TLSv1.3` minimum
- `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` headers present
- No directory listing (`autoindex off`)
- Upstream timeout values set

**Monitoring:**
- Every new service has a Prometheus scrape job
- Every new service has at least one alert rule
- Grafana dashboard updated

## Output format

```
Infrastructure Review Report
============================
Vault policy:  APPROVED / CHANGES REQUIRED — [issue]
Docker config: APPROVED / CHANGES REQUIRED — [issue]
Nginx config:  APPROVED / CHANGES REQUIRED — [issue]
Monitoring:    APPROVED / CHANGES REQUIRED — [issue]

Blockers: [list — file:line — rule violated]
Trust boundary flag: YES / NO
Overall result: APPROVED / CHANGES REQUIRED / REJECTED
```

## Rules

- Every blocker cites the specific `infrastructure/CLAUDE.md` rule
- Never modify files — read and report only
- Secret in env var = always Critical blocker
- TLS below 1.2 = always Critical blocker
