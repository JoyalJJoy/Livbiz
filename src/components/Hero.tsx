import styles from './Hero.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>LivBiz Coworking</p>
          <h1>Where Professionals Work Better</h1>
          <p className={styles.serviceLine}>Private Office</p>
          <p className={styles.subtitle}>
            Flexible coworking spaces designed for focus, collaboration and growth at one thoughtfully managed campus.
          </p>
          <Link href="/book" className={styles.bookingButton}>
            Online Booking <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 620 430" role="img">
            <path className={styles.shadow} d="M174 358c61 40 195 42 292 2 24-10 24-25-1-33-71-23-226-21-298 3-31 10-27 16 7 28Z" />
            <path className={styles.rocketWingBack} d="M140 225c-31 14-60 39-81 71-7 11 5 24 17 18 39-19 77-45 114-78l-50-11Z" />
            <path className={styles.rocketWing} d="M187 287c-27 28-53 61-75 97-7 12 5 25 18 18 43-24 81-57 113-96l-56-19Z" />
            <path className={styles.flame} d="M121 247c-36 8-58 28-76 59 33-9 62-20 89-37l-13-22Z" />
            <path className={styles.flameCore} d="M145 253c-25 9-40 24-51 46 26-5 47-13 67-28l-16-18Z" />
            <path className={styles.rocketBody} d="M158 204c99-84 203-116 311-95 21 4 31 29 18 46-69 92-168 139-299 139-33 0-53-51-30-90Z" />
            <path className={styles.rocketTop} d="M158 204c40-34 81-59 122-76l73 143c-48 16-103 23-165 23-33 0-53-51-30-90Z" />
            <path className={styles.rocketStripe} d="M144 236c87-61 182-101 285-119" />
            <path className={styles.windowOuter} d="M375 94c46-2 84 30 88 77 3 40-23 76-62 85-53-25-81-85-26-162Z" />
            <path className={styles.windowInner} d="M402 117c27 2 50 23 53 52 3 26-11 50-34 62-45-20-57-76-19-114Z" />
            <path className={styles.star} d="M505 76l10-19 7 20 20 9-20 7-9 19-7-20-20-9 19-7Z" />
            <path className={styles.personCape} d="M414 276c-51 36-117 42-179 12 21-36 58-59 112-71l67 59Z" />
            <path className={styles.personBody} d="M398 201c51 18 83 55 95 112 5 25-15 47-40 43-65-11-104-54-117-129l62-26Z" />
            <path className={styles.personArm} d="M468 199l127-34c23-6 42 18 29 39-6 9-15 15-26 15l-126 15-4-35Z" />
            <path className={styles.personSleeve} d="M459 198l57-16 9 43-58 7-8-34Z" />
            <path className={styles.personHead} d="M434 114c38-5 70 22 73 59 3 36-24 68-60 71-38 3-68-24-70-61-2-35 22-64 57-69Z" />
            <path className={styles.hair} d="M387 133c18-45 90-54 123-17 12 14 6 36-13 43-30 11-65 15-104 12-15-1-21-22-6-38Z" />
            <path className={styles.faceDetail} d="M452 174c2-7 11-7 13 0" />
            <path className={styles.smile} d="M475 197c10 8 23 6 31-4" />
            <path className={styles.fist} d="M598 160c23-3 40 16 35 38-4 18-20 30-38 27-17-3-29-18-28-35 0-15 12-28 31-30Z" />
          </svg>
        </div>
      </div>

      <svg className={styles.wave} viewBox="0 0 1440 88" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50C276 78 511 78 814 54C1047 36 1203 19 1440 4V88H0V50Z" />
      </svg>
    </section>
  );
}
