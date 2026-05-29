import styles from './PremiumCampuses.module.css';
import Image from 'next/image';
import { ArrowRight, Coffee, Shield, Wifi } from 'lucide-react';
import Link from 'next/link';

export default function PremiumCampuses() {
  return (
    <section id="workspace" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <p className={styles.kicker}>Single campus</p>
          <h2>One Workspace, Ready for the Way You Work</h2>
          <p>One focused LivBizz location for day passes, meetings, client conversations and productive daily work.</p>
        </div>

        <div className={`${styles.card} animate-on-scroll`}>
          <div className={styles.imageCol}>
            <Image
              src="/images/hero-bg.jpg"
              alt="LivBizz workspace interior"
              fill
              sizes="(max-width: 899px) 100vw, 48vw"
              className={styles.image}
            />
          </div>
          <div className={styles.contentCol}>
            <div className={styles.cardHeader}>
              <h3>LivBizz Coworking & Conference Hub</h3>
              <span className={styles.status}>Available</span>
            </div>
            <p className={styles.description}>
              A focused workspace for daily work, meetings, client conversations and team sessions, with bookings handled online from the first visit.
            </p>
            <div className={styles.amenities}>
              <div className={styles.amenityBadge}>
                <Wifi size={16} /> Fast Wi-Fi
              </div>
              <div className={styles.amenityBadge}>
                <Coffee size={16} /> Lounge
              </div>
              <div className={styles.amenityBadge}>
                <Shield size={16} /> Managed access
              </div>
            </div>
            <div className={styles.footer}>
              <div className={styles.pricing}>
                <span className={styles.priceLabel}>Book online</span>
                <span className={styles.priceValue}>Day Pass</span>
                <span className={styles.priceUnit}>or meeting room</span>
              </div>
              <Link href="/book" className={styles.enquireBtn}>
                Enquire Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
