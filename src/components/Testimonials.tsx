import styles from './Testimonials.module.css';
import Image from 'next/image';

export default function Testimonials() {
  return (
    <section id="stories" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>Client Stories</h2>
          <p>Hear from the teams and organizations thriving at LivBiz.</p>
        </div>

        <div className={`${styles.featuredCard} animate-on-scroll`}>
          <div className={styles.featuredImageWrapper}>
            <Image
              src="/images/conference-training.png"
              alt="Ivy Living team training session at LivBiz"
              fill
              sizes="(max-width: 899px) 100vw, 42vw"
              className={styles.featuredImage}
            />
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.quoteIconLarge}>&ldquo;</div>
            <h3 className={styles.featuredQuote}>
              &ldquo;LivBiz has become our preferred venue for team trainings.&rdquo;
            </h3>
            <p className={styles.featuredText}>
              &ldquo;We recently conducted a training program for our team at LivBiz, and the experience exceeded our expectations. The workspace was professional, well-maintained, and provided the perfect environment for productive learning and collaboration. The meeting facilities, comfortable seating, reliable internet, and supportive staff ensured that our session ran smoothly from start to finish. We appreciate the attention to detail and the welcoming atmosphere. LivBiz has become our preferred venue for team trainings and professional gatherings, and we highly recommend it to other organizations looking for a quality workspace.&rdquo;
            </p>
            <div className={styles.featuredAuthor}>
              <h4>Team Ivy Living</h4>
              <p>Training Partner</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
