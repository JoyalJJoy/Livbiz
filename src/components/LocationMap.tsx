import styles from './LocationMap.module.css';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function LocationMap() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>Visit Our Premium Campus</h2>
          <p>Located in the heart of Bengaluru's thriving business district.</p>
        </div>

        <div className={styles.mapGrid}>
          <div className={`${styles.infoCard} animate-on-scroll`}>
            <h3>LivBiz Coworking & Conference Hub</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <MapPin className={styles.icon} />
                <p>First Floor, Shakunthala Plaza-2, K.Narayanapura, P O, Kothanur, Bengaluru, Karnataka 560077</p>
              </div>
              <div className={styles.infoItem}>
                <Clock className={styles.icon} />
                <p>Open 24/7 for members. Reception: Mon-Fri, 9am - 6pm</p>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.icon} />
                <p>+91 (800) 123-4567</p>
              </div>
              <div className={styles.infoItem}>
                <Mail className={styles.icon} />
                <p>hello@livbiz.com</p>
              </div>
            </div>
            
            <a 
              href="https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <MagneticButton className={styles.directionsBtn} style={{ width: '100%' }}>
                Get Directions
              </MagneticButton>
            </a>
          </div>

          <div className={`${styles.mapWrapper} animate-on-scroll`} style={{ animationDelay: '0.2s' }}>
            <iframe 
              src="https://maps.google.com/maps?q=First+Floor,+LivBiz+Coworking+%26+Conference+Hub,+Shakunthala+Plaza-2,+K.Narayanapura,+P+O,+Kothanur,+Bengaluru,+Karnataka+560077&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.iframe}
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
