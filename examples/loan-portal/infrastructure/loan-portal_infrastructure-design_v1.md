# Loan Portal — Infrastructure Design v1

On-premises deployment. No cloud provider. All servers are physical hardware managed by the platform team.

---

## Server Inventory

| Hostname | Role | CPU | RAM | OS | Notes |
|---|---|---|---|---|---|
| `app-staging-01` | Staging application server | 8 vCPU | 32 GB | Ubuntu 22.04 LTS | Mirrors production config; used for pre-production validation |
| `app-prod-01` | Production application server (primary) | 16 vCPU | 64 GB | Ubuntu 22.04 LTS | Active in load balancer rotation |
| `app-prod-02` | Production application server (secondary) | 16 vCPU | 64 GB | Ubuntu 22.04 LTS | Active in load balancer rotation |
| `db-prod-01` | SQL Server database host | 16 vCPU | 128 GB | Windows Server 2022 | Not containerised — SQL Server 2022 as Windows service |
| `vault-prod-01` | HashiCorp Vault host | 4 vCPU | 8 GB | Ubuntu 22.04 LTS | Dedicated Vault server; Vault Agent sidecar deployed per app server |
| `monitor-prod-01` | Monitoring stack host | 8 vCPU | 16 GB | Ubuntu 22.04 LTS | Prometheus, Grafana, Loki, Alertmanager |
| `nas01` | NAS file storage | — | — | — | SMB share mounted to app servers at `/mnt/loan-docs/` |
| `jenkins-01` | CI/CD server | 8 vCPU | 16 GB | Ubuntu 22.04 LTS | Jenkins 2.440; builds, tests, and deploys all environments |

---

## Network Topology

```
Internet
    │  HTTPS :443
    ▼
[Hardware Load Balancer]
    │  Round-robin to app-prod-01 and app-prod-02
    │
    ├──────────────────────────────┐
    ▼                              ▼
[app-prod-01]                 [app-prod-02]
[Nginx :443 — TLS termination]
[Angular static files]
    │  HTTP :8080 (VLAN 10.0.1.0/24 only)
    ▼
[Backend — Spring Boot — Docker container]
    │  TCP :1433 (VLAN 10.0.2.0/24 only)
    ▼
[db-prod-01 — SQL Server 2022]

[vault-prod-01]      ← :8200 (VLAN 10.0.1.0/24 only)
  Vault Agent sidecar co-deployed on each app server
  Injects secrets at container startup

[monitor-prod-01]    ← Prometheus scrapes :8080/actuator/prometheus
  ← Loki receives logs from Loki Docker driver on all app servers
  → Grafana serves dashboards on :3000 (internal monitoring VLAN only)

[nas01]              ← SMB share mounted to /mnt/loan-docs/ on app servers
```

---

## Network Segments (VLANs)

| VLAN | Subnet | Purpose | Access rules |
|---|---|---|---|
| Application VLAN | `10.0.1.0/24` | App servers ↔ Vault ↔ RabbitMQ | App servers only; no direct internet access |
| Database VLAN | `10.0.2.0/24` | App servers → SQL Server | `appuser` from app servers; `flywayuser` from Jenkins only |
| Monitoring VLAN | `10.0.3.0/24` | Prometheus scraping, Grafana, Alertmanager | Monitor server only; read-only metrics pull |
| Management VLAN | `10.0.4.0/24` | Jenkins, SSH access, admin operations | Jump host required; MFA enforced |

---

## Firewall Rules (UFW — all servers)

| Server | Port | Protocol | Direction | Source | Purpose |
|---|---|---|---|---|---|
| `app-prod-01/02` | 443 | TCP | Inbound | Internet | HTTPS (Nginx) |
| `app-prod-01/02` | 80 | TCP | Inbound | Internet | HTTP → HTTPS redirect |
| `app-prod-01/02` | 22 | TCP | Inbound | Management VLAN | SSH (key-based auth only) |
| `app-prod-01/02` | 8080 | TCP | Outbound | Application VLAN | Backend health checks (Prometheus) |
| `db-prod-01` | 1433 | TCP | Inbound | Application VLAN | SQL Server |
| `db-prod-01` | 1433 | TCP | Inbound | Management VLAN | Flyway migrations (Jenkins) |
| `vault-prod-01` | 8200 | TCP | Inbound | Application VLAN | Vault API (secrets fetch at startup) |
| `vault-prod-01` | 8200 | TCP | Inbound | Management VLAN | Vault admin |
| `monitor-prod-01` | 9090 | TCP | Inbound | Monitoring VLAN | Prometheus |
| `monitor-prod-01` | 3000 | TCP | Inbound | Management VLAN | Grafana UI |
| All servers | ALL | — | Default | — | DENY all not listed above |

---

## Container Configuration per Application Server

Services running on `app-prod-01` and `app-prod-02` (via Docker Compose):

| Container | Image | Internal port | External | Restart policy |
|---|---|---|---|---|
| `backend` | `app-backend@sha256:<pinned>` | 8080 | Not exposed (Nginx proxies) | `unless-stopped` |
| `nginx` | `nginx:1.24@sha256:<pinned>` | 80, 443 | 80, 443 | `unless-stopped` |
| `vault-agent` | `hashicorp/vault:1.15@sha256:<pinned>` | 8100 (sidecar) | Not exposed | `unless-stopped` |
| `rabbitmq` | `rabbitmq:3.12-management@sha256:<pinned>` | 5672, 15672 | Not exposed (app VLAN only) | `unless-stopped` |

`app-prod-01` additionally runs:

