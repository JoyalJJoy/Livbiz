import styles from './BookCtaBanner.module.css';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BookCtaBanner() {
  return (
    <section id="booking" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.textContent}>
          <h2>Book Your Workspace Online</h2>
          <p>
            Reserve your <strong>day pass or meeting room in seconds</strong> through our online booking system. Check availability, choose your slot, and confirm instantly.
          </p>
        </div>
        <div className={styles.actionContent}>
          <Link href="/book" className={styles.ctaBtn}>
            Go to Online Booking <ArrowRight size={22} />
          </Link>
        </div>
      </div>
    </section>
  );
}
