import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
import { AppError } from '@/lib/errors';
import { UNAVAILABLE_MESSAGE } from './records';

function requireFirebase() {
  const fb = getFirebase();
  if (!fb) throw new AppError('unavailable', UNAVAILABLE_MESSAGE);
  return fb;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { auth } = requireFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function register(displayName: string, email: string, password: string): Promise<User> {
  const { auth, db } = requireFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Profile document: owner-only read/write, enforced by rules. Contains no credentials.
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName,
    company: '',
    email,
    createdAt: serverTimestamp(),
  });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function resendVerification(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function sendReset(email: string): Promise<void> {
  const { auth } = requireFirebase();
  // Always resolve the same way so the UI does not reveal whether an email is registered.
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/network-request-failed' || code === 'auth/too-many-requests') throw err;
  }
}

export async function updateProfileDoc(uid: string, values: { displayName: string; company: string }): Promise<void> {
  const { auth, db } = requireFirebase();
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: values.displayName });
  await updateDoc(doc(db, 'users', uid), { displayName: values.displayName, company: values.company });
}

export async function signOut(): Promise<void> {
  const fb = getFirebase();
  if (fb) await fbSignOut(fb.auth);
}
