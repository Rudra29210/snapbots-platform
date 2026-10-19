import { Link, useParams } from 'react-router-dom';
import { projects } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { Section, StatusBadge, CtaBand, PageHero } from '@/components/sections';
import NotFound from './errors';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);
  if (!project) return <NotFound />;
  return (
    <>
      <Seo path={`/projects/${project.id}`} title={project.title} description={project.summary} />
      <PageHero eyebrow="Project" title={project.title} lead={project.summary}>
        <StatusBadge status={project.status} />
      </PageHero>
      <Section>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">Details</h2>
            <p className="mt-4 leading-relaxed text-paper/75">{project.details}</p>
          </div>
          <aside aria-label="Project tags" className="glass h-fit rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-mute">Tags</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((t) => <li key={t} className="rounded-full bg-white/5 px-3 py-1 text-sm">{t}</li>)}
            </ul>
            <Link to={`/contact?category=robotics_project&subject=${encodeURIComponent(`Similar to: ${project.title}`)}`} className="mt-6 block rounded-full bg-lime px-5 py-3 text-center font-semibold text-ink">
              Discuss a similar project
            </Link>
            <Link to="/projects" className="mt-3 block text-center text-sm text-lime hover:underline">Back to all projects</Link>
          </aside>
        </div>
      </Section>
      <CtaBand title="Build something similar?" body="Share your requirements and we will say honestly whether and how we can help." />
    </>
  );
}
