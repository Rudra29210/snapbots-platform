import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navLinks, company } from '@/content/site';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition duration-300',
        scrolled ? 'border-b border-white/10 bg-ink/85 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="container-x flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight" aria-label="SNAPBOTS home">
          SNAP<span className="text-lime">BOTS</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn('text-sm text-paper/70 transition hover:text-paper', isActive && 'text-lime')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="text-sm text-paper/70 hover:text-lime">Admin</Link>}
              <Link to="/dashboard" className="text-sm text-paper/70 hover:text-lime">Dashboard</Link>
            </>
          ) : (
            <Link to="/login" className="text-sm text-paper/70 hover:text-lime">Sign in</Link>
          )}
          <Link to="/contact" className="inline-flex items-center rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition hover:bg-lime-400">
            Start a project
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-paper lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-ink-900 lg:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn('rounded-lg px-3 py-3 text-base text-paper/80 hover:bg-white/5', isActive && 'text-lime')
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="rounded-lg px-3 py-3 text-paper/80 hover:bg-white/5">Dashboard</Link>
                  {isAdmin && <Link to="/admin" className="rounded-lg px-3 py-3 text-paper/80 hover:bg-white/5">Admin</Link>}
                </>
              ) : (
                <Link to="/login" className="rounded-lg px-3 py-3 text-paper/80 hover:bg-white/5">Sign in</Link>
              )}
              <Link to="/contact" className="mt-1 rounded-full bg-lime px-5 py-3 text-center font-semibold text-ink">
                Start a project
              </Link>
              <span className="px-3 pt-2 text-xs text-mute">{company.email}</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
