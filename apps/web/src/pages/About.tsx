import { company } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { CtaBand, PageHero, Reveal, Section } from '@/components/sections';
import { Card } from '@/components/ui';

const milestones = [
  { title: 'Foundation', body: 'SNAPBOTS begins with robotics components and custom robot projects.' },
  { title: 'Expansion', body: 'Work broadens into embedded systems, IoT and applied AI prototypes.' },
  { title: 'Ecosystem', body: 'Products, education, research and partnerships are being developed alongside services.' },
];

export default function About() {
  return (
    <>
      <Seo path="/about" title="About" description="The mission, approach and direction of SNAPBOTS." />
      <PageHero eyebrow="About" title="We make engineering tangible." lead={company.mission} />
      <Section eyebrow="Approach" title="How we work">
        <Reveal><p className="max-w-3xl text-lg leading-relaxed text-paper/75">{company.approach}</p></Reveal>
      </Section>
      <Section eyebrow="Story" title="Where we are going">
        <div className="grid gap-5 md:grid-cols-3">
          {milestones.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.08}>
              <Card className="h-full">
                <p className="font-mono text-xs text-lime">0{i + 1}</p>
                <h3 className="mt-3 text-xl font-bold">{m.title}</h3>
                <p className="mt-3 text-sm text-paper/65">{m.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section eyebrow="Founder" title={company.founder}>
        <Reveal>
          <p className="max-w-3xl text-paper/75">
            {company.founder} leads SNAPBOTS and is the primary contact for engineering, partnerships and learning initiatives.
            A team profile will be added here once team members agree to be listed.
          </p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <a className="text-lime hover:underline" href={company.founderInstagram} target="_blank" rel="noopener noreferrer">Founder on Instagram</a>
            <a className="text-lime hover:underline" href={company.instagram} target="_blank" rel="noopener noreferrer">SNAPBOTS on Instagram</a>
            <a className="text-lime hover:underline" href={`mailto:${company.email}`}>{company.email}</a>
          </div>
        </Reveal>
      </Section>
      <CtaBand title="Want to work together?" body="Whether it is a project, a partnership or a question, we read every message." />
    </>
  );
}
