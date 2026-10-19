import { Seo } from '@/components/layout/Seo';
import { PageHero, Section } from '@/components/sections';
import { SupportForm } from '@/components/forms/SupportForm';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Support() {
  const { user } = useAuth();
  return (
    <>
      <Seo path="/support" title="Customer support" description="Submit a support request for an order, product, account or warranty question." />
      <PageHero eyebrow="Support" title="We are here to help." lead="Describe the issue and include an order reference if you have one. We aim to reply within two working days." />
      <Section>
        <div className="glass mx-auto max-w-3xl rounded-3xl p-6 md:p-10">
          {!user && (
            <p className="mb-8 rounded-xl border border-white/10 p-4 text-sm text-paper/70">
              You can send a request without an account. <Link className="text-lime hover:underline" to="/login">Sign in</Link> to track your requests in your dashboard.
            </p>
          )}
          <SupportForm />
        </div>
      </Section>
    </>
  );
}
