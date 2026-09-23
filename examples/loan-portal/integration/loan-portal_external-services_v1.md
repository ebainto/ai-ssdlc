# Loan Portal — External Services Summary v1

Summary of all external service integrations. Full vendor API guides are stored alongside this file as PDF references — do not @import them.

---

## Auth0

**Purpose:** Identity provider — user authentication, JWT issuance, and JWKS endpoint for token validation.

**Direction:** Outbound (OIDC redirect for login); Inbound (JWKS validation on every API request).

**Auth method:** RS256 JWT. The backend validates access tokens against Auth0's JWKS endpoint on every request.

**Key configuration:**
| Setting | Value |
|---|---|
| Domain | `your-tenant.au.auth0.com` |
| Audience | `https://api.loanportal.internal` |
| JWKS endpoint | `https://your-tenant.au.auth0.com/.well-known/jwks.json` |
| Token lifetime | Access token: 15 minutes; refresh token: 7 days |
| Credentials in Vault | `secret/app/backend/auth0` — `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN` |

**Integration pattern:** Auth0 issues the JWT. The backend validates it using `nimbus-jose-jwt` against the JWKS endpoint (cached with 1-hour TTL). The backend does not call Auth0 on every request — only on token validation cache miss. User registration and profile updates go via Auth0 Management API.

**Error codes to handle:**
| Status | Meaning | Handling |
|---|---|---|
| 401 | Token invalid or expired | Return 401 to caller; frontend triggers refresh flow |
| 403 | Insufficient scope | Return 403; do not retry |
| 429 | Rate limited | Retry after `Retry-After` header; log warning |

---

## Equifax Credit Check API

**Purpose:** Credit score retrieval for loan application assessment.

**Direction:** Outbound only.

**Auth method:** Mutual TLS (mTLS). Client certificate and private key loaded from Vault at startup.

**Key configuration:**
| Setting | Value |
|---|---|
| Base URL (production) | `https://api.equifax.com/business/consumer-credit-report/v1` |
| Base URL (sandbox) | `https://sandbox.equifax.com/business/consumer-credit-report/v1` |
| TLS: client cert path | Injected by Vault Agent as `EQUIFAX_CLIENT_CERT` env var |
| TLS: client key path | Injected by Vault Agent as `EQUIFAX_CLIENT_KEY` env var |
| Timeout | 15 seconds (higher than default due to Equifax SLA) |
| Retry | 2 retries, 500ms base backoff, exponential — total max 3 attempts |
| Circuit breaker | Opens after 3 failures in 5-call window; stays open for 60 seconds |

**PII sent:** `full_name`, `date_of_birth`, `address` — only fields covered by the signed credit check consent form.

**Response — key fields:**
| Field | Type | Notes |
|---|---|---|
| `creditScore` | `integer` | Range 0–1200 (Equifax scale) |
| `riskBand` | `string` | `VERY_LOW`, `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH` |
| `enquiryId` | `string` | Equifax reference for this enquiry — log for audit |

**Business rule (in backend — not in integration layer):** Applications with `creditScore < 600` are automatically placed in `UNDER_REVIEW` for manual assessment rather than auto-rejected.

---

## SendGrid (Transactional Email)

**Purpose:** Email notifications for application status changes and document verification events.

**Direction:** Outbound only.

**Auth method:** API key from Vault (`secret/app/backend/sendgrid` → `SENDGRID_API_KEY`).

**Key configuration:**
| Setting | Value |
|---|---|
| Base URL | `https://api.sendgrid.com/v3` |
| Endpoint used | `POST /mail/send` |
| From address | `noreply@loanportal.internal` |
| Template IDs | Managed in SendGrid dashboard — reference by ID in code |
| Timeout | 5 seconds |
| Retry | 3 retries, exponential backoff |

**PII sent:** `email` only. No name, no DOB, no application details in email API calls. Application details are in the email template body rendered by SendGrid.

**Email events sent:**
| Trigger event | Template | Recipient |
|---|---|---|
| `application.submitted` | `application-submitted` | Applicant |
| `application.status.changed` to UNDER_REVIEW | `application-under-review` | Applicant |
| `application.status.changed` to APPROVED | `application-approved` | Applicant |
| `application.status.changed` to REJECTED | `application-rejected` | Applicant |
| `document.verified` | `document-verified` | Applicant (if opted in) |

