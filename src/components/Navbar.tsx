import styles from './Navbar.module.css';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>LivBiz</span>
            <span className={styles.logoSubtext}>Coworking & Conference Hub</span>
          </Link>
        </div>
        <nav className={styles.navLinks}>
          <Link href="#campuses" className={styles.link}>Campuses</Link>
          <Link href="#features" className={styles.link}>Features</Link>
          <Link href="#stories" className={styles.link}>Stories</Link>
        </nav>
        <div className={styles.action}>
          <Link href="#enquire" className={styles.button}>Enquire</Link>
        </div>
      </div>
    </header>
  );
}
