# Database Supporting Documents

Supporting documents for the database layer delivered by the business team, DBA, or tech team.

---

## Folder structure

| Folder | What goes here | Format | Claude-accessible? |
|---|---|---|---|
| `requirements/` | Data requirements, entity glossary, data ownership definitions, data retention rules | Convert to `.md`; keep original alongside | Yes — `@import` into `database/CLAUDE.md` |
| `design/` | Data dictionary, physical data model, column-level classification register, ER diagrams | Data dictionary → `.md` for Claude; ER diagrams → PDF — human reference | `.md` files — `@import`; PDF — prompt-only |

---

## How inline content and @imported documents work together

The `database/CLAUDE.md` works as both at the same time — content you write directly into the file and documents you `@import` are loaded together as one combined context. Claude sees no difference between the two.

```
database/CLAUDE.md (what Claude loads)
│
├── Inline content — written directly into the file
│   └── Tech Stack, Commands, Security Architecture,
│       Migration Conventions, Layer Boundaries — stable,
│       structured content maintained here permanently
│
└── @import statements — pull in external documents
    └── @./docs/database/design/loan-portal_data-dictionary_v1.md
        → Claude reads this file and treats it as part of
          database/CLAUDE.md — indistinguishable from inline content
```

---

## What goes inline vs what goes in @imported documents

| What goes inline in `database/CLAUDE.md` | What goes in `@imported` documents |
|---|---|
| Tech stack (SQL Server version, Flyway, JDBC driver) | Full data dictionary from the DBA (all tables, columns, types, descriptions) |
| Commands (flyway:migrate, flyway:info, sqlcmd) | Entity glossary — business definitions for each data entity |
| Core entities summary (table, purpose — brief) | Data ownership and retention policy document |
| Key relationships (brief text ERD) | Column-level data classification register (if maintained separately from CLAUDE.md) |
| Application status workflow (state machine) | Any document that versions independently from the migration scripts |
| Security Architecture (Always Encrypted, RLS, login matrix) | — |
| Data Classification table (PII columns — brief) | — |
| Migration Conventions | — |
| Layer Boundaries | — |

**The rule:** stable, structured content you maintain as migrations evolve stays inline. Documents delivered by the DBA or business team — which version independently — are `@imported`.

---

## How to use the `requirements/` folder

Store data requirements and entity glossary documents here.

**Step 1 — Convert to Markdown and store both copies**

```
docs/database/requirements/
├── loan-portal_entity-glossary_v1.md     ← Claude reads this
└── loan-portal_entity-glossary_v1.docx   ← original; human reference only
```

**Step 2 — Add `@import` to `database/CLAUDE.md`**

```markdown
## Application Specification — Data Model

@./docs/database/requirements/loan-portal_entity-glossary_v1.md

**Core entities:**  ← your inline summary continues here
```

**Step 3 — When a new version arrives, update one line**

```markdown
<!-- update this line only: -->
@./docs/database/requirements/loan-portal_entity-glossary_v2.md
```

---

## How to use the `design/` folder

Store data dictionaries, column classification registers, and ER diagrams here. The approach differs based on file type.

### Data dictionaries (Markdown — @importable)

Convert Excel data dictionaries to a Markdown table. This is the most valuable document to make Claude-accessible — it tells Claude exactly which columns exist, their types, and their sensitivity classification.

**Example Markdown data dictionary format:**

```markdown
## Data Dictionary

| Table | Column | Data type | Nullable | Description | Classification |
|---|---|---|---|---|---|
| applicants | id | UNIQUEIDENTIFIER | No | Primary key — NEWSEQUENTIALID() | Internal |
| applicants | email | NVARCHAR(255) | No | Applicant login email — Always Encrypted (AES-256) | PII — Confidential |
| applicants | full_name | NVARCHAR(200) | No | Full legal name | PII — Internal |
| applicants | date_of_birth | DATE | No | Date of birth — Always Encrypted (AES-256) | PII — Confidential |
| applicants | phone | NVARCHAR(20) | Yes | Mobile phone — Always Encrypted (AES-256) | PII — Confidential |
| loan_applications | id | UNIQUEIDENTIFIER | No | Primary key | Internal |
| loan_applications | status | NVARCHAR(50) | No | Workflow status: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED | Internal |
| loan_applications | loan_amount | DECIMAL(18,2) | No | Requested loan amount in AUD | Financial — Confidential |
```

Store the converted dictionary in `docs/database/design/`:

```
docs/database/design/
├── loan-portal_data-dictionary_v1.md     ← Markdown table — Claude reads this
└── loan-portal_data-dictionary_v1.xlsx   ← Original Excel — human reference only
```

Add `@import` to `database/CLAUDE.md`:

```markdown
## Application Specification — Data Model

@./docs/database/design/loan-portal_data-dictionary_v1.md
@./docs/database/requirements/loan-portal_entity-glossary_v1.md

**Core entities:**  ← your inline summary continues here
```

**When a new version arrives:**

```markdown
<!-- update this line only: -->
@./docs/database/design/loan-portal_data-dictionary_v2.md
```

### Column-level classification register

If the data classification register is maintained as a separate document from the data dictionary, store and import it the same way:

```
docs/database/design/
└── loan-portal_data-classification-register_v1.md
```

```markdown
@./docs/database/design/loan-portal_data-classification-register_v1.md
```

### ER diagrams (PDF/images — prompt-only)

ER diagrams **cannot be `@imported`**. Reference them in the prompt when verifying migrations against the data model:

```
docs/database/design/
└── loan-portal_er-diagram_v2.pdf     ← ER diagram — prompt-only
```

**Example — verifying a migration against the ER diagram:**

```
@docs/database/design/loan-portal_er-diagram_v2.pdf
Review migration V015 and confirm the new foreign key relationship matches
the relationship shown between loan_applications and documents in this ER diagram.
```

---

## What NOT to @import

| Document type | Why not | What to do instead |
|---|---|---|
| ER diagram PDFs or images | Cannot be `@imported` | Reference with `@` in the prompt when needed |
| Large Excel spreadsheets | Claude cannot read `.xlsx` | Convert to Markdown table first |
| Full data modelling tool exports (XML/JSON) | Too large; mostly irrelevant | Extract the entity and column list into a Markdown table |

---

## File naming convention

`[system-name]_[document-type]_v[N].[ext]`

| Example filename | What it is |
|---|---|
| `loan-portal_data-dictionary_v1.md` | Converted Markdown table — Claude reads this |
| `loan-portal_data-dictionary_v1.xlsx` | Original Excel — human reference |
| `loan-portal_entity-glossary_v1.md` | Business definitions per entity — Claude reads this |
| `loan-portal_data-classification-register_v1.md` | Column classification — Claude reads this |
| `loan-portal_er-diagram_v2.pdf` | ER diagram — prompt-only |
| `loan-portal_data-retention-policy_v1.md` | Retention rules per entity — Claude reads this |
