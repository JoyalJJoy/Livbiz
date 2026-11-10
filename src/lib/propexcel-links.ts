/**
 * Public catalog / auth embeds (propexcel-public-app).
 *
 * Prod (current): https://livbiz-public.propexcel.com
 * Demo: https://livbiz-public-demo.propexcel.com
 * LOCAL: http://localhost:4300  — `npm run dev:public` in PropExcel
 *
 * No `/public` prefix on public-app hosts. Localhost needs `org=`; demo/prod
 * host binds org via KV (org query optional / may be stripped).
 */
const PROPEXCEL_PUBLIC_BASE = 'https://livbiz-public.propexcel.com';

// navbar=none: section tabs only (LivBiz owns top nav)
// logo=0: hide PropExcel logo under the LivBiz header
// hostAuth=1: hide catalog Sign in (LivBiz header owns it); does not affect
//   normal public navbar=none pages that omit this flag
// org=livbiz: required on localhost / shared hosts
// Do NOT pass theme=light: skips org UI theme
// Do NOT pass signin=0: that also hides Book Amenities / Book Spaces tabs
const EMBED_QUERY = 'navbar=none&logo=0&hostAuth=1&org=livbiz';

/** Matches PropExcel `PUBLIC_AUTH_SUCCESS_MESSAGE`. */
export const PROPEXCEL_AUTH_SUCCESS_MESSAGE = 'propexcel:public-auth:success';

/** Matches PropExcel `PUBLIC_AUTH_LOGOUT_MESSAGE`. */
export const PROPEXCEL_AUTH_LOGOUT_MESSAGE = 'propexcel:public-auth:logout';

/** Matches PropExcel `PUBLIC_AUTH_REQUIRED_MESSAGE` (Book / Browse needs login). */
export const PROPEXCEL_AUTH_REQUIRED_MESSAGE =
  'propexcel:public-auth:required';

/** Matches PropExcel `PUBLIC_CATALOG_SECTION_MESSAGE`. */
export const PROPEXCEL_CATALOG_SECTION_MESSAGE =
  'propexcel:public-catalog:section';

export type PropExcelCatalogSection =
  | 'properties'
  | 'amenities'
  | 'spaces'
  | 'my-bookings'
  | 'my-invoices'
  | 'my-profile';

export const PROPEXCEL_LINKS = {
  propertiesEmbed: `${PROPEXCEL_PUBLIC_BASE}/properties?viewBy=all&${EMBED_QUERY}`,
  spacesEmbed: `${PROPEXCEL_PUBLIC_BASE}/spaces?${EMBED_QUERY}`,
  amenitiesEmbed: `${PROPEXCEL_PUBLIC_BASE}/amenities?${EMBED_QUERY}`,
  inquiryEmbed: `${PROPEXCEL_PUBLIC_BASE}/inquiry?${EMBED_QUERY}`,
  bookingsEmbed: `${PROPEXCEL_PUBLIC_BASE}/my-bookings?${EMBED_QUERY}`,
  invoicesEmbed: `${PROPEXCEL_PUBLIC_BASE}/my-invoices?${EMBED_QUERY}`,
  profileEmbed: `${PROPEXCEL_PUBLIC_BASE}/my-profile?${EMBED_QUERY}`,
  /**
   * Guest sign-in / sign-up / forgot for client embeds.
   * redirect=parent: postMessage only — LivBiz stays on /login until we navigate.
   */
  authEmbed: `${PROPEXCEL_PUBLIC_BASE}/auth?${EMBED_QUERY}&view=sign-in&redirect=parent`,
  authSignUpEmbed: `${PROPEXCEL_PUBLIC_BASE}/auth?${EMBED_QUERY}&view=sign-up&redirect=parent`,
} as const;

export const LIVBIZ_BOOKING_ROUTES = {
  properties: '/book/properties',
  spaces: '/book/spaces',
  amenities: '/book/amenities',
  bookings: '/book/bookings',
  invoices: '/book/invoices',
  profile: '/book/profile',
} as const;

