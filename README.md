# SNAPBOTS Platform

Public website, customer portal, administrator dashboard and Firebase backend for SNAPBOTS
(`BUILD. INNOVATE. IMPACT.`).

- **Web app:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, React Hook Form, Zod.
- **Backend:** Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions (TypeScript, Node 22),
  Firestore and Storage security rules, Firebase Hosting with security headers.

Read these next:

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Structure, data flow, session model, caching |
| [DATABASE.md](DATABASE.md) | Collections, fields, indexes, retention |
| [SECURITY.md](SECURITY.md) | Permission matrix, threat model, controls and their verification status |
| [TESTING.md](TESTING.md) | Exactly what was run, and the real results |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Firebase project setup, environments, release and rollback |

## Quick start

Prerequisites: Node 22, npm 10, Java 21 (only for emulator and rules tests).

```bash
npm ci                         # installs all workspaces from the lockfile
npm run dev                    # web app on http://localhost:5173 (public pages work without Firebase)
```

Without Firebase configuration the site runs in **public-only mode**. Enquiry forms show a truthful
"not connected" message instead of pretending to save.

To connect the app to Firebase locally with the emulators:

```bash
cp apps/web/.env.example apps/web/.env   # then set VITE_USE_EMULATORS=true and the VITE_FIREBASE_* values
npm run emulators                        # Auth, Firestore, Storage, Functions, Hosting, Emulator UI on :4000
npm run dev
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server for the web app |
| `npm run build` | Type-check and production build to `apps/web/dist` |
| `npm run typecheck` | `tsc` strict type check for the web app |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run test:web` | Vitest + Testing Library (web app) |
| `npm run functions:build` | Compile Cloud Functions to `functions/lib` |
| `npm run test:functions` | Vitest unit tests for function logic |
| `npm run test:rules` | Firestore and Storage rules tests inside the Firebase emulator (needs Java 21 and network access to download the emulator) |
| `npm test` | `test:web` and `test:functions` |
| `npm run emulators` | Start local Firebase emulators |
| `npm run bootstrap-admin -- <uid>` | Grant admin claim to the first administrator (see DEPLOYMENT.md) |

## Repository layout

```
apps/web/            React application (src/app routing, pages, components, services, schemas, tests)
functions/           Cloud Functions (src/index.ts), pure logic (roles.ts, audit.ts), tests, bootstrap script
firestore.rules      Default-deny Firestore rules
storage.rules        Default-deny Storage rules
firestore.indexes.json
firebase.json        Hosting (SPA rewrites, security headers), emulator ports, rule and function wiring
.github/workflows/ci.yml   Verification pipeline (no deploy credentials)
```

## Feature status

Statuses: **IMPLEMENTED AND TESTED** (run and passing here), **IMPLEMENTED, NOT LIVE-VERIFIED** (code exists,
needs a Firebase project or the emulator to confirm), **PARTIAL**, **NOT IMPLEMENTED**.

| Area | Status |
|---|---|
| Public pages: home, about, services, products (search, filter), projects (search, detail), innovation, learning, FAQ (search, accordion), legal, 404, access-denied, service-error | IMPLEMENTED AND TESTED (component tests for search, filter, accordion, navigation) |
| Responsive navigation, skip link, reduced-motion support | IMPLEMENTED, NOT LIVE-VERIFIED (no browser run in this environment) |
| Enquiry, partnership and support forms: Zod validation, honeypot, server timestamps, create-only writes | IMPLEMENTED AND TESTED for validation; persistence IMPLEMENTED, NOT LIVE-VERIFIED |
| Persistence to Firestore when configured | IMPLEMENTED, NOT LIVE-VERIFIED |
| Register, login, logout, verify email, password reset, session restore | IMPLEMENTED, NOT LIVE-VERIFIED (Firebase Auth provider must be enabled) |
| Customer dashboard (own records only) and account profile | IMPLEMENTED, NOT LIVE-VERIFIED |
| Account self-deletion | NOT IMPLEMENTED (documented manual request by email) |
| Google sign-in | NOT IMPLEMENTED |
| Admin overview counts, enquiry/partnership/support management with status and internal notes | IMPLEMENTED, NOT LIVE-VERIFIED |
| Admin role grant through server callable, with audit event | IMPLEMENTED, NOT LIVE-VERIFIED |
| Audit trail for status changes (metadata only) | IMPLEMENTED, NOT LIVE-VERIFIED |
| Firestore and Storage security rules | IMPLEMENTED, rules tests WRITTEN BUT NOT EXECUTED (emulator unavailable here) |
| Admin management of products, services, projects and page content | NOT IMPLEMENTED (content is typed in `apps/web/src/content/site.ts`) |
| User management list and role revocation | NOT IMPLEMENTED |
| Attachments upload UI | NOT IMPLEMENTED (Storage rules are in place for future use) |
| Email or SMS notifications | NOT IMPLEMENTED (submissions say so truthfully) |
| Online checkout and payments | NOT IMPLEMENTED (intentionally; product pages are enquiry-only) |
| App Check enforcement | PARTIAL (client hook point and function flag exist; must be configured and enabled in the console) |
| Scheduled retention cleanup | NOT IMPLEMENTED |
| Error monitoring integration | NOT IMPLEMENTED (structured console logging and an error boundary only) |
| Health endpoint | IMPLEMENTED, NOT LIVE-VERIFIED (`health` HTTPS function; it is not routed through Hosting) |

## Placeholders to replace before launch

- `https://snapbots.example` in `apps/web/src/components/layout/Seo.tsx`, `apps/web/public/robots.txt`, and `apps/web/public/sitemap.xml`.
- Demonstration projects, products and innovation entries in `apps/web/src/content/site.ts`. They are labelled `demonstration`, `planned` or `in_development`. Replace them only with verified facts.
- Privacy policy and terms are drafts and must be reviewed by a qualified professional.
