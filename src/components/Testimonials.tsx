import styles from './Testimonials.module.css';
import Image from 'next/image';

export default function Testimonials() {
  return (
    <section id="stories" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>Client Stories</h2>
          <p>Hear from the visionary leaders, entrepreneurs, and teams thriving at LivBiz.</p>
        </div>

        <div className={styles.gridTop}>
          <div className={`${styles.card} animate-on-scroll`}>
            <div className={styles.imageWrapper}>
              <Image src="/images/testimonial-woman.png" alt="Client Story" fill className={styles.image} />
            </div>
            <div className={styles.content}>
              <div className={styles.quoteIcon}>&ldquo;</div>
              <p className={styles.quote}>
                "LivBiz Coworking & Conference Hub provided the most sophisticated environment for growing our tech startup. The premium amenities and vibrant community allowed us to focus completely on our work while networking with like-minded individuals."
              </p>
              <div className={styles.author}>
                <h4>Sarah Jenkins</h4>
                <p>Founder, TechFlow AI</p>
              </div>
            </div>
          </div>

          <div className={`${styles.card} animate-on-scroll`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.imageWrapper}>
              <Image src="/images/testimonial-man.png" alt="Client Story" fill className={styles.image} />
            </div>
            <div className={styles.content}>
              <div className={styles.quoteIcon}>&ldquo;</div>
              <p className={styles.quote}>
                "Moving to LivBiz was a strategic decision for us. We needed a space that reflects our brand's premium value, and the Lavelle Road campus exceeded our expectations. The staff is exceptional and the workspace is truly world-class."
              </p>
              <div className={styles.author}>
                <h4>David Chen</h4>
                <p>CEO, Nexus Consulting</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.featuredCard} animate-on-scroll`} style={{ animationDelay: '0.4s' }}>
          <div className={styles.featuredImageWrapper}>
            <Image src="/images/featured-testimonial-man.png" alt="Featured Client" fill className={styles.featuredImage} />
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.quoteIconLarge}>&ldquo;</div>
            <h3 className={styles.featuredQuote}>
              "A space that reflects the standard of my work."
            </h3>
            <p className={styles.featuredText}>
              "LivBiz Coworking Hub isn't just about desks; it's about an atmosphere that promotes success. Every detail is perfect, making it a true environment for excellence."
            </p>
            <div className={styles.featuredAuthor}>
              <h4>Michael Sterling</h4>
              <p>Senior Partner, Sterling & Associates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
