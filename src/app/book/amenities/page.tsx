import type { Metadata } from 'next';
import PropExcelEmbed from '@/components/PropExcelEmbed';
import { PROPEXCEL_LINKS } from '@/lib/propexcel-links';

export const metadata: Metadata = {
  title: 'Book a Room',
  description: 'Book a LivBizz meeting or conference room online.',
};

export default function BookAmenitiesPage() {
  return (
    <PropExcelEmbed
      src={PROPEXCEL_LINKS.amenitiesEmbed}
      title="Book a LivBizz meeting room"
    />
  );
}
