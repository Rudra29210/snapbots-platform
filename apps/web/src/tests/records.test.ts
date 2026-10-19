import { describe, expect, it } from 'vitest';
import { submitEnquiry, UNAVAILABLE_MESSAGE } from '@/services/records';
import { AppError, toUserMessage } from '@/lib/errors';

const valid = {
  name: 'Asha Verma',
  email: 'asha@example.com',
  phone: '',
  company: '',
  category: 'general' as const,
  subject: 'Question about services',
  message: 'Could you tell me more about your embedded systems work?',
  consent: true as const,
  website: '',
};

describe('submission service without Firebase configured', () => {
  it('reports a truthful unavailable error rather than pretending to save', async () => {
    await expect(submitEnquiry(valid, null)).rejects.toMatchObject({ code: 'unavailable' });
    await expect(submitEnquiry(valid, null)).rejects.toThrow(UNAVAILABLE_MESSAGE);
  });

  it('validates before attempting any write', async () => {
    const err = await submitEnquiry({ ...valid, message: 'x' }, null).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).code).toBe('validation');
  });

  it('silently rejects honeypot submissions with a generic message', async () => {
    const err = await submitEnquiry({ ...valid, website: 'http://bot.example' }, null).catch((e: unknown) => e);
    expect((err as AppError).code).toBe('validation');
    expect(toUserMessage(err)).toBe('Submission rejected.');
  });
});

describe('toUserMessage', () => {
  it('never exposes raw provider text for unknown errors', () => {
    expect(toUserMessage(new Error('internal stack trace at line 42'))).toBe('Something went wrong. Please try again.');
  });

  it('maps common auth codes to plain language', () => {
    expect(toUserMessage({ code: 'auth/invalid-credential' })).toMatch(/not recognised/);
  });
});
