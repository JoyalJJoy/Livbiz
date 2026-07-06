import styles from './LocationMap.module.css';
import { Clock, MapPin, Phone, Mail, Navigation } from 'lucide-react';

export default function LocationMap() {
  return (
    <section className={styles.section} id="location" aria-label="Contact and Location">
      <div className={`container ${styles.container}`}>
        
        {/* ── Section Header (Apple Store Style) ──────────────── */}
        <div className={`${styles.header} animate-on-scroll`}>
          <p className={styles.kicker}>CONTACT</p>
          <h2>We'd love to meet you.</h2>
        </div>

        {/* ── Large Beautiful Map ────────────────────────────── */}
        <div 
          className={`${styles.mapWrapper} animate-on-scroll`}
          style={{ animationDelay: '0.1s' }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.9!2d77.65!3d13.04!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae19b175037319%3A0x6a8ac5d7839cf846!2sLivBiz%20Coworking%20%26%20Conference%20Hub!5e0!3m2!1sen!2sin!4v1"
            className={styles.mapEmbed}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="LivBiz Coworking location map"
          />
        </div>

        {/* ── Horizontal Divider Line ───────────────────────── */}
        <hr className={`${styles.divider} animate-on-scroll`} style={{ animationDelay: '0.15s' }} />

        {/* ── Info Columns Grid ─────────────────────────────── */}
        <div 
          className={`${styles.infoGrid} animate-on-scroll`}
          style={{ animationDelay: '0.2s' }}
        >
          {/* Address Column */}
          <div className={styles.infoCol}>
            <div className={styles.colHeader}>
              <MapPin size={18} className={styles.icon} />
              <h3>Address</h3>
            </div>
            <p>
              First Floor, Shakunthala Plaza-2,<br />
              K.Narayanapura, P O, Kothanur,<br />
              Bengaluru, Karnataka 560077
            </p>
            <a 
              href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.textLink}
            >
              Get Directions <Navigation size={12} style={{ marginLeft: '4px' }} />
            </a>
          </div>

          {/* Phone Column */}
          <div className={styles.infoCol}>
            <div className={styles.colHeader}>
              <Phone size={18} className={styles.icon} />
              <h3>Phone</h3>
            </div>
            <p>
              <a href="tel:8088631765" className={styles.contactLink}>8088 631 765</a><br />
              <a href="tel:8095797304" className={styles.contactLink}>8095 797 304</a>
            </p>
          </div>

          {/* Email Column */}
          <div className={styles.infoCol}>
            <div className={styles.colHeader}>
              <Mail size={18} className={styles.icon} />
              <h3>Email</h3>
            </div>
            <p>
              <a href="mailto:connect@livbizz.com" className={styles.contactLink}>connect@livbizz.com</a><br />
              <a href="mailto:info@livbizz.com" className={styles.contactLink}>info@livbizz.com</a>
            </p>
          </div>

          {/* Hours Column */}
          <div className={styles.infoCol}>
            <div className={styles.colHeader}>
              <Clock size={18} className={styles.icon} />
              <h3>Hours</h3>
            </div>
            <p>
              <strong>Mon – Sat:</strong><br />
              9:00 AM – 7:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
