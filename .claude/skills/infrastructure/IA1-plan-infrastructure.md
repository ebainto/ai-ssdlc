# IA1 — Plan infrastructure for a feature

**Agent:** Infrastructure Agent
**Trigger:** `"plan infra for [feature]"`, `"what infra does [story] need"`, or spawned by Dev Lead (OA5/OA6 Step 4)

## Pre-condition

Read `infrastructure/CLAUDE.md` before planning anything.

## Inputs required

| Input | Source | Required |
|---|---|---|
| Story ID or feature description | Spawn prompt or user | Yes |
| What the feature adds | Spawn prompt or developer description | Yes |

## Change-to-requirement mapping

| Change type | Infrastructure requirement | Config file(s) |
|---|---|---|
| New secret | Vault secret path + policy update | `vault/policies/[service].hcl` |
| New external service call | Egress rule or Nginx upstream | `nginx/upstream.conf` |
| New container / service | Docker Compose entry + health check | `docker/docker-compose.yml` |
| New database | DB container or Vault connection string | `vault/secrets/`, `docker/docker-compose.yml` |
| Non-secret env variable | Docker Compose env section | `docker/docker-compose.yml` |
| New observable endpoint | Prometheus scrape + Grafana panel | `monitoring/prometheus.yml`, `monitoring/grafana/` |
| New Nginx route | Location block or vhost entry | `nginx/[vhost].conf` |

## Behaviour

1. For each feature change: identify the requirement and config file using the table above
2. Flag any new network path or trust boundary: `[TRUST BOUNDARY — flag for /threat-model-trigger-check]`
3. Fire IA4 automatically to produce the Infrastructure Change Request

## Output

Infrastructure change checklist → then IA4 fires.
