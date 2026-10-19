import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { partnershipSchema, PARTNERSHIP_TYPES } from '@/schemas/forms';
import { submitPartnership } from '@/services/records';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { FormStatus, type SubmitState } from './FormStatus';

type Input_ = z.input<typeof partnershipSchema>;
type Output_ = z.output<typeof partnershipSchema>;

export function PartnershipForm() {
  const { user } = useAuth();
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Input_, unknown, Output_>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: { organisation: '', contactName: user?.displayName ?? '', email: user?.email ?? '', partnershipType: 'sponsor', website: '', proposal: '', consent: false as unknown as true, hp_field: '' },
  });

  const onSubmit = async (values: Output_) => {
    setState({ kind: 'submitting' });
    try {
      const reference = await submitPartnership(values, user?.uid ?? null);
      setState({ kind: 'success', reference });
      reset();
    } catch (err) {
      setState({ kind: 'error', message: toUserMessage(err) });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Partnership application">
      <FormStatus state={state} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Leave this field empty<input tabIndex={-1} autoComplete="off" {...register('hp_field')} /></label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Organisation" error={errors.organisation?.message}>{(p) => <Input {...p} {...register('organisation')} />}</Field>
        <Field label="Contact person" error={errors.contactName?.message}>{(p) => <Input {...p} {...register('contactName')} />}</Field>
        <Field label="Email" error={errors.email?.message}>{(p) => <Input {...p} type="email" {...register('email')} />}</Field>
        <Field label="Type of partnership" error={errors.partnershipType?.message}>
          {(p) => (
            <Select {...p} {...register('partnershipType')}>
              {PARTNERSHIP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Website (optional)" error={errors.website?.message} hint="Full address, e.g. https://example.org">
          {(p) => <Input {...p} type="url" {...register('website')} />}
        </Field>
      </div>
      <Field label="Proposal" error={errors.proposal?.message} hint="What you would like to do together, and what you can contribute.">
        {(p) => <Textarea {...p} rows={6} {...register('proposal')} />}
      </Field>
      <label className="flex items-start gap-3 text-sm text-paper/80">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-lime" {...register('consent')} />
        <span>I agree that SNAPBOTS may contact me about this partnership application.</span>
      </label>
      {errors.consent && <p role="alert" className="text-xs text-danger">{errors.consent.message}</p>}
      <Button type="submit" loading={isSubmitting || state.kind === 'submitting'}>Submit application</Button>
    </form>
  );
}
