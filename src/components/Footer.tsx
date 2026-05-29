import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <h3>LivBizz Coworking & Conference Hub</h3>
          <p>Flexible coworking, meeting rooms, and online workspace booking for professionals who want a focused place to work better.</p>
        </div>
        
        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4>Workspace</h4>
            <ul>
              <li><a href="#workspace">Single Campus</a></li>
              <li><a href="#booking">Online Booking</a></li>
              <li><a href="#features">Services</a></li>
            </ul>
          </div>
          
          <div className={styles.linkGroup}>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#stories">Client Stories</a></li>
            </ul>
          </div>
          
          <div className={styles.linkGroup}>
            <h4>Contact</h4>
            <ul>
              <li><a href="#">Enquire Now</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} LivBizz Coworking & Conference Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
