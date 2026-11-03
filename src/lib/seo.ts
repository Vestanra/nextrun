import { demoEvents } from './demoEvents';

export const SITE_URL = 'https://vestanra.github.io';

export interface RouteSeo {
  title: string;
  description: string;
  canonicalPath: string;
  noIndex?: boolean;
}

const homeSeo: RouteSeo = {
  title: 'NEXTRUN — Running Events',
  description: 'Discover running events, compare race distances, and register for your next race with NEXTRUN.',
  canonicalPath: '/',
};

function normalizePath(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

export function getRouteSeo(pathname: string): RouteSeo {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/') return homeSeo;

  const eventMatch = normalizedPath.match(/^\/events\/([^/]+)$/);
  if (eventMatch) {
    const event = demoEvents.find((candidate) => candidate.id === eventMatch[1]);
    if (event) {
      return {
        title: `${event.name} | NEXTRUN`,
        description: event.description,
        canonicalPath: `/events/${event.id}/`,
      };
    }
  }

  const checkoutMatch = normalizedPath.match(/^\/events\/([^/]+)\/checkout$/);
  if (checkoutMatch) {
    const event = demoEvents.find((candidate) => candidate.id === checkoutMatch[1]);
    return {
      title: `${event?.name ?? 'Event'} Checkout | NEXTRUN`,
      description: 'Complete your race registration with NEXTRUN.',
      canonicalPath: event ? `/events/${event.id}/` : '/',
      noIndex: true,
    };
  }

  if (/^\/events\/[^/]+\/confirmation\/[^/]+$/.test(normalizedPath)) {
    return {
      title: 'Registration Confirmation | NEXTRUN',
      description: 'Your NEXTRUN race registration confirmation.',
      canonicalPath: '/',
      noIndex: true,
    };
  }

  return {
    title: 'Page Not Found | NEXTRUN',
    description: 'The requested NEXTRUN page could not be found.',
    canonicalPath: '/',
    noIndex: true,
  };
}

export function canonicalUrl(pathname: string): string {
  return new URL(getRouteSeo(pathname).canonicalPath, SITE_URL).href;
}
