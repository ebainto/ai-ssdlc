# Backend Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `backend/` folder. It gives Claude the layer-specific context it needs to write correct, consistent, and secure code for this layer — including the business logic, API contracts, and security controls that apply here.

**As a developer, you use this file to:**
- Define the tech stack so Claude recommends the right Spring Boot patterns and libraries
- Describe the domain model and business rules so Claude understands what the code must do
- Specify security controls so Claude enforces authentication, authorisation, and data protection in every service or endpoint it writes
- Set architectural conventions so Claude keeps controllers thin, services clean, and repositories isolated

**When to update this file:**
- New domain areas or services are added (update Application Specification)
- Spring Security configuration changes (e.g. new auth method, new role)
- New compliance requirements affect data handling (update Security Architecture)
- Framework or library versions change

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — what this layer can/cannot call, integration points with protocols and auth
- `security/policies/` — source of truth for security standards; this file applies them to this stack

---

## Tech Stack

```
Runtime:        Java 21 LTS
Framework:      Spring Boot 3.2
Build tool:     Maven 3.9
API style:      REST (OpenAPI 3.1 spec generated via Springdoc — docs/api/)
Security:       Spring Security 6 + JWT (RS256) via nimbus-jose-jwt
Persistence:    Spring Data JPA + Hibernate 6 (SQL Server dialect)
DB migrations:  Flyway 10 (migration scripts in database/migrations/)
Validation:     Jakarta Bean Validation (Hibernate Validator)
Boilerplate:    Lombok
API docs:       Springdoc OpenAPI 2 (Swagger UI at /swagger-ui.html in dev)
Testing:        JUnit 5 + Mockito + Spring Boot Test + Testcontainers (SQL Server)
Linting:        Checkstyle + SpotBugs (via Maven plugins)
```

---

## Commands

```bash
# Install dependencies and compile
mvn compile

# Start dev server (hot reload via Spring DevTools on port 8080)
mvn spring-boot:run

# Start with a specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run all tests
mvn test

# Run a single test class
mvn test -Dtest=[CoreRecord]ServiceTest

# Run a single test method
mvn test -Dtest=[CoreRecord]ServiceTest#shouldRejectWhenQuotaExceeded

# Run tests with coverage report (generates target/site/jacoco/)
mvn verify

# Run only integration tests
mvn verify -P integration-tests

# Package as JAR (skipping tests)
mvn package -DskipTests

# Run SpotBugs static analysis
mvn spotbugs:check

# Run Checkstyle
mvn checkstyle:check

# View OpenAPI spec (dev server must be running)
# http://localhost:8080/swagger-ui.html
# http://localhost:8080/v3/api-docs
```

---

## Application Specification

<!--
  HOW TO CONNECT BUSINESS/TECH DOCUMENTS TO CLAUDE
  ─────────────────────────────────────────────────
  When the business team or tech team delivers requirements or design documents
  (Word, PDF, etc.), convert them to Markdown and store them in:

    docs/backend/requirements/   ← business requirements, functional specs
    docs/backend/design/         ← technical design documents, API design decisions

  Then @import the Markdown file here so Claude loads it automatically:

    @../docs/backend/requirements/your-requirements-file.md

  Example (replace with your actual file name when ready):
  @../docs/backend/requirements/[your-system]_business-requirements_v1.md

  Rules:
  - Claude cannot read .docx or .xlsx — always convert to .md first
  - Keep the original Word/PDF alongside the .md as the human reference copy
  - Large vendor PDFs (100+ pages): do not @import — reference with @ in the prompt instead
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

<!-- Uncomment once you have an OpenAPI spec of your own:
@../docs/backend/design/[your-system]_openapi-spec_v1.yaml
-->

> **FILL THIS IN.** The tables below are placeholder shape, not your domain.
> Replace the bracketed names. A fully worked reference is in
> `examples/loan-portal/`.

**Purpose:** [One sentence: what this service does.] This is the only layer
authorised to read or write the database.

**Domain areas and owning services:**

| Domain | Service class | Responsibility |
|---|---|---|
| `[CoreRecords]` | `[CoreRecord]Service` | Create, update and progress records through their workflow |
| `[Actors]` | `[Actor]Service` | Manage profiles and verification status |
| `[Attachments]` | `[Attachment]Service` | Validate input, persist server-generated file references |
| Notifications | `NotificationService` | Queue notification events to the integration layer |
| Auth | `AuthService` | Validate tokens and resolve the caller's identity and roles |

