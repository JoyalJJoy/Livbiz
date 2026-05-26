import styles from './page.module.css';
import Link from 'next/link';
import { Monitor, Wifi, Coffee, Zap, Presentation, ChevronLeft, Clock, Shield, Users, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WorkspaceLottie from '@/components/WorkspaceLottie';

export default function BookPage() {
  return (
    <main className={styles.main}>
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className={styles.heroBanner}>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.heroEyebrow}>Online Booking</p>
          <h1>Find Your Perfect Workspace</h1>
          <p className={styles.heroSubtitle}>
            Flexible day passes and fully equipped meeting rooms — book in seconds, show up ready to work.
          </p>
        </div>
        <svg className={styles.wave} viewBox="0 0 1440 88" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 50C276 78 511 78 814 54C1047 36 1203 19 1440 4V88H0V50Z" />
        </svg>
      </section>

      {/* ── Content Section ─────────────────────────────── */}
      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.backLink}>
            <Link href="/" className={styles.backBtn}>
              <ChevronLeft size={18} /> Back to Home
            </Link>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.cardsCol}>
              {/* Day Pass Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <div className={styles.iconWrapper}>
                      <Monitor size={22} />
                    </div>
                    <h3>Day Pass</h3>
                  </div>
                  <div className={styles.price}>₹200 Onwards</div>
                </div>
                <p className={styles.description}>
                  Flexible workspace access, perfect for individuals and freelancers. Get a desk for the day with full access to all amenities.
                </p>
                <div className={styles.cardFooter}>
                  <div className={styles.amenities}>
                    <div className={styles.amenity} title="High-Speed WiFi"><Wifi size={15} /></div>
                    <div className={styles.amenity} title="Air Conditioning"><Monitor size={15} /></div>
                    <div className={styles.amenity} title="Power Backup"><Zap size={15} /></div>
                    <div className={styles.amenity} title="Coffee & Tea"><Coffee size={15} /></div>
                  </div>
                  <Link href="/book/day-pass" className={styles.bookBtn}>
                    Book a Desk
                  </Link>
                </div>
              </div>

              {/* Meeting Room Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <div className={styles.iconWrapper}>
                      <Presentation size={22} />
                    </div>
                    <h3>Meeting Rooms</h3>
                  </div>
                  <div className={styles.price}>₹250/hr Onwards</div>
                </div>
                <p className={styles.description}>
                  Fully equipped rooms for pitches, team syncs, or client presentations. Available by the hour or full day.
                </p>
                <div className={styles.cardFooter}>
                  <div className={styles.amenities}>
                    <div className={styles.amenity} title="High-Speed WiFi"><Wifi size={15} /></div>
                    <div className={styles.amenity} title="Air Conditioning"><Monitor size={15} /></div>
                    <div className={styles.amenity} title="Power Backup"><Zap size={15} /></div>
                    <div className={styles.amenity} title="Coffee & Tea"><Coffee size={15} /></div>
                  </div>
                  <Link href="/book/meeting-room" className={styles.bookBtn}>
                    Book a Room
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.imageCol}>
              <div className={styles.illustration}>
                <WorkspaceLottie />
              </div>
              <div className={styles.imageColText}>
                <h2>Workspace That Works for You</h2>
                <p>Premium amenities, reliable connectivity, and a professional environment — all under one roof.</p>
              </div>
            </div>
          </div>

          {/* ── Features Strip ─────────────────────────── */}
          <div className={styles.featuresStrip}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Clock size={20} /></div>
              <span>Instant Booking</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Shield size={20} /></div>
              <span>Secure Payment</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Users size={20} /></div>
              <span>Flexible Capacity</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Sparkles size={20} /></div>
              <span>Premium Amenities</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
