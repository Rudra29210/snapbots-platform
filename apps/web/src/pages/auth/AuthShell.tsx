import type { ReactNode } from 'react';
import { Seo } from '@/components/layout/Seo';
import { PageHero } from '@/components/sections';

export function AuthShell({ title, lead, children, seoPath }: { title: string; lead?: string; children: ReactNode; seoPath: string }) {
  return (
    <>
      <Seo path={seoPath} title={title} description="SNAPBOTS account." />
      <PageHero eyebrow="Account" title={title} lead={lead} />
      <section className="container-x pb-24">
        <div className="glass mx-auto max-w-lg rounded-3xl p-6 md:p-10">{children}</div>
      </section>
    </>
  );
}