**Key business rules enforced at this layer (authoritative — frontend validation
is UX only).** List yours here; these are the *kinds* of rule that belong at
this layer:
- Numeric and length bounds on every request field — via `@Min`/`@Max`/`@Size`
  on the request DTO, not in the controller body
- Per-actor quotas and rate limits — checked in the service before creation
- Legal state transitions only — a record moves to the next state only when its
  preconditions hold; never trust a status supplied by the client
- Immutability rules — which states are editable and which are frozen
- Notifications are queued asynchronously — the service calls the integration
  layer; it never sends email or SMS directly

**REST API structure** — replace with your own resources:
```
POST   /api/v1/[records]                 → create a record
GET    /api/v1/[records]/{id}            → get by id (owner or privileged role)
PATCH  /api/v1/[records]/{id}            → update (editable states only)
POST   /api/v1/[records]/{id}/submit     → advance state
GET    /api/v1/[records]                 → list own records (paginated)
POST   /api/v1/[attachments]             → multipart upload; server assigns the stored path
GET    /api/v1/[actors]/me               → get own profile
POST   /api/v1/auth/logout               → revoke the session / refresh token
```

> **Auth endpoints depend on your identity model — decide it before writing any
> of them.** If an external IdP issues tokens (the default in this template's
> Security Architecture), this service has **no** `/auth/login` endpoint: it
> validates tokens against the IdP's JWKS and never sees a password. Only add
> `/auth/login` and `/auth/refresh` here if you have deliberately chosen to be
> your own identity provider — see the Security Architecture section below,
> which explains why that is usually the wrong choice.
>
> Whatever you choose, include a logout endpoint. Server-side session
> revocation is an ASVS V3 requirement and is trivial to forget.

---

## Security Architecture

> Aligned to: `security/policies/secure-coding-standard.md` and
> `security/policies/encryption-policy.md` — the two policies that ship.
> Add `security/policies/backend-security-policy.md` and point here instead if
> this layer grows rules the shared standards do not cover.
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Threat (Phase 2 ref) | Control | Implementation in Spring Boot |
|---|---|---|
| Broken authentication (STRIDE-S) | Tokens issued by the external IdP; this service only **validates** them | RS256 access token validated against the IdP's JWKS endpoint via `nimbus-jose-jwt`, JWKS cached with a bounded TTL. Short access-token lifetime (15 min) and refresh rotation are configured **at the IdP**, not here |
| Broken authorisation (STRIDE-E) | RBAC at method level + resource ownership guard | `@PreAuthorize("hasRole('[PRIVILEGED_ROLE]')")` on privileged endpoints. A custom `@ResourceOwner` check verifies the record's owner id equals the authenticated subject — compare against the token's immutable subject claim, never a display name or email |
| Input injection (STRIDE-T) | DTO validation + JPA parameterised queries | `@Valid` on all controller method parameters. Hibernate generates parameterised SQL — no `@NativeQuery` with string concatenation |
| Sensitive data in logs (STRIDE-I) | Custom log filter strips PII fields | Logback `PatternLayout` with a custom converter masks every field classified PII in `database/CLAUDE.md`. MDC carries only `correlationId` and the subject id |
| Mass assignment (STRIDE-T) | Explicit request DTOs; no entity exposure in controller | Controllers accept a purpose-built `Create[Record]Request` DTO, never a JPA entity. `@JsonIgnore` on sensitive entity fields. Never `@RequestBody [Record]Entity` |
| Privilege escalation (STRIDE-E) | Role hierarchy enforced in Spring Security config | Define your hierarchy explicitly, e.g. `[ADMIN] > [REVIEWER] > [END_USER]`. Every role in the hierarchy needs real endpoints, an RLS path and a threat-model entry — a role that exists only in config is an untested privilege boundary. Role changes only via a privileged, audited endpoint |
| Secrets in config (STRIDE-I) | Secrets from HashiCorp Vault; none in `application.yml` | Spring Cloud Vault injects secrets at startup. `application.yml` contains only non-sensitive config. CI/CD uses Vault AppRole auth |

**Spring Security filter chain (order matters):**
```
Request → CorsFilter              (CORS headers)
        → JwtAuthenticationFilter (validates Bearer token, sets SecurityContext)
        → AuthorizationFilter     (Spring Security — checks @PreAuthorize annotations)
        → Controller              (business logic)
```

**Auth flow — pick ONE identity model and delete the other.** Mixing them is the
single most common defect in this layer: half the codebase validates IdP tokens
while the other half issues its own, and neither is fully correct.

