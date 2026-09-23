# Frontend Supporting Documents

Supporting documents for the frontend layer delivered by the business team or UX team.

---

## Folder structure

| Folder | What goes here | Format | Claude-accessible? |
|---|---|---|---|
| `requirements/` | Business/UX requirements, user stories, screen flow descriptions, acceptance criteria | Convert to `.md`; keep original alongside | Yes — `@import` into `frontend/CLAUDE.md` |
| `design/` | Wireframes, UI mockups, screen-by-screen annotations, design system specs, user journey maps | PDF/images — human reference; text annotations → `.md` | `.md` annotations — `@import`; PDF/images — prompt-only |

> **Note on OpenAPI specs:** The backend API specification (OpenAPI/Swagger) lives in `docs/backend/design/`. Reference it from there when generating Angular HTTP client services — do not copy it here.

---

## How inline content and @imported documents work together

The `frontend/CLAUDE.md` works as both at the same time — content you write directly into the file and documents you `@import` are loaded together as one combined context. Claude sees no difference between the two.

```
frontend/CLAUDE.md (what Claude loads)
│
├── Inline content — written directly into the file
│   └── Tech Stack, Commands, Security Architecture,
│       Conventions, Layer Boundaries — stable, structured
│       content maintained here permanently
│
└── @import statements — pull in external documents
    └── @../docs/frontend/requirements/your-requirements-file.md
        → Claude reads this file and treats it as part of
          frontend/CLAUDE.md — indistinguishable from inline content
```

---

## What goes inline vs what goes in @imported documents

| What goes inline in `frontend/CLAUDE.md` | What goes in `@imported` documents |
|---|---|
| Tech stack, Angular version, libraries | Full UX requirements document from the business/UX team |
| Commands (ng serve, ng test, ng build) | Detailed user flow descriptions with all steps and edge cases |
| Key user flows (brief list — 4–6 flows) | Acceptance criteria per screen or user story |
| Business rules enforced at UI (brief bullets) | Screen-by-screen field validation rules and error messages |
| Key routes (route → description) | Accessibility requirements from the UX team |
| Security Architecture table (STRIDE → Angular controls) | Any document that versions independently from the codebase |
| Key Entry Points, Conventions, Layer Boundaries | — |

**The rule:** stable, structured content you maintain as the codebase evolves stays inline. Documents delivered by other teams — which version independently — are `@imported`.

---

## How to use the `requirements/` folder

Store UX and business requirements here. Convert Word documents to Markdown so Claude can read them.

**Step 1 — Convert to Markdown and store both copies**

```
docs/frontend/requirements/
├── [system]_ux-requirements_v1.md     ← Claude reads this
└── [system]_ux-requirements_v1.docx   ← original; human reference only
```

**Step 2 — Add `@import` to `frontend/CLAUDE.md`**

```markdown
## Application Specification

@../docs/frontend/requirements/[system]_ux-requirements_v1.md

**Purpose:** Customer-facing loan application portal...  ← your inline content continues here
```

**Step 3 — When a new version arrives, update one line**

```markdown
<!-- update this line only: -->
@../docs/frontend/requirements/[system]_ux-requirements_v2.md
```

---

## How to use the `design/` folder

Store wireframes, UI mockups, and design annotations here. The approach differs based on file type.

### Screen flow and annotation documents (Markdown — @importable)

When UX designers provide written screen-by-screen annotations, field validation rules, or user journey descriptions in text form, convert them to Markdown and `@import`.

```
docs/frontend/design/
├── [system]_screen-annotations_v1.md     ← field labels, validation messages, UX rules — @import
└── [system]_user-journey_v1.md           ← step-by-step journey descriptions — @import
```

```markdown
## Application Specification

@../docs/frontend/requirements/[system]_ux-requirements_v1.md
@../docs/frontend/design/[system]_screen-annotations_v1.md

**Purpose:** Customer-facing loan application portal...
```

### Wireframes and mockups (PDF/images — prompt-only)

Wireframes, mockups, and design screenshots **cannot be `@imported`**. Reference them in the prompt explicitly when building a specific screen:

```
docs/frontend/design/
├── [system]_wireframes-apply-flow_v2.pdf      ← Apply screen wireframes — prompt-only
├── [system]_wireframes-dashboard_v1.pdf       ← Dashboard wireframes — prompt-only
└── [system]_design-system-spec_v1.pdf         ← Design system — prompt-only
```

**Example — building a screen from a wireframe:**

```
@docs/frontend/design/[system]_wireframes-apply-flow_v2.pdf
Build the Step 2 component (Employment Details) of the multi-step loan application form.
Use Angular Reactive Forms. Follow the field names and validation rules shown on page 3 of this wireframe.
```

**Example — using the backend API spec to generate an Angular service:**

```
@docs/backend/design/[system]_openapi-spec_v1.yaml
Generate an Angular HttpClient service for the /api/v1/applications endpoints.
Use the interceptor-based auth pattern defined in frontend/CLAUDE.md.
```

---

## What NOT to @import

| Document type | Why not | What to do instead |
|---|---|---|
| Wireframe PDFs and mockup images | Cannot be `@imported` — Claude cannot auto-load images | Reference with `@` in the prompt per screen |
| Full UX research reports | Too large; mostly irrelevant to code generation | Extract the key flows and rules into a Markdown summary |
| Binary files (`.docx`, `.sketch`, `.figma`) | Claude cannot read binary formats | Export to PDF (human reference) or extract text to `.md` |

---

## File naming convention

`[system-name]_[document-type]_v[N].[ext]`

| Example filename | What it is |
|---|---|
| `[system]_ux-requirements_v1.md` | Converted requirements — Claude reads this |
| `[system]_ux-requirements_v1.docx` | Original Word — human reference |
| `[system]_screen-annotations_v1.md` | UX annotations — Claude reads this |
| `[system]_user-journey_v1.md` | User journey description — Claude reads this |
| `[system]_wireframes-apply-flow_v2.pdf` | Wireframes — prompt-only |
| `[system]_design-system-spec_v1.pdf` | Design system — prompt-only |
