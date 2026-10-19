# Deployment

This guide assumes three Firebase projects: development, staging and production. Use separate projects so that
test data never reaches production. Nothing in this repository has been deployed.

## 1. Prerequisites

- Node 22, npm 10, Java 21 (emulators and rules tests)
- A Google account with billing enabled on the Firebase projects that need Cloud Functions (Functions require the
  Blaze plan)
- Firebase CLI, already a dev dependency: use `npx firebase` or `npm run emulators`

## 2. Create the Firebase projects

1. In the Firebase console, create `snapbots-dev`, `snapbots-staging` and `snapbots-prod` (or your chosen names).
2. In each project, enable **Authentication → Sign-in method → Email/Password**.
3. Enable **Firestore Database** in production mode (rules are deployed from this repo).
4. Enable **Storage** and **Hosting**.
5. Register a **Web app** in each project and copy its config into `apps/web/.env` (or your CI secrets), using the
   variables in `apps/web/.env.example`.
6. Set a budget alert: **Billing → Budgets & alerts** at a low threshold for development and a monitored threshold for
   production.

## 3. Configure locally

```bash
cp .firebaserc.example .firebaserc         # then set the real project IDs (.firebaserc is git-ignored)
npx firebase login
npx firebase use snapbots-dev
```

## 4. Verify before any deploy

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run functions:build
npm run test:rules          # required: must pass before staging
```

## 5. Deploy order

Deploy rules and indexes before the application that depends on them:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
npx firebase deploy --only functions
npx firebase deploy --only hosting
```

Indexes can take several minutes to build. Admin lists and customer dashboards will show errors until their index
is ready. The UI shows the message "Could not load" in that case.

## 6. First administrator

The first admin must be granted with the Admin SDK. Never commit the service account key.

1. Create the user through the site, verify the email, and copy the UID from the Firebase console.
2. Download a service-account key for the **development** project and keep it outside the repository.
3. Run:

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/secure/path/key.json npm run bootstrap-admin -- <uid>
   ```

4. Delete the key file, or rotate it, after use.
5. The admin signs out and back in to refresh the token.

Further admins are granted from the **Roles** page, which calls `setAdminRole`.

## 7. App Check rollout

App Check is not enforced by default.

1. In the console, register the web app with reCAPTCHA Enterprise or reCAPTCHA v3, and add the site key as
   `VITE_APP_CHECK_SITE_KEY`. **The client initialisation for App Check is not yet wired into the code**, so this
   step is a prerequisite that must be added first.
2. Monitor App Check metrics for at least a week with enforcement off.
3. Enforce for Firestore, Storage and Functions. For functions, set `APP_CHECK_ENFORCED=true` in the function
   environment, redeploy, and watch for rejected traffic.

## 8. Custom domain

In **Hosting**, add the custom domain and follow the DNS records shown. Update the origin in
`Seo.tsx`, `robots.txt` and `sitemap.xml` (currently `snapbots.example`).

## 9. CI/CD

`.github/workflows/ci.yml` verifies pull requests and pushes to `main`. It holds **no deploy credentials**. Deployment
is intentionally manual until a protected release workflow is set up. When you add one, use a dedicated service
account with only the Hosting, Functions, Firestore and Storage deploy roles, stored as an environment secret with
manual approval.

## 10. Rollback

- **Hosting:** Firebase console → Hosting → release history → roll back to the previous release.
- **Functions:** redeploy the previous commit, or delete the broken function with `firebase functions:delete`.
- **Rules:** redeploy the previous `firestore.rules` and `storage.rules` from git. Rules changes apply within minutes.
- **Data:** see backup below.

## 11. Backup and recovery

Enable scheduled exports with the Firestore managed export tool (`gcloud firestore export gs://<bucket>`) to a
bucket in the same region, with a retention lifecycle. Test a restore into a scratch project at least once before
relying on it. This repository does not automate backups yet.

## 12. Operations

- Logs: Cloud Logging, filter by function name. Logs are structured and contain no note text or message bodies.
- Health: call the `health` function URL directly (`https://<region>-<project>.cloudfunctions.net/health`).
- Audit: query `auditEvents` in the console or add an admin view.
- Incidents: if an admin account is suspected of compromise, remove the claim (not yet automated; use the Admin SDK
  with `setCustomUserClaims(uid, {})`), revoke refresh tokens with `revokeRefreshTokens`, and review `auditEvents`.
