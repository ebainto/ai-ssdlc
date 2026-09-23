# Database Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `database/` folder. It gives Claude the context it needs to write correct T-SQL migrations, schema changes, and seed data — and to enforce the data protection rules specific to this layer.

**As a developer, you use this file to:**
- Define the database engine and tooling so Claude generates compatible T-SQL syntax
- Document the data model so Claude understands entity relationships before writing migrations
- Specify which columns contain sensitive data so Claude applies the right encryption or masking
- Set migration conventions so Claude never produces a breaking change without a safe transition path

**When to update this file:**
- New entities or relationships are added (update Data Model section)
- A column is identified as sensitive/PII (update Data Classification table)
- Database engine or migration tooling changes
- Row-level security policies or Always Encrypted configuration changes

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — access rules (backend only via JDBC), what must not live here
- `security/policies/data-classification-policy.md` — authoritative list of sensitive fields

---

## Tech Stack

```
Engine:         Microsoft SQL Server 2022 (Developer Edition locally, Standard in staging/prod)
ORM:            Hibernate 6 with SQL Server dialect (managed by Spring Data JPA in backend/)
Migrations:     Flyway 10 (T-SQL scripts in database/migrations/)
Local dev:      SQL Server 2022 container (see infrastructure/docker/docker-compose.yml)
Client tool:    Azure Data Studio (recommended) or SQL Server Management Studio (SSMS)
JDBC driver:    mssql-jdbc 12.4 (configured in backend)
Encryption:     SQL Server Always Encrypted (column-level) for PII fields
Auditing:       SQL Server Temporal Tables (system-versioned) for audit history
```

---

## Commands

```bash
# Run all pending migrations (dev only — prod goes through CI/CD pipeline)
mvn flyway:migrate -Dflyway.url="jdbc:sqlserver://localhost:1433;databaseName=appdb"

# Check current migration status
mvn flyway:info

# Roll back to a baseline (dev only — Flyway OSS supports undo via Flyway Teams)
mvn flyway:undo

# Validate migration checksums against DB state
mvn flyway:validate

# Connect to local SQL Server (Azure Data Studio or sqlcmd)
sqlcmd -S localhost,1433 -U sa -P YourDevPassword123! -d appdb

# Apply dev seed data
mvn flyway:migrate -Dflyway.locations=classpath:db/migration,classpath:db/seed/dev

# Start local SQL Server container
docker compose -f ../infrastructure/docker/docker-compose.yml up sqlserver

# Generate schema diff (requires SchemaCompare in Azure Data Studio)
# Use Azure Data Studio Schema Compare: source = local dev DB, target = migration scripts
```

---

## Application Specification — Data Model

<!--
  HOW TO CONNECT BUSINESS/TECH DOCUMENTS TO CLAUDE
  ─────────────────────────────────────────────────
  Store data requirements and design documents in:

    docs/database/requirements/   ← data requirements, entity glossary, data ownership
    docs/database/design/         ← data dictionary (.md), ER diagrams (PDF — human reference)

  For data dictionaries and entity definitions, convert to Markdown and @import here:
  @./docs/database/design/loan-portal_data-dictionary_v1.md

  For ER diagrams (PDF/images), reference in the prompt when needed:
    @docs/database/design/loan-portal_er-diagram_v2.pdf

  Rules:
  - Convert Excel data dictionaries to Markdown tables before @importing
  - ER diagram PDFs cannot be @imported — reference with @ in the prompt only
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

@./docs/database/design/loan-portal_data-dictionary_v1.md

**Core entities:**

| Entity | Table | Purpose |
|---|---|---|
| Applicant | `applicants` | Registered user who can submit loan applications |
| Application | `loan_applications` | A single loan application with status workflow |
| Document | `documents` | File references for supporting evidence (stored in file share, not DB) |
| NotificationPreference | `notification_preferences` | Per-applicant opt-in settings for email and SMS alerts |
| ApplicationHistory | `loan_applications_history` | System-versioned temporal table — auto-generated audit of all application changes |
| RefreshToken | `refresh_tokens` | Hashed refresh tokens with device fingerprint and expiry |

**Key relationships:**
```
applicants (1) ──< loan_applications (many)     — one applicant, many applications
loan_applications (1) ──< documents (many)       — one application, many documents
applicants (1) ──< notification_preferences (1)  — one-to-one
loan_applications → loan_applications_history    — temporal table (SQL Server managed)
applicants (1) ──< refresh_tokens (many)         — one applicant, multiple device sessions
```

**Application status workflow:**
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
                                 → REJECTED
                                 → ADDITIONAL_INFO_REQUIRED → SUBMITTED (loop)
