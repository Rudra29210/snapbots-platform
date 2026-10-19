import { describe, expect, it } from 'vitest';
import { enquirySchema, partnershipSchema, supportSchema, registerSchema } from '@/schemas/forms';

const validEnquiry = {
  name: 'Asha Verma',
  email: 'asha@example.com',
  phone: '+91 98765 43210',
  company: '',
  category: 'robotics_project',
  subject: 'Line follower for school',
  message: 'We need a small line-following robot for a school competition next month.',
  consent: true,
  website: '',
} as const;

describe('enquirySchema', () => {
  it('accepts a complete, valid enquiry', () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it('rejects a filled honeypot field (bot signal)', () => {
    const r = enquirySchema.safeParse({ ...validEnquiry, website: 'http://spam.example' });
    expect(r.success).toBe(false);
  });

  it('requires explicit consent', () => {
    const r = enquirySchema.safeParse({ ...validEnquiry, consent: false });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r)).toMatch(/agree to be contacted/i);
  });

  it('rejects an unknown category instead of storing it', () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, category: 'admin' }).success).toBe(false);
  });

  it('rejects a message that is too short', () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, message: 'hi' }).success).toBe(false);
  });

  it('rejects a phone number containing letters', () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, phone: 'call-me-now' }).success).toBe(false);
  });

  it('lower-cases and trims the email address', () => {
    const r = enquirySchema.parse({ ...validEnquiry, email: '  Asha@Example.COM ' });
    expect(r.email).toBe('asha@example.com');
  });
});

describe('partnershipSchema', () => {
  const base = {
    organisation: 'Sample College',
    contactName: 'Dr. Test',
    email: 'partner@example.com',
    partnershipType: 'institution',
    website: '',
    proposal: 'We would like to run a monthly robotics workshop for second-year students.',
    consent: true,
    hp_field: '',
  };

  it('accepts a valid application with no website', () => {
    expect(partnershipSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a website that is not a full URL', () => {
    expect(partnershipSchema.safeParse({ ...base, website: 'example.com' }).success).toBe(false);
  });

  it('accepts a full https URL', () => {
    expect(partnershipSchema.safeParse({ ...base, website: 'https://example.org' }).success).toBe(true);
  });
});

describe('supportSchema', () => {
  it('requires a detailed description', () => {
    const r = supportSchema.safeParse({
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      topic: 'order',
      orderReference: '',
      subject: 'Late delivery',
      description: 'short',
      website: '',
    });
    expect(r.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('rejects mismatched passwords', () => {
    const r = registerSchema.safeParse({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'longpassword1',
      confirmPassword: 'longpassword2',
    });
    expect(r.success).toBe(false);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const r = registerSchema.safeParse({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(r.success).toBe(false);
  });
});
