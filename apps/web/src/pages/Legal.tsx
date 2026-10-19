import { company } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { PageHero, Section } from '@/components/sections';

const updated = 'Draft: not yet reviewed by a lawyer. Replace before launch.';

export function Privacy() {
  return (
    <>
      <Seo path="/privacy" title="Privacy policy" description="How SNAPBOTS collects, uses and retains personal information." />
      <PageHero eyebrow="Legal" title="Privacy policy" lead={updated} />
      <Section>
        <article className="prose-invert max-w-3xl space-y-6 text-paper/75 leading-relaxed">
          <h2 className="text-2xl font-bold text-paper">What we collect</h2>
          <p>When you send an enquiry, partnership application or support request we store the details you provide: name, email, and the message content, plus optional phone number, company and order reference. If you create an account we store your display name and email address, and Firebase Authentication stores your credentials. We do not store passwords in our database.</p>
          <h2 className="text-2xl font-bold text-paper">Why we use it</h2>
          <p>To answer your request, to manage your account, and to keep the service secure against spam and abuse.</p>
          <h2 className="text-2xl font-bold text-paper">Retention</h2>
          <p>Enquiries and support requests are kept while they are being handled and then reviewed for deletion. The exact retention period is to be confirmed by the business before launch.</p>
          <h2 className="text-2xl font-bold text-paper">Your rights</h2>
          <p>You can ask us to see, correct or delete the personal information we hold about you. Email <a className="text-lime hover:underline" href={`mailto:${company.email}`}>{company.email}</a>. Account self-deletion is not yet automated; requests are handled manually.</p>
          <h2 className="text-2xl font-bold text-paper">Service providers</h2>
          <p>We use Google Firebase for authentication, database, storage, hosting and functions. Their terms apply to the infrastructure they operate.</p>
        </article>
      </Section>
    </>
  );
}

export function Terms() {
  return (
    <>
      <Seo path="/terms" title="Terms of use" description="Terms for using the SNAPBOTS website and enquiry services." />
      <PageHero eyebrow="Legal" title="Terms of use" lead={updated} />
      <Section>
        <article className="max-w-3xl space-y-6 text-paper/75 leading-relaxed">
          <h2 className="text-2xl font-bold text-paper">Information on this site</h2>
          <p>Product, project and innovation content describes current status and may change. Items marked as demonstration, planned or in development are not offers to sell.</p>
          <h2 className="text-2xl font-bold text-paper">Enquiries</h2>
          <p>Submitting an enquiry does not create a contract. Any engagement, sale or partnership is agreed separately in writing.</p>
          <h2 className="text-2xl font-bold text-paper">Acceptable use</h2>
          <p>Do not attempt to access other people's data, interfere with the service, or submit content that is unlawful, abusive or misleading.</p>
          <h2 className="text-2xl font-bold text-paper">Liability</h2>
          <p>The site is provided as is. To the extent permitted by law, SNAPBOTS is not liable for indirect losses arising from use of the site. Final wording to be reviewed before launch.</p>
        </article>
      </Section>
    </>
  );
}
