import styles from './LandingPage.module.css';

function LandingPage() {
  return (
    <div className={styles.page}>
      <span className="material-icons-round" style={{ fontSize: 56, color: 'var(--color-primary)' }}>
        public
      </span>
      <h1 className={styles.title}>Revanta</h1>
      <p className={styles.subtitle}>Driver Review Platform</p>
      <p className={styles.placeholder}>
        <span className="material-icons-outlined" style={{ verticalAlign: 'middle', marginRight: 6 }}>
          construction
        </span>
        Landing page — awaiting design
      </p>
    </div>
  );
}

export default LandingPage;
