const PROPEXCEL_PUBLIC_BASE = 'https://livbiz.propexcel.com/public';

// navbar=none: PropExcel embed chrome (section tabs only, no side/top app nav)
// logo=0: hide PropExcel logo under the LivBiz header
// Do NOT pass theme=light: it forces PropExcel generic default-light and skips
// the org UI theme. LivBiz's saved public theme is already preset "light" with
// their brand colors (Theme Settings).
const EMBED_QUERY = 'navbar=none';

export const PROPEXCEL_LINKS = {
  propertiesEmbed: `${PROPEXCEL_PUBLIC_BASE}/properties?viewBy=all&${EMBED_QUERY}`,
  spacesEmbed: `${PROPEXCEL_PUBLIC_BASE}/spaces?${EMBED_QUERY}`,
  amenitiesEmbed: `${PROPEXCEL_PUBLIC_BASE}/amenities?${EMBED_QUERY}`,
  inquiryEmbed: `${PROPEXCEL_PUBLIC_BASE}/inquiry?${EMBED_QUERY}`,
} as const;

export const LIVBIZ_BOOKING_ROUTES = {
  properties: '/book/properties',
  spaces: '/book/spaces',
  amenities: '/book/amenities',
} as const;
