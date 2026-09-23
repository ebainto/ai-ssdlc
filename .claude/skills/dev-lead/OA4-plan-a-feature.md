# OA4 — Plan a feature (generic)

**Agent:** Dev Lead
**Trigger:** `"plan feature"`, `"what layers does this touch"`, `"map this story"`

## Inputs required

| Input | Source | Required |
|---|---|---|
| Story ID | User | Yes |
| Story summary | User or `ssdlc/*_user-stories_*.md` | Yes |

## Behaviour

1. Ask for story ID and summary if not provided.
2. Identify all layers the story touches (frontend, backend, database, infrastructure, integration, security).
3. For each layer: state which CLAUDE.md sections to read before starting.
4. Flag any story touching Security Architecture — always requires Security Auditor.
5. Recommend execution sequence.

## Output format

| Layer | Touched? | CLAUDE.md sections to read | Security Auditor required? |
|---|---|---|---|

Recommended sequence:
1. QA Engineer (QA1) → write tests first
2. Developer implements in [layers]
3. Infrastructure Agent (IA1) → if infra change required
4. Code Reviewer (CR1 + CR2) → review all changed layers
5. Security Auditor (SA1) → if story touches Security Architecture
6. the PR hand-off (commit on a branch, push, then `gh pr create`)

## When to use OA4

Use when OA5/OA6/OA7 do not precisely fit the request — e.g. multi-layer refactor, compliance story, or story that crosses multiple pipelines.
