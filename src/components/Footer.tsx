import Image from 'next/image';
import styles from './Footer.module.css';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function Footer() {
  const brandName = "LivBizz";

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        
        {/* ── Top Footer Row ─────────────────────────────────── */}
        <div className={styles.topRow}>
          
          {/* Brand Col */}
          <div className={styles.brandCol}>
            
            {/* Logo Row */}
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: '85%', height: '85%', objectFit: 'contain', objectPosition: 'center 35%' }}
                />
              </div>
              <span className={styles.logoText}>LivBizz</span>
              <span className={styles.subLabel}>Coworking Spaces</span>
            </div>

            {/* Typography Hook (Copy once. Reuse anytime.) */}
            <div className={styles.hook}>
              <div className={styles.hookMain}>Focus once.</div>
              <div className={styles.hookItalic}>Grow anytime.</div>
            </div>

            {/* Description */}
            <p className={styles.description}>
              LivBizz provides premium workspace and conference hubs, automatically equipped with high-speed internet, ergonomic setups, and business amenities.
            </p>

            {/* Book Workspace Button */}
            <Link href="/book" className={styles.ctaBtn}>
              <Calendar size={16} />
              <span>Book Workspace</span>
            </Link>

            {/* Copyright */}
            <div className={styles.copyright}>
              &copy; {new Date().getFullYear()} LivBizz.com &mdash; All rights reserved
            </div>

          </div>

          {/* Links Grid */}
          <div className={styles.linksGrid}>
            
            {/* Col 1: Menu */}
            <div className={styles.linksCol}>
              <h4>Menu</h4>
              <ul className={styles.linksList}>
                <li><Link href="#">Home</Link></li>
                <li><Link href="#workspace">Spaces</Link></li>
                <li><Link href="#experience">FAQ</Link></li>
                <li><Link href="#booking">Pricing</Link></li>
              </ul>
            </div>

            {/* Col 2: Navigation */}
            <div className={styles.linksCol}>
              <h4>Navigation</h4>
              <ul className={styles.linksList}>
                <li><Link href="#location">Contact</Link></li>
                <li><Link href="#experience">Roadmap</Link></li>
                <li><Link href="/privacy">Privacy policy</Link></li>
                <li><Link href="/terms">Terms of service</Link></li>
                <li><Link href="#location">Support portal</Link></li>
              </ul>
            </div>

            {/* Col 3: Locations */}
            <div className={styles.linksCol}>
              <h4>Locations</h4>
              <ul className={styles.linksList}>
                <li><a href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac" target="_blank" rel="noopener noreferrer">Kothanur Hub</a></li>
                <li><a href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac" target="_blank" rel="noopener noreferrer">Shakunthala Plaza-2</a></li>
                <li><a href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac" target="_blank" rel="noopener noreferrer">Bengaluru HQ</a></li>
                <li><Link href="#location">Partner spaces</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── Gigantic Background Watermark with letter hover glow ── */}
        <div className={styles.watermark} aria-hidden="true">
          {brandName.split("").map((char, index) => (
            <span key={index} className={styles.watermarkChar}>
              {char}
            </span>
          ))}
        </div>

      </div>
    </footer>
  );
}