**Suppression check:** Before sending, check `notification_preferences.email_on_status_change` or `email_on_document_verified` for the applicant. Do not call SendGrid if preference is `0`.

---

## DocuSign (Electronic Signature)

**Purpose:** Electronic signature collection for loan agreements once an application is approved.

**Direction:** Outbound (send envelope for signature) + Inbound webhook (signature completion event).

**Auth method:**
- Outbound: API key from Vault (`DOCUSIGN_API_KEY`)
- Inbound webhook: HMAC-SHA256 signature validation — shared secret from Vault (`DOCUSIGN_WEBHOOK_SECRET`). Header: `X-DocuSign-Signature-1`.

**Key configuration:**
| Setting | Value |
|---|---|
| Base URL (production) | `https://www.docusign.net/restapi/v2.1` |
| Base URL (sandbox) | `https://demo.docusign.net/restapi/v2.1` |
| Account ID | Stored in Vault at `secret/app/backend/docusign` |
| Webhook endpoint | `POST /api/v1/webhooks/docusign` (internal, registered with DocuSign) |
| Timeout (outbound) | 10 seconds |
| Retry | 1 retry only (DocuSign manages idempotency via envelope ID) |

**PII sent:** `email` and `full_name` for the signatory fields only.

**Integration flow:**
```
1. Application reaches APPROVED status in backend
2. Backend calls DocuSign: create envelope with loan agreement PDF
3. DocuSign sends signing email to applicant
4. Applicant signs in DocuSign portal
5. DocuSign sends webhook: POST /api/v1/webhooks/docusign
6. Backend validates HMAC-SHA256 signature on webhook
7. Backend processes signature.completed event → triggers next workflow step
```

**Webhook validation (must not be skipped):**
```java
// Required for every inbound DocuSign webhook
String payload = request.body();
String receivedSignature = request.header("X-DocuSign-Signature-1");
String expectedSignature = HMAC.sha256(webhookSecret, payload);
if (!constantTimeEquals(expectedSignature, receivedSignature)) {
    throw new WebhookAuthenticationException("DocuSign webhook HMAC validation failed");
}
```

---

## RabbitMQ (Internal Async Messaging)

> **Components below have no host in the infrastructure design — reconcile
> before treating this as complete.** The server inventory in
> `../infrastructure/loan-portal_infrastructure-design_v1.md` lists no Redis
> instance and no worker hosts, yet this document depends on:
>
> | Component referenced here | In the inventory? | Consequence |
> |---|---|---|
> | Redis deduplication cache | No | Idempotency has nowhere to store `message-id`, so redelivery causes duplicate side effects |
> | Document verification worker | No | `document.verified` has no publisher |
> | Notification worker | No | `application.submitted` has no consumer |
> | RabbitMQ | Yes — one container per app host | Two independent brokers, not a cluster: a message published on prod-01 is invisible to a consumer on prod-02, and a queue is lost with its host |
>
> This is the most common gap in an integration design: the message flows get
> specified before the things that run them exist. Either add the hosts and
> cluster the broker, or cut the flows that depend on them.

**Purpose:** Internal event-driven messaging between the backend and worker services.

**Direction:** Both (publish and consume).

**Auth method:** Username/password from Vault (`secret/app/backend/rabbitmq`).

**Exchanges and queues:**

| Exchange | Type | Routing key | Publisher | Consumer |
|---|---|---|---|---|
| `loan.events` | Direct | `application.submitted` | Backend `LoanApplicationService` | Notification worker |
| `loan.events` | Direct | `document.verified` | Document verification worker | Backend `DocumentService` |
| `loan.events` | Direct | `signature.completed` | DocuSign webhook handler | Backend `LoanApplicationService` |

**Message format (all events):**
```json
{
  "eventType": "application.submitted",
  "version": "2",
  "messageId": "uuid-v4",
  "timestamp": "2024-03-15T10:00:00Z",
  "payload": { ... }
}
```

**Idempotency:** All consumers check the `message-id` header against a Redis deduplication cache (TTL 24 hours) before processing. Duplicate messages are ACKed and discarded.

**Dead letter queue:** All queues have a corresponding `*.dlq` dead letter queue. Messages that fail after 3 retry attempts go to DLQ. Alertmanager fires `RabbitMQDLQGrowing` if DLQ depth > 10.

**Schema versioning:** Event schemas are versioned at `integration/events/schemas/v<N>/`. Never modify a published schema version. Create a new version directory and update the routing key to include the version if a breaking change is required.
