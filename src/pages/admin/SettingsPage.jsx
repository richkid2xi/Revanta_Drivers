import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getCorporationSettings, updateCorporationSettings } from '../../store/reviewsStore';
import styles from './SettingsPage.module.css';

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [corporationName, setCorporationName] = useState(() => getCorporationSettings().name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveCorporation = () => {
    updateCorporationSettings({ name: corporationName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account and appearance.</p>
        </div>
      </div>

      {/* Corporation Details */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Corporation Details</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>TRANSPORT CORPORATION NAME</label>
          <input
            type="text"
            className={styles.input}
            value={corporationName}
            onChange={(e) => setCorporationName(e.target.value)}
          />
        </div>
        <div className={styles.cardFooter}>
          <button className={styles.btnPrimary} onClick={handleSaveCorporation}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>
              {saved ? 'check' : 'save'}
            </span>
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>CURRENT PASSWORD</label>
          <input
            type="password"
            className={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>NEW PASSWORD</label>
          <input
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className={styles.cardFooter}>
          <button className={styles.btnPrimary}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>lock</span>
            Update Password
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Appearance</h2>
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleTitle}>Dark Mode</span>
            <span className={styles.toggleDesc}>Toggle between light and dark interface.</span>
          </div>
          <button
            className={styles.toggleBtn}
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{
              backgroundColor: theme === 'dark' ? 'var(--color-primary-light)' : 'var(--color-border)'
            }}
          >
            <div
              className={styles.toggleCircle}
              style={{ left: theme === 'dark' ? '22px' : '2px' }}
            />
          </button>
        </div>
      </div>

      {/* Subscription & Pricing */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Pricing & Subscription</h2>
        <div className={styles.subscriptionGrid}>
           <div className={styles.subItem}>
              <label className={styles.label}>CURRENT PLAN</label>
              <div className={styles.planBadge}>{getCorporationSettings().subscription?.plan || 'Basic Plan'}</div>
           </div>
           <div className={styles.subItem}>
              <label className={styles.label}>MONTHLY PRICE</label>
              <div className={styles.priceVal}>{getCorporationSettings().subscription?.price || '$19/mo'}</div>
           </div>
        </div>
        
        <div className={styles.driverUsage}>
           <div className={styles.usageHeader}>
              <span className={styles.usageLabel}>Fleet Capacity</span>
              <span className={styles.usageCount}>{getCorporationSettings().subscription?.activeDrivers || 0} / {getCorporationSettings().subscription?.driverLimit || 10} Drivers</span>
           </div>
           <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${((getCorporationSettings().subscription?.activeDrivers || 0) / (getCorporationSettings().subscription?.driverLimit || 10)) * 100}%` }} 
              />
           </div>
           <p className={styles.pricingHint}>Revanta adjusts pricing based on your fleet size. Adding more drivers may move you to a higher tier.</p>
        </div>

        <div className={styles.cardFooter}>
           <button className={styles.btnPrimary} style={{ backgroundColor: '#10B981', border: 'none' }}>
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>payment</span>
              Manage Payment Details
           </button>
        </div>
      </div>

      {/* System Information */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>System Information</h2>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Platform</span>
            <span className={styles.infoValue}>Revanta v1.0.0</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Developer</span>
            <a 
              href="https://elitron-portfolio.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.infoValueText}
              style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 600 }}
            >
              EliTech CreaTives
            </a>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Type</span>
            <span className={styles.infoValueText}>Driver Review Platform</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Country</span>
            <span className={styles.infoValueText}>Ghana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
