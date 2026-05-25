import styles from './Hero.module.css';
import Image from 'next/image';
import { Search } from 'lucide-react';
import heroBg from '../../public/images/hero-bg.jpg';

export default function Hero() {
  const titleWords = "India's Largest Coworking Space".split(" ");

  return (
    <section className={styles.hero}>
      <div className={styles.bgImageContainer}>
        <Image
          src={heroBg}
          alt="Premium coworking space with city views"
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className={styles.bgImage}
        />
        <div className={styles.overlay}></div>
      </div>
      
      <div className={`container ${styles.content}`}>
        <div className={styles.titleContainer}>
          <p className={styles.eyebrow}>Bengaluru workspaces</p>
          <h1 className={styles.title}>
            {titleWords.map((word, index) => (
              <span
                key={index}
                className={styles.titleWord}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className={styles.subtitle}>
            More space for focus. Premium spaces for professionals.
          </p>
        </div>

        <form className={styles.searchBar} action="#campuses">
          <label className={styles.srOnly} htmlFor="location-search">Search locations</label>
          <Search className={styles.searchIcon} size={20} />
          <input 
            id="location-search"
            type="text" 
            placeholder="Search for locations..." 
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
