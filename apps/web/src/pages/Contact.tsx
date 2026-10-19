import { useSearchParams } from 'react-router-dom';
import { Mail, Instagram, MapPin } from 'lucide-react';
import { company } from '@/content/site';
import { ENQUIRY_CATEGORIES, type EnquiryCategory } from '@/schemas/forms';
import { Seo } from '@/components/layout/Seo';
import { PageHero, Section } from '@/components/sections';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get('category');
  const category = (ENQUIRY_CATEGORIES.find((c) => c.value === requested)?.value ?? 'general') as EnquiryCategory;
  const subject = (params.get('subject') ?? '').slice(0, 120);

  return (
    <>
      <Seo path="/contact" title="Contact" description="Contact SNAPBOTS about projects, products, services, learning and partnerships." />
      <PageHero eyebrow="Contact" title="Tell us what you are building." lead="Choose the category that fits best. Every enquiry is read by a person." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <aside className="space-y-8" aria-label="Contact details">
            <div className="flex gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
              <div>
                <p className="font-semibold">Email</p>
                <a className="text-paper/70 hover:text-lime" href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </div>
            <div className="flex gap-4">
              <Instagram className="mt-1 h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
              <div>
                <p className="font-semibold">Instagram</p>
                <a className="text-paper/70 hover:text-lime" href={company.instagram} target="_blank" rel="noopener noreferrer">@snap.bots</a>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
              <div>
                <p className="font-semibold">Based in</p>
                <p className="text-paper/70">{company.location}</p>
              </div>
            </div>
            <p className="text-sm text-mute">For order or account problems, use the <a className="text-lime hover:underline" href="/support">support form</a>.</p>
          </aside>
          <div className="glass rounded-3xl p-6 md:p-10">
            <EnquiryFormWithDefaults category={category} subject={subject} />
          </div>
        </div>
      </Section>
    </>
  );
}

// Keyed so changing the URL parameters resets the form to the new defaults.
function EnquiryFormWithDefaults({ category, subject }: { category: EnquiryCategory; subject: string }) {
  return <EnquiryForm key={`${category}|${subject}`} defaultCategory={category} defaultSubject={subject} />;
}
