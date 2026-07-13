import { NavLink, Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';

function AppLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand}>
            Capstone App
          </NavLink>

          <nav className={styles.nav} aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
