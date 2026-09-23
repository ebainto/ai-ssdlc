# Loan Portal — Data Dictionary v1

All tables live in the `appdb` database on SQL Server 2022. All IDs are `UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID()`. All timestamps are `DATETIME2(7)` with UTC values. Column names use `snake_case`.

---

## Table: `applicants`

Registered users who can create and submit loan applications.

| Column | Type | Nullable | Default | Classification | Notes |
|---|---|---|---|---|---|
| `id` | `UNIQUEIDENTIFIER` | No | `NEWSEQUENTIALID()` | — | PK |
| `email` | `NVARCHAR(320)` | No | — | PII — Confidential | Always Encrypted (Randomized, AES-256). Max RFC 5321 length. |
| `password_hash` | `NVARCHAR(72)` | No | — | Secret | BCrypt output. Raw password never stored. |
| `full_name` | `NVARCHAR(200)` | No | — | PII — Internal | Plaintext; RLS restricts to record owner + ADMIN |
| `phone` | `NVARCHAR(30)` | Yes | `NULL` | PII — Confidential | Always Encrypted (Randomized, AES-256) |
| `date_of_birth` | `DATE` | Yes | `NULL` | PII — Confidential | Always Encrypted (Randomized, AES-256) |
| `identity_verified` | `BIT` | No | `0` | — | Set to `1` after external identity check passes |
| `created_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | |
| `updated_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | Updated via trigger |

**Indexes:** `UQ_applicants_email` (unique, non-clustered, on encrypted column — requires deterministic encryption for uniqueness; use Deterministic if enforced).

**Row-Level Security:** `ApplicantDataPolicy` — read access restricted to the applicant matching `SESSION_CONTEXT(N'userId')` or `db_admin` role.

---

## Table: `loan_applications`

A single loan application with lifecycle status.

| Column | Type | Nullable | Default | Classification | Notes |
|---|---|---|---|---|---|
| `id` | `UNIQUEIDENTIFIER` | No | `NEWSEQUENTIALID()` | — | PK |
| `applicant_id` | `UNIQUEIDENTIFIER` | No | — | — | FK → `applicants.id` |
| `status` | `NVARCHAR(50)` | No | `'DRAFT'` | — | Enum: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED |
| `loan_amount` | `DECIMAL(12,2)` | No | — | Financial — Confidential | Range: 1,000.00–500,000.00. RLS restricts access. |
| `purpose` | `NVARCHAR(500)` | No | — | Internal | Free-text description |
| `term_months` | `INT` | No | — | — | Range: 6–360 |
| `submitted_at` | `DATETIME2(7)` | Yes | `NULL` | — | Set when status → SUBMITTED |
| `reviewed_at` | `DATETIME2(7)` | Yes | `NULL` | — | Set when status → UNDER_REVIEW |
| `decided_at` | `DATETIME2(7)` | Yes | `NULL` | — | Set when status → APPROVED or REJECTED |
| `reviewer_notes` | `NVARCHAR(2000)` | Yes | `NULL` | Internal | Written by reviewer; not exposed to applicant |
| `created_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | |
| `updated_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | Updated via trigger |
| `SysStartTime` | `DATETIME2(7)` | No | — | — | Temporal table system column — SQL Server managed |
| `SysEndTime` | `DATETIME2(7)` | No | — | — | Temporal table system column — SQL Server managed |

**System versioning:** `SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.loan_applications_history)`. Do not write to the history table directly.

**Indexes:** `IX_loan_applications_applicant_id` (non-clustered on `applicant_id`), `IX_loan_applications_status` (non-clustered on `status`, filtered: `WHERE status IN ('SUBMITTED','UNDER_REVIEW')`).

**Business rule:** An applicant may not have more than 3 rows where `status IN ('DRAFT','SUBMITTED','UNDER_REVIEW')` simultaneously. Enforced in `LoanApplicationService`, not as a DB constraint.

**Row-Level Security:** `ApplicantDataPolicy` — FILTER PREDICATE on `applicant_id`.

---

## Table: `loan_applications_history`

Auto-generated temporal history table for `loan_applications`. Managed entirely by SQL Server — do not write to it manually.

| Column | Type | Notes |
|---|---|---|
| (mirrors all columns of `loan_applications`) | | |
| `SysStartTime` | `DATETIME2(7)` | Row valid-from timestamp |
| `SysEndTime` | `DATETIME2(7)` | Row valid-to timestamp |

**Query pattern:**
```sql
-- Point-in-time state of an application
SELECT * FROM loan_applications
FOR SYSTEM_TIME AS OF '2024-03-15T10:00:00';

-- Full history of one application
SELECT * FROM loan_applications
FOR SYSTEM_TIME ALL
WHERE id = @applicationId
ORDER BY SysStartTime;
```

**Permissions:** `appuser` has no explicit permissions on this table. History is queryable only via `FOR SYSTEM_TIME` syntax through the parent table.

