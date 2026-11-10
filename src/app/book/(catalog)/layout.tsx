import BookCatalogFrame from '@/components/BookCatalogFrame';

/**
 * Shared catalog iframe for /book/properties|amenities|spaces|bookings|invoices|profile.
 * Keeps one iframe mounted while LivBiz URLs stay in sync with PropExcel tabs.
 */
export default function BookCatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Route pages only supply metadata; chrome + iframe live here. */}
      <div hidden>{children}</div>
      <BookCatalogFrame />
    </>
  );
}
