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
- `security/policies/encryption-policy.md` — encryption standards for sensitive data. Add domain-specific data classification rules here if you need more than the default classifications.

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

**Important:** Run all Flyway commands from `backend/` (where `pom.xml` is), not from `database/`.
Flyway is configured in the backend's Maven pom and uses classpath URLs.

```bash
# From backend/ directory:
# Run all pending migrations (dev only — prod goes through CI/CD pipeline)
mvn flyway:migrate -Dflyway.url="jdbc:sqlserver://localhost:1433;databaseName=appdb"

# Check current migration status
mvn flyway:info

# NOTE: `flyway:undo` is a paid Flyway Teams/Enterprise feature. On Flyway OSS
# it fails. Roll back in dev by recreating the database from migrations, and in
# production by rolling forward with a new corrective migration — never by
# editing an applied one.

# Validate migration checksums against DB state
mvn flyway:validate

# Connect to local SQL Server (Azure Data Studio or sqlcmd).
# Read the password from the environment — never inline a credential in a
# command you might paste into a terminal, a ticket or a commit.
sqlcmd -S localhost,1433 -U sa -P "$MSSQL_SA_PASSWORD" -d appdb

# Apply dev seed data
mvn flyway:migrate -Dflyway.locations=classpath:db/migration,classpath:db/seed/dev

# Start local SQL Server container
docker compose -f ../infrastructure/docker/docker-compose.yml up sqlserver

# Connection strings:
# Dev (with self-signed cert — must trust it):
jdbc:sqlserver://localhost:1433;databaseName=appdb;encrypt=true;trustServerCertificate=true;columnEncryptionSetting=Enabled

# Prod (with valid cert — do NOT trust self-signed):
jdbc:sqlserver://db-prod-01:1433;databaseName=appdb;encrypt=strict;columnEncryptionSetting=Enabled
# Prod certificate and key are injected via Vault into the Java keystore at container startup

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
  @../docs/database/design/[your-system]_data-dictionary_v1.md

  For ER diagrams (PDF/images), reference in the prompt when needed:
    @docs/database/design/[your-system]_er-diagram_v2.pdf

  Rules:
  - Convert Excel data dictionaries to Markdown tables before @importing
  - ER diagram PDFs cannot be @imported — reference with @ in the prompt only
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

<!-- Uncomment and point at your own data dictionary once you have one:
@../docs/database/design/[your-system]_data-dictionary_v1.md
-->

> **FILL THIS IN.** Everything below is placeholder shape, not your schema.
> Replace `[Entity]` / `[your_table]` names with your own. Keep the patterns —
> the temporal-table, RLS and classification mechanics are the reusable part.
> A fully worked reference is in `examples/loan-portal/`.

**Core entities:**

| Entity | Table | Purpose |
|---|---|---|
| `[PrimaryActor]` | `[actors]` | The authenticated user this system serves |
| `[CoreRecord]` | `[core_records]` | The main business record, with a status workflow |
| `[Attachment]` | `[attachments]` | File references — store the file outside the DB, see the rule below |
| `[CoreRecord]History` | `[core_records_history]` | System-versioned temporal table — SQL Server maintains it |
| `RefreshToken` *(Option B only)* | `refresh_tokens` | **Only if backend uses self-issued identity (Option B in backend/CLAUDE.md, requires ADR).** Hashed refresh tokens with device fingerprint and expiry. If using external IdP: omit this table. |

**Key relationships:**
```
[actors] (1) ──< [core_records] (many)        — one actor, many records
[core_records] (1) ──< [attachments] (many)    — one record, many attachments
[core_records] → [core_records_history]        — temporal table (SQL Server managed)
[actors] (1) ──< refresh_tokens (many)         — one actor, multiple device sessions
```

**Status workflow** — define your own states and the legal transitions between
them. Every transition must be enforced in the backend, never trusted from the
client:
```
[INITIAL] → [SUBMITTED] → [IN_REVIEW] → [TERMINAL_OK]
                                      → [TERMINAL_REJECTED]
                                      → [NEEDS_INPUT] → [SUBMITTED] (loop)