| Container | Image | Internal port | Notes |
|---|---|---|---|
| `frontend` | `app-frontend@sha256:<pinned>` | (served by Nginx from dist/) | Angular build output in Nginx container |

---

## HashiCorp Vault Secret Paths

| Path | Secret(s) | Consumed by |
|---|---|---|
| `secret/app/backend/db` | `DB_URL`, `DB_USERNAME` (`appuser`), `DB_PASSWORD` | Backend container at startup |
| `secret/app/backend/jwt` | `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (RS256 key pair) | Backend container at startup |
| `secret/app/backend/auth0` | `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN` | Backend container at startup |
| `secret/app/backend/sendgrid` | `SENDGRID_API_KEY` | Backend container at startup |
| `secret/app/backend/equifax` | `EQUIFAX_CLIENT_CERT`, `EQUIFAX_CLIENT_KEY` | Backend container at startup |
| `secret/app/backend/docusign` | `DOCUSIGN_API_KEY`, `DOCUSIGN_WEBHOOK_SECRET` | Backend container at startup |
| `secret/app/backend/rabbitmq` | `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD` | Backend container at startup |
| `secret/infra/flyway` | `FLYWAY_DB_URL`, `FLYWAY_USERNAME` (`flywayuser`), `FLYWAY_PASSWORD` | Jenkins pipeline |

**Rule:** No secrets in `application.yml`, `.env`, Dockerfiles, or Docker Compose files. Vault Agent injects all secrets as environment variables at container startup. The only values allowed in `.env` files are the Vault server address and the AppRole `role_id`.

---

## Monitoring — Prometheus Scrape Targets

| Job name | Target | Scrape interval | Metrics |
|---|---|---|---|
| `backend-prod-01` | `app-prod-01:8080/actuator/prometheus` | 15s | JVM, HTTP request latency, custom business metrics |
| `backend-prod-02` | `app-prod-02:8080/actuator/prometheus` | 15s | Same |
| `nginx-prod-01` | `app-prod-01:9113/metrics` (nginx-prometheus-exporter) | 30s | Request rate, error rate, upstream response time |
| `nginx-prod-02` | `app-prod-02:9113/metrics` | 30s | Same |
| `node-exporter` | All servers `:9100/metrics` | 30s | CPU, memory, disk, network |
| `vault` | `vault-prod-01:8200/v1/sys/metrics` | 30s | Vault health, token counts |

---

## Alertmanager Rules (critical alerts)

| Alert name | Condition | Severity | Receiver |
|---|---|---|---|
| `BackendDown` | `up{job="backend"} == 0` for 1 minute | Critical | PagerDuty + Slack `#incidents` |
| `HighErrorRate` | HTTP 5xx rate > 5% over 5 minutes | High | Slack `#incidents` |
| `HighLatency` | P99 response time > 2s over 5 minutes | High | Slack `#oncall` |
| `DiskSpaceLow` | Available disk < 10% | High | Slack `#oncall` |
| `CertExpiryWarning` | TLS cert expires in < 30 days | Warning | Slack `#oncall` |
| `CertExpiryCritical` | TLS cert expires in < 7 days | Critical | PagerDuty + Slack `#incidents` |
| `VaultSealed` | `vault_core_unsealed == 0` | Critical | PagerDuty + Slack `#incidents` |

---

## Deployment Process (Jenkins)

All deployments to staging and production go through Jenkins. No manual SSH deployments.

```
1. Code merged to main branch
       ↓
2. Jenkins pipeline triggered (webhook)
       ↓
3. Build: mvn package (backend JAR), ng build (frontend dist)
       ↓
4. SAST: SpotBugs + Semgrep + ESLint
   SCA:  OWASP Dependency-Check + npm audit
   Image scan: Trivy — Critical CVEs block pipeline
       ↓
5. Unit + integration tests — coverage gate ≥ 80%
       ↓
6. Build and push Docker images (pinned digest to internal registry)
       ↓
7. Deploy to staging: docker compose pull + docker compose up -d
   Run smoke tests against staging
       ↓
8. Manual approval gate (platform lead)
       ↓
9. Flyway migrations run via Jenkins (flywayuser)
   MUST precede the application rollout — see the note below
       ↓
10. Deploy to prod-01 (rolling): pull, stop, start, health check
    Deploy to prod-02 after prod-01 healthy
```

> **Migrations run before the rollout, and must be backward compatible.**
>
> An earlier revision of this document had these two steps the other way round:
> the new application was rolled out to both production hosts and *then* the
> schema was migrated. That breaks the deploy — new code queries columns that do
> not exist yet, and the window is the whole rollout, not an instant.
>
> Running migrations first only works if each migration is additive with respect
> to the currently-deployed code, because during a rolling deploy the old and new
> versions run simultaneously against the same schema. Use expand/contract:
>
> | Release | Migration | Application |
> |---|---|---|
> | N | Add the new nullable column / new table; backfill | Ignores it |
> | N+1 | — | Writes both old and new; reads new |
> | N+2 | Drop the old column, add NOT NULL | Reads and writes new only |
>
> A destructive migration (drop, rename, narrow a type, add NOT NULL without a
> default) must never ship in the same release as the code that depends on it.

---

## TLS Certificate Management

- Certificates issued by internal CA
- Stored at `/etc/nginx/certs/` on each app server
- Renewed by `infrastructure/scripts/cert-renewal.sh` (cron job, runs weekly)
- Alertmanager fires `CertExpiryWarning` at 30 days and `CertExpiryCritical` at 7 days
- Renewal requires platform team action — not automated to avoid accidental rollover
