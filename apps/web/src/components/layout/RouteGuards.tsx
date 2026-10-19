import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';
import { AccessDenied } from '@/pages/errors';

/**
 * UX-only gating: hides protected screens from visitors. Real protection is enforced
 * by Firestore/Storage rules and Cloud Functions, which do not trust this component.
 */
function Restoring() {
  return (
    <div className="container-x flex min-h-[50vh] items-center justify-center py-24">
      <Spinner label="Restoring your session" />
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <AccessDenied reason="unconfigured" />;
  if (loading) return <Restoring />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <AccessDenied reason="unconfigured" />;
  if (loading) return <Restoring />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <AccessDenied reason="forbidden" />;
  return <>{children}</>;
}
