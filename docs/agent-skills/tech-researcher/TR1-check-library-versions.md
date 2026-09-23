# TR1 — Check library versions

**Agent:** Tech Researcher
**Trigger:** `"check library versions"`, `"version audit"`, `/research versions`

## Inputs required

None — reads dependency manifests directly.

## Behaviour

1. Read dependency manifests for each active layer:
   - Backend: `backend/pom.xml` or `backend/build.gradle`
   - Frontend: `frontend/package.json`
   - Infrastructure: `infrastructure/docker/` image tags
   - Integration: `integration/pom.xml` or `integration/package.json`
2. Use WebSearch to fetch: latest stable version and CVEs for each dependency

## Output format

| Layer | Library | Current version | Latest stable | CVEs in current | Urgency |
|---|---|---|---|---|---|
| | | | [fetched] | [CVE-list or None] | Critical / High / Low / Current |

Urgency definitions:
- **Critical** — Critical CVE in current version
- **High** — High CVE, OR 2+ major versions behind
- **Low** — Minor/patch behind, no known CVEs
- **Current** — Up to date

Mark any unconfirmed version: `[ASSUMED — verify against registry]`

## Save instruction

File: `docs/architecture/[system-name]_version-audit_v1.md` (increment if exists)

## After TR1

Flag all Critical and High rows. Offer to run TR2 for each.
