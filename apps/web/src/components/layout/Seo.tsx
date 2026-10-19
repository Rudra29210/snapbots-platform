import { useEffect } from 'react';
import { company } from '@/content/site';

const SITE_ORIGIN = 'https://snapbots.example'; // Replace with the production origin before launch.

/** Sets title, description, canonical and Open Graph tags for the current route. */
export function Seo({ title, description, path }: { title?: string; description?: string; path: string }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | SNAPBOTS` : `SNAPBOTS — ${company.tagline}`;
    document.title = fullTitle;
    setMeta('name', 'description', description ?? 'SNAPBOTS: robotics, embedded systems, IoT and AI engineering.');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description ?? '');
    setMeta('property', 'og:url', SITE_ORIGIN + path);
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = SITE_ORIGIN + path;
  }, [title, description, path]);
  return null;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
