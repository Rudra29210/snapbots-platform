/**
 * One-time bootstrap for the FIRST administrator. Run locally with a service account
 * that you control; never commit that key. After the first admin exists, grant others
 * through the Roles page, which goes through the setAdminRole function.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/secure/path/key.json npm run bootstrap-admin -- <uid>
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { parseSetAdminInput, mergeAdminClaims } from '../src/roles';

async function main() {
  const uid = process.argv[2];
  const parsed = parseSetAdminInput({ uid });
  if (!parsed.ok) {
    console.error(parsed.message);
    process.exit(1);
  }
  initializeApp({ credential: applicationDefault() });
  const user = await getAuth().getUser(parsed.ok ? parsed.uid : '');
  await getAuth().setCustomUserClaims(user.uid, mergeAdminClaims(user.customClaims, true));
  console.log(`Admin claim set for ${user.uid}. The user must sign out and back in to refresh their token.`);
}

main().catch((err: unknown) => {
  console.error('Bootstrap failed:', err instanceof Error ? err.message : 'unknown error');
  process.exit(1);
});
