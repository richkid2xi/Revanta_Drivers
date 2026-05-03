import React, { useState } from 'react';
import { getDriverSession } from '../../store/reviewsStore';
import styles from '../admin/ReviewsPage.module.css';

const FAQS = [
  {
    q: "How do passengers rate me?",
    a: "Passengers scan your personal QR code at the end of their trip. They can then rate your service from 1 to 5 stars and leave optional comments about their experience."
  },
  {
    q: "Why can I not see passenger contact details?",
    a: "To protect passenger privacy and ensure honest feedback, all reviews are anonymous to drivers. Only the rating, trip type, and comments are visible to you."
  },
  {
    q: "What does my rating affect?",
    a: "Your rating is a key indicator of your performance. High ratings may lead to bonuses or recognition from your corporation, while consistently low ratings may require a performance review."
  },
  {
    q: "How is my average calculated?",
    a: "Your average rating is the sum of all star ratings divided by the total number of reviews you have received."
  }
];

export default function DriverHelp() {
  const session = getDriverSession();
  const [openIndex, setOpenIndex] = useState(null);

  if (!session) return null;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Help & Support</h1>
          <p className={styles.pageSubtitle}>Common questions and answers for Revanta drivers.</p>
        </div>
      </div>

      <div className={styles.reviewsList} style={{ gap: '12px' }}>
        {FAQS.map((faq, index) => (
          <div key={index} className={styles.card} style={{ cursor: 'pointer', padding: '16px' }} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{faq.q}</span>
              <span className="material-icons-round" style={{ color: 'var(--color-primary)', transition: 'transform 0.2s', transform: openIndex === index ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </span>
            </div>
            {openIndex === index && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.card} style={{ marginTop: '24px', backgroundColor: 'var(--color-primary-bg)', borderColor: 'var(--color-primary-border)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff' }}>
            <span className="material-icons-round" style={{ marginLeft: '8px' }}>contact_support</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Still need help?</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              If you have issues with your account or vehicle assignments, please reach out to your corporation manager directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
