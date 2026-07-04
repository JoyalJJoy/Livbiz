import styles from './PremiumCampuses.module.css';
import Image from 'next/image';

const workspaceCategories = [
  {
    id: 'open-workstations',
    label: 'Open Workstations',
    description: 'Flexible hot desks in a bright, open-plan layout with ergonomic seating and natural light.',
    images: [
      { src: '/images/workspace-open-1.png', alt: 'LivBiz open workstation area with multiple desks' },
      { src: '/images/workspace-open-2.png', alt: 'LivBiz open workstation with privacy dividers' },
    ],
  },
  {
    id: 'meeting-rooms',
    label: 'Meeting Rooms',
    description: 'Private meeting rooms equipped with presentation screens, AC, and comfortable seating for up to 6.',
    images: [
      { src: '/images/meeting-room-1.png', alt: 'LivBiz meeting room with 6 seats and display screen' },
      { src: '/images/meeting-room-2.png', alt: 'LivBiz meeting room with warm ambient lighting' },
      { src: '/images/meeting-room-3.png', alt: 'LivBiz conference table close-up with branded display' },
    ],
  },
  {
    id: 'conference-rooms',
    label: 'Conference Rooms',
    description: 'Spacious conference rooms with glass walls, large displays, and seating for up to 12 — ideal for trainings and workshops.',
    images: [
      { src: '/images/conference-room-1.png', alt: 'LivBiz conference room with long table and glass walls' },
      { src: '/images/conference-training.png', alt: 'Training session in progress at LivBiz conference room' },
    ],
  },
];

export default function PremiumCampuses() {
  return (
    <section id="workspace" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <p className={styles.kicker}>Our Spaces</p>
          <h2>Explore the LivBiz Workspace</h2>
          <p>Professional, well-maintained spaces designed for focused work, team meetings, and client conversations.</p>
        </div>

        <div className={styles.gallery}>
          {workspaceCategories.map((category) => (
            <div key={category.id} className={`${styles.categoryBlock} animate-on-scroll`}>
              <div className={styles.categoryHeader}>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
              </div>
              <div className={`${styles.imageGrid} ${category.images.length === 3 ? styles.threeCol : styles.twoCol}`}>
                {category.images.map((image, index) => (
                  <div
                    key={index}
                    className={`${styles.imageCard} ${index === 0 && category.images.length === 3 ? styles.imageCardWide : ''}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                      className={styles.image}
                    />
                    <div className={styles.imageOverlay}>
                      <span className={styles.imageLabel}>{category.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
