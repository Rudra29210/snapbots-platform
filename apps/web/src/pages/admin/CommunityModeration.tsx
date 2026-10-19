import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Clock3,
  Flag,
} from 'lucide-react';

type Project = {
  id: string;
  title?: string;
  category?: string;
  summary?: string;
  description?: string;
  technologies?: string[];
  creatorName?: string;
  authorEmail?: string;
  authorId?: string;
  sourceUrl?: string;
  demoUrl?: string;
  imageData?: string;
  status?: string;
  createdAt?: { toDate?: () => Date } | null;
};

type CommunityReport = {
  id: string;
  reporterId?: string;
  targetType?: 'project' | 'comment';
  projectId?: string;
  targetId?: string;
  reason?: string;
  status?: 'open' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt?: { toDate?: () => Date } | null;
};

type ReviewStatus = 'published' | 'rejected' | 'changes_requested';

function safeExternalUrl(value?: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function formatDate(value?: { toDate?: () => Date } | null) {
  try {
    return value?.toDate?.().toLocaleString() || 'Recently submitted';
  } catch {
    return 'Recently submitted';
  }
}

export default function CommunityModeration() {
  const firebase = getFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!firebase) {
      setError('Firebase is not configured.');
      setLoading(false);
      return;
    }

    const projectsQuery = query(
      collection(firebase.db, 'projects'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        setProjects(
          snapshot.docs
            .map((item) => ({
              id: item.id,
              ...item.data(),
            }) as Project)
            .filter((item) =>
              ['pending_review', 'changes_requested'].includes(item.status ?? ''),
            ),
        );
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Project moderation load error:', err);
        setError(
          'Could not load submissions. Check your admin access and Firestore rules.',
        );
        setLoading(false);
      },
    );

    const reportsQuery = query(
      collection(firebase.db, 'communityReports'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribeReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        setReports(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }) as CommunityReport),
        );
      },
      (err) => {
        console.error('Report queue load error:', err);
        setError(
          'Could not load reports. Verify admin access and the communityReports rules.',
        );
      },
    );

    return () => {
      unsubscribeProjects();
      unsubscribeReports();
    };
  }, [firebase]);

  async function reviewProject(
    project: Project,
    status: ReviewStatus,
  ) {
    if (!firebase) return;

    if (status !== 'published' && !feedback.trim()) {
      setError('Add feedback before requesting changes or rejecting.');
      return;
    }

    setBusyId(project.id);
    setError('');
    setNotice('');

    try {
      await updateDoc(doc(firebase.db, 'projects', project.id), {
        status,
        reviewFeedback:
          status === 'changes_requested' || status === 'rejected'
            ? feedback.trim()
            : '',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNotice(
        status === 'published'
          ? 'Project approved and published.'
          : status === 'rejected'
            ? 'Project rejected.'
            : 'Changes requested. The creator can update the submission.',
      );
      setSelected(null);
      setFeedback('');
    } catch (err) {
      console.error('Project review error:', err);
      setError('Review failed. Verify your admin permissions and Firestore rules.');
    } finally {
      setBusyId('');
    }
  }

  async function updateReport(
    report: CommunityReport,
    status: NonNullable<CommunityReport['status']>,
  ) {
    if (!firebase) return;

    setBusyId(report.id);
    setError('');
    setNotice('');

    try {
      await updateDoc(doc(firebase.db, 'communityReports', report.id), {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: firebase.auth.currentUser?.uid,
      });

      setNotice(`Report marked as ${status.replace('_', ' ')}.`);
    } catch (err) {
      console.error('Report update error:', err);
      setError(
        'Could not update the report. Check admin permissions and Firestore rules.',
      );
    } finally {
      setBusyId('');
    }
  }

  const openReports = reports.filter((report) => report.status === 'open');

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-500">
            Snapbots Community
          </p>
          <h1 className="mt-2 text-3xl font-bold">Community moderation</h1>
          <p className="mt-2 text-sm text-gray-500">
            Review submissions and investigate community reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border p-3">
            <Clock3 className="text-lime-500" size={20} />
            <span className="font-semibold">
              {projects.length} awaiting review
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border p-3">
            <Flag className="text-red-500" size={20} />
            <span className="font-semibold">
              {openReports.length} open reports
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-xl border border-lime-500/40 p-4 text-sm">
          {notice}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Project submissions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Existing approval, rejection, and change-request workflow.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-12 text-gray-500">
            <RefreshCw className="animate-spin" size={20} />
            Loading submissions…
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-lime-500" size={36} />
            <h3 className="text-xl font-semibold">All caught up</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are no submissions waiting for review.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-2xl border">
                {project.imageData && (
                  <img
                    src={project.imageData}
                    alt=""
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-600">
                      {project.category || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {project.status === 'changes_requested'
                        ? 'Changes requested'
                        : 'Pending review'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold">
                    {project.title || 'Untitled project'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    By {project.creatorName || project.authorEmail || 'Unknown creator'}
                  </p>
                  <p className="line-clamp-3 text-sm">
                    {project.summary || project.description || 'No summary provided.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelected(project);
                      setFeedback('');
                      setError('');
                      setNotice('');
                    }}
                    className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-500/10"
                  >
                    Inspect and review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Community reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Reports of projects and comments submitted by community members.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">
            No reports have been submitted.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border px-2.5 py-1 text-xs font-semibold">
                        {report.targetType || 'Unknown target'}
                      </span>
                      <span className="rounded-full bg-gray-500/10 px-2.5 py-1 text-xs">
                        {report.status || 'Unknown status'}
                      </span>
                    </div>
                    <p className="mt-3 break-words text-sm">
                      {report.reason || 'No reason supplied.'}
                    </p>
                    <p className="mt-2 break-all text-xs text-gray-500">
                      Project: {report.projectId || 'Unknown'} · Target: {report.targetId || 'Unknown'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>

                  {report.status === 'open' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => void updateReport(report, 'reviewed')}
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Mark reviewed
                      </button>
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => void updateReport(report, 'dismissed')}
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => void updateReport(report, 'action_taken')}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Action taken
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="max-h-[92vh] w-full max-w-3xl space-y-5 overflow-y-auto rounded-t-2xl bg-white p-5 text-gray-900 dark:bg-gray-950 dark:text-white sm:rounded-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-lime-600">Submission review</p>
                <h2 id="review-title" className="mt-1 text-2xl font-bold">
                  {selected.title || 'Untitled project'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border px-3 py-2"
              >
                Close
              </button>
            </div>

            {selected.imageData && (
              <img
                src={selected.imageData}
                alt="Project preview"
                className="max-h-80 w-full rounded-xl object-contain"
              />
            )}

            <p className="text-sm text-gray-500">
              Creator: {selected.creatorName || 'Unknown'} · {selected.authorEmail || ''}
            </p>
            <p className="whitespace-pre-wrap">
              {selected.description || selected.summary || 'No description provided.'}
            </p>

            {!!selected.technologies?.length && (
              <p className="text-sm">
                <strong>Technologies:</strong> {selected.technologies.join(', ')}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {safeExternalUrl(selected.sourceUrl) && (
                <a
                  className="inline-flex items-center gap-2 underline"
                  href={safeExternalUrl(selected.sourceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source code <ExternalLink size={15} />
                </a>
              )}
              {safeExternalUrl(selected.demoUrl) && (
                <a
                  className="inline-flex items-center gap-2 underline"
                  href={safeExternalUrl(selected.demoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live demo <ExternalLink size={15} />
                </a>
              )}
            </div>

            <label className="block space-y-2 text-sm font-medium">
              Feedback for the creator (required to request changes or reject)
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Explain what needs improvement or why the submission is rejected."
                className="w-full rounded-xl border bg-transparent p-3 font-normal"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!!busyId}
                onClick={() => void reviewProject(selected, 'published')}
                className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-4 py-3 font-semibold text-black disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                {busyId === selected.id ? 'Saving…' : 'Approve & publish'}
              </button>

              <button
                type="button"
                disabled={!!busyId || !feedback.trim()}
                onClick={() => void reviewProject(selected, 'changes_requested')}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold disabled:opacity-50"
              >
                <MessageSquare size={18} />
                Request changes
              </button>

              <button
                type="button"
                disabled={!!busyId || !feedback.trim()}
                onClick={() => void reviewProject(selected, 'rejected')}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-600 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}