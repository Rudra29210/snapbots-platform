import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button } from '@/components/ui';
import { resendVerification, signOut } from '@/services/auth';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { AuthShell } from './AuthShell';

export default function VerifyEmail() {
  const { user, loading, refreshClaims } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.emailVerified) return <Navigate to="/dashboard" replace />;

  const checkVerified = async () => {
    setBusy(true);
    try {
      await user.reload();
      await refreshClaims();
      if (user.emailVerified) {
        navigate('/dashboard', { replace: true });
      } else {
        setMessage({ tone: 'error', text: 'Your email is not verified yet. Open the link in the email, then try again.' });
      }
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await resendVerification(user);
      setMessage({ tone: 'success', text: `We sent a verification link to ${user.email ?? 'your email'}.` });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Verify your email" lead={`We sent a link to ${user.email ?? 'your email address'}. Open it to activate your account.`} seoPath="/verify-email">
      <div className="space-y-5">
        {message && <Alert tone={message.tone === 'success' ? 'success' : 'error'}>{message.text}</Alert>}
        <Button className="w-full" onClick={checkVerified} loading={busy}>I have verified my email</Button>
        <Button variant="secondary" className="w-full" onClick={resend} disabled={busy}>Resend verification email</Button>
        <Button variant="ghost" className="w-full" onClick={() => void signOut()}>Use a different account</Button>
      </div>
    </AuthShell>
  );
}
