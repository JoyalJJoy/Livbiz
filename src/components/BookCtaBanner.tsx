import styles from './BookCtaBanner.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Monitor, Presentation, ArrowRight, Wifi, Coffee, Shield } from 'lucide-react';
import { LIVBIZ_BOOKING_ROUTES } from '@/lib/propexcel-links';

export default function BookCtaBanner() {
  return (
    <section id="booking" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>Instant Reservation</p>
          <h2 className={styles.heading}>Book Your Space Online</h2>
          <p className={styles.subtitle}>
            Reserve your hot desk or private conference room in seconds. Check real-time seat availability, pick your slot, and confirm instantly.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {/* Card 1: Book a Desk */}
          <div className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/images/workspace-open-2.png" 
                alt="Book a Desk" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.cardImage}
                priority
              />
              <span className={`${styles.badge} ${styles.badgeGreen}`}>DAY PASS</span>
            </div>
            
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Hot Desk</h3>
              <p className={styles.cardDescription}>
                Perfect for freelancers, remote professionals, and students needing a premium high-productivity single desk.
              </p>
              
              <ul className={styles.featuresList}>
                <li>
                  <span className={styles.featureIcon}><Wifi size={16} /></span>
                  <span>High-speed WiFi (100+ Mbps)</span>
                </li>
                <li>
                  <span className={styles.featureIcon}><Coffee size={16} /></span>
                  <span>Unlimited Coffee & Water</span>
                </li>
                <li>
                  <span className={styles.featureIcon}><Shield size={16} /></span>
                  <span>Premium Ergonomic Seating</span>
                </li>
              </ul>
              
              <Link href={LIVBIZ_BOOKING_ROUTES.spaces} className={styles.ctaButton}>
                Book a Desk <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Card 2: Book a Conference */}
          <div className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/images/meeting-room-3.png" 
                alt="Book a Conference Room" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.cardImage}
                priority
              />
              <span className={`${styles.badge} ${styles.badgeBlue}`}>MEETING ROOM</span>
            </div>
            
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Conference Room</h3>
              <p className={styles.cardDescription}>
                Fully equipped private collaborative rooms for team sprint syncs, presentations, interviews, and client meetings.
              </p>
              
              <ul className={styles.featuresList}>
                <li>
                  <span className={styles.featureIcon}><Presentation size={16} /></span>
                  <span>Large Presentation Screen</span>
                </li>
                <li>
                  <span className={styles.featureIcon}><Monitor size={16} /></span>
                  <span>Ergonomic Seating for up to 10</span>
                </li>
                <li>
                  <span className={styles.featureIcon}><ArrowRight size={16} /></span>
                  <span>Hourly & Half-Day Bookings</span>
                </li>
              </ul>
              
              <Link href={LIVBIZ_BOOKING_ROUTES.amenities} className={styles.ctaButton}>
                Book a Room <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
