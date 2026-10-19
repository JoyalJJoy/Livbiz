import type { Metadata } from 'next';
import PropExcelEmbed from '@/components/PropExcelEmbed';
import { PROPEXCEL_LINKS } from '@/lib/propexcel-links';

export const metadata: Metadata = {
  title: 'Book a Desk',
  description: 'Book a LivBizz hot desk or day pass online.',
};

export default function BookSpacesPage() {
  return (
    <PropExcelEmbed
      src={PROPEXCEL_LINKS.spacesEmbed}
      title="Book a LivBizz desk"
    />
  );
}