export const PROPEXCEL_SECTION_TO_LIVBIZ_ROUTE: Record<
  PropExcelCatalogSection,
  string
> = {
  properties: LIVBIZ_BOOKING_ROUTES.properties,
  amenities: LIVBIZ_BOOKING_ROUTES.amenities,
  spaces: LIVBIZ_BOOKING_ROUTES.spaces,
  'my-bookings': LIVBIZ_BOOKING_ROUTES.bookings,
  'my-invoices': LIVBIZ_BOOKING_ROUTES.invoices,
  'my-profile': LIVBIZ_BOOKING_ROUTES.profile,
};

export function livbizPathToCatalogSection(
  pathname: string
): PropExcelCatalogSection {
  if (pathname.startsWith(LIVBIZ_BOOKING_ROUTES.amenities)) return 'amenities';
  if (pathname.startsWith(LIVBIZ_BOOKING_ROUTES.spaces)) return 'spaces';
  if (pathname.startsWith(LIVBIZ_BOOKING_ROUTES.bookings)) return 'my-bookings';
  if (pathname.startsWith(LIVBIZ_BOOKING_ROUTES.invoices)) return 'my-invoices';
  if (pathname.startsWith(LIVBIZ_BOOKING_ROUTES.profile)) return 'my-profile';
  return 'properties';
}

export function livbizRouteToPropExcelEmbedSrc(pathname: string): string {
  switch (livbizPathToCatalogSection(pathname)) {
    case 'amenities':
      return PROPEXCEL_LINKS.amenitiesEmbed;
    case 'spaces':
      return PROPEXCEL_LINKS.spacesEmbed;
    case 'my-bookings':
      return PROPEXCEL_LINKS.bookingsEmbed;
    case 'my-invoices':
      return PROPEXCEL_LINKS.invoicesEmbed;
    case 'my-profile':
      return PROPEXCEL_LINKS.profileEmbed;
    default:
      return PROPEXCEL_LINKS.propertiesEmbed;
  }
}

/** After PropExcel guest auth, continue on LivBiz booking (catalog iframe). */
export const LIVBIZ_POST_AUTH_ROUTE = LIVBIZ_BOOKING_ROUTES.properties;

/** My Account when PropExcel guest session is mirrored as signed-in. */
export const LIVBIZ_ACCOUNT_ROUTE = LIVBIZ_BOOKING_ROUTES.profile;

/**
 * Allow only LivBiz public/booking paths as login return targets
 * (never admin/dashboard open redirects).
 */
export function isSafeLivBizReturnPath(
  raw: string | null | undefined
): raw is string {
  if (!raw || typeof raw !== 'string') {
    return false;
  }
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return false;
  }
  if (trimmed.includes('://')) {
    return false;
  }
  const pathOnly = trimmed.split('?')[0] || trimmed;
  return (
    pathOnly === '/' ||
    pathOnly === '/book' ||
    pathOnly.startsWith('/book/')
  );
}

/** Safe in-app return path after /login (Back or post-auth). */
export function getSafeLivBizPostAuthPath(
  raw: string | null | undefined,
  fallback: string = LIVBIZ_POST_AUTH_ROUTE
): string {
  return isSafeLivBizReturnPath(raw) ? raw.trim() : fallback;
}

/** Build `/login` with optional sign-up view and return path. */
export function buildLivBizLoginHref(options?: {
  view?: 'sign-in' | 'sign-up' | null;
  redirect?: string | null;
}): string {
  const params = new URLSearchParams();
  if (options?.view === 'sign-up') {
    params.set('view', 'sign-up');
  }
  if (isSafeLivBizReturnPath(options?.redirect)) {
    params.set('redirect', options.redirect.trim());
  }
  const search = params.toString();
  return search ? `/login?${search}` : '/login';
}
