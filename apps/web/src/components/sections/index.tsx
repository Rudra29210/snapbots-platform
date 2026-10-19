import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui';
import { statusLabel } from '@/content/site';
import type { ContentStatus } from '@/types';
import type { EnquiryStatus } from '@/schemas/forms';
import { recordStatusLabel } from '@/content/labels';

/** Entrance animation that respects prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pb-16 pt-20 md:pt-28">
      <div className="absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-6xl">{title}</h1>
          {lead && <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/70 md:text-lg">{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function Section({ id, eyebrow, title, lead, children, className }: { id?: string; eyebrow?: string; title?: string; lead?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('container-x py-20 md:py-28', className)} aria-labelledby={title ? `${id ?? 's'}-title` : undefined}>
      {(eyebrow || title) && (
        <Reveal className="mb-12 max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 id={`${id ?? 's'}-title`} className="mt-3 text-3xl font-bold md:text-5xl">{title}</h2>}
          {lead && <p className="mt-4 text-paper/65">{lead}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const tone = status === 'live' ? 'ok' : status === 'in_development' ? 'warn' : status === 'planned' ? 'lime' : 'neutral';
  return <Badge tone={tone}>{statusLabel[status]}</Badge>;
}

export function CtaBand({ title, body, to = '/contact', label = 'Start a conversation' }: { title: string; body: string; to?: string; label?: string }) {
  return (
    <section className="container-x pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-lime/25 bg-gradient-to-br from-lime/15 via-ink-800 to-ink p-10 md:p-16">
          <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">{title}</h2>
          <p className="mt-4 max-w-xl text-paper/70">{body}</p>
          <Link to={to} className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-semibold text-ink transition hover:bg-lime-400">
            {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

const recordStatusTone: Record<EnquiryStatus, 'lime' | 'warn' | 'ok' | 'neutral'> = {
  new: 'lime',
  in_review: 'warn',
  responded: 'ok',
  closed: 'neutral',
};

/** Status for customer and admin records. Separate from product/content status labels. */
export function RecordStatusBadge({ status }: { status: EnquiryStatus }) {
  return <Badge tone={recordStatusTone[status]}>{recordStatusLabel(status)}</Badge>;
}
