import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome to Capstone App</h1>
      <p className={styles.description}>
        This is your internship capstone project. Head to the settings page to
        update your profile, appearance, and notification preferences with
        built-in form validation.
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Get started</h2>
        <p className={styles.cardText}>
          Open <Link to="/settings">Settings</Link> to configure your account.
        </p>
      </div>
    </div>
  );
}

export default HomePage;
