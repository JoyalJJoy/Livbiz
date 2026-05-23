"use client";

import styles from './Hero.module.css';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import MagneticButton from './MagneticButton';

// Word-by-word reveal variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: -90 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 } 
  }
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 1, duration: 0.8, ease: "easeOut" }
  }
};

export default function Hero() {
  const titleWords = "India's Largest Coworking Space".split(" ");

  return (
    <section className={styles.hero}>
      <div className={styles.bgImageContainer}>
        <motion.div
          initial={{ scale: 1.1, filter: 'blur(10px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
          <Image 
            src="/images/hero-bg.png" 
            alt="Premium Coworking Space" 
            fill
            priority
            className={styles.bgImage}
          />
        </motion.div>
        <div className={styles.overlay}></div>
      </div>
      
      <div className={`container ${styles.content}`}>
        <motion.div 
          className={styles.titleContainer}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className={styles.title}>
            {titleWords.map((word, index) => (
              <span key={index} style={{ display: 'inline-block', marginRight: '0.2em', perspective: '1000px' }}>
                <motion.span 
                  style={{ display: 'inline-block', transformOrigin: 'bottom' }}
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p 
            className={styles.subtitle}
            variants={subtitleVariants}
          >
            More space for focus. Premium spaces for professionals.
          </motion.p>
        </motion.div>

        <motion.div 
          className={`glass ${styles.searchBar}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
        >
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search for locations..." 
            className={styles.searchInput}
          />
          <MagneticButton 
            className={styles.searchButton}
          >
            Search
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
