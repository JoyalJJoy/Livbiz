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
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 0 18px rgba(99, 102, 241, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              flexShrink: 0
            }}>
              <img 
                src="/images/logo.png" 
                alt="LivBizz emblem" 
                style={{ 
                  height: '100%', 
                  width: '100%', 
                  objectFit: 'contain',
                  transform: 'scale(1.4) translateY(-11%)',
                  transformOrigin: 'center center'
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
