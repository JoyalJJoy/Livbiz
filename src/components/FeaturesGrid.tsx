"use client";

import styles from './FeaturesGrid.module.css';
import { Network, Coffee, Monitor, KeyRound } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 40, 
      damping: 15,
      mass: 1
    }
  }
};

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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            The LivBiz Coworking & Conference Hub Edge
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Elevate your work experience with meticulously designed environments, enterprise-grade amenities, and zero-compromise infrastructure.
          </motion.p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className={styles.card}
              variants={cardVariants}
            >
              <div className={styles.iconWrapper}>
                {feature.icon}
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.description}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
