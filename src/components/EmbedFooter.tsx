import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import styles from './EmbedFooter.module.css';

const MAPS = 'https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac';

/**
 * Compact booking-page chrome. Fixed under the catalog iframe so the page
 * keeps a single scroll surface while still showing LivBizz brand + contact.
 */
export default function EmbedFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="LivBizz home">
            <span className={styles.logoIcon}>
              <Image
                src="/images/logo.png"
                alt=""
                width={22}
                height={22}
                style={{ objectFit: 'contain', objectPosition: 'center 35%' }}
              />
            </span>
            <span className={styles.logoText}>LivBizz</span>
          </Link>
          <span className={styles.tagline}>Focus once. Grow anytime.</span>
        </div>

        <nav className={styles.links} aria-label="Footer">
          <a href={MAPS} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <MapPin size={13} aria-hidden />
            <span>Kothanur Hub</span>
          </a>
          <a href="tel:8088631765" className={styles.link}>
            <Phone size={13} aria-hidden />
            <span>8088 631 765</span>
          </a>
          <a href="tel:8095797304" className={styles.link}>
            <Phone size={13} aria-hidden />
            <span>8095 797 304</span>
          </a>
        </nav>

        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} LivBizz
        </p>
      </div>
    </footer>
  );
}
