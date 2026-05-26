import styles from './DayInTheLife.module.css';
import Image from 'next/image';

const steps = [
  {
    id: 1,
    time: 'Easy Booking',
    title: 'Find a Time That Works for You',
    description: 'Browse available day passes and meeting rooms, select your slot, and secure your workspace in a few clicks.',
    image: '/images/morning_concept.jpg'
  },
  {
    id: 2,
    time: 'Arrive Ready',
    title: 'Walk Into a Focused Setup',
    description: 'Use the space for client calls, planning, desk work or team discussions without spending the day arranging basics.',
    image: '/images/afternoon_synergy.jpg'
  },
  {
    id: 3,
    time: 'Grow Steady',
    title: 'Scale Your Work Rhythm',
    description: 'Keep the flexibility of booking when needed, then move toward a more regular setup as your work expands.',
    image: '/images/evening_connections.jpg'
  }
];

export default function DayInTheLife() {
  return (
    <section id="experience" className={styles.section}>
      <div className={styles.header}>
        <h2>
          Get Your Office Up and Running in Minutes
        </h2>
        <p>
          Fully furnished, simple to book, and built to keep your workday moving without unnecessary setup.
        </p>
      </div>

      <div className={`container ${styles.scrollyContainer}`}>
        <div className={styles.stickyCol}>
          <div className={styles.imageContainer}>
            {steps.map((step, index) => (
              <div key={step.id} className={`${styles.imageWrapper} ${index === 0 ? styles.featuredImage : ''}`}>
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes={index === 0 ? "(max-width: 899px) 100vw, 48vw" : "(max-width: 899px) 50vw, 24vw"}
                  className={styles.image}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contentCol}>
          {steps.map((step) => (
            <div key={step.id} className={styles.stepContent}>
              <span className={styles.timeLabel}>{step.time}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
