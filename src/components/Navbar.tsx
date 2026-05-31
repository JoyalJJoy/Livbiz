import styles from './Navbar.module.css';
import Link from 'next/link';
import NavbarAccountButton from './NavbarAccountButton';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(7, 50, 61, 0.15)',
              border: '1.5px solid rgba(7, 50, 61, 0.08)',
              flexShrink: 0
            }}>
              <img 
                src="/images/logo.png" 
                alt="LivBizz emblem" 
                style={{ 
                  width: '90%', 
                  height: '90%', 
                  objectFit: 'contain',
                  objectPosition: 'center 35%'
                }} 
              />
            </div>
            <span style={{ 
              color: '#ffffff', 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'clamp(1.4rem, 1.1rem + 1.3vw, 1.95rem)', 
              fontWeight: 800, 
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              LivBizz
            </span>
          </Link>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="#booking" className={styles.link}>Booking</Link>
          <Link href="#workspace" className={styles.link}>Workspace</Link>
          <Link href="#stories" className={styles.link}>Reviews</Link>
          <Link href="#features" className={styles.link}>Features</Link>
        </nav>
        <div className={styles.action}>
          <NavbarAccountButton />
        </div>
      </div>
    </header>
  );
}
