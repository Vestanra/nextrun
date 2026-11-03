import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrl, getRouteSeo } from '@/lib/seo';

function ensureMeta(name: string): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) return existing;

  const element = document.createElement('meta');
  element.name = name;
  document.head.appendChild(element);
  return element;
}

function ensureCanonical(): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (existing) return existing;

  const element = document.createElement('link');
  element.rel = 'canonical';
  document.head.appendChild(element);
  return element;
}

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(pathname);
    document.title = seo.title;
    ensureMeta('description').content = seo.description;
    ensureCanonical().href = canonicalUrl(pathname);

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (seo.noIndex) {
      ensureMeta('robots').content = 'noindex, nofollow';
    } else {
      robots?.remove();
    }
  }, [pathname]);

  return null;
}
