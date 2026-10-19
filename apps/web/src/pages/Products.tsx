import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Users,
  Cpu,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
import { Seo } from '@/components/layout/Seo';
import { EmptyState, Button, Card, Input, Select } from '@/components/ui';
import { PageHero, Reveal, Section } from '@/components/sections';

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: string;
};

type CommunityProject = {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageData: string;
  creatorName: string;
  status: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [communityProjects, setCommunityProjects] = useState<
    CommunityProject[]
  >([]);
  const [communityLoading, setCommunityLoading] = useState(true);

  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setError('The product catalogue is temporarily unavailable.');
      setLoading(false);
      setCommunityLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(firebase.db, 'products'),
      (snapshot) => {
        const published = snapshot.docs
          .map((item) => {
            const data = item.data();

            return {
              id: item.id,
              name: String(data.name ?? ''),
              sku: String(data.sku ?? ''),
              description: String(data.description ?? ''),
              category: String(data.category ?? 'Other'),
              price: Number(data.price ?? 0),
              stock: Number(data.stock ?? 0),
              imageUrl: String(data.imageUrl ?? ''),
              status: String(data.status ?? 'draft'),
            };
          })
          .filter((product) => product.status === 'published')
          .sort((a, b) => a.name.localeCompare(b.name));

        setProducts(published);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Public product loading failed:', err);
        setError(
          'Products could not be loaded. Check that Firestore rules allow public reading of published products.',
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  // Read existing published community projects without changing their schema.
  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setCommunityLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(firebase.db, 'projects'),
      (snapshot) => {
        const published = snapshot.docs
          .map((item) => {
            const data = item.data();

            return {
              id: item.id,
              title: String(data.title ?? ''),
              summary: String(data.summary ?? ''),
              category: String(data.category ?? 'Other'),
              imageData: String(data.imageData ?? ''),
              creatorName: String(data.creatorName ?? 'Community creator'),
              status: String(data.status ?? ''),
            };
          })
          .filter((project) => project.status === 'published')
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, 3);

        setCommunityProjects(published);
        setCommunityLoading(false);
      },
      (err) => {
        console.error('Community showcase loading failed:', err);
        setCommunityProjects([]);
        setCommunityLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch =
        !q ||
        `${p.name} ${p.description} ${p.sku} ${p.category}`
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, query, category]);

  return (
    <>
      <Seo
        path="/products"
        title="Products"
        description="Explore published SNAPBOTS robotics products, components and kits."
      />

      <PageHero
        eyebrow="Products"
        title="Components, kits and custom builds."
        lead="Explore our published robotics products, check availability, and enquire about the items you need."
      />

      <Section>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="product-search"
              className="mb-1.5 block text-sm text-paper/80"
            >
              Search products
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
                aria-hidden="true"
              />
              <Input
                id="product-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, SKU, or category"
                className="pl-11"
              />
            </div>
          </div>

          <div className="md:w-64">
            <label
              htmlFor="product-category"
              className="mb-1.5 block text-sm text-paper/80"
            >
              Category
            </label>
            <Select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-mute">
            Loading published products…
          </p>
        ) : results.length === 0 ? (
          <EmptyState
            title={
              products.length === 0
                ? 'No published products yet'
                : 'No products match'
            }
            body={
              products.length === 0
                ? 'Published products will appear here when they are available.'
                : 'Try another search or clear your filters.'
            }
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <p aria-live="polite" className="mb-6 text-sm text-mute">
              {results.length} {results.length === 1 ? 'product' : 'products'}
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.04}>
                  <Card className="flex h-full flex-col overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        className="mb-4 aspect-[4/3] w-full rounded-lg bg-white/5 object-contain"
                      />
                    ) : (
                      <div className="mb-4 flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-white/5 text-sm text-mute">
                        Product image coming soon
                      </div>
                    )}

                    <p className="font-mono text-xs uppercase tracking-wider text-mute">
                      {p.category}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">{p.name}</h2>

                    {p.sku && (
                      <p className="mt-1 text-xs text-mute">SKU: {p.sku}</p>
                    )}

                    <p className="mt-3 flex-1 whitespace-pre-line text-sm text-paper/65">
                      {p.description ||
                        'Contact us for product specifications.'}
                    </p>

                    <p className="mt-4 text-xl font-bold">
                      ₹
                      {p.price.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <p className="mt-2 text-sm text-mute">
                      {p.stock > 0
                        ? `${p.stock} in stock`
                        : 'Currently out of stock'}
                    </p>

                    <Link
                      to={`/contact?category=product&subject=${encodeURIComponent(`Enquiry: ${p.name}`)}`}
                      className="mt-5 inline-flex w-fit items-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-lime hover:text-lime"
                    >
                      Enquire about {p.name}
                    </Link>
                  </Card>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* Community showcase — follows the product catalogue */}
      <Section>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-lime">
              <Users size={18} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                The Snapbots Community
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Built by the community.
                </h2>
                <p className="mt-4 text-paper/65">
                  Discover projects created by makers and innovators working
                  across robotics, AI, IoT, electronics, and software. Explore
                  ideas, learn from other builders, and share what you create.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Explore projects <ArrowRight size={16} />
                </Link>
                <Link
                  to="/community/submit"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-lime hover:text-lime"
                >
                  Share a project <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              {communityLoading ? (
                <p className="py-6 text-sm text-mute">
                  Loading community projects…
                </p>
              ) : communityProjects.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {communityProjects.map((project, index) => (
                    <Reveal key={project.id} delay={index * 0.06}>
                      <Link
                        to={`/community/projects/${project.id}`}
                        className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
                      >
                        <Card className="h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:border-lime/40">
                          {project.imageData ? (
                            <img
                              src={project.imageData}
                              alt={project.title}
                              loading="lazy"
                              className="mb-4 aspect-[16/10] w-full rounded-lg bg-white/5 object-cover"
                            />
                          ) : (
                            <div className="mb-4 flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-white/5">
                              <Cpu
                                size={32}
                                className="text-mute"
                                aria-hidden="true"
                              />
                            </div>
                          )}

                          <p className="text-xs font-semibold uppercase tracking-wider text-lime">
                            {project.category}
                          </p>
                          <h3 className="mt-2 text-lg font-bold transition group-hover:text-lime">
                            {project.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-sm text-paper/65">
                            {project.summary ||
                              'Explore this community project to learn more.'}
                          </p>
                          <p className="mt-4 text-xs text-mute">
                            By {project.creatorName}
                          </p>
                        </Card>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 px-5 py-8 text-center">
                  <Users
                    size={28}
                    className="mx-auto text-mute"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 font-semibold">
                    The next great idea could be yours.
                  </h3>
                  <p className="mt-2 text-sm text-mute">
                    Community projects will appear here once they are
                    published.
                  </p>
                  <Link
                    to="/community/submit"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline"
                  >
                    Submit your project <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 text-sm font-semibold text-paper/70 transition hover:text-lime"
              >
                View the entire community <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}