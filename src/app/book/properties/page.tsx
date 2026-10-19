import type { Metadata } from 'next';
import PropExcelEmbed from '@/components/PropExcelEmbed';
import { PROPEXCEL_LINKS } from '@/lib/propexcel-links';

export const metadata: Metadata = {
  title: 'Online Booking',
  description: 'Browse and book LivBizz workspaces online.',
};

export default function BookPropertiesPage() {
  return (
    <PropExcelEmbed
      src={PROPEXCEL_LINKS.propertiesEmbed}
      title="Browse LivBizz properties"
    />
  );
}
