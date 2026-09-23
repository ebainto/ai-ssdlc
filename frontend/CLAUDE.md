# Frontend Layer — CLAUDE.md

## What this file is and how to use it

This file is automatically loaded by Claude Code whenever you work on any file inside the `frontend/` folder. It gives Claude the layer-specific context it needs to write correct, consistent, and secure code for this layer without you having to re-explain the stack every time.

**As a developer, you use this file to:**
- Define the tech stack and versions so Claude always recommends the right libraries and Angular patterns
- Describe the application's purpose and key user flows so Claude understands business context
- Specify security controls so Claude enforces them in every component or feature it writes
- Set conventions so Claude follows your team's Angular patterns automatically

**When to update this file:**
- Tech stack version changes (e.g. upgrading Angular 17 → 18)
- New major user flows are added to the application
- Security policy changes (e.g. new CSP directive, new auth approach)
- Team conventions change (e.g. switching from class-based to standalone components)

**Relationship to other files:**
- Root `CLAUDE.md` — project-wide rules; this file adds to them, never overrides
- **Layer Boundaries section (below)** — what this layer can/cannot call, integration points with auth contracts
- `security/policies/` — source of truth for security standards; this file applies them to this stack

---

## Tech Stack

```
Framework:      Angular 17 (standalone components, no NgModules)
Language:       TypeScript 5.3
UI components:  Angular Material 17
Reactive:       RxJS 7.8
HTTP client:    Angular HttpClient (built-in — never use fetch or axios directly)
State:          Angular Signals (local) + NgRx 17 (global application state)
Auth:           Angular route guards + HTTP interceptors (JWT bearer token injection)
Forms:          Angular Reactive Forms (never template-driven forms)
Testing:        Jest 29 + Angular Testing Library
Linting:        ESLint + angular-eslint + Prettier
Build:          Angular CLI 17 (ng build)
Node:           20 LTS (build tooling only)
```

---

## Commands

```bash
# Install dependencies
npm install

# Start dev server (live reload on http://localhost:4200)
ng serve

# Start dev server on a specific port
ng serve --port 4300

# Run all unit tests
ng test

# Run a single test file
ng test --include="**/loan-application.component.spec.ts"

# Run tests in headless mode (CI)
ng test --watch=false --browsers=ChromeHeadless

# Run end-to-end tests
ng e2e

# Type check without building
npx tsc --noEmit

# Lint
ng lint

# Production build
ng build --configuration=production

# Analyse bundle size
ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json

# Generate a new component (standalone)
ng generate component features/loan-application/components/step-one --standalone
```

---

## Application Specification

<!--
  HOW TO CONNECT BUSINESS/TECH DOCUMENTS TO CLAUDE
  ─────────────────────────────────────────────────
  Store UX requirements and business docs in:

    docs/frontend/requirements/   ← business/UX requirements, user stories
    docs/frontend/design/         ← wireframes, screen flows (PDF/images — human reference only)

  For requirements documents (text/Markdown), @import here:
  @./docs/frontend/requirements/loan-portal_ux-requirements_v1.md

  For wireframes and mockups (PDF/images), reference in the prompt when needed:
    @docs/frontend/design/apply-screen-wireframe-v2.pdf

  Rules:
  - Claude cannot read .docx — always convert to .md first
  - Images and PDFs cannot be @imported — reference with @ in the prompt only
  - See docs/guides/template-guide.md → "Storing supporting documents" for full guidance
-->

@./docs/backend/design/openapi-spec_v1.yaml

**Purpose:** Customer-facing loan application portal. Authenticated users can apply for loans, upload supporting documents, and track their application status in real time.

**Key user flows:**
1. **Loan application** — multi-step form (5 steps): personal details → employment → loan amount → documents → review & submit
2. **Document upload** — PDF/JPG/PNG only, max 10 MB per file, max 5 files per application
3. **Application status dashboard** — displays current status with polling every 30 seconds via `HttpClient` + RxJS `interval`
4. **Notification preferences** — user opts in/out of email and SMS alerts per event type

**Business rules enforced at this layer (UX validation — backend re-validates all):**
- Loan amount: $1,000 minimum, $500,000 maximum (Angular Reactive Form validators)
- Employment duration: ≥ 3 months required (custom validator)
- Session timeout: redirect to `/login` after 15 minutes of inactivity
- File type: `.pdf`, `.jpg`, `.png` only (checked via file input `accept` attribute + custom validator)

**Key routes:**
```
/login                          → authentication page (public)
/dashboard                      → authenticated home (AuthGuard required)
/apply                          → multi-step loan application (AuthGuard required)
/applications                   → application history list (AuthGuard required)
/applications/:id               → application detail (AuthGuard required)
/settings/notifications         → notification preferences (AuthGuard required)
```

