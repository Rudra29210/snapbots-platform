import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Alert, Button, Field, Input } from '@/components/ui';
import { profileSchema } from '@/schemas/forms';
import { updateProfileDoc, signOut } from '@/services/auth';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { company } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { PageHero, Section } from '@/components/sections';

type Values = z.input<typeof profileSchema>;

export default function Account() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values, unknown, z.output<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '', company: '' },
  });

  const onSubmit = async (v: z.output<typeof profileSchema>) => {
    if (!user) return;
    setStatus(null);
    try {
      await updateProfileDoc(user.uid, v);
      setStatus({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setStatus({ tone: 'error', text: toUserMessage(err) });
    }
  };

  return (
    <>
      <Seo path="/account" title="Account" description="Manage your SNAPBOTS account." />
      <PageHero eyebrow="Account" title="Your profile" lead={user?.email ?? undefined} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-3xl p-6 md:p-10">
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Profile">
              {status && <Alert tone={status.tone === 'success' ? 'success' : 'error'}>{status.text}</Alert>}
              <Field label="Name" error={errors.displayName?.message}>{(p) => <Input {...p} {...register('displayName')} />}</Field>
              <Field label="Company (optional)" error={errors.company?.message}>{(p) => <Input {...p} {...register('company')} />}</Field>
              <Button type="submit" loading={isSubmitting}>Save profile</Button>
            </form>
          </div>
          <div className="glass h-fit space-y-6 rounded-3xl p-6 md:p-8">
            <div>
              <p className="font-semibold">Your records</p>
              <p className="mt-2 text-sm text-mute">Enquiries, partnership applications and support requests you submitted while signed in.</p>
              <Link to="/dashboard" className="mt-4 inline-block text-sm text-lime hover:underline">Open dashboard</Link>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="font-semibold">Delete account</p>
              <p className="mt-2 text-sm text-mute">Self-service deletion is not automated yet. Email us and we will delete your account and profile.</p>
              <a className="mt-4 inline-block text-sm text-lime hover:underline" href={`mailto:${company.email}?subject=${encodeURIComponent('Account deletion request')}`}>Request deletion by email</a>
            </div>
            <div className="border-t border-white/10 pt-6">
              <Button variant="secondary" onClick={() => void signOut()}>Sign out</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
