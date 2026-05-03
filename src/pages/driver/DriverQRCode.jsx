import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';
import { getDriverSession } from '../../store/reviewsStore';
import styles from '../admin/SettingsPage.module.css';

export default function DriverQRCode() {
  const session = getDriverSession();
  const canvasRef = useRef(null);
  
  const reviewUrl = `${window.location.origin}/review?driver=${session?.driverId || 'DRV-0042'}`;

  useEffect(() => {
    if (!canvasRef.current || !session) return;
    QRCodeLib.toCanvas(canvasRef.current, reviewUrl, {
      width: 320,
      margin: 1,
      color: { dark: '#2563EB', light: '#ffffff' },
    });
  }, [reviewUrl, session]);

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Driver QR Card - ${session.name}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 40px; color: #1f2937; }
            .card { border: 2px solid #e5e7eb; border-radius: 24px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 24px; margin-bottom: 4px; color: #111827; }
            .driver-id { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2563EB; margin-bottom: 24px; font-weight: 700; }
            .qr-container { margin-bottom: 32px; }
            img { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
            .instruction { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
            .footer { font-size: 12px; color: #6b7280; }
            .corp-name { font-weight: 700; color: #1e3a8a; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="corp-name">${session.corporationName}</div>
            <h1>${session.name}</h1>
            <div class="driver-id">${session.driverId}</div>
            <div class="qr-container">
              <img src="${canvasRef.current.toDataURL()}" alt="QR Code" width="200" height="200" />
            </div>
            <div class="instruction">Scan to rate your ride</div>
            <p class="footer">Thank you for riding with us!</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `Revanta-QR-${session.driverId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!session) return null;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>My QR Code</h1>
          <p className={styles.pageSubtitle}>Show this code to passengers to receive performance feedback.</p>
        </div>
      </div>

      <div className={styles.card} style={{ alignItems: 'center', textAlign: 'center' }}>
        <h2 className={styles.cardTitle}>Your Feedback Terminal</h2>
        <div className={styles.qrSection}>
          <div className={styles.qrBox}>
            <canvas ref={canvasRef} />
          </div>
          
          <div className={styles.formGroup} style={{ width: '100%', maxWidth: '400px' }}>
            <label className={styles.label}>Direct Feedback URL</label>
            <div className={styles.urlGroup}>
              <input type="text" className={styles.input} value={reviewUrl} readOnly />
            </div>
          </div>

          <div className={styles.qrActions}>
            <button className={styles.btnPrimary} onClick={handleDownload}>
              <span className="material-icons-outlined">download</span>
              Download Image
            </button>
            <button className={styles.btnSecondary} onClick={handlePrint}>
              <span className="material-icons-outlined">print</span>
              Print Card
            </button>
          </div>
          
          <p className={styles.qrFooterText} style={{ marginTop: '12px' }}>
            <span className="material-icons-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>lock</span>
            This QR code is uniquely linked to your driver profile ({session.driverId}).
          </p>
        </div>
      </div>
    </div>
  );
}
