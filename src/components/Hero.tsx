import styles from './Hero.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LIVBIZ_BOOKING_ROUTES } from '@/lib/propexcel-links';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>LivBizz Coworking</p>
          <h1>Your Workspace,<br />Ready When You Are</h1>
          <p className={styles.serviceLine}>Day Pass &bull; Meeting Rooms</p>
          <p className={styles.subtitle}>
            Premium coworking with high-speed WiFi, ergonomic seating, and on-demand conference rooms. Book by the hour or the day — no commitments.
          </p>
          <Link href={LIVBIZ_BOOKING_ROUTES.properties} className={styles.bookingButton}>
            Online Booking <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 600 450" role="img">
            {/* Floor shadow */}
            <ellipse className={styles.floorShadow} cx="300" cy="410" rx="240" ry="22" />

            {/* Desk */}
            <rect className={styles.desk} x="80" y="260" width="440" height="16" rx="4" />
            <rect className={styles.deskLeg} x="110" y="276" width="12" height="100" rx="3" />
            <rect className={styles.deskLeg} x="478" y="276" width="12" height="100" rx="3" />
            <rect className={styles.deskFront} x="80" y="268" width="440" height="8" rx="2" />

            {/* Person 1 — left side, working on laptop */}
            <circle className={styles.head1} cx="200" cy="175" r="32" />
            <path className={styles.hair1} d="M172 162c5-25 30-40 55-33 10 3 15 12 12 22-15-3-32-3-48 0-7 2-14 8-19 11Z" />
            <path className={styles.body1} d="M170 207c0-8 6-14 14-14h32c8 0 14 6 14 14v53h-60v-53Z" />
            <rect className={styles.arm1} x="160" y="220" width="18" height="40" rx="9" />
            <rect className={styles.arm1} x="222" y="220" width="18" height="40" rx="9" />

            {/* Laptop 1 */}
            <rect className={styles.laptop} x="150" y="238" width="100" height="22" rx="3" />
            <rect className={styles.screen} x="155" y="215" width="90" height="23" rx="2" />
            <rect className={styles.screenGlow} x="162" y="220" width="36" height="3" rx="1" />
            <rect className={styles.screenGlow} x="162" y="226" width="50" height="3" rx="1" />
            <rect className={styles.screenGlow} x="162" y="232" width="28" height="3" rx="1" />

            {/* Person 2 — right side, talking/presenting */}
            <circle className={styles.head2} cx="400" cy="168" r="34" />
            <path className={styles.hair2} d="M370 152c8-22 35-34 57-24 8 4 12 14 8 22-16-6-34-8-50-4-6 1-11 4-15 6Z" />
            <path className={styles.body2} d="M368 202c0-8 6-14 14-14h36c8 0 14 6 14 14v58h-64v-58Z" />
            <rect className={styles.arm2} x="356" y="215" width="18" height="45" rx="9" />
            <path className={styles.armGesture} d="M432 215c12-20 28-35 42-30 8 3 6 14-2 18-14 6-28 14-40 26v-14Z" />

            {/* Laptop 2 */}
            <rect className={styles.laptop} x="350" y="238" width="100" height="22" rx="3" />
            <rect className={styles.screen} x="355" y="212" width="90" height="26" rx="2" />
            <rect className={styles.screenGlow} x="362" y="218" width="42" height="3" rx="1" />
            <rect className={styles.screenGlow} x="362" y="224" width="55" height="3" rx="1" />
            <rect className={styles.screenGlow} x="362" y="230" width="30" height="3" rx="1" />

            {/* Coffee cup */}
            <rect className={styles.coffee} x="290" y="240" width="20" height="20" rx="3" />
            <path className={styles.coffeeHandle} d="M310 244c6 0 10 4 10 8s-4 8-10 8" />
            <path className={styles.steam} d="M296 236c0-6 3-10 4-14" />
            <path className={styles.steam} d="M304 234c0-6 3-12 4-16" />

            {/* Plant in pot */}
            <rect className={styles.pot} x="530" y="330" width="36" height="42" rx="4" />
            <rect className={styles.potRim} x="526" y="326" width="44" height="10" rx="3" />
            <path className={styles.leaf} d="M548 326c-8-20-4-45 10-58 14 13 18 38 10 58h-20Z" />
            <path className={styles.leafDark} d="M548 326c-5-14-4-32 4-46 10 12 14 32 8 46h-12Z" />
            <line className={styles.stem} x1="548" y1="326" x2="548" y2="285" />

            {/* Floating UI elements — calendar card */}
            <rect className={styles.uiCard} x="70" y="80" width="90" height="72" rx="10" />
            <rect className={styles.uiCardHeader} x="70" y="80" width="90" height="20" rx="10" />
            <rect className={styles.uiDot} x="82" y="108" width="14" height="14" rx="3" />
            <rect className={styles.uiDotActive} x="102" y="108" width="14" height="14" rx="3" />
            <rect className={styles.uiDot} x="122" y="108" width="14" height="14" rx="3" />
            <rect className={styles.uiDot} x="82" y="128" width="14" height="14" rx="3" />
            <rect className={styles.uiDot} x="102" y="128" width="14" height="14" rx="3" />
            <rect className={styles.uiDot} x="122" y="128" width="14" height="14" rx="3" />

            {/* Floating UI — chat bubble */}
            <rect className={styles.chatBubble} x="460" y="70" width="100" height="60" rx="12" />
            <rect className={styles.chatLine} x="475" y="85" width="55" height="6" rx="3" />
            <rect className={styles.chatLine} x="475" y="97" width="40" height="6" rx="3" />
            <rect className={styles.chatLine} x="475" y="109" width="60" height="6" rx="3" />

            {/* Wifi icon */}
            <path className={styles.wifi} d="M300 100c-18 0-34 7-46 18" />
            <path className={styles.wifi} d="M300 100c18 0 34 7 46 18" />
            <path className={styles.wifi} d="M300 115c-10 0-20 4-27 11" />
            <path className={styles.wifi} d="M300 115c10 0 20 4 27 11" />
            <circle className={styles.wifiDot} cx="300" cy="132" r="5" />

            {/* Small decorative dots */}
            <circle className={styles.decorDot} cx="45" cy="200" r="4" />
            <circle className={styles.decorDot} cx="555" cy="180" r="3" />
            <circle className={styles.decorDot} cx="520" cy="120" r="5" />
            <circle className={styles.decorDotGold} cx="180" cy="100" r="4" />
            <circle className={styles.decorDotGold} cx="440" cy="50" r="3" />
          </svg>
        </div>
      </div>

      <svg className={styles.wave} viewBox="0 0 1440 88" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50C276 78 511 78 814 54C1047 36 1203 19 1440 4V88H0V50Z" />
      </svg>
    </section>
  );
}
