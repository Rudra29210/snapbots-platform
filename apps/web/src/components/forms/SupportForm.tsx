import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { supportSchema, SUPPORT_TOPICS } from '@/schemas/forms';
import { submitSupportTicket } from '@/services/records';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { FormStatus, type SubmitState } from './FormStatus';
import { z } from 'zod';

type In = z.input<typeof supportSchema>;
type Out = z.output<typeof supportSchema>;

export function SupportForm() {
  const { user } = useAuth();
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<In, unknown, Out>({
    resolver: zodResolver(supportSchema),
    defaultValues: { name: user?.displayName ?? '', email: user?.email ?? '', topic: 'technical', orderReference: '', subject: '', description: '', website: '' },
  });

  const onSubmit = async (values: Out) => {
    setState({ kind: 'submitting' });
    try {
      const reference = await submitSupportTicket(values, user?.uid ?? null);
      setState({ kind: 'success', reference });
      reset();
    } catch (err) {
      setState({ kind: 'error', message: toUserMessage(err) });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Support request">
      <FormStatus state={state} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Leave this field empty<input tabIndex={-1} autoComplete="off" {...register('website')} /></label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>{(p) => <Input {...p} {...register('name')} />}</Field>
        <Field label="Email" error={errors.email?.message}>{(p) => <Input {...p} type="email" {...register('email')} />}</Field>
        <Field label="Topic" error={errors.topic?.message}>
          {(p) => (
            <Select {...p} {...register('topic')}>
              {SUPPORT_TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Order reference (optional)" error={errors.orderReference?.message}>{(p) => <Input {...p} {...register('orderReference')} />}</Field>
      </div>
      <Field label="Subject" error={errors.subject?.message}>{(p) => <Input {...p} {...register('subject')} />}</Field>
      <Field label="Describe the issue" error={errors.description?.message} hint="Steps you took, what you expected and what happened.">
        {(p) => <Textarea {...p} rows={7} {...register('description')} />}
      </Field>
      <Button type="submit" loading={isSubmitting || state.kind === 'submitting'}>Send support request</Button>
    </form>
  );
}
