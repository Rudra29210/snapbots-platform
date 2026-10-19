import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Alert, EmptyState, Field, Select, Skeleton, Textarea } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { RecordStatusBadge } from '@/components/sections';
import { recordStatusLabel } from '@/content/labels';
import { adminEnquiryUpdateSchema, ENQUIRY_STATUSES, type EnquiryStatus } from '@/schemas/forms';
import { listRecords, updateRecordStatus } from '@/services/admin';
import { toUserMessage } from '@/lib/errors';
import type { RecordCollection } from '@/services/records';

export interface AdminRecord {
  id: string;
  status: EnquiryStatus;
  createdAt: { toDate: () => Date } | null;
  internalNote?: string;
  [key: string]: unknown;
}

type Props = {
  col: RecordCollection;
  title: string;
  describe: (r: AdminRecord) => { heading: string; lines: Array<[string, string]> };
};

type Form = z.input<typeof adminEnquiryUpdateSchema>;

export function RecordsPage({ col, title, describe }: Props) {
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('all');
  const [rows, setRows] = useState<AdminRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<{ id: string; values: Form } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setRows(null);
    try {
      setRows(await listRecords<AdminRecord>(col, { status: filter }));
    } catch (err) {
      setError(toUserMessage(err));
    }
  }, [col, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = rows?.find((r) => r.id === selected) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-mute">Newest first. Showing up to 25 records per page.</p>
        </div>
        <div className="sm:w-56">
          <label htmlFor={`${col}-filter`} className="mb-1.5 block text-sm text-paper/80">Status</label>
          <Select id={`${col}-filter`} value={filter} onChange={(e) => setFilter(e.target.value as EnquiryStatus | 'all')}>
            <option value="all">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{recordStatusLabel(s)}</option>)}
          </Select>
        </div>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error" title="Could not load records">{error}<div className="mt-3"><Button variant="secondary" onClick={() => void load()}>Try again</Button></div></Alert>}

      {!error && rows === null && <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>}

      {rows && rows.length === 0 && (
        <EmptyState title="No records here" body={filter === 'all' ? 'Nothing has been submitted yet.' : 'No records have this status.'} />
      )}

      {rows && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => {
            const d = describe(r);
            const open = selected === r.id;
            return (
              <article key={r.id} className="glass rounded-2xl">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`rec-${r.id}`}
                  onClick={() => setSelected(open ? null : r.id)}
                  className="flex w-full flex-col gap-2 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{d.heading}</span>
                    <span className="mt-1 block font-mono text-xs text-mute">
                      {r.createdAt?.toDate().toLocaleString('en-GB') ?? 'pending'} · {r.id.slice(0, 8)}
                    </span>
                  </span>
                  <RecordStatusBadge status={r.status} />
                </button>
                {open && current && (
                  <div id={`rec-${r.id}`} className="border-t border-white/10 px-5 py-5">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      {d.lines.map(([k, v]) => (
                        <div key={k} className={k === 'Message' || k === 'Description' || k === 'Proposal' ? 'sm:col-span-2' : ''}>
                          <dt className="text-xs uppercase tracking-wider text-mute">{k}</dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-paper/85">{v || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                    <StatusEditor
                      key={`${r.id}-${r.status}`}
                      record={current}
                      onRequest={(values) => {
                        if (values.status === 'closed' && r.status !== 'closed') setPending({ id: r.id, values });
                        else void save(r.id, values);
                      }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Close this record?"
        body="Closed records are hidden from the default view. The change and time are recorded in the audit log."
        confirmLabel="Close record"
        tone="danger"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && void save(pending.id, pending.values, () => setPending(null))}
      />
    </div>
  );

  async function save(id: string, values: Form, after?: () => void) {
    setBusy(true);
    setNotice(null);
    try {
      await updateRecordStatus(col, id, { status: values.status, internalNote: values.internalNote ?? '' });
      after?.();
      setNotice('Record updated.');
      await load();
    } catch (err) {
      setError(toUserMessage(err));
      after?.();
    } finally {
      setBusy(false);
    }
  }
}

function StatusEditor({ record, onRequest }: { record: AdminRecord; onRequest: (v: Form) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form, unknown, z.output<typeof adminEnquiryUpdateSchema>>({
    resolver: zodResolver(adminEnquiryUpdateSchema),
    defaultValues: { status: record.status, internalNote: record.internalNote ?? '' },
  });
  return (
    <form noValidate onSubmit={handleSubmit(onRequest)} className="mt-6 grid gap-5 md:grid-cols-[220px_1fr]" aria-label="Update record">
      <Field label="Status" error={errors.status?.message}>
        {(p) => (
          <Select {...p} {...register('status')}>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{recordStatusLabel(s)}</option>)}
          </Select>
        )}
      </Field>
      <Field label="Internal note (staff only)" error={errors.internalNote?.message} hint="Never shown to the customer.">
        {(p) => <Textarea {...p} rows={3} {...register('internalNote')} />}
      </Field>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit">Save changes</Button>
        <span className="text-xs text-mute">Status changes are recorded in the audit log.</span>
      </div>
    </form>
  );
}
