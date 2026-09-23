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
mvn test -Dtest=LoanApplicationServiceTest

# Run a single test method
mvn test -Dtest=LoanApplicationServiceTest#shouldRejectApplicationWhenLimitExceeded

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

    @./docs/backend/requirements/your-requirements-file.md

  Example (replace with your actual file name when ready):
  @./docs/backend/requirements/loan-portal_business-requirements_v1.md

  Rules:
  - Claude cannot read .docx or .xlsx — always convert to .md first
  - Keep the original Word/PDF alongside the .md as the human reference copy
  - Large vendor PDFs (100+ pages): do not @import — reference with @ in the prompt instead
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

@./docs/backend/design/openapi-spec_v1.yaml

**Purpose:** Processes loan applications, manages applicant profiles, and orchestrates document verification and status updates. This is the only layer authorised to read or write the database.

**Domain areas and owning services:**

| Domain | Service class | Responsibility |
|---|---|---|
| Applications | `LoanApplicationService` | Create, update, and progress applications through the approval workflow |
| Applicants | `ApplicantService` | Manage applicant profiles and identity verification status |
| Documents | `DocumentService` | Validate, store file references, and trigger document verification |
| Notifications | `NotificationService` | Queue notification events to the integration layer |
| Auth | `AuthService` | Issue and refresh JWT tokens; validate credentials |

**Key business rules enforced at this layer (authoritative — frontend validation is UX only):**
- Loan amount must be between $1,000 and $500,000 — validated via `@Min` and `@Max` on the request DTO
- An applicant cannot have more than 3 active applications simultaneously — checked in `LoanApplicationService` before creation
- An application transitions to `UNDER_REVIEW` only when all required documents are in `VERIFIED` status
- Only applications in `DRAFT` status can be edited; submitted applications are immutable
- Notifications are queued asynchronously — `NotificationService` calls the integration layer; it never sends directly

**REST API structure:**
```
POST   /api/v1/auth/login                   → issue access + refresh token
POST   /api/v1/auth/refresh                 → rotate refresh token
POST   /api/v1/applications                 → create new loan application
GET    /api/v1/applications/{id}            → get application by ID (owner or ADMIN role)
PATCH  /api/v1/applications/{id}            → update application (DRAFT status only)
POST   /api/v1/applications/{id}/submit     → submit for review
GET    /api/v1/applications                 → list own applications (paginated)
POST   /api/v1/documents                    → upload document reference
GET    /api/v1/applicants/me                → get own profile
```

---

## Security Architecture

> Aligned to: `security/policies/backend-security-policy.md`
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Threat (Phase 2 ref) | Control | Implementation in Spring Boot |
|---|---|---|
| Broken authentication (STRIDE-S) | JWT RS256 with short expiry + refresh token rotation | Access token: 15 min, RS256 signed. Refresh token: 7 days, stored as BCrypt hash in DB, rotated on every use. Issued by `AuthService` via `nimbus-jose-jwt` |
| Broken authorisation (STRIDE-E) | RBAC at method level + resource ownership guard | `@PreAuthorize("hasRole('ADMIN')")` on admin endpoints. Custom `@ResourceOwner` annotation verifies `applicant_id == authentication.name` |
| Input injection (STRIDE-T) | DTO validation + JPA parameterised queries | `@Valid` on all controller method parameters. Hibernate generates parameterised SQL — no `@NativeQuery` with string concatenation |
| Sensitive data in logs (STRIDE-I) | Custom log filter strips PII fields | Logback `PatternLayout` with custom converter masks `email`, `phone`, `dateOfBirth` fields. MDC carries only `correlationId` and `userId` |
| Mass assignment (STRIDE-T) | Explicit request DTOs; no entity exposure in controller | Controllers accept `CreateApplicationRequest` DTO (not JPA entity). `@JsonIgnore` on all sensitive entity fields. Never use `@RequestBody ApplicationEntity` |
| Privilege escalation (STRIDE-E) | Role hierarchy enforced in Spring Security config | `ADMIN > REVIEWER > APPLICANT` role hierarchy. Role assignment only via admin-only `PATCH /api/v1/admin/users/{id}/role` |
| Secrets in config (STRIDE-I) | Secrets from HashiCorp Vault; none in `application.yml` | Spring Cloud Vault injects secrets at startup. `application.yml` contains only non-sensitive config. CI/CD uses Vault AppRole auth |

**Spring Security filter chain (order matters):**
```
Request → CorsFilter              (CORS headers)
        → JwtAuthenticationFilter (validates Bearer token, sets SecurityContext)
        → AuthorizationFilter     (Spring Security — checks @PreAuthorize annotations)
        → Controller              (business logic)
```

**Auth flow:**
```java
// Login
POST /api/v1/auth/login
  → AuthService.authenticate(email, password)
  → BCryptPasswordEncoder.matches(rawPassword, storedHash)
  → JwtProvider.generateAccessToken(userId, roles)   // RS256, 15 min
  → JwtProvider.generateRefreshToken()                // opaque, stored as BCryptHash in DB

// Refresh
POST /api/v1/auth/refresh (body: { refreshToken })
  → RefreshTokenService.validate(token)               // hash lookup in DB
  → rotate: invalidate old, issue new
  → if reuse detected: invalidate ALL tokens for user (breach response)
```

**Logging rules:**
```
Log:      correlationId, userId, action, httpMethod, path, statusCode, durationMs
Never log: email, phone, dateOfBirth, password, token, documentContent
```

---

## Key Entry Points

```
src/main/java/.../Application.java              — Spring Boot entry point
src/main/java/.../config/SecurityConfig.java    — Spring Security filter chain config
src/main/java/.../config/VaultConfig.java       — HashiCorp Vault secret binding
src/main/java/.../auth/                         — JWT provider, refresh token service, auth filter
src/main/java/.../application/                  — LoanApplication controller → service → repository
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
| Auth0 | JWT validation against JWKS endpoint | `integration/apis/auth0.md` |