```

**Temporal table (audit history) — SQL Server syntax.** This pattern is reusable
as-is; only the table names change:
```sql
-- [core_records] is system-versioned; SQL Server maintains the history table
CREATE TABLE [core_records] (
    id              UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    status          NVARCHAR(50)     NOT NULL DEFAULT '[INITIAL]',
    -- ... your columns
    SysStartTime    DATETIME2        GENERATED ALWAYS AS ROW START NOT NULL,
    SysEndTime      DATETIME2        GENERATED ALWAYS AS ROW END   NOT NULL,
    PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime)
)
WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.[core_records_history]));
```

> Use `NEWID()`, not `NEWSEQUENTIALID()`, for any id that appears in a URL.
> Sequential GUIDs are guessable, which defeats access-control-by-obscurity and
> makes IDOR testing harder. If you need index locality, keep a separate
> internal sequential key and never expose it.

---

## Security Architecture

> Aligned to: `security/policies/encryption-policy.md`, plus the classification
> table below, which is this layer's source of truth for what is sensitive.
> Add `security/policies/data-classification-policy.md` and point here instead if
> classification needs an organisation-wide policy of its own.
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

### Data Classification

Classify **every** column that holds personal, financial or secret data. A
column absent from this table is treated as unclassified, which fails an audit.

| Column | Table | Classification | Protection method |
|---|---|---|---|
| `[login_identifier]` | `[actors]` | PII — Confidential | Always Encrypted **Deterministic** — see the lookup rule below |
| `[phone]` | `[actors]` | PII — Confidential | Always Encrypted (Randomized, AES-256) |
| `[date_of_birth]` | `[actors]` | PII — Confidential | Always Encrypted (Randomized, AES-256) |
| `[full_name]` | `[actors]` | PII — Internal | Plaintext; access restricted by Row-Level Security |
| `password_hash` *(Option B only)* | `[actors]` | Secret | **Only if backend uses self-issued identity.** BCrypt hash; never returned by any SELECT the application exposes. If external IdP: omit this column. |
| `token_hash` *(Option B only)* | `refresh_tokens` | Secret | **Only if backend uses self-issued identity.** SHA-256 of the raw token — see the token lookup rule below. If external IdP: omit this table. |
| `[amount]` | `[core_records]` | Financial — Confidential | Classify per your policy; if it must be queried or aggregated, it cannot be Randomized-encrypted |
| `[file_reference]` | `[attachments]` | Internal | **Server-generated** path only — never a client-supplied value. See the rule below |

> **Encryption mode decides queryability — get this right before you migrate.**
> Randomized Always Encrypted produces a different ciphertext each time, so
> `WHERE col = ?` can never match. Any column you look a row up by — a login
> identifier above all — must be **Deterministic**, or authentication cannot
> work. Deterministic leaks equality (two equal plaintexts share a ciphertext),
> so use it only where lookup is genuinely required.
>
> **Never store a salted hash in a column you look up by.** BCrypt and Argon2
> salt per call, so `WHERE token_hash = ?` cannot match. Verifying a password is
> fine — you fetch the row by identifier, then call `matches()`. Finding a row
> by token is not: hash refresh tokens with SHA-256 (they are already
> high-entropy random, so they need no salt) and look up on that.
>
> **Column encryption keys must not live in a cloud KMS in an on-prem design.**
> Pick a custody story consistent with your deployment and state it here.

### Security Architecture Controls

| Threat (Phase 2 ref) | Control | Implementation in SQL Server |
|---|---|---|
| Unauthorised data access (STRIDE-I) | Row-Level Security (RLS) | RLS policy on `[core_records]` and `[attachments]`: `FILTER PREDICATE` checks `SESSION_CONTEXT(N'userId')` matches the owning actor id. **Do not put RLS on the table you authenticate against** — the session context is unset before login, so the lookup would return zero rows |
| PII column exposure (STRIDE-I) | Always Encrypted | Encrypted at driver level (mssql-jdbc); plaintext never reaches the SQL Server engine. Mode per the classification table above |
| Credential theft (STRIDE-S) | Password hashing | BCrypt via Spring Security, stored in `password_hash`. Size the column for the algorithm: BCrypt emits 60 characters, so `CHAR(60)` — or size for Argon2 if you use it |
| Migration data loss (STRIDE-T) | Safe multi-step migration pattern | Breaking changes use: (1) add new column → (2) dual-write period → (3) backfill → (4) drop old column |
| Excessive DB privilege (STRIDE-E) | Least-privilege SQL logins | Three logins: `appuser` (DML only), `flywayuser` (DDL only), `readonlyuser` (SELECT only) — see matrix below |
| Audit trail tampering (STRIDE-T) | Temporal tables + permission restriction | `[core_records_history]` managed by SQL Server. `appuser` gets no `INSERT`/`UPDATE`/`DELETE` on the history table, but **does** need `SELECT` on it — a `FOR SYSTEM_TIME` query reads the history table, and without that grant every history query fails |
| SQL injection (STRIDE-T) | Hibernate parameterised queries | Hibernate generates `sp_executesql` with typed parameters; no `@NativeQuery` with string concatenation permitted |

### SQL Server Login Matrix

| Login | Permissions | Used by |
|---|---|---|
| `appuser` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on application tables; `SELECT` only on history tables | Backend application at runtime (credentials injected via HashiCorp Vault) |
| `flywayuser` | `CREATE`/`ALTER`/`DROP TABLE`, `CREATE INDEX`, plus `ALTER ANY SECURITY POLICY` and `ALTER ANY SCHEMA` if your migrations manage RLS | Flyway migration job in the CI pipeline only |
| `readonlyuser` | `SELECT` on all tables (excluding history tables) | Reporting, read replicas, analytics queries |

### Row-Level Security — example implementation

```sql
-- Set the application user context at the start of each request (done in backend via JDBC)
EXEC sp_set_session_context N'userId', @userId;

