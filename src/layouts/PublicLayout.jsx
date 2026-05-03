import { Outlet } from 'react-router-dom';
import styles from './PublicLayout.module.css';

/**
 * PublicLayout
 * Wrapper for all client-facing pages (Landing, Review, ThankYou).
 * Renders a minimal shell — no sidebar. Header/footer injected per page if needed.
 */
function PublicLayout() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
