'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  getSafeLivBizPostAuthPath,
  LIVBIZ_ACCOUNT_ROUTE,
  LIVBIZ_POST_AUTH_ROUTE,
  PROPEXCEL_AUTH_SUCCESS_MESSAGE,
  PROPEXCEL_LINKS,
} from '@/lib/propexcel-links';
import {
  isPropExcelEmbedOrigin,
  readPropExcelGuestSignedIn,
  setPropExcelGuestSignedIn,
} from '@/lib/propexcel-guest-session';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>
            Loading...
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  // Bare /login (header Sign In from home) → Back goes `/`.
  // Auth-required / book Sign In → Back uses `redirect` (/book/…).
  const backPath = getSafeLivBizPostAuthPath(
    searchParams.get('redirect'),
    '/'
  );
  const authSrc =
    view === 'sign-up'
      ? PROPEXCEL_LINKS.authSignUpEmbed
      : PROPEXCEL_LINKS.authEmbed;

  useEffect(() => {
    const redirectParam = new URLSearchParams(window.location.search).get(
      'redirect'
    );

    // Already mirrored as signed-in:
    // - With redirect= (came from booking auth gate): stay on /login so a
    //   stale mirror cannot bounce the user straight back without signing in.
    // - Without redirect (opened Sign In /login directly): go to account.
    if (readPropExcelGuestSignedIn() && !redirectParam) {
      window.location.replace(LIVBIZ_ACCOUNT_ROUTE);
      return;
    }

    function onMessage(event: MessageEvent) {
      if (!isPropExcelEmbedOrigin(event.origin)) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type !== PROPEXCEL_AUTH_SUCCESS_MESSAGE) return;
      setPropExcelGuestSignedIn(true);
      const next = getSafeLivBizPostAuthPath(
        new URLSearchParams(window.location.search).get('redirect'),
        LIVBIZ_POST_AUTH_ROUTE
      );
      // Hard navigate so the catalog iframe remounts and picks up guest cookies.
      window.location.assign(next);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.leftBanner}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push(backPath)}
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>

        <div className={styles.illustrationContainer}>
          <svg
            viewBox="0 0 500 400"
            className={styles.illustrationImg}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle cx="120" cy="200" r="80" fill="#1e293b" />
            <circle cx="380" cy="180" r="100" fill="#1e293b" opacity="0.4" />
            <rect x="180" y="80" width="160" height="110" rx="8" fill="#334155" />
            <rect x="190" y="90" width="140" height="15" rx="3" fill="#475569" />
            <circle cx="200" cy="97.5" r="3" fill="#ef4444" />
            <circle cx="210" cy="97.5" r="3" fill="#eab308" />
            <circle cx="220" cy="97.5" r="3" fill="#22c55e" />
            <rect x="235" y="130" width="50" height="40" rx="6" fill="#f59e0b" />
            <path
              d="M245 130V118C245 110 252 105 260 105C268 105 275 110 275 118V130"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x="60" y="150" width="80" height="100" rx="8" fill="#475569" />
            <path d="M100 170L115 185H105V210H95V185H85L100 170Z" fill="#e2e8f0" />
            <rect x="75" y="225" width="50" height="12" rx="4" fill="#f59e0b" />
            <path
              d="M400 320C400 320 420 280 430 250C440 280 460 320 460 320H400Z"
              fill="#10b981"
            />
            <path
              d="M410 320C410 320 430 260 440 230C450 260 470 320 470 320H410Z"
              fill="#047857"
            />
            <rect x="420" y="320" width="30" height="35" rx="4" fill="#eab308" />
            <circle cx="280" cy="230" r="24" fill="#fca5a5" />
            <rect x="250" y="254" width="60" height="100" rx="12" fill="#065f46" />
            <path
              d="M290 220C280 200 250 220 260 240"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x="220" y="300" width="130" height="10" rx="3" fill="#e2e8f0" />
            <path d="M270 300L260 275H300L290 300" fill="#cbd5e1" />
          </svg>

          <h2 className={styles.welcomeHeading}>Welcome back</h2>
          <p className={styles.welcomeText}>
            Sign in to access your dashboard and manage your bookings.
          </p>
        </div>

        <p className={styles.footerCopyright}>&copy; LivBizz Coworking</p>
      </div>

      <div className={styles.rightFormArea}>
        <div className={styles.authFrameCard}>
          <iframe
            src={authSrc}
            title="LivBizz account sign in"
            className={styles.authFrame}
          />
        </div>
      </div>
    </div>
  );
}
