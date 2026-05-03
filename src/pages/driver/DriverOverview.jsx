import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDriverReviews, getDriverSession, RATING_LABELS } from '../../store/reviewsStore';
import styles from '../admin/DashboardPage.module.css';
import { ReviewSidebar } from '../../components/ReviewSidebar';

/* ── Star Rating ───────────────────────────────────────── */
function StarRating({ rating, max = 5, size = 18 }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <span
            key={i}
            className={`material-icons-round ${styles.star}`}
            style={{ fontSize: size }}
          >
            {filled ? 'star' : half ? 'star_half' : 'star_border'}
          </span>
        );
      })}
    </span>
  );
}

/* ── Helpers ───────────────────────────────────────────── */
function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getSatisfactionClass(score, styles) {
  if (score >= 4.0) return styles.satGreen;
  if (score >= 3.0) return styles.satAmber;
  return styles.satRed;
}

export default function DriverOverview() {
  const session = getDriverSession();
  const today = useMemo(() => formatDate(), []);
  const allReviews = useMemo(() => session ? getDriverReviews(session.driverId) : [], [session]);
  const navigate = useNavigate();
  const [selectedReview, setSelectedReview] = useState(null);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const unread = allReviews.filter(r => r.status === 'unread').length;
    return [
      { id: 'total',    label: 'Total Reviews',  value: total,    icon: 'business_center',        color: 'neutral' },
      { id: 'unread',   label: 'Unread Feedback', value: unread,   icon: 'mark_email_unread',  color: 'amber',   sub: 'Needs attention' },
    ];
  }, [allReviews]);

  const insights = useMemo(() => {
    if (!allReviews.length) return { overall: 0, staff: 0, delivery: 0, respect: 0, loyalty: 0, referral: 0 };

    let overallSum = 0, overallCount = 0;
    let deliveryYes = 0, deliveryTotal = 0;
    let staffSum = 0, staffCount = 0;
    let respectYes = 0, respectTotal = 0;
    let loyaltyYes = 0, loyaltyTotal = 0;
    let referralYes = 0, referralTotal = 0;

    allReviews.forEach(r => {
      const q = {};
      (r.questions || []).forEach(ans => { q[ans.id] = ans.value; });

      if (typeof q['q1'] === 'number') { overallSum += q['q1']; overallCount++; }
      if (q['q4']) { if (q['q4'] === 'Yes') deliveryYes++; deliveryTotal++; }
      if (typeof q['q2'] === 'number') { staffSum += q['q2']; staffCount++; }
      if (q['q6'] === 'Yes') { respectYes++; respectTotal++; }
      if (q['q8']) { if (q['q8'] === 'Yes' || q['q8'] === 'Maybe') loyaltyYes++; loyaltyTotal++; }
      if (q['q9']) { if (q['q9'] === 'Yes' || q['q9'] === 'Maybe') referralYes++; referralTotal++; }
    });

    return {
      overall: overallCount ? (overallSum / overallCount).toFixed(1) : 0,
      staff: staffCount ? (staffSum / staffCount).toFixed(1) : 0,
      delivery: deliveryTotal ? Math.round((deliveryYes / deliveryTotal) * 100) : 0,
      respect: respectTotal ? Math.round((respectYes / respectTotal) * 100) : 0,
      loyalty: loyaltyTotal ? Math.round((loyaltyYes / loyaltyTotal) * 100) : 0,
      referral: referralTotal ? Math.round((referralYes / referralTotal) * 100) : 0,
    };
  }, [allReviews]);

  const recentReviews = useMemo(() =>
    [...allReviews].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5),
    [allReviews]
  );

  if (!session) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Performance Overview</h1>
          <p className={styles.pageSubtitle}>Welcome back, {session.name}</p>
        </div>
        <div className={styles.dateBadge}>
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>calendar_today</span>
          {today}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.id} className={`${styles.statCard} ${styles[`statCard_${stat.color}`]}`}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={`material-icons-outlined ${styles.statIcon} ${styles[`statIcon_${stat.color}`]}`}>
                {stat.icon}
              </span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            {stat.sub && <div className={styles.statSub}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {insights.overall > 0 && (
        <div className={`${styles.satisfactionCard} ${getSatisfactionClass(Number(insights.overall), styles)}`} style={{ marginTop: '24px' }}>
          <div className={styles.satisfactionLeft}>
            <span className={styles.satisfactionLabel}>My Average Satisfaction</span>
            <div className={styles.satisfactionScore}>
              <span className={styles.scoreNumber}>{insights.overall}</span>
              <div className={styles.scoreDetails}>
                <StarRating rating={Number(insights.overall)} size={22} />
                <span className={styles.scoreMeta}>out of 5.0&nbsp;·&nbsp;{allReviews.length} total reviews</span>
              </div>
            </div>
          </div>
          <div className={styles.satisfactionIcon}>
            <span className={`material-icons-round ${styles.satisfactionIconColor}`}>star</span>
          </div>
        </div>
      )}

      <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
        <div className={`${styles.statCard} ${styles.statCard_neutral}`}>
          <div className={styles.statTop}><span className={styles.statLabel}>Trip Safety</span><span className="material-icons-outlined">shield</span></div>
          <div className={styles.statValue}>{insights.staff}<span style={{fontSize: '1rem'}}>/5</span></div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_amber}`}>
          <div className={styles.statTop}><span className={styles.statLabel}>Compliance Rate</span><span className="material-icons-outlined">fact_check</span></div>
          <div className={styles.statValue}>{insights.delivery}%</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_green}`}>
          <div className={styles.statTop}><span className={styles.statLabel}>Professionalism</span><span className="material-icons-outlined">verified_user</span></div>
          <div className={styles.statValue}>{insights.respect}%</div>
        </div>
      </div>

      <div className={styles.recentSection} style={{ marginTop: '32px' }}>
        <div className={styles.recentHeader}>
          <h2 className={styles.sectionTitle}>Recent Personal Feedback</h2>
          <Link to="/driver/reviews" className={styles.viewAll}>
            View all <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <div className={styles.submissionList}>
          {recentReviews.map((sub) => (
            <div key={sub.id} className={styles.subCard} onClick={() => setSelectedReview(sub)} style={{ cursor: 'pointer' }}>
              <div className={styles.subCardTop}>
                <div className={styles.subCardMeta}>
                  <span className={styles.subRef}>{sub.id}</span>
                  <span className={styles.driverBadgeCompact}>{sub.servicesSelected?.[0] || 'Ride'}</span>
                </div>
                <span className={styles.subDate}>{sub.shortDate}</span>
              </div>
              <div className={styles.subCardBody}>
                <StarRating rating={sub.rating} size={16} />
                <span className={styles.subRatingText}>{RATING_LABELS[sub.rating]}</span>
              </div>
              <p className={styles.subText}>{sub.text}</p>
            </div>
          ))}
          {recentReviews.length === 0 && (
             <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
               <span className="material-icons-round" style={{ fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>history</span>
               <p style={{ color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px' }}>No Feedback Yet</p>
               <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>Once passengers submit reviews using your QR code, they will appear here.</p>
             </div>
          )}
        </div>
      </div>

      <div className={styles.qrShortcutCard}>
        <div className={styles.qrShortcutLeft}>
          <div className={styles.qrShortcutIcon}><span className="material-icons-round">qr_code_2</span></div>
          <div>
            <h3 className={styles.qrShortcutTitle}>My Feedback QR Code</h3>
            <p className={styles.qrShortcutDesc}>Share this code with passengers at the end of their trip to collect reviews.</p>
          </div>
        </div>
        <Link to="/driver/qrcode" className={styles.qrShortcutBtn}>View QR</Link>
      </div>

      <ReviewSidebar 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
        onUpdate={() => {}} 
        readOnly={true} 
      />
    </div>
  );
}
