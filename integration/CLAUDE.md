# Integration Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `integration/` folder. It gives Claude the context it needs to write correct API client wrappers, event schemas, and contract tests — and to enforce the security controls that protect the application's external boundary.

**As a developer, you use this file to:**
- List all external services so Claude knows what the application integrates with before writing any connector code
- Define event schema conventions so Claude generates compatible publishers and consumers
- Specify security controls so Claude enforces signature validation, TLS mutual auth, and credential handling in every connector it writes
- Set resilience patterns so Claude always includes timeout, retry, and circuit breaker in outbound calls

**When to update this file:**
- A new external service is added (add to External Services table)
- An event schema is versioned (update Events section)
- A third-party API changes its auth method (update Security Architecture)
- Resilience thresholds change (timeout, retry count, circuit breaker threshold)

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — translate and forward only; no business logic; integration points with auth methods
- `security/policies/integration-security-policy.md` — authoritative standards for external connections

---

## Tech Stack

```
Runtime:         Java 21 LTS (same JVM as backend — integration clients live inside backend/ as a package)
HTTP client:     Spring WebClient (reactive, non-blocking) for REST calls
Messaging:       RabbitMQ 3.12 (on-prem message broker — Docker container in dev, dedicated server in prod)
Serialisation:   Jackson 2.16 (JSON) — all API request/response bodies
Contract tests:  Spring Cloud Contract 4 (consumer-driven contract testing)
Schema registry: JSON Schema (files in integration/events/schemas/)
Resilience:      Resilience4j 2 (CircuitBreaker + Retry + TimeLimiter)
Secret storage:  HashiCorp Vault (credentials injected at startup — never hardcoded)
```

> **Note:** Integration client classes live in `backend/src/main/java/.../integration/` as a sub-package of the backend. The `integration/` root folder contains contracts, event schemas, and tests — not runtime code.

---

## Commands

```bash
# Run all contract tests (from backend directory)
cd ../backend && mvn test -pl . -Dtest="*ContractTest"

# Run a single contract test
mvn test -Dtest=StripeIntegrationContractTest

# Validate all JSON event schemas
npm run validate:schemas   # uses ajv-cli — see integration/events/package.json

# Run integration tests against sandbox environments (requires sandbox env vars)
mvn test -P integration-sandbox -Dtest="*SandboxTest"

# Start RabbitMQ locally (via docker-compose)
docker compose -f ../infrastructure/docker/docker-compose.yml up rabbitmq

# Open RabbitMQ management console (local)
# http://localhost:15672  (guest/guest in dev)
```

---

## Application Specification — External Services

<!--
  HOW TO CONNECT VENDOR API DOCUMENTS TO CLAUDE
  ─────────────────────────────────────────────
  Store vendor API guides and integration docs in:

    docs/integration/requirements/   ← vendor API specs, third-party integration briefs
    docs/integration/design/         ← integration design docs, sequence diagrams

  For vendor API guides: extract only what Claude needs into a Markdown summary, then @import:
  @../docs/integration/requirements/[vendor]_api-summary_v2.md

  Do NOT @import full vendor PDF guides (100+ pages) — they consume context on every conversation.
  Instead, reference them in the prompt only when needed:
    @docs/integration/requirements/[vendor]_api-guide_v4.pdf

  Rules:
  - Always create a Markdown summary extract; @import the summary, not the full PDF
  - Claude cannot read .docx — convert to .md first
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

<!-- Uncomment once you have an external-services summary of your own:
@../docs/integration/requirements/[your-system]_external-services_v1.md
-->

**External services this application integrates with:**

| Service | Purpose | Direction | Protocol | Contract file |
|---|---|---|---|---|
| `[IdP]` | User authentication and token issuance | Outbound (OIDC) + Inbound (JWKS validation) | OIDC / OAuth2 | `integration/apis/[idp].md` |
| `[DataProvider]` | `[what it returns]` | Outbound | REST over mTLS | `integration/apis/[provider].md` |
| `[EmailProvider]` | Transactional email — status notifications | Outbound | REST | `integration/apis/[provider].md` |
| `[SignatureProvider]` | `[what it does]` | Outbound + Webhook | REST + webhook | `integration/apis/[provider].md` |
| RabbitMQ | Internal async messaging (notifications, audit events) | Both | AMQP 0-9-1 | `integration/events/` |

**Event catalogue (RabbitMQ):**

| Event | Exchange | Routing key | Schema version | Publisher | Consumer |
|---|---|---|---|---|---|
| `[record].submitted` | `[your.exchange]` | `[record].submitted` | v1 | Backend `[Record]Service` | Notification worker |
| `[attachment].verified` | `[your.exchange]` | `[attachment].verified` | v1 | `[Verification worker]` | Backend `[Attachment]Service` |
| `[signature].completed` | `[your.exchange]` | `[signature].completed` | v1 | `[Provider]` webhook receiver | Backend `[Record]Service` |

---

## Security Architecture

