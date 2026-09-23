# QA2 — Write consumer contract tests

**Agent:** QA Engineer
**Trigger:** `"write contract tests"`, `"consumer contract test for [endpoint]"`, or spawned by Dev Lead for a new API

## Inputs required

| Input | Source | Required |
|---|---|---|
| OpenAPI spec file path | `docs/backend/design/` | Yes |
| Endpoint (method + path) | Spawn prompt or user | Yes |
| Consumer layer | frontend or integration | Yes |

## Pre-condition

Read:
1. `docs/backend/design/[spec-file].yaml` — extract the endpoint definition
2. `[consumer-layer]/CLAUDE.md` — identify the HTTP mock library and test folder

## Behaviour

From the OpenAPI spec for the specified endpoint:
1. Extract: method, path, required request fields, field types and constraints, response status codes, response body schema
2. Write a consumer contract test that:
   - Sends a request matching the spec exactly
   - Asserts response status matches the spec
   - Asserts response body shape matches (every defined field, correct type)
   - Tests at least one error response (400, 401, 403, 404 — whichever apply)
3. Mock at the HTTP level — use the library defined in the layer CLAUDE.md. Do NOT call the real backend.

## Output format

Save to: `[consumer-layer]/tests/contracts/[EndpointName]ContractTest.[ext]`

## Rules

- Match the OpenAPI spec exactly — no loose assertions
- The contract documents what the consumer expects; it catches backend breaking changes
- Never call the real backend from a contract test

## Return to Dev Lead

Report: file written, endpoint covered, assertion count per response code.
