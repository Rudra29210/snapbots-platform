# Testing

Every result below comes from a command run in the build environment. Nothing was simulated.

## Results

| Check | Command | Result |
|---|---|---|
| Web type check (strict) | `npm run typecheck` | **Pass** |
| Web lint (zero warnings) | `npm run lint` | **Pass** |
| Web unit and component tests | `npm run test:web` | **Pass: 29 of 29** (schemas 13, records/service 5, pages and navigation 11) |
| Web production build | `npm run build` | **Pass.** Vendor chunks: Firebase ≈462 kB (≈108 kB gzip), React ≈156 kB, Framer Motion ≈113 kB, forms ≈80 kB. App code ≈31 kB. |
| Functions compile | `npm run functions:build` | **Pass** |
| Functions unit tests | `npm run test:functions` | **Pass: 8 of 8** (role input validation, claim merging, audit event construction, note text excluded) |
| Firestore and Storage rules tests | `npm run test:rules` | **NOT RUN.** 37 Firestore cases and 7 Storage cases are written. The emulator needs a jar downloaded from `storage.googleapis.com`, which the build sandbox could not reach. Run this on a machine with network access before any launch. |
| Live Firebase project end-to-end journeys | — | **NOT RUN.** No Firebase project or credentials were available. |
| Browser end-to-end tests (Playwright or similar) | — | **NOT IMPLEMENTED** |
| Visual, responsive and reduced-motion review | — | **NOT RUN** in a browser. Layout was written mobile-first and checked by build and type checking only. |

## What the component tests cover

- Products: search, category filter, empty state with reset, no checkout controls on the page.
- FAQ: keyword filter, accordion expand and collapse with correct `aria-expanded`.
- Projects: search by tag.
- Navbar: mobile menu opens and closes, `aria-expanded` state, Escape key closes it.
- Contact: empty submission shows validation errors and does not call the backend; category and subject are read from the URL; without Firebase configured it displays the honest "not connected" message.

## What the rules tests cover (written, not run)

Enquiries: guest, customer and forged-owner creation; privileged status at creation; server timestamps; honeypot;
email, length and consent validation; extra fields; overwrite prevention; owner-only reads; cross-user denial; guest denial;
unfiltered list denial; admin reads; customer status changes denied; admin updates allowed only with own `updatedBy`,
allowed fields and an enum status; forged actor denied; customer-authored fields denied to admins; deletion denied.
Users: self-profile creation, cross-uid creation denied, admin flag denied, self-escalation denied, email change denied, other profile reads denied.
Audit: client writes denied even for admins; default deny on unlisted collections.
Storage: owner upload, cross-folder denial, content-type denial, private read isolation, public read, non-admin write denial, admin image-only writes, default deny.

## Running the emulator tests

```bash
# Requires Java 21 and network access to download the emulator jar on first run.
npm run test:rules
```

Expected: every case passes. A failing case means a rule does not match the intended policy. Fix the rule or the
test, and record the decision.

## Known test gaps

- No browser end-to-end journey tests.
- No test of the audit trigger running live in the emulator (the logic is unit-tested, the trigger wiring is not).
- No test of the `setAdminRole` callable end to end (only its input validation and claim merging are unit-tested).
- No accessibility scan (for example axe) has been run.
- No load or abuse testing.