---

## Table: `documents`

File references for supporting evidence attached to loan applications. Actual file content is stored on the NAS file share — the database holds the path reference only.

| Column | Type | Nullable | Default | Classification | Notes |
|---|---|---|---|---|---|
| `id` | `UNIQUEIDENTIFIER` | No | `NEWSEQUENTIALID()` | — | PK |
| `application_id` | `UNIQUEIDENTIFIER` | No | — | — | FK → `loan_applications.id` |
| `applicant_id` | `UNIQUEIDENTIFIER` | No | — | — | FK → `applicants.id` (denormalised for RLS performance) |
| `document_type` | `NVARCHAR(50)` | No | — | Internal | Enum: IDENTITY, INCOME, BANK_STATEMENT, OTHER |
| `file_path` | `NVARCHAR(500)` | No | — | Internal | UNC path on NAS (e.g. `\\nas01\loan-docs\{applicant_id}\{doc_id}.pdf`). Never a URL. |
| `original_filename` | `NVARCHAR(260)` | No | — | Internal | Original filename as uploaded — stored for display only |
| `mime_type` | `NVARCHAR(100)` | No | — | Internal | e.g. `application/pdf`, `image/jpeg` |
| `file_size_bytes` | `BIGINT` | No | — | Internal | Max enforced at service layer: 10 MB |
| `status` | `NVARCHAR(30)` | No | `'PENDING'` | — | Enum: PENDING, VERIFIED, REJECTED |
| `verified_at` | `DATETIME2(7)` | Yes | `NULL` | — | Set when status → VERIFIED |
| `uploaded_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | |

**Indexes:** `IX_documents_application_id` (non-clustered on `application_id`).

**Row-Level Security:** FILTER PREDICATE on `applicant_id`.

---

## Table: `notification_preferences`

One row per applicant. Created with defaults when the applicant account is created.

| Column | Type | Nullable | Default | Classification | Notes |
|---|---|---|---|---|---|
| `id` | `UNIQUEIDENTIFIER` | No | `NEWSEQUENTIALID()` | — | PK |
| `applicant_id` | `UNIQUEIDENTIFIER` | No | — | — | FK → `applicants.id`. Unique constraint. |
| `email_on_status_change` | `BIT` | No | `1` | — | Email when application status changes |
| `email_on_document_verified` | `BIT` | No | `1` | — | Email when a document is verified |
| `sms_on_status_change` | `BIT` | No | `0` | — | SMS notification (requires phone to be set) |
| `updated_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | Updated via trigger |

---

## Table: `refresh_tokens`

Hashed refresh tokens with per-device tracking. Supports token rotation and full revocation.

| Column | Type | Nullable | Default | Classification | Notes |
|---|---|---|---|---|---|
| `id` | `UNIQUEIDENTIFIER` | No | `NEWSEQUENTIALID()` | — | PK |
| `applicant_id` | `UNIQUEIDENTIFIER` | No | — | — | FK → `applicants.id` |
| `token_hash` | `NVARCHAR(72)` | No | — | Secret | BCrypt hash of the opaque refresh token. Raw token never stored. |
| `device_fingerprint` | `NVARCHAR(200)` | Yes | `NULL` | Internal | User-Agent + IP hash — for display in "active sessions" list |
| `issued_at` | `DATETIME2(7)` | No | `SYSUTCDATETIME()` | — | |
| `expires_at` | `DATETIME2(7)` | No | — | — | `issued_at + 7 days` |
| `revoked_at` | `DATETIME2(7)` | Yes | `NULL` | — | Set on logout or breach detection. NULL = active. |

**Indexes:** `IX_refresh_tokens_applicant_id` (non-clustered), `IX_refresh_tokens_expires_at` (non-clustered — used by cleanup job).

**Token rotation rule:** On every successful refresh, the current row's `revoked_at` is set and a new row is inserted. If the same token is presented twice (reuse detection), all rows for `applicant_id` are revoked immediately.

**Cleanup:** A scheduled job deletes rows where `expires_at < DATEADD(DAY, -7, SYSUTCDATETIME())` to keep the table lean.

---

## Migration File Naming Reference

```
V<version>__<description>.sql

Examples:
V20240101001__create_applicants_table.sql
V20240101002__create_loan_applications_table.sql
V20240101003__create_documents_table.sql
V20240101004__create_notification_preferences_table.sql
V20240101005__create_refresh_tokens_table.sql
V20240101006__add_rls_policies.sql
V20240315001__add_loan_status_index.sql
```

---

## SQL Server Login Summary

| Login | Permissions | Used by |
|---|---|---|
| `appuser` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on all application tables (excluding history table) | Backend at runtime |
| `flywayuser` | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX` | Flyway in CI/CD only |
| `readonlyuser` | `SELECT` on all tables (excluding history tables) | Reporting, analytics |
