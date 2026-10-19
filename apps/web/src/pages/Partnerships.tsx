import { company, partnershipIntro } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { PageHero, Section } from '@/components/sections';
import { PartnershipForm } from '@/components/forms/PartnershipForm';

export default function Partnerships() {
  return (
    <>
      <Seo path="/partnerships" title="Partnerships" description="Sponsorship, institutional, research and distribution partnerships with SNAPBOTS." />
      <PageHero eyebrow="Partnerships" title="Build with SNAPBOTS." lead={partnershipIntro} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-6 text-paper/70">
            <h2 className="text-2xl font-bold text-paper">Who we work with</h2>
            <p>Sponsors who want to support hands-on engineering education.</p>
            <p>Schools, colleges and training institutions running robotics or embedded programmes.</p>
            <p>Research and product collaborators exploring applied AI on real hardware.</p>
            <p>Distributors and resellers once product availability is confirmed.</p>
            <p className="text-sm text-mute">
              We do not list partner logos or endorsements until agreements are signed. Prefer email? Write to{' '}
              <a className="text-lime hover:underline" href={`mailto:${company.email}`}>{company.email}</a>.
            </p>
          </div>
          <div className="glass rounded-3xl p-6 md:p-10">
            <PartnershipForm />
          </div>
        </div>
      </Section>
    </>
  );
}
