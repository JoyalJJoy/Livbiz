import styles from './DayInTheLife.module.css';
import Image from 'next/image';

const steps = [
  {
    id: 1,
    time: 'Morning',
    title: 'Morning Concept',
    description: 'Start your day with focus. Enjoy freshly brewed artisanal coffee while knocking out your most important tasks in our quiet zones.',
    image: '/images/morning_concept.jpg'
  },
  {
    id: 2,
    time: 'Afternoon',
    title: 'Afternoon Synergy',
    description: 'Transition into collaborative work. Book a state-of-the-art meeting room to brainstorm with your team or meet clients.',
    image: '/images/afternoon_synergy.jpg'
  },
  {
    id: 3,
    time: 'Evening',
    title: 'Evening Connections',
    description: 'Wind down and network. Join exclusive community events, exchange ideas over a drink, and connect with fellow founders.',
    image: '/images/evening_connections.jpg'
  }
];

export default function DayInTheLife() {
  return (
    <section id="experience" className={styles.section}>
      <div className={styles.header}>
        <h2>
          A Day in the Life
        </h2>
        <p>
          Experience how our spaces are choreographed to support your rhythm, from morning inspiration to evening networking.
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
