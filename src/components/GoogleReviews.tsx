import React from 'react';
import styles from './GoogleReviews.module.css';

const googleReviews = [
  {
    id: 1,
    author: 'Nisa Samuel',
    rating: 5,
    text: 'Needed a place to work for a few hours between meetings and came across LivBiz. The space was quiet, clean, and comfortable. The Wi-Fi worked well and I was able to finish my work without any interruptions. The owners were friendly too. Will definitely come back.',
    time: 'a month ago',
    initials: 'NS',
    bgColor: '#3f51b5',
  },
  {
    id: 2,
    author: 'Suraj Shettigar',
    rating: 5,
    text: 'LivBiz is a convenient co-working space with a professional setup. It’s a good place for small teams who need a quiet, productive environment with basic office facilities and a work-friendly atmosphere.',
    time: '2 months ago',
    initials: 'SS',
    bgColor: '#e91e63',
  },
  {
    id: 3,
    author: 'Nived P',
    rating: 5,
    text: 'Excellent Coworking space with a comfortable work environment,Fast internet and helpful staff.A great place to work and collaborate.Highly recommend.',
    time: '3 weeks ago',
    initials: 'NP',
    bgColor: '#009688',
  },
  {
    id: 4,
    author: 'Ramdas Cheruvanveettil',
    rating: 5,
    text: 'Very recently the management that i work for conducted a training session here, once reached i was very delighted to experience the training session just because of the ambience provided by LivBiz Coworking&Conference Hub unlike previous meeting spaces. I highly recommend this place who are in search of a meeting space. Thanks to my management for finding such a wonderful place to conduct training, which really helped me to scale my understanding.',
    time: 'a week ago',
    initials: 'RC',
    bgColor: '#ff9800',
  },
  {
    id: 5,
    author: 'Anthony Fernandes',
    rating: 5,
    text: 'Great business centre with good facilities and service for corporate meets and training programs.',
    time: '2 weeks ago',
    initials: 'AF',
    bgColor: '#4caf50',
  },
];

export default function GoogleReviews() {
  // Duplicate the reviews list to ensure a seamless loop in the marquee animation
  const duplicatedReviews = [...googleReviews, ...googleReviews];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <svg viewBox="0 0 24 24" className={styles.googleIcon}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Reviews Rating</span>
          </div>
          <h2>Loved by Our Community</h2>
          <div className={styles.ratingSummary}>
            <span className={styles.ratingVal}>4.9</span>
            <span className={styles.stars}>★★★★★</span>
            <span className={styles.count}>(Based on Google Map Reviews)</span>
          </div>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            {duplicatedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className={styles.reviewCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar} style={{ backgroundColor: review.bgColor }}>
                    {review.initials}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{review.author}</h4>
                    <span className={styles.time}>{review.time}</span>
                  </div>
                  <div className={styles.googleG}>G</div>
                </div>
                <div className={styles.starsRow}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className={styles.star}>★</span>
                  ))}
                </div>
                <p className={styles.reviewText}>{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
