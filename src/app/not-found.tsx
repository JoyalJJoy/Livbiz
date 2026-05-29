import Link from 'next/link';

export default function NotFound() {
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
        <h1
          style={{
            fontFamily: 'var(--font-poppins), sans-serif',
            fontSize: '6rem',
            fontWeight: 800,
            color: '#6366f1',
            margin: '0 0 0.25rem',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: 'var(--font-poppins), sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f8fafc',
            margin: '0 0 0.75rem',
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: '0 0 2rem',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#6366f1',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: 'var(--font-manrope), sans-serif',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
