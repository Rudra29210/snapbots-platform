# SNAPBOTS visual redesign

## What changed
- Reworked the public homepage into a premium engineering-studio experience with an animated CSS/SVG-like orbital system illustration, responsive typography, project and capability storytelling, and clearer calls to action.
- Added a shared visual layer for navigation, cards, forms, account/admin surfaces, tables, focus states, and mobile breakpoints.
- Preserved the existing React + TypeScript + Vite + Tailwind + Framer Motion + Firebase architecture and existing routes/content data.
- Added missing source modules referenced by the existing code: `apps/web/src/lib/cn.ts`, `errors.ts`, and `firebase.ts`.
- Animation respects `prefers-reduced-motion` in the main visual system and Framer Motion components.

## Run locally
From the repository root:

```bash
npm ci
npm run dev
```

Open the localhost URL Vite prints. The repository uses npm workspaces, so run `npm ci` at the root, not inside `apps/web`.

## Firebase
Copy `apps/web/.env.example` to `apps/web/.env` and enter the public Firebase web-app config values from your Firebase console. Without Firebase configuration, the public website can run in public-only mode; authentication, record submission and admin data require a configured Firebase project and correct security rules.

## Validation note
The code was updated from the supplied archive. Automated build/tests could not be confirmed in this environment because dependency installation did not complete. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` locally and share any resulting errors for targeted fixes.
