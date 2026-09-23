# Infrastructure Supporting Documents

Supporting documents for the infrastructure layer — server topology designs, network diagrams, capacity plans, and infrastructure design documents delivered by the infrastructure team, network engineers, or solutions architects.

---

## Folder structure

| Folder | What goes here | Format | Claude-accessible? |
|---|---|---|---|
| `requirements/` | Infrastructure requirements, capacity requirements, SLA targets, hosting constraints from the business | Convert to `.md`; keep original alongside | Yes — `@import` into `infrastructure/CLAUDE.md` |
| `design/` | Server topology design, network architecture, Docker/Nginx design decisions, Vault access policy design, monitoring design | `.md` for design decisions; PDF/images for diagrams — human reference | `.md` files — `@import`; PDF/images — prompt-only |

---

## How inline content and @imported documents work together

The `infrastructure/CLAUDE.md` works as both at the same time — content you write directly into the file and documents you `@import` are loaded together as one combined context. Claude sees no difference between the two.

```
infrastructure/CLAUDE.md (what Claude loads)
│
├── Inline content — written directly into the file
│   └── Tech Stack, Commands, Security Architecture,
│       Server Topology, Conventions, Layer Boundaries —
│       stable, structured content maintained here permanently
│
└── @import statements — pull in external documents
    └── @../docs/infrastructure/design/[system]_network-design_v1.md
        → Claude reads this file and treats it as part of
          infrastructure/CLAUDE.md — indistinguishable from inline content
```

---

## What goes inline vs what goes in @imported documents

| What goes inline in `infrastructure/CLAUDE.md` | What goes in `@imported` documents |
|---|---|
| Tech stack (Docker version, Nginx version, Vault version) | Detailed network architecture design from the network engineer |
| Commands (docker compose up, vault status, nginx -t) | Server topology design with IP ranges and VLAN assignments |
| Server topology summary (brief — host roles, IP summary) | Capacity plan from the infrastructure team |
| Key ports and protocols table | Vault access policy design document |
| Security Architecture (TLS config, Vault agent, firewall rules summary) | Monitoring and alerting design (if maintained separately) |
| Monitoring stack summary (Prometheus, Grafana, Loki) | Any document that versions independently from the config files |
| Conventions (Docker naming, volume mounts, env vars) | — |
| Layer Boundaries | — |

**The rule:** stable, structured content you maintain as config files evolve stays inline. Documents delivered by the network or infrastructure team — which version independently — are `@imported`.

---

## How to use the `requirements/` folder

Store infrastructure requirements and hosting constraints here.

**Step 1 — Convert to Markdown and store both copies**

```
docs/infrastructure/requirements/
├── [system]_infra-requirements_v1.md     ← Claude reads this
└── [system]_infra-requirements_v1.docx   ← original; human reference only
```

**Step 2 — Add `@import` to `infrastructure/CLAUDE.md`**

```markdown
## Application Specification

@../docs/infrastructure/requirements/[system]_infra-requirements_v1.md

**Environment overview:**  ← your inline content continues here
```

**Step 3 — When a new version arrives, update one line**

```markdown
<!-- update this line only: -->
@../docs/infrastructure/requirements/[system]_infra-requirements_v2.md
```

---

## How to use the `design/` folder

Store infrastructure design documents, network architecture decisions, and topology diagrams here. The approach differs based on file type.

### Infrastructure design documents (Markdown — @importable)

Written design decisions from the solutions architect or infrastructure team — covering server topology, Docker Compose structure, Nginx virtual host design, Vault policy design, or monitoring configuration — are converted to Markdown and `@imported`.

```
docs/infrastructure/design/
├── [system]_network-design_v1.md          ← network architecture decisions — @import
├── [system]_vault-policy-design_v1.md     ← Vault access policy design — @import
└── [system]_monitoring-design_v1.md       ← Prometheus/Grafana/Loki design — @import
```

