import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Field, Input } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { grantAdminRole } from '@/services/admin';
import { toUserMessage } from '@/lib/errors';

const schema = z.object({
  uid: z.string().trim().regex(/^[A-Za-z0-9_-]{20,128}$/, 'Enter a valid user ID (UID) from the Firebase console'),
});
type Values = z.infer<typeof schema>;

export default function Roles() {
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { uid: '' } });

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await grantAdminRole(pending);
      setStatus({ tone: 'success', text: 'Admin access granted. The user must sign out and back in, or wait for their token to refresh, before it takes effect.' });
      reset();
    } catch (err) {
      setStatus({ tone: 'error', text: toUserMessage(err) });
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Roles</h1>
        <p className="mt-2 text-sm text-mute">
          Admin access is a server-issued custom claim. This page only asks the server to grant it. The server checks that you are
          already an administrator and records the change. Your browser cannot grant itself access.
        </p>
      </div>
      {status && <Alert tone={status.tone === 'success' ? 'success' : 'error'}>{status.text}</Alert>}
      <form noValidate onSubmit={handleSubmit((v) => setPending(v.uid))} className="glass space-y-6 rounded-2xl p-6" aria-label="Grant admin access">
        <Field label="User ID (UID)" error={errors.uid?.message} hint="Find it under Authentication in the Firebase console.">
          {(p) => <Input {...p} className="font-mono" {...register('uid')} />}
        </Field>
        <Button type="submit">Grant admin access…</Button>
      </form>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Grant administrator access?"
        body="This user will be able to read all enquiries, partnerships and support requests, and change their status."
        confirmLabel="Grant access"
        tone="danger"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirm()}
      />
    </div>
  );
}
