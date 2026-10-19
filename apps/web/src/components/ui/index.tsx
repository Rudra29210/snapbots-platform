import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes, useId } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-offset-4 active:scale-[0.98]';
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-lime text-ink hover:bg-lime-400 hover:shadow-glow',
  secondary: 'border border-white/15 bg-white/[0.04] text-paper hover:border-lime/50 hover:text-lime',
  ghost: 'text-paper/80 hover:text-lime',
  danger: 'bg-danger/90 text-ink hover:bg-danger',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }>(
  function Button({ variant = 'primary', loading = false, className, children, disabled, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonBase, buttonVariants[variant], className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

export function Field({
  label,
  error,
  hint,
  children,
  id,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
  id?: string;
}) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-paper/90">
        {label}
      </label>
      {children({ id: fieldId, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-paper placeholder:text-mute/70 ' +
  'transition focus:border-lime/60 focus:outline-none focus:ring-2 focus:ring-lime/20 aria-[invalid=true]:border-danger/70';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(inputClass, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} rows={5} className={cn(inputClass, 'resize-y', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={cn(inputClass, 'appearance-none pr-10', className)} {...rest}>
      {children}
    </select>
  );
});

export function Card({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} className={cn('glass rounded-2xl p-6 transition duration-300 hover:border-lime/30', className)}>
      {children}
    </div>
  );
}

const badgeTones = {
  neutral: 'border-white/15 text-paper/75',
  lime: 'border-lime/40 text-lime',
  warn: 'border-warn/40 text-warn',
  ok: 'border-ok/40 text-ok',
  danger: 'border-danger/40 text-danger',
} as const;

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider', badgeTones[tone])}>
      {children}
    </span>
  );
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  children?: ReactNode;
}) {
  const tones = {
    info: 'border-white/15 bg-white/[0.03]',
    success: 'border-ok/40 bg-ok/10',
    error: 'border-danger/40 bg-danger/10',
    warning: 'border-warn/40 bg-warn/10',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border p-4 text-sm', tones[tone])}>
      {title && <p className="font-semibold text-paper">{title}</p>}
      {children && <div className="mt-1 text-paper/80">{children}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm text-mute">
      <Loader2 className="h-5 w-5 animate-spin text-lime" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton h-4 w-full', className)} />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="glass rounded-2xl px-6 py-14 text-center">
      <p className="font-display text-xl text-paper">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-mute">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
