import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Monitor, Presentation, ArrowRight, Wifi, Coffee, Shield, Clock, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BookPage() {
  return (
    <main className={styles.main}>
      <Navbar />

      {/* ── Choose Your Path Section ─────────────────────── */}
      <section className={styles.chooseSection}>
        <div className={styles.chooseSectionInner}>
          {/* Clean banner layout with no text or animation as requested */}
        </div>
        <svg className={styles.wave} viewBox="0 0 1440 88" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 50C276 78 511 78 814 54C1047 36 1203 19 1440 4V88H0V50Z" />
        </svg>
      </section>

      {/* ── Two Cards Grid ───────────────────────────────── */}
      <section className={styles.cardsSection}>
        <div className={styles.cardsContainer}>

          {/* Card 1: Book a Desk */}
          <div className={styles.pathCard}>
            <div className={styles.pathCardContent}>
              <div className={styles.pathCardIcon}>
                <Monitor size={22} />
              </div>
              <p className={styles.pathLabel}>I need a</p>
              <h2 className={styles.pathTitle}>Day Pass</h2>
              <p className={styles.pathDescription}>
                Find your ideal desk, book securely, and work productively with complete flexibility.
              </p>
              <ul className={styles.pathFeatures}>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>High-speed WiFi & power backup</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Complimentary coffee & tea</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Flexible hourly & daily booking</span>
                </li>
              </ul>
              <Link href="/book/day-pass" className={styles.pathCta}>
                <span>Book a Desk</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className={styles.pathCardImage}>
              <Image
                src="/images/desk-booking.png"
                alt="Professional working at a modern coworking desk"
                width={360}
                height={420}
                className={styles.cardImg}
                priority
              />
            </div>
          </div>

          {/* Card 2: Book a Conference */}
          <div className={styles.pathCard}>
            <div className={styles.pathCardContent}>
              <div className={styles.pathCardIcon}>
                <Presentation size={22} />
              </div>
              <p className={styles.pathLabel}>I need a</p>
              <h2 className={styles.pathTitle}>Conference Room</h2>
              <p className={styles.pathDescription}>
                Book fully equipped meeting rooms for pitches, team syncs, or client presentations.
              </p>
              <ul className={styles.pathFeatures}>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Presentation screen & whiteboard</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Seats 4–16 people comfortably</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Hourly or full-day availability</span>
                </li>
              </ul>
              <Link href="/book/meeting-room" className={styles.pathCta}>
                <span>Book a Room</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className={styles.pathCardImage}>
              <Image
                src="/images/conference-booking.png"
                alt="Modern conference room with presentation setup"
                width={360}
                height={420}
                className={styles.cardImg}
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────── */}
      <section className={styles.trustStrip}>
        <div className={styles.trustInner}>
          <div className={styles.trustItem}>
            <Shield size={18} className={styles.trustIcon} />
            <span>Secure & Verified Listings</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <Clock size={18} className={styles.trustIcon} />
            <span>Instant QR Booking Confirmation</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <Wifi size={18} className={styles.trustIcon} />
            <span>High-Speed WiFi at All Locations</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <Coffee size={18} className={styles.trustIcon} />
            <span>Premium Amenities Included</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
