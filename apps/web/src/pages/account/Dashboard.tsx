import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/layout/Seo';
import { PageHero, RecordStatusBadge, Section } from '@/components/sections';
import { Alert, Badge, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { listOwnRecords } from '@/services/records';
import { toUserMessage } from '@/lib/errors';
import type { EnquiryDoc, PartnershipDoc, SupportTicketDoc } from '@/types';
import type { EnquiryStatus } from '@/schemas/forms';
import { ENQUIRY_CATEGORIES } from '@/schemas/forms';

type Item = { id: string; kind: string; title: string; status: EnquiryStatus; createdAt: Date | null };

const categoryLabel = (v: string) => ENQUIRY_CATEGORIES.find((c) => c.value === v)?.label ?? 'Enquiry';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const [enq, par, sup] = await Promise.all([
          listOwnRecords<EnquiryDoc>('enquiries', user.uid),
          listOwnRecords<PartnershipDoc>('partnerships', user.uid),
          listOwnRecords<SupportTicketDoc>('supportTickets', user.uid),
        ]);
        const merged: Item[] = [
          ...enq.map((e) => ({ id: e.id, kind: 'Enquiry', title: `${categoryLabel(e.category)}: ${e.subject}`, status: e.status, createdAt: e.createdAt?.toDate() ?? null })),
          ...par.map((p) => ({ id: p.id, kind: 'Partnership', title: p.organisation, status: p.status, createdAt: p.createdAt?.toDate() ?? null })),
          ...sup.map((s) => ({ id: s.id, kind: 'Support', title: s.subject, status: s.status, createdAt: s.createdAt?.toDate() ?? null })),
        ].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        if (active) setItems(merged);
      } catch (err) {
        if (active) setError(toUserMessage(err));
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <Seo path="/dashboard" title="Dashboard" description="Your SNAPBOTS enquiries and support requests." />
      <PageHero eyebrow="Dashboard" title={`Hello${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.`} lead="Your enquiries, partnership applications and support requests appear here once submitted while signed in.">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/contact" className="text-lime hover:underline">New enquiry</Link>
          <Link to="/support" className="text-lime hover:underline">New support request</Link>
          <Link to="/account" className="text-lime hover:underline">Edit profile</Link>
        </div>
      </PageHero>
      <Section>
        {user && !user.emailVerified && (
          <div className="mb-8">
            <Alert tone="warning" title="Verify your email">Your address is not verified yet. <Link className="underline" to="/verify-email">Check verification</Link>.</Alert>
          </div>
        )}
        {error && <Alert tone="error" title="Could not load your records">{error}</Alert>}
        {!error && items === null && (
          <div className="space-y-4" aria-label="Loading records">
            <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
          </div>
        )}
        {items && items.length === 0 && (
          <EmptyState title="Nothing submitted yet" body="When you send an enquiry, partnership application or support request while signed in, it will appear here." action={<Link to="/contact" className="rounded-full bg-lime px-5 py-2.5 font-semibold text-ink">Start an enquiry</Link>} />
        )}
        {items && items.length > 0 && (
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {items.map((i) => (
              <li key={`${i.kind}-${i.id}`} className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="mt-1 text-xs text-mute">
                    <Badge>{i.kind}</Badge>{' '}
                    {i.createdAt ? i.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Submitting…'}
                    {' · Ref '}<span className="font-mono">{i.id.slice(0, 8)}</span>
                  </p>
                </div>
                <RecordStatusBadge status={i.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