> Aligned to: `security/policies/integration-security-policy.md`
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Threat (Phase 2 ref) | Control | Implementation |
|---|---|---|
| Spoofed inbound webhook (STRIDE-S) | HMAC signature validation on every inbound webhook | Validate the provider's signature header (HMAC-SHA256) using a shared secret from Vault, with a constant-time comparison. The IdP's tokens are validated against its JWKS endpoint. **Every** webhook route must be reachable by the provider yet still authenticated — a route left behind a blanket `authenticated()` rule will silently reject all callbacks |
| Credential theft for outbound calls (STRIDE-I) | All credentials from HashiCorp Vault — never hardcoded | API keys, OAuth2 client secrets, and mTLS client certs fetched from Vault at startup via Vault Agent sidecar. Rotated every 90 days |
| Man-in-the-middle on sensitive APIs (STRIDE-I) | mTLS where the provider supports it | Client certificate and key loaded from Vault at startup and injected into the Spring WebClient `SslContext` |
| PII forwarded to third parties (STRIDE-I) | PII minimisation — send only what each provider legally requires | Record the exact field list per provider in the table below. An email provider needs an address, not a date of birth. Anything beyond the consent you hold is an unlawful disclosure |
| Replay attacks on inbound events (STRIDE-T) | Message idempotency via RabbitMQ deduplication header | All consumers check `message-id` header against a Redis deduplication cache (TTL 24 hours) before processing |
| Cascading failure from external dependency (STRIDE-D) | Resilience4j circuit breaker + retry + timeout | All WebClient calls wrapped in Resilience4j: timeout 5s, retry 3× (exponential backoff 100ms base), circuit breaker opens after 5 failures in 10s |
| Event schema breaking change (STRIDE-T) | Consumer-driven contract tests via Spring Cloud Contract | Contract stubs published by consumers; provider pipeline must pass all consumer contracts before merging a schema change |

**Outbound API resilience defaults (Resilience4j config):**

| Setting | Default value | Override |
|---|---|---|
| Timeout | 5 seconds | `[slow provider]` → `[N]` s (per their SLA) |
| Retry count | 3 | Webhook acks → 1, where the provider owns idempotency |
| Retry backoff | Exponential, 100 ms base | — |
| Circuit breaker failure threshold | 50% in 10-call sliding window | — |
| Circuit breaker wait in OPEN state | 30 seconds | — |

**PII data sent to each external service:**

| Service | Fields sent | Legal basis |
|---|---|---|
| `[IdP]` | `[email]`, `[name]` (registration only) | Contractual necessity |
| `[DataProvider]` | `[exact field list]` | `[lawful basis — e.g. legal obligation + explicit consent]` |
| `[EmailProvider]` | `[email]` only | Consent (notification opt-in) |
| `[SignatureProvider]` | `[exact field list]` | Contractual necessity |

---

## Conventions

- **One file per external service in `integration/apis/`** — documents the API contract, auth method, endpoint base URL, sandbox credentials path in Vault, and any known quirks
- **Event schemas versioned in `integration/events/schemas/v<N>/`** — never modify a published schema version; create a new version directory
- **All WebClient instances created via factory** — `WebClientFactory` in `backend/src/main/java/.../integration/config/` provides pre-configured clients with Resilience4j decorators; never create raw `WebClient.create()` in a service
- **Contract tests mandatory before staging** — no new integration goes to staging without a passing Spring Cloud Contract test covering the happy path and the main error response

---

## Layer Boundaries

**Responsibility:** Owns all external-facing connectors, third-party API clients, and event-driven messaging. The single point of entry and exit for anything outside the application boundary.

| Direction | Detail |
|---|---|
| **Inbound** | Webhooks from external services; events consumed from RabbitMQ |
| **Outbound** | REST calls to third-party APIs via Spring WebClient; events published to RabbitMQ |
| **Must not** | Contain business logic — translate and forward only; decisions belong in backend |

**Sub-folder purpose:**

| Folder | Contents |
|---|---|
| `integration/apis/` | One `.md` contract file per external service — create one per provider you add |
| `integration/events/` | RabbitMQ exchange/queue definitions; event schemas versioned in `events/schemas/v<N>/` |
| `integration/tests/` | Spring Cloud Contract consumer tests — primary quality gate for all integrations |

**Integration points:**

| Connects to | Via | Auth method |
|---|---|---|
| `[IdP]` | OIDC / JWKS validation | JWT RS256 |
| `[DataProvider]` | REST over mTLS | Client certificate from Vault |
| `[EmailProvider]` | REST | API key from Vault |
| `[SignatureProvider]` | REST + inbound webhook | OAuth2 client credentials (outbound); HMAC-SHA256 (inbound webhook). Confirm the provider's real auth scheme from its current docs — do not assume an API key |
| RabbitMQ | AMQP 0-9-1 | Username/password from Vault |

**Business logic boundary:** If a response from an external service requires a
conditional decision (e.g. "reject when the provider's score is below `[N]`"),
that decision belongs in the owning backend service — never in the integration
client. The client translates and forwards; it does not decide.
