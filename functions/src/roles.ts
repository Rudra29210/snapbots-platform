import { z } from 'zod';

/**
 * Pure role logic. Kept free of Firebase imports so it can be unit-tested directly.
 */

export const SetAdminInput = z.object({
  uid: z
    .string()
    .trim()
    .min(20)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/, 'uid contains invalid characters'),
});
export type SetAdminInput = z.infer<typeof SetAdminInput>;

export function parseSetAdminInput(data: unknown): { ok: true; uid: string } | { ok: false; message: string } {
  const r = SetAdminInput.safeParse(data);
  if (!r.success) return { ok: false, message: 'Please provide a valid user identifier.' };
  return { ok: true, uid: r.data.uid };
}

/** Preserves any other custom claims while adding admin. Never removes unrelated claims. */
export function mergeAdminClaims(existing: Record<string, unknown> | undefined, grant: boolean): Record<string, unknown> {
  return { ...(existing ?? {}), admin: grant };
}
