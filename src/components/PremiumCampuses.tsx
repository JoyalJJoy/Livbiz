import styles from './PremiumCampuses.module.css';
import Image from 'next/image';
import { MapPin, Wifi, Coffee, Shield } from 'lucide-react';
import Link from 'next/link';

const campuses = [
  {
    id: 'lavelle',
    name: 'Lavelle Road Campus',
    status: 'Available',
    description: 'A highly sought-after, premium workspace offering unmatched connectivity and prestige for elite professional teams.',
    price: '15,000',
    image: '/images/campus-lavelle.png',
    mapUrl: 'https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac',
  },
  {
    id: 'museum',
    name: 'Museum Road Campus',
    status: 'Available',
    description: 'Bespoke spaces designed for modern businesses, combining classic elegance with cutting-edge amenities.',
    price: '12,500',
    image: '/images/campus-museum.png',
    mapUrl: 'https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac',
  },
  {
    id: 'whitefield',
    name: 'Premium Whitefield',
    status: 'Waitlist',
    description: 'An expansive, enterprise-grade facility ideal for large corporate headquarters and growing teams.',
    price: '18,000',
    image: '/images/campus-whitefield.png',
    mapUrl: 'https://maps.app.goo.gl/w8bGnBx2sFJgYsvs9?g_st=ac',
  }
];

export default function PremiumCampuses() {
  return (
    <section id="campuses" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>Premium Campuses</h2>
          <p>Discover workspaces designed for focus, collaboration, and unparalleled professional growth.</p>
        </div>

        <div className={styles.list}>
          {campuses.map((campus, index) => (
            <div key={campus.id} className={`${styles.card} animate-on-scroll`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.imageCol}>
                <Image src={campus.image} alt={campus.name} fill className={styles.image} />
              </div>
              <div className={styles.contentCol}>
                <div className={styles.cardHeader}>
                  <h3>{campus.name}</h3>
                  <span className={`${styles.status} ${campus.status === 'Waitlist' ? styles.waitlist : ''}`}>
                    {campus.status}
                  </span>
                </div>
                <p className={styles.description}>{campus.description}</p>
                <div className={styles.amenities}>
                  <Wifi size={20} />
                  <Coffee size={20} />
                  <Shield size={20} />
                </div>
                <div className={styles.footer}>
                  <div className={styles.pricing}>
                    <span className={styles.priceLabel}>Starting from</span>
                    <span className={styles.priceValue}>₹{campus.price}</span>
                    <span className={styles.priceUnit}>/mo</span>
                  </div>
                  <div className={styles.actions}>
                    <Link href={campus.mapUrl} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                      <MapPin size={18} /> View on Map
                    </Link>
                    <button className={styles.enquireBtn}>Enquire</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
