# Security

## Permission matrix

| Capability | Public visitor | Signed-in customer (own data) | Administrator (`admin` claim) | Cloud Functions (Admin SDK) |
|---|---|---|---|---|
| Browse public pages and content | ✔ | ✔ | ✔ | — |
| Create enquiry / partnership / support record | ✔ (userId null) | ✔ (userId = own uid) | ✔ | — |
| Read own enquiries, partnerships, tickets | — | ✔ | ✔ | — |
| Read other customers' records | — | ✘ | ✔ | — |
| Change record status / internal note | ✘ | ✘ | ✔ (fields restricted, `updatedBy` must be own uid) | — |
| Delete records | ✘ | ✘ | ✘ | ✘ (not implemented) |
| Read and write own profile (`displayName`, `company`) | — | ✔ | ✔ (read) | — |
| Change own email or any role field | ✘ | ✘ | ✘ | — |
| Grant admin claim | ✘ | ✘ | ✔ (via `setAdminRole`, which re-checks the caller) | ✔ (the only writer) |
| Read audit log | ✘ | ✘ | ✔ | — |
| Write audit log | ✘ | ✘ | ✘ | ✔ |
| Upload public media | ✘ | ✘ | ✔ (images only, ≤ 5 MB) | — |
| Upload private attachments | ✘ | own folder only (PDF/PNG/JPEG, ≤ 10 MB) | ✔ | — |
| Read another customer's attachments | ✘ | ✘ | ✔ | — |

Staff or support roles are **not implemented**. Only the `admin` claim exists.

## Verification status

| Control | Implemented | Verified |
|---|---|---|
| Default-deny Firestore and Storage rules | Yes | **Not executed.** 37 Firestore cases and 7 Storage cases are written in `functions/tests/rules/`. They require the Firebase emulator, which could not be downloaded in the build environment. |
| Schema validation in the browser | Yes | Yes (29 web tests, including schema tests) |
| Server-side field validation | Yes, in rules (types, lengths, enums, consent, timestamps, ownership) | Written, not executed (see above) |
| Honeypot on public forms | Yes | Yes (schema tests); the bot-filtering effect itself is not measured |
| Privilege escalation blocked (self-assigned admin, profile role fields) | Yes, in rules and by design (roles live only in custom claims) | Written, not executed |
| Audit trail for status changes | Yes (trigger) | Pure logic tested (8 function tests). Trigger not executed live. |
| App Check | Partial: function flag `APP_CHECK_ENFORCED`, no enforcement by default | **Not configured** |
| Rate limiting on submissions | **Not implemented** beyond App Check, which is not enforced | — |
| CSP and security headers | Yes, in `firebase.json` | Not verified in a browser. Any script or style not allowed by the CSP will be blocked. Check the console after deploying. |
| Secrets handling | No server secrets in the client. Client Firebase config is public by design. | Yes (grep and review). The bootstrap script reads credentials only from `GOOGLE_APPLICATION_CREDENTIALS`. |
| Dependency vulnerability scan | `npm audit` reports advisories in the transitive tree | Not triaged. Run `npm audit` and review before launch. |

## Threat model (summary)

| Threat | Mitigation | Residual risk |
|---|---|---|
| Customer reads another customer's enquiry | Owner-only read rule and `userId` filter | Depends on rules tests being run before launch |
| Anonymous user forges an admin claim | Claims are set only by `setAdminRole` (admin-only) and the Admin SDK | Compromised admin account can grant more admins. Keep admin count small and audit `role.admin_granted`. |
| Admin forges another actor in `updatedBy` | Rule requires `updatedBy == request.auth.uid` | None known |
| Spam or bot enquiries | Honeypot, length limits, App Check (once enabled), create-only writes | No rate limit yet. A determined bot can submit many records. Enable App Check and monitor counts. |
| Stored XSS via enquiry text | React escapes text by default; no `dangerouslySetInnerHTML` is used; `whitespace-pre-wrap` only | Low. Keep it that way; review any new HTML rendering. |
| Clickjacking | `X-Frame-Options: DENY`, `frame-ancestors 'none'` | None known |
| Mixed content and downgrade | HSTS header | None known |
| Sensitive data in logs | Logs contain IDs and status codes only; note text and emails are not logged. Error boundary strips input. | Review function logs before enabling wider logging |
| Internal notes exposed to customers | **Known gap.** Owners can read the full enquiry document, including `internalNote`. | **High for any real use of notes.** Fix by moving notes to an admin-only subcollection before relying on them. |
| Enumeration of account existence | Password reset always shows the same message | Login errors use the same generic message for unknown user and wrong password |
| Stolen session token | Short-lived ID token, refreshed by the SDK | Standard Firebase risk. Consider revoking sessions on password reset (not implemented). |
| Abuse of the setAdminRole endpoint | Requires admin claim; input validated; generic error messages | Anonymous callers still reach the function (cheap rejection). Enable App Check. |

## Known gaps to close before production

1. Move `internalNote` to an admin-only subcollection, then update rules and the UI.
2. Run the emulator rules tests (`npm run test:rules`) and fix anything they reveal.
3. Enable and enforce App Check on Firestore, Storage and Functions.
4. Add rate limiting on submission endpoints (App Check plus monitoring; a callable with per-IP limits if needed).
5. Triage `npm audit` findings.
6. Verify the CSP in a browser against the deployed site, and adjust the allow-list only as needed.
7. Get a legal review of the privacy policy and terms.
8. Add error monitoring (not connected) and set alerting on `auth/` and `permission-denied` spikes.

## Data handling

- Stored personal data: name, email, optional phone and company, message content, account display name.
- No passwords, card data, government IDs or health data are collected by the site.
- Deletion: manual request by email (see the privacy page). Self-service deletion is not implemented.
