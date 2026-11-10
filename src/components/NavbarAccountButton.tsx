'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  buildLivBizLoginHref,
  LIVBIZ_ACCOUNT_ROUTE,
  PROPEXCEL_AUTH_LOGOUT_MESSAGE,
  PROPEXCEL_AUTH_REQUIRED_MESSAGE,
  PROPEXCEL_AUTH_SUCCESS_MESSAGE,
} from '@/lib/propexcel-links';
import {
  isPropExcelEmbedOrigin,
  readPropExcelGuestSignedIn,
  setPropExcelGuestSignedIn,
} from '@/lib/propexcel-guest-session';
import styles from './Navbar.module.css';

function isCatalogBookingPath(pathname: string): boolean {
  return (
    pathname.startsWith('/book/properties') ||
    pathname.startsWith('/book/amenities') ||
    pathname.startsWith('/book/spaces') ||
    pathname.startsWith('/book/bookings') ||
    pathname.startsWith('/book/invoices') ||
    pathname.startsWith('/book/profile')
  );
}

/**
 * Signed out → Sign In → /login.
 * Signed in on catalog pages → hidden (embed has My profile).
 * Signed in elsewhere → My Account → /book/profile.
 *
 * Session is read only after mount so we never flash the wrong label.
 */
export default function NavbarAccountButton() {
  const pathname = usePathname();
  /** null = not hydrated yet (unknown). */
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setSignedIn(readPropExcelGuestSignedIn());

    function syncFromStorage() {
      setSignedIn(readPropExcelGuestSignedIn());
    }

    function onCustom(event: Event) {
      const detail = (event as CustomEvent<{ signedIn?: boolean }>).detail;
      if (typeof detail?.signedIn === 'boolean') {
        setSignedIn(detail.signedIn);
        return;
      }
      syncFromStorage();
    }

    function onMessage(event: MessageEvent) {
      if (!isPropExcelEmbedOrigin(event.origin)) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === PROPEXCEL_AUTH_SUCCESS_MESSAGE) {
        setPropExcelGuestSignedIn(true);
        setSignedIn(true);
        return;
      }
      if (data.type === PROPEXCEL_AUTH_REQUIRED_MESSAGE) {
        if (window.location.pathname.startsWith('/login')) {
          return;
        }
        // Booking said auth is required — clear a stale mirror so /login
        // does not immediately bounce back via redirect=.
        setPropExcelGuestSignedIn(false);
        setSignedIn(false);
        window.location.assign(
          buildLivBizLoginHref({
            view: data.view === 'sign-up' ? 'sign-up' : null,
            redirect: window.location.pathname,
          })
        );
        return;
      }
      if (data.type === PROPEXCEL_AUTH_LOGOUT_MESSAGE) {
        setPropExcelGuestSignedIn(false);
        setSignedIn(false);
        if (isCatalogBookingPath(window.location.pathname)) {
          window.location.assign('/');
        }
      }
    }

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('livbiz:propexcel-guest-session', onCustom);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('livbiz:propexcel-guest-session', onCustom);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  // Avoid Sign In → My Account flash before localStorage is known.
  if (signedIn === null) {
    return (
      <span
        className={styles.accountButton}
        style={{ visibility: 'hidden' }}
        aria-hidden
      >
        Sign In
      </span>
    );
  }

  if (signedIn && isCatalogBookingPath(pathname)) {
    return null;
  }

  const signInHref = buildLivBizLoginHref({
    redirect: pathname.startsWith('/book') ? pathname : null,
  });

  return (
    <Link
      href={signedIn ? LIVBIZ_ACCOUNT_ROUTE : signInHref}
      className={styles.accountButton}
    >
      {signedIn ? 'My Account' : 'Sign In'}
    </Link>
  );
}
