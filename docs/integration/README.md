# Integration Supporting Documents

Supporting documents for the integration layer — vendor API guides, third-party specifications, and integration design documents.

---

## Folder structure

| Folder | What goes here | Format |
|---|---|---|
| `requirements/` | Vendor API specifications, third-party integration briefs, webhook documentation received from vendors | Full PDF: keep as-is. Markdown summary extract: for Claude |
| `design/` | Integration design documents, sequence diagrams, event flow diagrams | `.md` for design decisions; PDF/images for diagrams — human reference only |

---

## How inline content and @imported documents work together

The `integration/CLAUDE.md` works as both at the same time — content you write directly into the file and documents you `@import` are loaded together as one combined context. Claude sees no difference between the two.

```
integration/CLAUDE.md (what Claude loads)
│
├── Inline content — written directly into the file
│   └── Tech Stack, Commands, Security Architecture,
│       Conventions, Layer Boundaries — stable, structured
│       content maintained here permanently
│
└── @import statements — pull in external documents
    └── @../docs/integration/requirements/[vendor]_api-summary_v2.md
        → Claude reads this file and treats it as part of
          integration/CLAUDE.md — indistinguishable from inline content
```

---

## What goes inline vs what goes in @imported documents

| What goes inline in `integration/CLAUDE.md` | What goes in `@imported` documents |
|---|---|
| Tech stack (WebClient, RabbitMQ, Resilience4j versions) | Markdown summary extract of vendor API guides (endpoints, auth, key request/response shapes) |
| Commands (contract tests, schema validation, RabbitMQ start) | Event catalogue details and JSON schema definitions |
| External Services table (service, purpose, direction, protocol) | Integration design document from the solutions architect |
| Event catalogue (exchange, routing key, schema version) | Consumer-driven contract specifications |
| Security Architecture table (STRIDE → integration controls) | Any document that versions independently from the connector code |
| Resilience4j defaults table | — |
| PII per service table | — |
| Conventions | — |
| Layer Boundaries | — |

**The rule:** stable, structured content that you maintain as connectors evolve stays inline. Vendor documents and design documents — which version independently — are `@imported` as Markdown summaries.

---

## How to connect a vendor API document to Claude

Vendor API guides are often large PDFs (100–500 pages). **Never `@import` the full PDF** — it consumes the entire context window on every conversation for irrelevant content.

**The correct approach: extract → summarise → @import**

**Step 1 — Create a Markdown summary extract**

Extract only what Claude needs to write correct connector code:
- Base URL and authentication method
- Endpoints used by this application (not all endpoints — only the ones in scope)
- Key request/response fields (not full schema — focus on fields the connector reads or sends)
- Error codes and how to handle them
- Rate limits and any API-specific quirks

```
docs/integration/requirements/
├── [vendor]_api-summary_v2.md      ← Markdown extract — Claude reads this (~2–4 pages)
└── [vendor]_api-guide_v4.pdf       ← Full vendor guide — human reference only (300+ pages)
```

**Step 2 — Add `@import` to `integration/CLAUDE.md`**

In the Application Specification section of `integration/CLAUDE.md`:

```markdown
## Application Specification — External Services

@../docs/integration/requirements/[vendor]_api-summary_v2.md

**External services this application integrates with:**  ← your inline content continues here
```

**Step 3 — When a new version arrives, update one line**

```markdown
<!-- change this: -->
@../docs/integration/requirements/[vendor]_api-summary_v2.md

<!-- to this: -->
@../docs/integration/requirements/[vendor]_api-summary_v3.md
```

---

## How to use the `design/` folder

Store integration design documents, sequence diagrams, and event flow diagrams here.

### Integration design documents (Markdown — @importable)

When the solutions architect or tech lead produces a written integration design — describing the flow between this application and an external system, error handling strategy, retry logic, or event routing — convert it to Markdown and `@import`.

```
docs/integration/design/
├── [system]_credit-check-integration-design_v1.md   ← @import into integration/CLAUDE.md
├── [system]_[provider]-integration-design_v1.md    ← @import if that connector is in scope
└── [system]_event-routing-design_v1.md              ← @import for RabbitMQ routing decisions
```

Add `@import` to `integration/CLAUDE.md`:

```markdown
## Application Specification — External Services

@../docs/integration/requirements/[vendor]_api-summary_v2.md
@../docs/integration/design/[system]_credit-check-integration-design_v1.md

**External services this application integrates with:**  ← your inline content continues here
```

**Example — asking Claude to implement retry logic from a design document:**

```
Based on the credit check integration design in my context, implement the
Resilience4j circuit breaker configuration for CreditCheckClient.java with
the retry and fallback behaviour described in the design document.
```

### Consumer-driven contract specifications (Markdown — @importable)

Spring Cloud Contract consumer test files live in `integration/tests/` as `.groovy` or `.yml` files. If the solutions architect produces a written contract specification document separately, store and `@import` it:

```
docs/integration/design/
└── [system]_consumer-contract-spec_v1.md
```

### Sequence diagrams and event flow diagrams (PDF/images — prompt-only)

Sequence diagrams and event flow diagrams **cannot be `@imported`**. Reference them in the prompt when implementing a specific flow or debugging an integration:

```
docs/integration/design/
├── [system]_credit-check-sequence_v1.pdf    ← sequence diagram — prompt-only
└── [system]_event-flow-diagram_v2.pdf       ← RabbitMQ event flow — prompt-only
```

**Example — implementing from a sequence diagram:**

```
@docs/integration/design/[system]_credit-check-sequence_v1.pdf
Implement the error handling for the credit check flow in CreditCheckClient.java.
Follow the failure path on page 2 — when the external service returns HTTP 503,
the diagram shows we should retry twice then return a CREDIT_CHECK_UNAVAILABLE status.
```

**Example — verifying event routing against the flow diagram:**

```
@docs/integration/design/[system]_event-flow-diagram_v2.pdf
Does the current RabbitMQ routing key configuration in integration/events/
match the exchange topology shown in this event flow diagram?
```

---

## When to reference the full vendor PDF — prompt-only

Use explicit `@` reference in the prompt when you need to look something up in the full vendor guide that is not in your summary extract:

```
@docs/integration/requirements/[vendor]_api-guide_v4.pdf
How does the credit score response handle a partial data scenario where date_of_birth is missing?
```

This loads the document for that conversation only — it is not loaded in future conversations.

---

## File naming convention

`[vendor-or-system]_[document-type]_v[N].[ext]`

| Example filename | What it is |
|---|---|
| `[vendor]_api-summary_v2.md` | Markdown extract — Claude reads this |
| `[vendor]_api-guide_v4.pdf` | Full vendor PDF — human reference; prompt-only |
| `auth0_integration-design_v1.md` | Integration design document |
| `[provider]_webhook-spec_v1.md` | Webhook payload specification extract |
| `rabbitmq_event-flow-diagram_v1.pdf` | Event flow diagram — prompt-only reference |
