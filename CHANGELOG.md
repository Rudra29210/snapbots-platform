# Changelog

## 0.1.0 — first implementation

- Public site: home, about, services, products (search and filter), projects (search, detail), innovation, learning, partnerships, contact, FAQ (search), support, privacy, terms, 404, access-denied and service-error states.
- Enquiry, partnership and support forms with Zod validation, honeypots and create-only Firestore writes. Honest "not connected" messaging when Firebase is absent.
- Authentication flows: register, login, email verification, password reset, session restore, profile update.
- Customer dashboard (own records only).
- Admin area: overview counts, enquiry, partnership and support management with status and internal notes, role grant through a server callable.
- Cloud Functions: `setAdminRole`, status-change audit triggers, `health`.
- Firestore and Storage rules (default deny), indexes, Firebase Hosting config with security headers and CSP.
- Tests: 29 web tests and 8 function tests passing; 37 Firestore and 7 Storage rules tests written but not yet executed.
- Known gaps are listed in README.md (feature status) and SECURITY.md (known gaps before production).
