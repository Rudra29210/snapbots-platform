import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ExternalLink,
  UserRound,
} from 'lucide-react';
import { getFirebase } from '@/lib/firebase';
import CommunityEngagement from '@/components/community/CommunityEngagement';

type CommunityProject = {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  technologies?: string[];
  creatorName?: string;
  authorId?: string;
  imageData?: string;
  sourceUrl?: string;
  demoUrl?: string;
  status?: string;
  createdAt?: { toDate?: () => Date } | Date | string;
};

function formatDate(value: CommunityProject['createdAt']) {
  if (!value) return '';

  try {
    const date =
      value instanceof Date
        ? value
        : typeof value === 'string'
          ? new Date(value)
          : value.toDate?.();

    if (!date || Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function safeExternalUrl(value?: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export default function CommunityProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const firebase = getFirebase();

  const [project, setProject] = useState<CommunityProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebase || !id) {
      setProject(null);
      setError('This project could not be found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setProject(null);

    const unsubscribe = onSnapshot(
      doc(firebase.db, 'projects', id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setProject(null);
          setError('This project does not exist or is no longer available.');
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Omit<CommunityProject, 'id'>;

        if (data.status !== 'published') {
          setProject(null);
          setError('This project is not publicly available.');
          setLoading(false);
          return;
        }

        setProject({ id: snapshot.id, ...data });
        setError('');
        setLoading(false);
      },
      (err) => {
        console.error('Project detail error:', err);
        setProject(null);
        setError('Unable to load this project. Please try again later.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [firebase, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <div className="container-x mx-auto max-w-5xl py-12 sm:py-16">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-white/10" />
            <div className="mt-10 h-10 max-w-2xl rounded bg-white/10" />
            <div className="mt-5 h-5 max-w-xl rounded bg-white/10" />
            <div className="mt-8 aspect-video rounded-2xl bg-white/[0.05]" />
            <div className="mt-8 h-28 rounded-2xl bg-white/[0.04]" />
          </div>
          <p className="mt-5 text-sm text-paper/50">
            Loading community project…
          </p>
        </div>
      </main>
    );
  }

  if (!project || error) {
    return (
      <main className="min-h-screen bg-ink px-5 py-16 text-paper sm:py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center sm:p-10">
          <Code2 size={36} strokeWidth={1.5} className="mx-auto text-lime" />
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Project unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-paper/60">
            {error || 'This project is not available.'}
          </p>
          <Link
            to="/community"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Back to community
          </Link>
        </div>
      </main>
    );
  }

  const sourceUrl = safeExternalUrl(project.sourceUrl);
  const demoUrl = safeExternalUrl(project.demoUrl);
  const publishedDate = formatDate(project.createdAt);

  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="container-x mx-auto max-w-5xl py-10 sm:py-14">
        <Link
          to="/community"
          className="group inline-flex items-center gap-2 text-sm text-paper/60 transition hover:text-lime"
        >
          <ArrowLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to community
        </Link>

        <header className="mt-8 sm:mt-10">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-paper/75">
            {project.category || 'Community project'}
          </span>

          <h1 className="mt-5 max-w-4xl font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
            {project.title || 'Untitled project'}
          </h1>

          {project.summary && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-paper/65 sm:text-lg sm:leading-8">
              {project.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-paper/50">
            <span className="inline-flex items-center gap-2">
              <UserRound size={16} className="text-lime" />
              {project.creatorName || 'Community creator'}
            </span>
            {publishedDate && <span>{publishedDate}</span>}
          </div>
        </header>

        {project.imageData ? (
          <div className="mt-9 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <img
              src={project.imageData}
              alt={project.title || 'Project image'}
              className="max-h-[620px] w-full object-contain"
              loading="eager"
            />
          </div>
        ) : (
          <div className="mt-9 flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
            <Code2 size={56} strokeWidth={1.2} className="text-paper/25" />
          </div>
        )}

        <div className="mt-9 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              About this project
            </h2>
            <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-paper/70 sm:text-base sm:leading-8">
              {project.description ||
                project.summary ||
                'No detailed description has been provided.'}
            </div>

            {!!project.technologies?.length && (
              <section className="mt-9">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Technologies used
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((technology, index) => (
                    <span
                      key={`${technology}-${index}`}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-paper/75"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-paper/45">
              Community project
            </p>
            <h2 className="mt-3 font-display text-lg font-semibold tracking-tight">
              Explore the project
            </h2>
            <p className="mt-2 text-sm leading-6 text-paper/55">
              Visit the source code or open a live demo, if provided by the creator.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm font-medium transition hover:border-lime/50 hover:text-lime"
                >
                  <Code2 size={17} />
                  View source code
                  <ExternalLink size={14} />
                </a>
              )}

              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-4 py-3 text-sm font-semibold text-ink transition hover:opacity-90"
                >
                  Live demo
                  <ArrowUpRight size={17} />
                </a>
              )}

              {!sourceUrl && !demoUrl && (
                <p className="rounded-xl border border-white/10 p-3 text-sm leading-6 text-paper/50">
                  No external links have been added.
                </p>
              )}
            </div>
          </aside>
        </div>

        <CommunityEngagement
          projectId={project.id}
          projectAuthorId={project.authorId}
        />

        <div className="mt-12 border-t border-white/10 pt-6 sm:mt-16">
          <Link
            to="/community"
            className="group inline-flex items-center gap-2 text-sm font-medium text-paper/65 transition hover:text-lime"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Explore more community projects
          </Link>
        </div>
      </div>
    </main>
  );
}