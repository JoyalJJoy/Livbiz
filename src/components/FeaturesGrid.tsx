import styles from './FeaturesGrid.module.css';
import { BriefcaseBusiness, Coffee, Monitor, ShieldCheck } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <BriefcaseBusiness className={styles.icon} size={30} />,
      title: 'Flexible Membership Plans',
      description: 'Choose simple day passes, meeting room slots, or longer workspace arrangements as your routine grows.'
    },
    {
      icon: <Monitor className={styles.icon} size={30} />,
      title: 'Professional Environment',
      description: 'A quiet, well-managed workspace designed for focus, client calls, planning sessions, and deep work.'
    },
    {
      icon: <Coffee className={styles.icon} size={30} />,
      title: 'Supportive Community',
      description: 'Work alongside founders, independent professionals, and teams without losing the calm of a dedicated office.'
    },
    {
      icon: <ShieldCheck className={styles.icon} size={30} />,
      title: 'All-Inclusive Amenities',
      description: 'Internet, power backup, meeting rooms, lounge areas, housekeeping, and the essentials that keep work moving.'
    }
  ];

  return (
    <section id="features" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <p className={styles.kicker}>Why LivBiz</p>
          <h2>
            Designed for Focus.<br />Built for Growth.
          </h2>
          <p>
            Flexible workspaces, meeting rooms and premium amenities designed to help freelancers, startups, and teams do their best work.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div
              key={index} 
              className={`${styles.card} animate-on-scroll`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className={styles.iconWrapper}>
                {feature.icon}
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
