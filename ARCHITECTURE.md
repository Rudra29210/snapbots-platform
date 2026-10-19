# Architecture

## Overview

```
Browser (React SPA, hosted on Firebase Hosting)
  │  Firebase Auth SDK ──────────────► Firebase Authentication (email/password)
  │  Firestore SDK (direct, rule-guarded) ─► Cloud Firestore
  │  Functions SDK (callable) ───────► Cloud Functions (setAdminRole)
  │
Cloud Functions (Admin SDK, bypasses client rules by design)
  ├─ setAdminRole (callable): only an existing admin can grant the admin claim; writes an audit event
  ├─ auditEnquiryUpdates / auditPartnershipUpdates / auditSupportUpdates (Firestore triggers):
  │     write metadata-only audit events on status changes
  └─ health (HTTP): liveness, no secrets
```

### Why most writes go directly to Firestore

Public enquiry submissions and customer reads use the Firestore client SDK. This is deliberate: a
validated, create-only write with rules that enforce the exact field set, lengths, enum values, server
timestamps and ownership is as strong as a function and avoids a cold-start round trip. The rules are the
control; the client schema is a usability layer over them.

Operations that **must** be server-side are: granting privileges (`setAdminRole`), writing audit records
(triggers), and anything that needs a secret or the Admin SDK. No client code can write audit events, and
admin claims can't be set from the browser.

## Front-end structure

| Path | Responsibility |
|---|---|
| `src/app/App.tsx` | Route table. Public routes under `SiteLayout`; `/account` and `/dashboard` under `RequireAuth`; `/admin/*` under `RequireAdmin`. Pages are lazy-loaded. |
| `src/layouts/SiteLayout.tsx` | Navbar, footer, skip link, route transitions (respects reduced motion) |
| `src/components/layout/` | Navbar (mobile menu with Escape handling), footer, `Seo` metadata, route guards |
| `src/components/ui/` | Accessible primitives: Button, Field (label, hint and error wiring), inputs, Badge, Alert, EmptyState, ConfirmDialog |
| `src/components/forms/` | Enquiry, partnership and support forms (React Hook Form + Zod resolver) |
| `src/schemas/forms.ts` | Single source of validation rules for forms and services |
| `src/services/` | `records.ts` (public submissions), `auth.ts`, `admin.ts` (paginated reads, counts, updates, role grant) |
| `src/content/` | Typed site copy and status labels |
| `src/lib/` | Env validation, lazy Firebase init, error mapping (raw provider text is never shown) |

## Session model

Firebase Authentication issues an ID token that the SDK persists in the browser (IndexedDB by default).
This is **not** an HttpOnly server session cookie, and the app does not claim it is. Consequences:

- Authorisation is enforced by Firestore and Storage rules and by the function, which verify the ID token on
  every request. Route guards are UX only.
- Admin status lives in the token's custom claim `admin`. Token refresh is roughly hourly, so a granted or
  revoked admin takes effect after the token refreshes (sign out and in to force it).
- The client never stores passwords, and the app does not write any credential to Firestore.
- Logout calls `signOut` and clears local auth state.

## Caching

| Asset | Cache policy (`firebase.json`) |
|---|---|
| Hashed build assets under `/assets/**` | `public, max-age=31536000, immutable` |
| `index.html` | `no-cache` (always revalidated, so new deploys are picked up) |
| Public content | Bundled in the build (`src/content/site.ts`). Changing it requires a deploy. |
| Customer and admin data | Never cached by the CDN; read via authenticated Firestore queries |

No Redis or other cache service is used. Firestore's offline persistence is not enabled, so no private data is
persisted in the browser beyond the auth session.

## Observability

- Front end: an error boundary logs one sanitised JSON line (component stack truncated, no user input).
- Functions: `firebase-functions/logger` structured logs. The audit trigger logs no note text.
- Audit trail: `auditEvents` collection, admin-readable, never client-writable.
- Not yet connected: an external error-monitoring service (see SECURITY.md).
