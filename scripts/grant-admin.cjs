const admin = require('firebase-admin');

async function main() {
  const email = process.argv[2];

  if (!email) {
    throw new Error(
      'Usage: node scripts/grant-admin.cjs your-email@example.com'
    );
  }

  // Uses credentials configured securely on your own machine.
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  const auth = admin.auth();
  const user = await auth.getUserByEmail(email);

  // Preserve existing custom claims.
  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    admin: true,
  });

  console.log(`Admin access granted to ${user.email}`);
}

main().catch((error) => {
  console.error('Could not grant admin access:', error.message);
  process.exitCode = 1;
});