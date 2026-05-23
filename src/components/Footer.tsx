import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <h3>LivBiz Coworking & Conference Hub</h3>
          <p>Premium coworking spaces designed for the modern professional. Work, connect, and grow in our state-of-the-art facilities.</p>
        </div>
        
        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4>Campuses</h4>
            <ul>
              <li><a href="#campuses">Lavelle Road</a></li>
              <li><a href="#campuses">Museum Road</a></li>
              <li><a href="#campuses">Whitefield</a></li>
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
          <p>&copy; {new Date().getFullYear()} LivBiz Coworking & Conference Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
