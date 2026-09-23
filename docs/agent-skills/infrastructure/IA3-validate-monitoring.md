# IA3 — Validate monitoring coverage

**Agent:** Infrastructure Agent
**Trigger:** `"check monitoring coverage"`, `"is [service] monitored"`, `/infra-check monitoring`

## Behaviour

1. Read `infrastructure/docker/docker-compose.yml` — list all defined services
2. Read `infrastructure/monitoring/prometheus.yml` — check scrape jobs
3. Read `infrastructure/monitoring/alertmanager/` — check alert rules
4. Read `infrastructure/monitoring/grafana/` — check dashboard panels

## Output format

| Service | Prometheus scrape? | Alert rule? | Dashboard panel? | Status |
|---|---|---|---|---|
| [service] | Yes / No | Yes / No | Yes / No | Covered / Gap |

## Rules

- Any `Gap` = deployment blocker — flag clearly
- A service with no monitoring cannot go to production — non-negotiable
- Flag any service in Docker Compose not present in Prometheus as a configuration drift warning