---

## Security Architecture

> Aligned to: `security/policies/frontend-security-policy.md`
> Populated at SSDLC Phase 5 (Development Standards). Threats identified in Phase 2 (Threat Model).

| Threat (Phase 2 ref) | Control | Implementation in Angular |
|---|---|---|
| Session hijacking (STRIDE-I) | Auth tokens never in localStorage — memory-only with httpOnly cookie refresh | Access token stored in-memory (NgRx store, not localStorage). Refresh token in httpOnly cookie managed by backend. On page reload, call `/auth/refresh` to re-issue access token |
| XSS via user-generated content (STRIDE-T) | Angular's built-in DOM sanitisation; avoid `bypassSecurityTrust*` | Angular escapes all interpolation `{{ }}` and property bindings by default. `DomSanitizer.bypassSecurityTrustHtml()` is banned — ESLint rule `@angular-eslint/no-bypassSecurityTrust*` enforced |
| CSRF (STRIDE-T) | Angular `HttpClient` XSRF token handling | `HttpClientXsrfModule` configured to read `XSRF-TOKEN` cookie and send as `X-XSRF-TOKEN` header on all mutating requests |
| Clickjacking (STRIDE-E) | X-Frame-Options + CSP frame-ancestors | Set at Nginx layer (`infrastructure/`); Angular app itself adds meta CSP tag in `index.html` |
| Idle session abuse (STRIDE-E) | 15-minute inactivity timeout | `IdleTimerService` uses RxJS `fromEvent` (mousemove, keydown) + `timer`; after 15 min dispatches NgRx `logout` action |
| Malicious file upload (STRIDE-T) | Client-side MIME + size check (UX gate) | Angular custom validator checks `file.type` and `file.size`; backend is the authoritative validator |
| Route unauthorised access (STRIDE-E) | Angular route guards on all authenticated routes | `AuthGuard` implements `CanActivate` — checks NgRx auth state; redirects to `/login` if unauthenticated |

**HTTP interceptor chain (order matters):**
```
Request →  AuthInterceptor       (injects Authorization: Bearer <token>)
        →  CorrelationInterceptor (adds X-Correlation-ID header)
        →  ErrorInterceptor       (handles 401 → refresh token → retry; 403 → redirect)
Response → LoadingInterceptor     (manages global loading state)
```

**Content Security Policy (applied in `index.html` meta tag):**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://cdn.yourdomain.com;
connect-src 'self' https://api.yourdomain.com;
frame-ancestors 'none';
```

---

## Key Entry Points

```
src/main.ts                                — app bootstrap; bootstrapApplication()
src/app/app.config.ts                      — global providers (HttpClient, Router, NgRx store)
src/app/app.routes.ts                      — root route definitions with lazy-loaded feature routes
src/app/core/interceptors/                 — HTTP interceptors (auth, XSRF, error, loading)
src/app/core/guards/auth.guard.ts          — route auth guard
src/app/core/services/auth.service.ts      — token management and refresh logic
src/app/features/loan-application/        — multi-step loan application feature
src/app/shared/                            — reusable components, pipes, directives
```

---

## Conventions

- **Standalone components only** — no NgModules; every component, directive, and pipe uses `standalone: true`
- **Reactive Forms only** — never use template-driven forms; all forms use `FormBuilder` and typed `FormGroup<T>`
- **All HTTP calls through a service** — never inject `HttpClient` directly into a component; always through a dedicated service in `core/services/` or `features/<name>/services/`
- **NgRx for global state only** — UI-local state uses Signals; only shared cross-feature state goes into the NgRx store
- **Lazy load every feature route** — `loadComponent: () => import(...)` on all feature routes; no eager loading of feature modules
- **Tests co-located:** `loan-application.component.ts` + `loan-application.component.spec.ts` in the same folder

---

## Layer Boundaries

**Responsibility:** Owns the user interface and all client-side rendering logic. Consumes APIs from the backend — never calls the database or external services directly.

| Direction | Detail |
|---|---|
| **Inbound** | User interactions from browser or mobile |
| **Outbound** | HTTP calls to `backend/api/` only — via Angular `HttpClient` through `core/services/` |
| **Must not** | Connect directly to the database, call infrastructure services, or call third-party APIs |

**Integration points:**

| Connects to | Via | Contract location |
|---|---|---|
| Backend API | REST (Angular `HttpClient`) | `docs/backend/design/openapi-spec_v1.yaml` |
| Auth0 (via backend) | OAuth2 / OIDC redirect — backend handles token exchange | `integration/apis/auth0.md` |