-- RLS predicate function
CREATE FUNCTION dbo.fn_owner_rls_predicate(@owner_id UNIQUEIDENTIFIER)
RETURNS TABLE WITH SCHEMABINDING AS
RETURN SELECT 1 AS result
WHERE
    CAST(SESSION_CONTEXT(N'userId') AS UNIQUEIDENTIFIER) = @owner_id
    -- Escape hatch for privileged reads. Name a role you actually create in a
    -- migration; IS_MEMBER() against a non-existent role returns NULL, not 1,
    -- so a typo here silently locks admins out rather than failing loudly.
    OR IS_MEMBER('[your_privileged_db_role]') = 1;

-- Apply to the owned table
CREATE SECURITY POLICY OwnerDataPolicy
ADD FILTER PREDICATE dbo.fn_owner_rls_predicate([owner_id])
ON dbo.[core_records] WITH (STATE = ON);
```

> **Plan RLS for every role that reads the data, not just the owner.** An admin
> UI, a reviewer queue and a reporting login each need either a predicate branch
> or a separate login outside the policy. Decide this before writing the
> migration — retrofitting it means rewriting the predicate and re-testing every
> read path.

---

## Migration Conventions

- **Naming:** `V<version>__<description>.sql` — Flyway format (e.g. `V20240315001__add_status_index.sql`)
- **Never edit** a migration that has been applied to any environment — create a new one
- **Every destructive migration** requires a prior data migration script to preserve data
- **Breaking changes use a 4-step pattern:**
  1. Migration: `V001__add_new_column.sql` — add new column (nullable, safe)
  2. Code: Application dual-writes to both columns (new + old) for one release
  3. Migration: `V002__backfill_new_column.sql` — backfill new column from old
  4. Migration: `V003__drop_old_column.sql` — drop old column (in a separate migration, safe to rollback)
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
