import { Link } from 'react-router-dom';
import { Seo } from '@/components/layout/Seo';
import { company } from '@/content/site';

function Shell({ code, title, children }: { code: string; title: string; children: React.ReactNode }) {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">{code}</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">{title}</h1>
      <div className="mt-6 max-w-xl text-paper/70">{children}</div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/" className="rounded-full bg-lime px-6 py-3 font-semibold text-ink">Back to home</Link>
        <Link to="/contact" className="rounded-full border border-white/15 px-6 py-3 font-semibold hover:border-lime hover:text-lime">Contact us</Link>
      </div>
    </section>
  );
}

/** Default export is the 404 page, used by unknown routes and missing records. */
export default function NotFound() {
  return (
    <>
      <Seo path="/404" title="Page not found" description="The page you are looking for does not exist." />
      <Shell code="404" title="This page does not exist.">
        The link may be out of date or the page may have moved. Try the navigation above or return to the home page.
      </Shell>
    </>
  );
}

export function AccessDenied({ reason }: { reason: 'forbidden' | 'unconfigured' }) {
  return (
    <>
      <Seo path="/access-denied" title="Access denied" description="You do not have access to this area." />
      <Shell code="403" title={reason === 'forbidden' ? 'Access denied' : 'Accounts are not available'}>
        {reason === 'forbidden'
          ? 'Your account does not have permission to view this area. If you believe this is a mistake, contact the SNAPBOTS team.'
          : `Account features are not connected in this environment. Public pages still work. Contact ${company.email} for help.`}
      </Shell>
    </>
  );
}

export function ServiceError() {
  return (
    <>
      <Seo path="/error" title="Something went wrong" description="A temporary error occurred." />
      <Shell code="500" title="Something went wrong on our side.">
        Please refresh the page. If the problem continues, email {company.email} and tell us what you were doing.
      </Shell>
    </>
  );
}
