import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert, Button, Field, Input } from '@/components/ui';
import { registerSchema } from '@/schemas/forms';
import { register as createAccount } from '@/services/auth';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { AuthShell } from './AuthShell';

type Values = z.infer<typeof registerSchema>;

export default function Register() {
  const { configured } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (v: Values) => {
    setServerError(null);
    try {
      await createAccount(v.displayName, v.email, v.password);
      navigate('/verify-email', { replace: true });
    } catch (err) {
      setServerError(toUserMessage(err));
    }
  };

  return (
    <AuthShell title="Create account" lead="Keep a record of your enquiries and support requests." seoPath="/register">
      {!configured && <Alert tone="warning" title="Accounts are not connected">Registration needs Firebase configuration.</Alert>}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" aria-label="Create account">
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Field label="Name" error={errors.displayName?.message}>{(p) => <Input {...p} autoComplete="name" {...register('displayName')} />}</Field>
        <Field label="Email" error={errors.email?.message}>{(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}</Field>
        <Field label="Password" hint="At least 8 characters." error={errors.password?.message}>{(p) => <Input {...p} type="password" autoComplete="new-password" {...register('password')} />}</Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>{(p) => <Input {...p} type="password" autoComplete="new-password" {...register('confirmPassword')} />}</Field>
        <Button type="submit" className="w-full" loading={isSubmitting} disabled={!configured}>Create account</Button>
      </form>
      <p className="mt-6 text-sm text-paper/70">Already registered? <Link to="/login" className="text-lime hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
