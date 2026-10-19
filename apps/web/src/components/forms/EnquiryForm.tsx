import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { enquirySchema, ENQUIRY_CATEGORIES, type EnquiryInput, type EnquiryValues } from '@/schemas/forms';
import { submitEnquiry } from '@/services/records';
import { toUserMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';
import { FormStatus, type SubmitState } from './FormStatus';

export function EnquiryForm({ defaultCategory = 'general', defaultSubject = '' }: { defaultCategory?: EnquiryInput['category']; defaultSubject?: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: user?.displayName ?? '',
      email: user?.email ?? '',
      category: defaultCategory,
      subject: defaultSubject,
      consent: false as unknown as true,
      website: '',
    },
  });

  const onSubmit = async (values: EnquiryValues) => {
    setState({ kind: 'submitting' });
    try {
      const reference = await submitEnquiry(values, user?.uid ?? null);
      setState({ kind: 'success', reference });
      reset();
    } catch (err) {
      setState({ kind: 'error', message: toUserMessage(err) });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Enquiry form">
      <FormStatus state={state} />
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Leave this field empty<input tabIndex={-1} autoComplete="off" {...register('website')} /></label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          {(p) => <Input {...p} {...register('name')} autoComplete="name" />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(p) => <Input {...p} type="email" {...register('email')} autoComplete="email" />}
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          {(p) => <Input {...p} type="tel" {...register('phone')} autoComplete="tel" />}
        </Field>
        <Field label="Company or organisation (optional)" error={errors.company?.message}>
          {(p) => <Input {...p} {...register('company')} autoComplete="organization" />}
        </Field>
        <Field label="What is this about?" error={errors.category?.message}>
          {(p) => (
            <Select {...p} {...register('category')}>
              {ENQUIRY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Subject" error={errors.subject?.message}>
          {(p) => <Input {...p} {...register('subject')} />}
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message} hint="Include goals, constraints, quantities or timeline where you can.">
        {(p) => <Textarea {...p} {...register('message')} />}
      </Field>
      <label className="flex items-start gap-3 text-sm text-paper/80">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-lime" {...register('consent')} />
        <span>I agree that SNAPBOTS may contact me about this enquiry and will store my details to do so.</span>
      </label>
      {errors.consent && <p role="alert" className="text-xs text-danger">{errors.consent.message}</p>}
      <Button type="submit" loading={isSubmitting || state.kind === 'submitting'}>
        Send enquiry
      </Button>
    </form>
  );
}
