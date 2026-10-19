import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Alert, Button, Field, Input } from '@/components/ui';
import { resetSchema } from '@/schemas/forms';
import { sendReset } from '@/services/auth';
import { toUserMessage } from '@/lib/errors';
import { AuthShell } from './AuthShell';

type Values = z.infer<typeof resetSchema>;

export default function ForgotPassword() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (v: Values) => {
    setServerError(null);
    try {
      await sendReset(v.email);
      setDone(true); // Same message whether or not the account exists.
    } catch (err) {
      setServerError(toUserMessage(err));
    }
  };

  return (
    <AuthShell title="Reset password" lead="Enter your account email and we will send a reset link." seoPath="/forgot-password">
      {done ? (
        <Alert tone="success" title="Check your inbox">If an account exists for that email, a reset link is on its way. The link expires after a short time.</Alert>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Password reset">
          {serverError && <Alert tone="error">{serverError}</Alert>}
          <Field label="Email" error={errors.email?.message}>{(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}</Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-sm"><Link to="/login" className="text-lime hover:underline">Back to sign in</Link></p>
    </AuthShell>
  );
}
