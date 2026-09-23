# Infrastructure Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `infrastructure/` folder. It gives Claude the context it needs to write correct Docker configurations, Nginx configs, and server provisioning scripts — and to apply the security hardening rules specific to this on-premises environment.

**As a developer, you use this file to:**
- Define the server topology and tooling so Claude generates compatible configs for the on-prem environment
- Document the environment structure so Claude understands what runs where before making changes
- Specify security controls so Claude enforces network isolation, TLS, and secrets management in every config it writes
- Set deployment conventions so Claude never recommends applying changes directly to production servers

**When to update this file:**
- New servers or services are added to the topology
- Docker or Nginx versions change
- Security posture requirements change (new firewall rules, new TLS policy)
- Secret management approach changes

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — what this layer provisions, what it must not contain, deployment rules
- `security/policies/infrastructure-security-policy.md` — authoritative security standards for the on-prem environment

---

## Tech Stack

```
Hosting:          On-premises physical servers (Linux — Ubuntu 22.04 LTS)
Containerisation: Docker 25 + Docker Compose v2
Reverse proxy:    Nginx 1.24 (TLS termination, load balancing, static asset serving)
Secrets:          HashiCorp Vault 1.15 (AppRole auth; secrets injected into containers at startup)
Monitoring:       Prometheus 2.49 + Grafana 10 (metrics); Loki (logs); Alertmanager (alerts)
CI/CD:            Jenkins 2.440 (pipelines defined in Jenkinsfile at project root)
TLS certificates: Internal CA (on-prem) — certificates issued and renewed via cert-manager scripts
Database server:  Dedicated SQL Server 2022 host (not containerised — runs as Windows service)
File storage:     On-prem NAS (SMB share mounted to application servers)
```

---

## Commands

```bash
# ── Local development ──────────────────────────────────────────────────────

# Start all services locally (backend, frontend dev server, SQL Server, Vault dev)
docker compose -f docker/docker-compose.yml up

# Start a specific service
docker compose -f docker/docker-compose.yml up backend

# Rebuild and restart a specific service after code change
docker compose -f docker/docker-compose.yml up --build backend

# Stop all local services
docker compose -f docker/docker-compose.yml down

# View logs for a specific service
docker compose -f docker/docker-compose.yml logs -f backend

# Open a shell inside a running container
docker compose -f docker/docker-compose.yml exec backend bash

# ── Docker image management ────────────────────────────────────────────────

# Build backend image locally (for testing only — CI/CD builds for staging/prod)
docker build -t app-backend:local -f docker/backend.Dockerfile .

# Build frontend image locally
docker build -t app-frontend:local -f docker/frontend.Dockerfile .

# Inspect image layers
docker history app-backend:local

# ── Nginx ─────────────────────────────────────────────────────────────────

# Test Nginx config before applying (run on the target server)
nginx -t -c /etc/nginx/nginx.conf

# Reload Nginx config without downtime (run on the target server)
nginx -s reload

# ── Secrets (HashiCorp Vault) ──────────────────────────────────────────────

# Check Vault status (dev Vault must be running via docker-compose)
vault status

# Read a secret (dev only — uses root token in local docker-compose)
vault kv get secret/app/backend

# ── Production deploys — go through Jenkins only ───────────────────────────
# Never SSH into staging or prod servers and run docker commands manually.
# All deployments triggered via Jenkins pipeline: infrastructure/Jenkinsfile
```

> **Never manually run `docker compose up` or `docker pull` on staging or production servers.**
> All changes to those environments must go through the Jenkins pipeline.

---

## Application Specification — Server Topology

<!--
  HOW TO CONNECT INFRASTRUCTURE DOCUMENTS TO CLAUDE
  ──────────────────────────────────────────────────
  Infrastructure documents typically come from the platform team or solutions architect:

    docs/infrastructure/requirements/   ← server provisioning specs, capacity requirements
    docs/infrastructure/design/         ← network diagrams, deployment architecture docs

  For infrastructure design documents, convert to Markdown and @import here:
  @../docs/infrastructure/design/[your-system]_infrastructure-design_v1.md

  Network diagrams (PDF/images) are human reference — reference in the prompt when needed:
    @docs/infrastructure/design/network-topology-v2.pdf

  Rules:
  - Claude cannot read .docx — convert to .md first
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

<!-- Uncomment once you have an infrastructure design document of your own:
@../docs/infrastructure/design/[your-system]_infrastructure-design_v1.md
-->

