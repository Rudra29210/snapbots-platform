import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { getFirebase } from '@/lib/firebase';

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

const CATEGORIES = [
  'All',
  'AI/ML',
  'Robotics',
  'IoT',
  'Software',
  'Electronics',
  'Environment',
  'Other',
];

function formatDate(value: CommunityProject['createdAt']) {
  if (!value) return '';

  try {
    const date =
      typeof value === 'string'
        ? new Date(value)
        : value instanceof Date
          ? value
          : value.toDate?.();

    if (!date || Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function CommunityGallery() {
  const firebase = getFirebase();

  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebase) {
      setError('Firebase is not configured. Please try again later.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const projectsQuery = query(
      collection(firebase.db, 'projects'),
      where('status', '==', 'published'),
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as CommunityProject[];

        items.sort((a, b) => {
          const getTime = (value: CommunityProject['createdAt']) => {
            if (!value) return 0;
            if (value instanceof Date) return value.getTime();
            if (typeof value === 'string') {
              return new Date(value).getTime() || 0;
            }
            return value.toDate?.().getTime() ?? 0;
          };

          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        setProjects(items);
        setLoading(false);
      },
      (err) => {
        console.error('Community gallery error:', err);
        setError(
          'Unable to load community projects. Check your connection and Firestore rules.',
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [firebase]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        category === 'All' ||
        (project.category ?? '').toLowerCase() === category.toLowerCase();

      const searchableText = [
        project.title,
        project.summary,
        project.description,
        project.creatorName,
        project.category,
        ...(project.technologies ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!term || searchableText.includes(term));
    });
  }, [projects, search, category]);

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Community hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(163,230,53,0.12), transparent 65%)',
          }}
        />

        <div className="container-x py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
              <Sparkles size={14} aria-hidden="true" />
              The Snapbots community
            </div>

            <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
              Built by creators.
              <br />
              <span className="text-lime">Driven by ideas.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-paper/65 sm:text-lg sm:leading-8">
              Discover projects from makers, developers, robotics enthusiasts,
              and innovators. Explore how others turn ideas into working
              creations—and share something you have built.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/community/submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition hover:bg-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Share your project
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>

              <div className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-paper/70">
                <Users size={17} className="text-lime" aria-hidden="true" />
                A community for builders
              </div>
            </div>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                {loading ? '—' : projects.length}
              </p>
              <p className="mt-1 text-xs text-paper/50 sm:text-sm">
                Published projects
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                {CATEGORIES.length - 1}
              </p>
              <p className="mt-1 text-xs text-paper/50 sm:text-sm">
                Project categories
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:col-span-1 sm:p-5">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                Build.
              </p>
              <p className="mt-1 text-xs text-paper/50 sm:text-sm">
                Share what you create
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project discovery */}
      <section className="container-x py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              Explore the work
            </p>

            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Community projects
            </h2>

            <p className="mt-2 text-sm leading-6 text-paper/55">
              {loading
                ? 'Loading published projects…'
                : `${filteredProjects.length} ${
                    filteredProjects.length === 1 ? 'project' : 'projects'
                  } found`}
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-paper/35"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, creators, technologies..."
              aria-label="Search community projects"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] py-3.5 pl-11 pr-11 text-sm text-paper outline-none transition placeholder:text-paper/35 hover:border-white/20 focus:border-lime/60 focus:ring-2 focus:ring-lime/10"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-paper/50 transition hover:bg-white/5 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter projects by category"
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                category === item
                  ? 'border-lime bg-lime text-ink'
                  : 'border-white/10 bg-white/[0.025] text-paper/60 hover:border-white/25 hover:text-paper'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/25 bg-red-400/5 p-5"
          >
            <h3 className="font-semibold text-red-300">
              We couldn’t load the gallery
            </h3>
            <p className="mt-2 text-sm leading-6 text-paper/65">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:text-lime-400"
            >
              Try again
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading community projects"
            aria-busy="true"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
              >
                <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project cards */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const projectUrl = `/community/projects/${encodeURIComponent(
                project.id,
              )}`;

              return (
                <article
                  key={project.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-lime/30 hover:bg-white/[0.04]"
                >
                  <Link
                    to={projectUrl}
                    aria-label={`View ${project.title || 'project'}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime"
                  >
                    {project.imageData ? (
                      <img
                        src={project.imageData}
                        alt={project.title || 'Community project'}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Code2
                          size={42}
                          strokeWidth={1.2}
                          aria-hidden="true"
                          className="text-lime/50"
                        />
                      </div>
                    )}

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
                    />

                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/85 px-3 py-1.5 text-xs font-medium text-lime backdrop-blur-md">
                      {project.category || 'Community'}
                    </span>

                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="truncate text-xs text-paper/45">
                        By {project.creatorName || 'Community creator'}
                      </span>

                      <span className="shrink-0 text-xs text-paper/40">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>

                    <Link
                      to={projectUrl}
                      className="rounded-sm text-lg font-semibold leading-snug tracking-tight transition hover:text-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                    >
                      {project.title || 'Untitled project'}
                    </Link>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-paper/60">
                      {project.summary ||
                        project.description ||
                        'Explore this community creation.'}
                    </p>

                    {!!project.technologies?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech, index) => (
                          <span
                            key={`${tech}-${index}`}
                            className="rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs text-paper/55"
                          >
                            {tech}
                          </span>
                        ))}

                        {project.technologies.length > 4 && (
                          <span className="px-1 py-1 text-xs text-paper/40">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4 mt-5">
                      <span className="text-xs text-paper/40">
                        Snapbots Community
                      </span>

                      <Link
                        to={projectUrl}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime transition hover:gap-2.5 hover:text-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                      >
                        Explore project
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
              <Search
                size={23}
                aria-hidden="true"
                className="text-paper/45"
              />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight">
              {projects.length === 0
                ? 'The gallery starts with you'
                : 'No matching projects'}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-paper/55">
              {projects.length === 0
                ? 'Published community projects will appear here. Share your work and help inspire the next creator.'
                : 'Try another search term or category to discover more projects.'}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {projects.length === 0 && (
                <Link
                  to="/community/submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  Submit a project
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              )}

              {(search || category !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-paper/70 transition hover:border-white/25 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submission call to action */}
        {!loading && projects.length > 0 && !error && (
          <section className="mt-12 overflow-hidden rounded-2xl border border-lime/20 bg-lime/[0.04] sm:mt-16">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">
                  Your turn to build
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Made something worth sharing?
                </h2>

                <p className="mt-3 text-sm leading-6 text-paper/60 sm:text-base">
                  Submit your project to the community. Once it has been
                  reviewed and published, other makers can discover your work.
                </p>
              </div>

              <Link
                to="/community/submit"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition hover:bg-lime-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:self-center"
              >
                Submit your project
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}