```

**Temporal table (audit history) — SQL Server syntax:**
```sql
-- loan_applications is system-versioned; SQL Server manages loan_applications_history automatically
CREATE TABLE loan_applications (
    id              UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    status          NVARCHAR(50)     NOT NULL DEFAULT 'DRAFT',
    -- ... other columns
    SysStartTime    DATETIME2        GENERATED ALWAYS AS ROW START NOT NULL,
    SysEndTime      DATETIME2        GENERATED ALWAYS AS ROW END   NOT NULL,
    PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime)
)
WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.loan_applications_history));
```

---

## Security Architecture

> Aligned to: `security/policies/data-classification-policy.md`
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

### Data Classification

| Column | Table | Classification | Protection method |
|---|---|---|---|
| `email` | `applicants` | PII — Confidential | SQL Server Always Encrypted (Randomized, AES-256); key stored in Azure Key Vault |
| `phone` | `applicants` | PII — Confidential | SQL Server Always Encrypted (Randomized, AES-256) |
| `date_of_birth` | `applicants` | PII — Confidential | SQL Server Always Encrypted (Randomized, AES-256) |
| `full_name` | `applicants` | PII — Internal | Plaintext; access restricted by Row-Level Security policy |
| `password_hash` | `applicants` | Secret | BCrypt hash (never returned in any SELECT exposed to application) |
| `token_hash` | `refresh_tokens` | Secret | BCrypt hash; raw token never stored |
| `loan_amount` | `loan_applications` | Financial — Confidential | Plaintext; RLS restricts access to record owner + ADMIN role |
| `file_path` | `documents` | Internal | UNC path reference only; file content stored on file share, not in DB |

### Security Architecture Controls

| Threat (Phase 2 ref) | Control | Implementation in SQL Server |
|---|---|---|
| Unauthorised data access (STRIDE-I) | Row-Level Security (RLS) | RLS policy on `loan_applications` and `documents`: `FILTER PREDICATE` checks `SESSION_CONTEXT(N'userId')` matches `applicant_id` |
| PII column exposure (STRIDE-I) | Always Encrypted | `email`, `phone`, `date_of_birth` encrypted at driver level (mssql-jdbc); plaintext never reaches SQL Server engine |
| Credential theft (STRIDE-S) | Password hashing | BCrypt via Spring Security — stored in `password_hash`; column is `NVARCHAR(72)` (BCrypt output length) |
| Migration data loss (STRIDE-T) | Safe multi-step migration pattern | Breaking changes use: (1) add new column → (2) dual-write period → (3) backfill → (4) drop old column |
| Excessive DB privilege (STRIDE-E) | Least-privilege SQL logins | Three logins: `appuser` (DML only), `flywayuser` (DDL only), `readonlyuser` (SELECT only) — see matrix below |
| Audit trail tampering (STRIDE-T) | Temporal tables + permission restriction | `loan_applications_history` managed by SQL Server; `appuser` has no permissions on history table; history queryable via `FOR SYSTEM_TIME` only |
| SQL injection (STRIDE-T) | Hibernate parameterised queries | Hibernate generates `sp_executesql` with typed parameters; no `@NativeQuery` with string concatenation permitted |

### SQL Server Login Matrix

| Login | Permissions | Used by |
|---|---|---|
| `appuser` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on application tables | Backend application at runtime (injected via HashiCorp Vault) |
| `flywayuser` | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX` | Flyway migration job in CI/CD pipeline only |
| `readonlyuser` | `SELECT` on all tables (excluding history tables) | Reporting, read replicas, analytics queries |

### Row-Level Security — example implementation

```sql
-- Set the application user context at the start of each request (done in backend via JDBC)
EXEC sp_set_session_context N'userId', @userId;

-- RLS predicate function
CREATE FUNCTION dbo.fn_applicant_rls_predicate(@applicant_id UNIQUEIDENTIFIER)
RETURNS TABLE WITH SCHEMABINDING AS
RETURN SELECT 1 AS result
WHERE
    CAST(SESSION_CONTEXT(N'userId') AS UNIQUEIDENTIFIER) = @applicant_id
    OR IS_MEMBER('db_admin') = 1;

-- Apply to loan_applications table
CREATE SECURITY POLICY ApplicantDataPolicy
ADD FILTER PREDICATE dbo.fn_applicant_rls_predicate(applicant_id)
ON dbo.loan_applications WITH (STATE = ON);
```

---

## Migration Conventions

- **Naming:** `V<version>__<description>.sql` — Flyway format (e.g. `V20240315001__add_loan_status_index.sql`)
- **Never edit** a migration that has been applied to any environment — create a new one
- **Every destructive migration** requires a prior data migration script to preserve data
- **Breaking changes use a 3-step pattern:**
  1. `V001__add_new_column.sql` — add new column (nullable, safe)
  2. Application dual-writes to both columns
  3. `V002__backfill_and_drop_old_column.sql` — backfill then drop old column
- **Always Encrypted columns** added in a migration must have a corresponding entry in the Data Classification table above before the PR is merged
- **Temporal tables** — never manually insert or update rows in `*_history` tables; SQL Server manages these automatically

---

## Layer Boundaries

**Responsibility:** Owns all data schemas, migrations, and seed data. Defines the single source of truth for data structure. No application logic lives here.

| Direction | Detail |
|---|---|
| **Accessed by** | Backend layer only — via JDBC connection pool (Hibernate / Spring Data JPA) |
| **Must not** | Contain business logic, stored procedures that encode business rules, or application-level triggers |
| **Exception** | Referential integrity constraints, temporal table management, and Row-Level Security predicates are acceptable |

**Integration points:**

| Connects to | Via | Notes |
|---|---|---|
| Backend | JDBC (mssql-jdbc 12.4) | Backend is the only authorised caller |
| Flyway (CI/CD) | JDBC (`flywayuser` login — DDL only) | Migration scripts applied via CI/CD pipeline only |

**Schema change coordination:** Any schema change must be accompanied by a corresponding Hibernate entity and repository update in `backend/`. A migration applied without a matching backend change will break the deployment.
