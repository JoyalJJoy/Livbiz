import styles from './Hero.module.css';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgImageContainer}>
        <Image 
          src="/images/hero-bg.png" 
          alt="Premium Coworking Space" 
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.overlay}></div>
      </div>
      
      <div className={`container ${styles.content}`}>
        <div className="animate-on-scroll">
          <h1 className={styles.title}>India's Largest<br/>Coworking Space</h1>
          <p className={styles.subtitle}>More space for focus. Premium spaces for professionals.</p>
        </div>

        <div className={`glass ${styles.searchBar} animate-scale-on-scroll`}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search for locations..." 
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>Search</button>
        </div>
      </div>
    </section>
  );
}
