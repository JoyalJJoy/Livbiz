const PROPEXCEL_PUBLIC_BASE = 'https://livbiz.propexcel.com/public';

export const PROPEXCEL_LINKS = {
  properties: `${PROPEXCEL_PUBLIC_BASE}/properties?viewBy=all&navbar=side`,
  spaces: `${PROPEXCEL_PUBLIC_BASE}/spaces?navbar=side`,
  amenities: `${PROPEXCEL_PUBLIC_BASE}/amenities?navbar=side`,
  inquiryEmbed: `${PROPEXCEL_PUBLIC_BASE}/inquiry?theme=light&logo=0`,
} as const;
