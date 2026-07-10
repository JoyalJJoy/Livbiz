'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[LivBizz Error]', error);
    Sentry.captureException(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        fontFamily: 'var(--font-manrope), var(--font-poppins), sans-serif',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '1rem',
          border: '1px solid #1e293b',
          backgroundColor: 'rgba(30, 41, 59, 0.35)',
        }}
      >
        {/* Warning Icon */}
        <div
          style={{
            fontSize: '4rem',
            lineHeight: 1,
            marginBottom: '1.5rem',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'inline-block' }}
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-poppins), sans-serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#f8fafc',
            margin: '0 0 0.75rem',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: '0 0 1.5rem',
          }}
        >
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>

        {/* Show error details only in development */}
        {isDev && error.message && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </p>
            {error.digest && (
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0',
                }}
              >
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={reset}
            style={{
              backgroundColor: '#6366f1',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'var(--font-manrope), sans-serif',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                '#4f46e5')
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                '#6366f1')
            }
          >
            Try Again
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'var(--font-manrope), sans-serif',
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
