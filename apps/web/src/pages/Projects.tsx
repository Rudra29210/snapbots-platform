import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { projects } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { EmptyState, Button, Card, Input } from '@/components/ui';
import { PageHero, Reveal, Section, StatusBadge } from '@/components/sections';

export default function Projects() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => !q || `${p.title} ${p.summary} ${p.tags.join(' ')}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <Seo path="/projects" title="Projects" description="Selected SNAPBOTS projects and prototypes, labelled by status." />
      <PageHero eyebrow="Portfolio" title="Projects and prototypes" lead="Each project is labelled by its real status. Demonstration entries are illustrative until verified records are published." />
      <Section>
        <div className="relative mb-10 max-w-md">
          <label htmlFor="project-search" className="sr-only">Search projects</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" aria-hidden="true" />
          <Input id="project-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or tag" className="pl-11" />
        </div>
        {results.length === 0 ? (
          <EmptyState title="No projects found" body="Try another keyword such as robotics, IoT or AI." action={<Button variant="secondary" onClick={() => setQuery('')}>Show all projects</Button>} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04}>
                <Link to={`/projects/${p.id}`} className="block h-full">
                  <Card className="flex h-full flex-col hover:-translate-y-1">
                    <StatusBadge status={p.status} />
                    <h2 className="mt-4 text-xl font-bold">{p.title}</h2>
                    <p className="mt-2 flex-1 text-sm text-paper/65">{p.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                      {p.tags.map((t) => <li key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-paper/70">{t}</li>)}
                    </ul>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