**Option A — external IdP (default; recommended).** `security/policies/secure-coding-standard.md`
requires this: *never roll your own authentication*.
```java
// No login endpoint exists here. The IdP authenticates the user and issues the
// token; the browser sends it; this service only validates.
Request with Authorization: Bearer <access_token>
  → JwtAuthenticationFilter
  → validate RS256 signature against the IdP JWKS (cached, bounded TTL)
  → validate iss, aud, exp, nbf                       // all four, every request
  → map token claims → GrantedAuthority set
  → SecurityContext holds the subject claim as the identity
```
Refresh and revocation are the IdP's job. Do not build a refresh endpoint.

**Option B — this service is the identity provider.** Only choose this
deliberately, and record it as an ADR with the reasons. It puts credential
storage, rotation, lockout, MFA and breach response on your team.
```java
POST /api/v1/auth/login
  → fetch the actor row by its login identifier
  //   that column must be Deterministic-encrypted or plaintext — a Randomized
  //   Always Encrypted column can never match an equality lookup
  → BCryptPasswordEncoder.matches(rawPassword, storedHash)   // constant-time
  → issue RS256 access token (15 min), signing key from Vault
  → issue opaque high-entropy refresh token

// Store and look up the refresh token by SHA-256, NOT BCrypt: BCrypt salts per
// call, so `WHERE token_hash = ?` can never match. The raw token is already
// random, so it needs no salt.
POST /api/v1/auth/refresh
  → look up SHA-256(presented token)
  → rotate: invalidate old, issue new
  → on reuse of an already-rotated token: revoke ALL tokens for that subject
```

> Whichever you pick, the frontend, integration and security layers must agree.
> One transport for the refresh token (httpOnly cookie **or** JSON body — not
> both), and CSRF defences that match: a cookie-borne token needs CSRF
> protection, a body-borne one does not.

**Logging rules:**
```
Log:      correlationId, subject id, action, httpMethod, path, statusCode, durationMs
Never log: any field classified PII or Secret in database/CLAUDE.md, plus
           passwords, tokens, authorization headers and file contents
```

---

## Key Entry Points

```
src/main/java/.../Application.java              — Spring Boot entry point
src/main/java/.../config/SecurityConfig.java    — Spring Security filter chain config
src/main/java/.../config/VaultConfig.java       — HashiCorp Vault secret binding
src/main/java/.../auth/                         — JWT provider, refresh token service, auth filter
src/main/java/.../[record]/                      — controller → service → repository
src/main/java/.../document/                     — Document controller → service → repository
src/main/java/.../common/exception/             — GlobalExceptionHandler (@ControllerAdvice)
src/main/java/.../common/security/              — @PreAuthorize helpers, @ResourceOwner annotation
src/main/resources/application.yml             — non-sensitive config only
src/main/resources/application-dev.yml         — dev overrides (local DB, Vault dev server)
```

---

## Conventions

- **Controllers are thin:** validate input (`@Valid`) → call one service method → return `ResponseEntity`; no business logic in controllers
- **Services own business logic:** one service per domain; services call repositories, never `EntityManager` directly
- **Repositories extend `JpaRepository`:** one repository interface per JPA entity; no `@NativeQuery` with string interpolation
- **DTOs are separate from entities:** `CreateApplicationRequest` / `ApplicationResponse` are distinct classes; never expose JPA entities through the API
- **Exception handling is centralised:** all exceptions caught in `GlobalExceptionHandler` (`@ControllerAdvice`); controllers never return error strings directly
- **All public endpoints explicitly declared:** Spring Security config defaults to `authenticated()`; public routes listed explicitly in `SecurityConfig.permitAll()`

---

## Layer Boundaries

**Responsibility:** Owns business logic, API contracts, and orchestration between all other layers. The only layer authorised to read or write the database.

| Direction | Detail |
|---|---|
| **Inbound** | HTTP requests from frontend; event messages from integration layer via RabbitMQ |
| **Outbound** | Queries to `database/` via Hibernate/JPA; calls to `integration/` for external services |
| **Must not** | Serve static assets, contain UI logic, or call infrastructure provisioning scripts |

**Integration points:**

| Connects to | Via | Contract location |
|---|---|---|
| Frontend | REST (Spring MVC controllers) | `docs/api/` |
| Database | Hibernate / Spring Data JPA | `database/schemas/` |
| Integration layer | WebClient (outbound REST); RabbitMQ listener (inbound events) | `integration/apis/` and `integration/events/` |
| `[IdP]` | JWT validation against the IdP's JWKS endpoint | `integration/apis/[idp].md` |
