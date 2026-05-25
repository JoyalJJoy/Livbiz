import styles from './FeaturesGrid.module.css';
import { Network, Coffee, Monitor, KeyRound } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Network className={styles.icon} size={32} />,
      title: 'Enterprise Connectivity',
      description: 'Superfast, uninterrupted, secure Wi-Fi and hard-wired internet access for zero-lag virtual meetings.'
    },
    {
      icon: <Coffee className={styles.icon} size={32} />,
      title: 'Artisanal Brews',
      description: 'Fuel your day with complimentary gourmet coffee, herbal teas, and healthy snacks available all day.'
    },
    {
      icon: <Monitor className={styles.icon} size={32} />,
      title: 'Ergonomic Design',
      description: 'Work comfortably in thoughtfully designed spaces featuring Herman Miller chairs and sit-stand desks.'
    },
    {
      icon: <KeyRound className={styles.icon} size={32} />,
      title: 'Secure Access',
      description: 'Enjoy 24/7 access with state-of-the-art keyless entry systems and comprehensive security.'
    }
  ];

  return (
    <section id="features" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>
            The LivBiz Coworking & Conference Hub Edge
          </h2>
          <p>
            Elevate your work experience with meticulously designed environments, enterprise-grade amenities, and zero-compromise infrastructure.
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
