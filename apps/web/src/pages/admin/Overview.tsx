import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { countByStatus } from '@/services/admin';
import { toUserMessage } from '@/lib/errors';
import { Alert, Card, Skeleton } from '@/components/ui';
import { recordStatusLabel } from '@/content/labels';
import { ENQUIRY_STATUSES, type EnquiryStatus } from '@/schemas/forms';
import type { RecordCollection } from '@/services/records';

const sources: Array<{ col: RecordCollection; label: string; to: string }> = [
  { col: 'enquiries', label: 'Enquiries', to: '/admin/enquiries' },
  { col: 'partnerships', label: 'Partnerships', to: '/admin/partnerships' },
  { col: 'supportTickets', label: 'Support requests', to: '/admin/support' },
];

type Counts = Record<EnquiryStatus, number>;

export default function Overview() {
  const [data, setData] = useState<Record<string, Counts> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all(sources.map(async (s) => [s.col, await countByStatus(s.col)] as const))
      .then((entries) => active && setData(Object.fromEntries(entries)))
      .catch((err) => active && setError(toUserMessage(err)));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-2 text-sm text-mute">Counts are read live from Firestore. Zero means no records in that state yet.</p>
      </div>
      {error && <Alert tone="error" title="Could not load counts">{error}</Alert>}
      <div className="grid gap-6 md:grid-cols-3">
        {sources.map((s) => {
          const counts = data?.[s.col];
          const total = counts ? ENQUIRY_STATUSES.reduce((n, st) => n + counts[st], 0) : null;
          return (
            <Card key={s.col}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">{s.label}</h2>
                <Link to={s.to} className="text-xs text-lime hover:underline">Open</Link>
              </div>
              {total === null ? (
                <Skeleton className="mt-6 h-10 w-24" />
              ) : (
                <>
                  <p className="mt-4 font-display text-4xl font-extrabold">{total}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {ENQUIRY_STATUSES.map((st) => (
                      <div key={st} className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                        <dt className="text-mute">{recordStatusLabel(st)}</dt>
                        <dd className="font-mono">{counts?.[st]}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
