import styles from './LocationMap.module.css';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export default function LocationMap() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <p className={styles.kicker}>The directions to reach us</p>
          <h2>How to Find LivBiz Coworking</h2>
          <p>Campus address, work hours and direct contact information will sit here once finalized.</p>
        </div>

        <div className={styles.mapGrid}>
          <div className={`${styles.infoCard} animate-on-scroll`}>
            <h3>LivBiz Coworking & Conference Hub</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <MapPin className={styles.icon} />
                <p>Campus address to be updated</p>
              </div>
              <div className={styles.infoItem}>
                <Clock className={styles.icon} />
                <p>Work hours to be updated</p>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.icon} />
                <p>Phone number to be updated</p>
              </div>
              <div className={styles.infoItem}>
                <Mail className={styles.icon} />
                <p>Email address to be updated</p>
              </div>
            </div>
            
            <a href="#booking" className={styles.directionsBtn}>Book Workspace</a>
          </div>

          <div className={`${styles.mapWrapper} animate-on-scroll`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.mapPlaceholder}>
              <span>LivBiz</span>
              <strong>Campus map coming soon</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
