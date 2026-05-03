import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ThankYouPage.module.css';

function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ref, name } = location.state || { ref: 'REF-XXXX-XXXX-XXXX', name: null };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Success Icon */}
        <div className={styles.successIcon}>
          <span className="material-icons-round">check</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className={styles.mainTitle}>Thank you for your feedback.</h1>
        
        <div className={styles.textGroup}>
          <p className={styles.subtitle}>
            Thank you for engaging with us. Your feedback has been received by the management team.
          </p>
          <p className={styles.description}>
            Your feedback helps us provide the best experience for<br />
            all our clients.
          </p>
        </div>

        {/* Reference Box */}
        <div className={styles.refBox}>
          <label className={styles.refLabel}>REFERENCE NUMBER</label>
          <div className={styles.refCode}>{ref}</div>
          
          <div className={styles.screenshotBadge}>
            <span className="material-icons-outlined">photo_camera</span>
            <span>Screenshot this for your records</span>
          </div>
        </div>

        {/* Submission Source */}
        <div className={styles.submissionSource}>
          {name ? (
            <span>Submitted by {name}</span>
          ) : (
            <span>Submitted anonymously</span>
          )}
        </div>

        {/* Back to Start Action */}
        <button className={styles.homeBtn} onClick={() => navigate('/review')}>
          Go back to start
        </button>
      </div>
    </div>
  );
}

export default ThankYouPage;
