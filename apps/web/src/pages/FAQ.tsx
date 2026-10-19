import { useMemo, useState } from 'react';
import { faqs } from '@/content/site';
import { Seo } from '@/components/layout/Seo';
import { EmptyState, Button, Input } from '@/components/ui';
import { CtaBand, PageHero, Section } from '@/components/sections';

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = faqs.filter((f) => !q || `${f.q} ${f.a}`.toLowerCase().includes(q));
    const byCat = new Map<string, typeof faqs>();
    for (const f of filtered) byCat.set(f.category, [...(byCat.get(f.category) ?? []), f]);
    return [...byCat.entries()];
  }, [query]);

  return (
    <>
      <Seo path="/faq" title="FAQ" description="Answers to common questions about projects, products, support and accounts." />
      <PageHero eyebrow="FAQ" title="Questions, answered plainly." />
      <Section>
        <div className="mb-12 max-w-md">
          <label htmlFor="faq-search" className="mb-1.5 block text-sm text-paper/80">Search questions</label>
          <Input id="faq-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. NDA, support, account" />
        </div>
        {groups.length === 0 ? (
          <EmptyState title="No matching questions" body="Try a broader term, or ask us directly." action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>} />
        ) : (
          <div className="space-y-12">
            {groups.map(([cat, items]) => (
              <div key={cat}>
                <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-lime">{cat}</h2>
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
                  {items.map((f) => {
                    const id = f.q.replace(/\W+/g, '-').toLowerCase();
                    const isOpen = open === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`${id}-panel`}
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-semibold transition hover:text-lime"
                        >
                          {f.q}
                          <span aria-hidden="true" className="text-lime">{isOpen ? '−' : '+'}</span>
                        </button>
                        {isOpen && (
                          <div id={`${id}-panel`} className="px-6 pb-6 text-paper/70">{f.a}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
      <CtaBand title="Did not find your answer?" body="Send us the question. We will answer it directly and may add it here." label="Ask a question" />
    </>
  );
}
