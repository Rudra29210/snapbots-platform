import { NavLink, Outlet } from 'react-router-dom';
import { Seo } from '@/components/layout/Seo';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/partnerships', label: 'Partnerships' },
  { to: '/admin/support', label: 'Support' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/roles', label: 'Roles' },
];

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <>
      <Seo
        path="/admin"
        title="Admin"
        description="SNAPBOTS administration."
      />

      <div className="container-x grid gap-6 py-6 sm:gap-8 sm:py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Admin sidebar */}
        <aside
          aria-label="Admin navigation"
          className="min-w-0 lg:sticky lg:top-24 lg:h-fit"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B111B] text-white shadow-xl shadow-black/5">
            {/* Sidebar header */}
            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F58220] text-lg font-black text-white shadow-lg shadow-orange-500/20">
                  S
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold tracking-wide text-white">
                    SNAPBOTS
                  </p>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Admin Console
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-3 sm:p-4">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Workspace
              </p>

              <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {adminLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-[#F58220] text-white shadow-md shadow-orange-500/15'
                          : 'text-white/65 hover:bg-white/[0.07] hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                            isActive
                              ? 'bg-white'
                              : 'bg-white/25 group-hover:bg-[#F58220]',
                          )}
                        />

                        <span>{link.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Account information */}
            <div className="border-t border-white/10 p-4">
              <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Account
              </p>

              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.05] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F58220]/30 bg-[#F58220]/15 text-sm font-bold text-[#F58220]">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    Signed in
                  </p>

                  <p className="mt-1 break-all text-[10px] leading-relaxed text-white/50">
                    {user?.email || 'Administrator'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 hidden px-2 text-[11px] leading-relaxed text-mute lg:block">
            Manage enquiries, partnerships, products, support, and administrative
            access.
          </p>
        </aside>

        {/* Admin page content */}
        <main className="min-w-0">
          <div className="min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}