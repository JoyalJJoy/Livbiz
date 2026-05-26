import styles from './Navbar.module.css';
import Link from 'next/link';
import NavbarAccountButton from './NavbarAccountButton';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>LivBiz</span>
            <span className={styles.logoMark} aria-hidden="true"></span>
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
