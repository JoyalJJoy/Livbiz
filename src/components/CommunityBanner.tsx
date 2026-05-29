import styles from './CommunityBanner.module.css';

export default function CommunityBanner() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>The LivBizz Coworking & Conference Hub Community</h2>
          <p>Immerse yourself in a diverse global network of innovators, creators, and enterprise leaders shaping the future of work.</p>
        </div>
        
        <div className={styles.statsRow}>
          <div className={`${styles.statItem} animate-on-scroll`}>
            <h3>500+</h3>
            <p>Global Locations</p>
          </div>
          <div className={`${styles.statItem} animate-on-scroll`} style={{ animationDelay: '0.1s' }}>
            <h3>50k+</h3>
            <p>Active Members</p>
          </div>
          <div className={`${styles.statItem} animate-on-scroll`} style={{ animationDelay: '0.2s' }}>
            <h3>120</h3>
            <p>Fortune 500 Clients</p>
          </div>
        </div>
      </div>
    </section>
  );
}