Add `@import` to `infrastructure/CLAUDE.md`:

```markdown
## Application Specification

@../docs/infrastructure/requirements/[system]_infra-requirements_v1.md
@../docs/infrastructure/design/[system]_network-design_v1.md
@../docs/infrastructure/design/[system]_vault-policy-design_v1.md

**Environment overview:**  ← your inline content continues here
```

**Example — asking Claude to generate a Vault policy from the design document:**

```
Based on the Vault policy design in my context, generate the HCL policy file
for the backend application role. The design specifies read-only access to
secret/[system]/database/* and secret/[system]/[idp]/*.
```

**Example — asking Claude to review a Docker Compose config against the network design:**

```
Based on the network design in my context, review infrastructure/docker/docker-compose.prod.yml
and confirm that the service network assignments match the VLAN design — backend and
database services should not be on the same network segment as the frontend.
```

### Network and architecture diagrams (PDF/images — prompt-only)

Network diagrams, physical server rack diagrams, and infrastructure topology images **cannot be `@imported`**. Reference them in the prompt when implementing config that must match a specific topology:

```
docs/infrastructure/design/
├── [system]_network-diagram_v2.pdf        ← network topology — prompt-only
├── [system]_server-topology_v1.pdf        ← physical/logical server layout — prompt-only
└── [system]_monitoring-dashboard-spec_v1.pdf ← dashboard layout spec — prompt-only
```

**Example — configuring Nginx to match a network diagram:**

```
@docs/infrastructure/design/[system]_network-diagram_v2.pdf
The network diagram shows the Nginx reverse proxy sits in the DMZ and routes
to the backend on the internal network. Review infrastructure/nginx/[system].conf
and confirm the upstream server addresses match the internal IP ranges shown on page 2.
```

**Example — building a Grafana dashboard from a spec:**

```
@docs/infrastructure/design/[system]_monitoring-dashboard-spec_v1.pdf
The monitoring spec on page 3 defines the SLA dashboard panels. Generate the
Grafana dashboard JSON for the Loan Application SLA panel using our Prometheus
metrics as defined in infrastructure/monitoring/prometheus.yml.
```

### Capacity plan documents (Markdown — @importable when concise)

If the infrastructure team provides a written capacity plan with sizing targets (CPU, memory, storage, throughput), convert to Markdown and `@import` so Claude can use the targets when reviewing Docker resource limits or Nginx worker configurations:

```
docs/infrastructure/design/
└── [system]_capacity-plan_v1.md
```

---

## What NOT to @import

| Document type | Why not | What to do instead |
|---|---|---|
| Network topology diagrams (PDF/images) | Cannot be `@imported` | Reference with `@` in the prompt when needed |
| Full vendor infrastructure guides | Too large; mostly irrelevant | Extract relevant config examples into a Markdown summary |
| Binary files (`.docx`, `.xlsx`, `.vsdx`) | Claude cannot read binary formats | Export to PDF (human reference) or extract text to `.md` |
| Cloud provider pricing sheets | Irrelevant to code/config generation | Keep as human reference only |

---

## File naming convention

`[system-name]_[document-type]_v[N].[ext]`

| Example filename | What it is |
|---|---|
| `[system]_infra-requirements_v1.md` | Converted requirements — Claude reads this |
| `[system]_infra-requirements_v1.docx` | Original Word — human reference |
| `[system]_network-design_v1.md` | Network design decisions — Claude reads this |
| `[system]_vault-policy-design_v1.md` | Vault policy design — Claude reads this |
| `[system]_monitoring-design_v1.md` | Monitoring/alerting design — Claude reads this |
| `[system]_capacity-plan_v1.md` | Capacity targets — Claude reads this |
| `[system]_network-diagram_v2.pdf` | Network topology diagram — prompt-only |
| `[system]_server-topology_v1.pdf` | Server layout diagram — prompt-only |
