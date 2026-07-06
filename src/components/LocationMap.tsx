import styles from './LocationMap.module.css';
import { Clock, MapPin, Phone, Navigation } from 'lucide-react';

export default function LocationMap() {
  return (
    <section className={styles.section} aria-label="Location and contact information">
      <div className={`container ${styles.container}`}>

        {/* Header */}
        <div className={styles.header}>
          <p className={styles.kicker}>Find Us</p>
          <h2>How to Find LivBiz Coworking</h2>
          <p>Located at Shakunthala Plaza-2, Kothanur, Bengaluru — easy to reach and ready for your next workday.</p>
        </div>

        <div className={styles.mapGrid}>
          {/* Info Card */}
          <div className={`${styles.infoCard} animate-on-scroll`}>
            <h3>LivBiz Coworking &amp; Conference Hub</h3>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <MapPin className={styles.icon} size={16} aria-hidden="true" />
                </div>
                <p>First Floor, Shakunthala Plaza-2, K.Narayanapura, P O, Kothanur, Bengaluru, Karnataka 560077</p>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <Clock className={styles.icon} size={16} aria-hidden="true" />
                </div>
                <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <Phone className={styles.icon} size={16} aria-hidden="true" />
                </div>
                <div>
                  <p><a href="tel:8088631765" className={styles.contactLink}>8088 631 765</a></p>
                  <p><a href="tel:8095797304" className={styles.contactLink}>8095 797 304</a></p>
                </div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directionsBtn}
            >
              <Navigation size={16} aria-hidden="true" />
              Get Directions
            </a>
          </div>

          {/* Map */}
          <div
            className={`${styles.mapWrapper} animate-on-scroll`}
            style={{ animationDelay: '0.15s' }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.9!2d77.65!3d13.04!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae19b175037319%3A0x6a8ac5d7839cf846!2sLivBiz%20Coworking%20%26%20Conference%20Hub!5e0!3m2!1sen!2sin!4v1"
              className={styles.mapEmbed}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LivBiz Coworking &amp; Conference Hub location on Google Maps"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
