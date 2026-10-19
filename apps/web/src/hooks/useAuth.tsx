import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebase } from '@/lib/firebase';

export interface AuthState {
  /** True while the initial auth state (including persisted sessions) is being restored. */
  loading: boolean;
  /** False when Firebase is not configured; the site then runs in public-only mode. */
  configured: boolean;
  user: User | null;
  isAdmin: boolean;
  /** Re-reads custom claims after a server-side role change. */
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const fb = getFirebase();
  const [loading, setLoading] = useState(Boolean(fb));
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!fb) return;
    const unsubAuth = onAuthStateChanged(fb.auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    // Token refreshes carry updated custom claims (e.g. admin granted by a function).
    const unsubToken = onIdTokenChanged(fb.auth, async (u) => {
      if (!u) return setIsAdmin(false);
      const result = await u.getIdTokenResult();
      setIsAdmin(result.claims['admin'] === true);
    });
    return () => {
      unsubAuth();
      unsubToken();
    };
    // fb is a stable singleton per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      configured: Boolean(fb),
      user,
      isAdmin,
      refreshClaims: async () => {
        if (!user) return;
        const result = await user.getIdTokenResult(true);
        setIsAdmin(result.claims['admin'] === true);
      },
    }),
    [loading, fb, user, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Co-located with the provider on purpose: the context and its hook must stay in one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
