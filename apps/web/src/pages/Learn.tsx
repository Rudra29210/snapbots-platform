import { learning } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { CtaBand, PageHero, Reveal, Section, StatusBadge } from '@/components/sections';
import { Card } from '@/components/ui';

export default function Learn() {
  return (
    <>
      <Seo path="/learn" title="Learn & community" description="Workshops, student projects and maker community from SNAPBOTS." />
      <PageHero eyebrow="Learning & community" title="Learn by building." lead={learning.intro} />
      <Section eyebrow="Initiatives" title="How we plan to help people learn">
        <div className="grid gap-6 md:grid-cols-3">
          {learning.initiatives.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <Card className="h-full">
                <StatusBadge status={item.status} />
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm text-paper/65">{item.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBand title="Want to join a session or bring a group?" body="Send your interest and the group size or level. We will contact you when a session is scheduled." label="Register interest" />
    </>
  );
}
