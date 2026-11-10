'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmbedFooter from '@/components/EmbedFooter';
import {
  buildLivBizLoginHref,
  PROPEXCEL_AUTH_REQUIRED_MESSAGE,
  PROPEXCEL_CATALOG_SECTION_MESSAGE,
  PROPEXCEL_SECTION_TO_LIVBIZ_ROUTE,
  livbizPathToCatalogSection,
  livbizRouteToPropExcelEmbedSrc,
  type PropExcelCatalogSection,
} from '@/lib/propexcel-links';
import {
  isPropExcelEmbedOrigin,
  setPropExcelGuestSignedIn,
} from '@/lib/propexcel-guest-session';
import styles from './PropExcelEmbed.module.css';

const CATALOG_SECTIONS = new Set<string>([
  'properties',
  'amenities',
  'spaces',
  'my-bookings',
  'my-invoices',
  'my-profile',
]);

/**
 * Persistent catalog iframe under /book/*.
 *
 * Important: do NOT bind iframe `src` to pathname. Tab clicks only
 * postMessage → LivBiz router.replace for the URL bar. Re-binding `src`
 * would reload the iframe on every tab (the double-refresh bug).
 */
export default function BookCatalogFrame() {
  const pathname = usePathname();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeSectionRef = useRef<PropExcelCatalogSection>(
    livbizPathToCatalogSection(pathname)
  );
  /** Pathname we expect from an iframe tab sync — do not touch iframe.src. */
  const ignoreSrcForPathRef = useRef<string | null>(null);
  const [initialSrc] = useState(() => livbizRouteToPropExcelEmbedSrc(pathname));
  const pathSection = livbizPathToCatalogSection(pathname);
  const embedSrc = livbizRouteToPropExcelEmbedSrc(pathname);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isPropExcelEmbedOrigin(event.origin)) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === PROPEXCEL_AUTH_REQUIRED_MESSAGE) {
        if (window.location.pathname.startsWith('/login')) {
          return;
        }
        // Booking said auth is required — clear a stale mirror so /login
        // does not immediately bounce back via redirect=.
        setPropExcelGuestSignedIn(false);
        window.location.assign(
          buildLivBizLoginHref({
            view: data.view === 'sign-up' ? 'sign-up' : null,
            redirect: window.location.pathname,
          })
        );
        return;
      }

      if (data.type !== PROPEXCEL_CATALOG_SECTION_MESSAGE) return;

      const section = data.section as string;
      if (!CATALOG_SECTIONS.has(section)) return;

      const catalogSection = section as PropExcelCatalogSection;
      iframeSectionRef.current = catalogSection;

      const nextPath = PROPEXCEL_SECTION_TO_LIVBIZ_ROUTE[catalogSection];
      if (!nextPath || pathname === nextPath) return;

      ignoreSrcForPathRef.current = nextPath;
      router.replace(nextPath);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [pathname, router]);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    // URL bar sync from iframe tab — never reload the iframe.
    if (ignoreSrcForPathRef.current === pathname) {
      ignoreSrcForPathRef.current = null;
      iframeSectionRef.current = pathSection;
      return;
    }

    if (iframeSectionRef.current === pathSection) {
      return;
    }

    // LivBiz-driven navigation (e.g. Sign In → later My Account from home).
    frame.src = embedSrc;
    iframeSectionRef.current = pathSection;
  }, [embedSrc, pathSection, pathname]);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <iframe
          ref={iframeRef}
          src={initialSrc}
          title="LivBizz booking catalog"
          className={styles.frame}
        />
      </main>
      <EmbedFooter />
    </div>
  );
}
