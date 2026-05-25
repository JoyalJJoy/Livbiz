import styles from './StatsBanner.module.css';
import Image from 'next/image';

const campuses = [
  { id: 1, name: 'Lavelle Road', image: '/images/campus-lavelle.jpg', tag: 'Premium' },
  { id: 2, name: 'Museum Road', image: '/images/campus-museum.jpg', tag: 'Elite' },
  { id: 3, name: 'Whitefield', image: '/images/campus-whitefield.jpg', tag: 'Corporate' },
];

export default function StatsBanner() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.statsContainer}`}>
        <h2 className={styles.statsHeading}>45,000+ Happy Members</h2>
        <p className={styles.statsSubheading}>Commercial Spaces. Workspaces. Unmatched Business Environment.</p>
      </div>

      <div className={`container ${styles.campusesContainer}`}>
        <div className={styles.campusesHeader}>
          <h2>Our Iconic Campuses</h2>
          <p>Curated spaces designed to inspire and elevate your daily workflow.</p>
        </div>

        <div className={styles.grid}>
          {campuses.map((campus, index) => (
            <div 
              key={campus.id} 
              className={`${styles.card} animate-on-scroll`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.imageWrapper}>
                <Image 
                  src={campus.image} 
                  alt={campus.name} 
                  fill 
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className={styles.image}
                />
                <div className={styles.tag}>{campus.tag}</div>
                <div className={styles.cardOverlay}>
                  <h3 className={styles.cardTitle}>{campus.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
