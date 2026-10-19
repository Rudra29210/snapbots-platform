import { Alert } from '@/components/ui';
import { company } from '@/content/site';

export type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; reference: string }
  | { kind: 'error'; message: string };

/** Truthful outcome messaging. We only claim what the system actually did. */
export function FormStatus({ state }: { state: SubmitState }) {
  if (state.kind === 'success') {
    return (
      <Alert tone="success" title="Received and saved">
        <p>
          Your reference is <span className="font-mono text-lime">{state.reference}</span>. We review submissions by hand
          and will reply to the email you gave. Automatic email confirmations are not switched on for this site yet.
        </p>
      </Alert>
    );
  }
  if (state.kind === 'error') return <Alert tone="error" title="Could not send">{state.message}</Alert>;
  return null;
}

export const fallbackContact = `Prefer email? Write to ${company.email}.`;