**Environments:**

| Environment | Server(s) | OS | Purpose |
|---|---|---|---|
| `dev` | Developer laptop (Docker Desktop) | macOS / Windows | Local development and unit testing |
| `staging` | `app-staging-01` (8 CPU, 32 GB RAM) | Ubuntu 22.04 LTS | Pre-production validation; mirrors production config |
| `prod` | `app-prod-01`, `app-prod-02` (16 CPU, 64 GB RAM each) | Ubuntu 22.04 LTS | Live production; active-active behind Nginx load balancer |
| `prod-db` | `db-prod-01` (16 CPU, 128 GB RAM) | Windows Server 2022 | SQL Server 2022 — dedicated host, not containerised |
| `prod-vault` | `vault-prod-01` (4 CPU, 8 GB RAM) | Ubuntu 22.04 LTS | HashiCorp Vault — dedicated host |
| `prod-monitor` | `monitor-prod-01` (8 CPU, 16 GB RAM) | Ubuntu 22.04 LTS | Prometheus, Grafana, Loki, Alertmanager |

**Services running per server (production):**

| Server | Containers / services |
|---|---|
| `app-prod-01`, `app-prod-02` | `backend` (Spring Boot JAR in Docker), `nginx` (reverse proxy + TLS) |
| `app-prod-01` only | `frontend` (Nginx serving Angular build artifacts) |
| `db-prod-01` | SQL Server 2022 (Windows service, not Docker) |
| `vault-prod-01` | Vault server (systemd service) + Vault Agent (sidecar) |
| `monitor-prod-01` | Prometheus, Grafana, Loki, Alertmanager (all via Docker Compose) |

**Network topology:**
```
Internet
    │  HTTPS :443
    ▼
[Nginx — app-prod-01/02]     ← TLS termination; serves Angular static files
    │  HTTP :8080 (internal only)
    ▼
[Backend — Spring Boot container]
    │  TCP :1433 (internal VLAN only)
    ▼
[SQL Server — db-prod-01]

[Vault — vault-prod-01]      ← Secrets injected at container startup via Vault Agent
[Monitor — monitor-prod-01]  ← Prometheus scrapes :8080/actuator/prometheus from backend
```

---

## Security Architecture

> Aligned to: `security/policies/encryption-policy.md` — the policy that ships.
> Add `security/policies/infrastructure-security-policy.md` and point here instead
> if this layer grows rules the shared standards do not cover.
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Threat (Phase 2 ref) | Control | Implementation on-prem |
|---|---|---|
| Man-in-the-middle — external (STRIDE-I) | TLS 1.2+ enforced on all external connections | Nginx: `ssl_protocols TLSv1.2 TLSv1.3;` + `ssl_prefer_server_ciphers on;`. HTTP → HTTPS redirect for all requests |
| Man-in-the-middle — internal (STRIDE-I) | Internal service traffic on isolated VLAN | Backend → SQL Server traffic on dedicated VLAN (`10.0.2.0/24`); no cross-VLAN access without firewall rule |
| Secrets in config files (STRIDE-I) | HashiCorp Vault — no secrets in Docker Compose or env files | Vault Agent sidecar runs alongside each container; injects secrets as environment variables at startup. `.env` files contain only Vault address and AppRole credentials |
| Unauthorised container access (STRIDE-E) | Docker socket never mounted into a container; non-root containers | **Socket access is root-equivalent on the host** — anyone who can reach `/var/run/docker.sock` can start a privileged container and mount the host filesystem, so "restricted to the `jenkins` user" means the CI user is effectively root there. Never bind-mount the socket into an application container, and keep the CI runner off production app hosts. All containers run non-root (UID 1000) with `--no-new-privileges` |
| Unpatched base images (STRIDE-T) | Pinned digest images + weekly Trivy scan | All Dockerfiles use `FROM image@sha256:...` (never `latest`). Jenkins pipeline runs `trivy image` scan; critical CVEs block deployment |
| Unrestricted network access (STRIDE-I) | `ufw` firewall on all servers | Default deny-all inbound. Only open: `:443` (Nginx, internet-facing), `:1433` (SQL Server, VLAN only), `:8200` (Vault, internal only), `:9090` (Prometheus, monitor VLAN only) |
| Lateral movement after breach (STRIDE-E) | Separate service accounts per server | Each server has a dedicated OS service account with minimal sudo rights. No shared passwords. SSH key-based auth only — password auth disabled |
| Certificate expiry causing downtime (STRIDE-D) | Automated cert renewal + Alertmanager alert | `cert-renewal.sh` cron job (weekly check). Alertmanager fires `CertExpiryWarning` alert at 30 days and `CertExpiryCritical` at 7 days |

