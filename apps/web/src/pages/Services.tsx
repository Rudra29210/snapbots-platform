import { Link } from 'react-router-dom';
import { services } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { CtaBand, PageHero, Reveal, Section } from '@/components/sections';
import { Card } from '@/components/ui';

export default function Services() {
  return (
    <>
      <Seo path="/services" title="Services" description="Robotics, embedded systems, IoT, AI applications, custom engineering and prototyping." />
      <PageHero eyebrow="Services" title="Engineering services, scoped and documented." lead="Every engagement begins with a conversation about the goal, constraints and what success looks like." />
      <Section>
        <div className="space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.03}>
              <Card id={s.id} className="scroll-mt-28 md:grid md:grid-cols-[1fr_1.4fr] md:gap-10">
                <div>
                  <p className="font-mono text-xs text-lime">0{i + 1}</p>
                  <h2 className="mt-2 text-2xl font-bold">{s.title}</h2>
                  <p className="mt-3 text-paper/65">{s.summary}</p>
                </div>
                <ul className="mt-6 space-y-3 md:mt-0">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-paper/80">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-sm text-mute">
          Not sure which service fits? <Link className="text-lime hover:underline" to="/contact">Describe your problem</Link> and we will point you to the right starting point.
        </p>
      </Section>
      <CtaBand title="Ready to scope a project?" body="Send us the brief. We will respond with questions, a feasibility view and next steps." label="Request a scope" />
    </>
  );
}
