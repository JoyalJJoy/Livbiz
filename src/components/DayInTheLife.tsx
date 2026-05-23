import styles from './DayInTheLife.module.css';
import { Sun, Users, Flame } from 'lucide-react';

export default function DayInTheLife() {
  const steps = [
    {
      icon: <Sun size={24} />,
      title: 'Morning Concept',
      description: 'Start your day with focus. Enjoy freshly brewed artisanal coffee while knocking out your most important tasks in our quiet zones.'
    },
    {
      icon: <Users size={24} />,
      title: 'Afternoon Synergy',
      description: 'Transition into collaborative work. Book a state-of-the-art meeting room to brainstorm with your team or meet clients.'
    },
    {
      icon: <Flame size={24} />,
      title: 'Evening Connections',
      description: 'Wind down and network. Join exclusive community events, exchange ideas over a drink, and connect with fellow founders.'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>A Day in the Life</h2>
          <p>Discover how our spaces are choreographed to support your rhythm, from morning inspiration to evening networking.</p>
        </div>

        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <div key={index} className={`${styles.step} animate-on-scroll`} style={{ animationDelay: `${index * 0.2}s` }}>
              <div className={styles.iconBox}>
                {step.icon}
              </div>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.description}>{step.description}</p>
              {index < steps.length - 1 && <div className={styles.connector}></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