**Nginx TLS configuration (production):**
```nginx
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate     /etc/nginx/certs/app.crt;
    ssl_certificate_key /etc/nginx/certs/app.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    # Must match security/policies/encryption-policy.md — permitted TLS 1.2 suites
    ssl_ciphers         ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    # CSP must be a RESPONSE HEADER, not a <meta> tag: browsers ignore
    # frame-ancestors in a meta tag, which silently voids clickjacking cover.
    # Angular Material injects inline styles and inlines SVG data: URIs, so
    # style-src 'unsafe-inline' and img-src data: are required or the UI breaks.
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    # Angular static files
    root /var/www/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;

    # Backend API proxy.
    #
    # Plain HTTP here is a DOCUMENTED EXCEPTION to the mTLS rule in
    # security/policies/encryption-policy.md. It is permitted only because this
    # hop stays on one host across a private Docker bridge network and cannot
    # traverse the LAN. Conditions: the backend publishes no host port, the
    # bridge is not shared with other stacks, and nginx and backend are always
    # co-scheduled. If the backend ever moves to another host, this must become
    # https:// with mTLS and client certs from Vault — revisit before any split.
    location /api/ {
        proxy_pass         http://backend:8080;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

**Docker Compose security flags (applied to all services):**
```yaml
services:
  backend:
    image: app-backend@sha256:<pinned-digest>   # never use :latest
    user: "1000:1000"                            # non-root user
    security_opt:
      - no-new-privileges:true                   # prevent privilege escalation
    read_only: true                              # read-only root filesystem
    tmpfs:
      - /tmp                                     # writable temp only
    cap_drop:
      - ALL                                      # drop all Linux capabilities
    cap_add:
      - NET_BIND_SERVICE                         # only add what's needed
```

---

## File Structure

```
infrastructure/
├── docker/
│   ├── docker-compose.yml          — local development (all services)
│   ├── docker-compose.staging.yml  — staging overrides
│   ├── docker-compose.prod.yml     — production overrides (used by Jenkins)
│   ├── backend.Dockerfile          — Spring Boot JAR container
│   └── frontend.Dockerfile         — Nginx + Angular build output
├── nginx/
│   ├── nginx.conf                  — base Nginx config
│   ├── conf.d/app.conf             — app virtual host (dev/staging)
│   └── conf.d/app-prod.conf        — production virtual host (TLS)
├── vault/
│   ├── vault-agent-config.hcl      — Vault Agent sidecar config
│   └── policies/                   — Vault access policies per service
├── monitoring/
│   ├── prometheus.yml              — scrape targets config
│   ├── alertmanager.yml            — alert routing and receivers
│   └── grafana/dashboards/         — provisioned Grafana dashboards
└── scripts/
    ├── cert-renewal.sh             — TLS certificate renewal script
    ├── server-harden.sh            — OS hardening script (run once on new servers)
    └── backup-db.sh                — SQL Server backup script (run via cron)
```

---

## Layer Boundaries

**Responsibility:** Owns on-premises server configuration, Docker containers, Nginx reverse proxy, Vault secrets, and monitoring. Defines how the application runs and recovers — not what it does.

| Direction | Detail |
|---|---|
| **Provisions** | Compute (Docker containers), networking (Nginx), secrets (Vault), monitoring (Prometheus/Grafana) |
| **Consumed by** | All application layers — they run inside the environment this layer defines |
| **Must not** | Contain application business logic, API definitions, or database schema |

**Sub-folder purpose:**

| Folder | Contents |
|---|---|
| `infrastructure/docker/` | Dockerfiles per service; Docker Compose for dev, staging, and prod |
| `infrastructure/nginx/` | Reverse proxy config, TLS virtual hosts, security headers |
| `infrastructure/vault/` | Vault Agent sidecar config; access policies per service |
| `infrastructure/monitoring/` | Prometheus scrape config, Grafana dashboards, Alertmanager routing |
| `infrastructure/scripts/` | Server hardening (`server-harden.sh`), cert renewal, DB backup cron scripts |

**Deployment rule:** Never apply changes to staging or production manually via SSH or `docker compose up`. All environment changes go through the Jenkins pipeline. Local dev is the only exception.
