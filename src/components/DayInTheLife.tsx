"use client";

import styles from './DayInTheLife.module.css';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const steps = [
  {
    id: 1,
    time: 'Morning',
    title: 'Morning Concept',
    description: 'Start your day with focus. Enjoy freshly brewed artisanal coffee while knocking out your most important tasks in our quiet zones.',
    image: '/images/morning_concept.png'
  },
  {
    id: 2,
    time: 'Afternoon',
    title: 'Afternoon Synergy',
    description: 'Transition into collaborative work. Book a state-of-the-art meeting room to brainstorm with your team or meet clients.',
    image: '/images/afternoon_synergy.png'
  },
  {
    id: 3,
    time: 'Evening',
    title: 'Evening Connections',
    description: 'Wind down and network. Join exclusive community events, exchange ideas over a drink, and connect with fellow founders.',
    image: '/images/evening_connections.png'
  }
];

export default function DayInTheLife() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section id="experience" className={styles.section} ref={containerRef}>
      <div className={styles.header}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          A Day in the Life
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Experience how our spaces are choreographed to support your rhythm, from morning inspiration to evening networking.
        </motion.p>
      </div>

      <div className={`container ${styles.scrollyContainer}`}>
        {/* Left Side: Sticky Image Gallery */}
        <div className={styles.stickyCol}>
          <div className={styles.imageContainer}>
            {steps.map((step, index) => {
              // Calculate opacity ranges based on index.
              // Roughly: step 0 -> 0 to 0.33, step 1 -> 0.33 to 0.66, step 2 -> 0.66 to 1.0
              const start = index === 0 ? 0 : (index - 0.2) / steps.length;
              const middle = (index + 0.5) / steps.length;
              const end = index === steps.length - 1 ? 1 : (index + 1.2) / steps.length;
              
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const opacity = useTransform(
                scrollYProgress,
                [start, middle, end],
                [index === 0 ? 1 : 0, 1, index === steps.length - 1 ? 1 : 0]
              );
              
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const scale = useTransform(
                scrollYProgress,
                [start, end],
                [1.05, 1]
              );

              return (
                <motion.div key={step.id} style={{ opacity }} className={styles.imageWrapper}>
                  <motion.div style={{ scale, width: '100%', height: '100%' }}>
                    <Image 
                      src={step.image} 
                      alt={step.title} 
                      fill 
                      className={styles.image} 
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Scroll Content */}
        <div className={styles.contentCol}>
          {steps.map((step, index) => (
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
