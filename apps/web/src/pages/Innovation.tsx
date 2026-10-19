import { innovation } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { CtaBand, PageHero, Reveal, Section, StatusBadge } from '@/components/sections';
import { Card, Alert } from '@/components/ui';

export default function Innovation() {
  return (
    <>
      <Seo path="/innovation" title="Innovation & AI" description="Research prototypes and AI applications from SNAPBOTS, with honest maturity notes." />
      <PageHero eyebrow="Innovation & AI" title="Research, prototypes and applied AI." lead="Each initiative below states its maturity. Nothing here is a finished public product unless marked as available." />
      <Section>
        <Alert tone="warning" title="Maturity notice">
          Features listed as planned or in progress are goals, not capabilities. Performance claims will be published only after structured testing.
        </Alert>
        <div className="mt-10 space-y-6">
          {innovation.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <Card className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-10">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">{item.name}</h2>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-4 text-paper/70">{item.purpose}</p>
                  <p className="mt-4 text-sm text-mute">Maturity: {item.maturity}</p>
                </div>
                <ul className="mt-6 space-y-3 md:mt-0">
                  {item.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-paper/80">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBand title="Interested in early access or research collaboration?" body="Tell us what you would use it for. Early-access places, if any, will be offered directly." label="Get in touch" />
    </>
  );
}
