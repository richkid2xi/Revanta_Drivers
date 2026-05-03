import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { findDriverByToken } from '../../store/reviewsStore';
import styles from './ReviewPage.module.css'; // Reuse existing styles for loading/error

function ReviewRedirect() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token) {
      const result = findDriverByToken(token);
      if (result) {
        // Set the active session context for the public review page
        localStorage.setItem('Revanta_session_corporation_id', result.corporationId);
        localStorage.setItem('Revanta_active_driver', result.driver.id);
        
        // Fast redirect to the real form
        setTimeout(() => {
          navigate('/review', { replace: true });
        }, 300);
      } else {
        setError(true);
      }
    }
  }, [token, navigate]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.stepContainer} style={{ textAlign: 'center', paddingTop: '100px', maxWidth: '400px' }}>
          <span className="material-icons-round" style={{ fontSize: 48, color: '#EF4444', marginBottom: 16 }}>error_outline</span>
          <h1 className={styles.stepHeading} style={{ color: '#EF4444', fontSize: '1.25rem' }}>Invalid Review Link</h1>
          <p className={styles.stepSubtitle} style={{ fontSize: '0.9rem', color: '#8B949E' }}>The QR code or link you used is invalid or has expired. Please contact the staff for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.stepContainer} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className={styles.loader} />
        <h2 className={styles.stepHeading} style={{ marginTop: 24, fontSize: '1.1rem', color: '#8B949E' }}>Connecting to Revanta...</h2>
        <style>{`
          .${styles.loader} {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(16, 185, 129, 0.1);
            border-top-color: #3B82F6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

export default ReviewRedirect;
