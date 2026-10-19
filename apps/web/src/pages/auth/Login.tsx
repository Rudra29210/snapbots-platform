import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert, Button, Field, Input } from '@/components/ui';
import { loginSchema } from '@/schemas/forms';
import { signIn } from '@/services/auth';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { AuthShell } from './AuthShell';

type Values = z.infer<typeof loginSchema>;

export default function Login() {
  const { user, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (v: Values) => {
    setServerError(null);
    try {
      await signIn(v.email, v.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(toUserMessage(err));
    }
  };

  return (
    <AuthShell title="Sign in" lead="Track your enquiries and support requests in one place." seoPath="/login">
      {!configured && <Alert tone="warning" title="Accounts are not connected">Sign-in needs Firebase configuration. See the deployment guide.</Alert>}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" aria-label="Sign in">
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Field label="Email" error={errors.email?.message}>{(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}</Field>
        <Field label="Password" error={errors.password?.message}>{(p) => <Input {...p} type="password" autoComplete="current-password" {...register('password')} />}</Field>
        <Button type="submit" className="w-full" loading={isSubmitting} disabled={!configured}>Sign in</Button>
      </form>
      <div className="mt-6 flex flex-col gap-3 text-sm text-paper/70">
        <Link to="/forgot-password" className="text-lime hover:underline">Forgot your password?</Link>
        <p>New here? <Link to="/register" className="text-lime hover:underline">Create an account</Link></p>
      </div>
    </AuthShell>
  );
}
