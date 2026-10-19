import { Link } from 'react-router-dom';
import { company } from '@/content/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-white/10 bg-ink-900">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-extrabold">SNAP<span className="text-lime">BOTS</span></p>
          <p className="mt-3 max-w-sm text-sm text-mute">{company.tagline}</p>
          <p className="mt-4 text-sm text-mute">{company.location}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-sm">
          <Link className="text-paper/70 hover:text-lime" to="/services">Services</Link>
          <Link className="text-paper/70 hover:text-lime" to="/projects">Projects</Link>
          <Link className="text-paper/70 hover:text-lime" to="/partnerships">Partnerships</Link>
          <Link className="text-paper/70 hover:text-lime" to="/faq">FAQ</Link>
          <Link className="text-paper/70 hover:text-lime" to="/support">Support</Link>
          <Link className="text-paper/70 hover:text-lime" to="/contact">Contact</Link>
          <Link className="text-paper/70 hover:text-lime" to="/privacy">Privacy</Link>
          <Link className="text-paper/70 hover:text-lime" to="/terms">Terms</Link>
        </nav>
        <div className="space-y-3 text-sm">
          <a className="block text-paper/70 hover:text-lime" href={`mailto:${company.email}`}>{company.email}</a>
          <a className="block text-paper/70 hover:text-lime" href={company.instagram} target="_blank" rel="noopener noreferrer">
            Instagram @snap.bots
          </a>
          <a className="block text-paper/70 hover:text-lime" href={company.founderInstagram} target="_blank" rel="noopener noreferrer">
            Founder on Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-xs text-mute">© {year} SNAPBOTS. All rights reserved.</p>
      </div>
    </footer>
  );
}
