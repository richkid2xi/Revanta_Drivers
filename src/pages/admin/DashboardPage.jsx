import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReviews, updateReview as storeUpdateReview, getCorporationSettings, RATING_LABELS } from '../../store/reviewsStore';
import styles from './DashboardPage.module.css';

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

/* ── Dashboard Page ────────────────────────────────────── */
function DashboardPage() {
  const today = useMemo(() => formatDate(), []);
  const [allReviews, setAllReviews] = useState(() => getReviews());
  const [corporationName, setCorporationName] = useState(() => getCorporationSettings().name);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSettingsUpdate = () => setCorporationName(getCorporationSettings().name);
    const handleReviewsUpdate = () => setAllReviews(getReviews());

    window.addEventListener('revanta_corporation_settings_updated', handleSettingsUpdate);
    window.addEventListener('revanta_reviews_updated', handleReviewsUpdate);
    
    return () => {
      window.removeEventListener('revanta_corporation_settings_updated', handleSettingsUpdate);
      window.removeEventListener('revanta_reviews_updated', handleReviewsUpdate);
    };
  }, []);

  const stats = useMemo(() => {
    const total = allReviews.length;
    const unread = allReviews.filter(r => r.status === 'unread').length;
    const read = allReviews.filter(r => r.status === 'read').length;
    const reviewed = allReviews.filter(r => r.status === 'reviewed').length;
    return [
      { id: 'total',    label: 'Total Reviews',  value: total,    icon: 'business_center',        color: 'neutral' },
      { id: 'unread',   label: 'Unread',         value: unread,   icon: 'mark_email_unread',  color: 'amber',   sub: 'Needs response' },
      { id: 'read',     label: 'Read',           value: read,     icon: 'drafts',             color: 'neutral', sub: 'Reviewed' },
      { id: 'reviewed', label: 'Reviewed',       value: reviewed, icon: 'check_circle',       color: 'green',   sub: 'Closed cases' },
    ];
  }, [allReviews]);

  const insights = useMemo(() => {
    const active = allReviews.filter(r => r.status !== 'reviewed');
    if (!active.length) return {
      overall: 0,
      delivery: 0,
      staff: 0,
      respect: 0,
      loyalty: 0,
      referral: 0,
      complaints: [],
      suggestions: []
    };

    let overallSum = 0, overallCount = 0;
    let deliveryYes = 0, deliveryTotal = 0;
    let staffSum = 0, staffCount = 0;
    let respectYes = 0, respectTotal = 0;
    let loyaltyYes = 0, loyaltyTotal = 0;
    let referralYes = 0, referralTotal = 0;

    const complaints = [];
    const suggestions = [];

    active.forEach(r => {
      const q = {};
      (r.questions || []).forEach(ans => {
         q[ans.id] = ans.value !== undefined ? ans.value : ans.score;
      });

      let rOverallSum = 0, rOverallCnt = 0;
      ['q1','q2','q3','q5'].forEach(id => {
         if (typeof q[id] === 'number') {
           rOverallSum += q[id];
           rOverallCnt++;
         }
      });
      if (rOverallCnt > 0) {
         overallSum += (rOverallSum / rOverallCnt);
         overallCount++;
      }

      if (q['q4']) {
         if (q['q4'] === 'Yes') deliveryYes++;
         deliveryTotal++;
      }
      if (typeof q['q5'] === 'number') {
         staffSum += q['q5'];
         staffCount++;
      }
      if (q['q6']) {
         if (q['q6'] === 'Yes') respectYes++;
         respectTotal++;
      }
      if (q['q8']) {
         if (q['q8'] === 'Yes' || q['q8'] === 'Maybe') loyaltyYes++;
         loyaltyTotal++;
      }
      if (q['q9']) {
         if (q['q9'] === 'Yes' || q['q9'] === 'Maybe') referralYes++;
         referralTotal++;
      }
      if (q['q7'] && typeof q['q7'] === 'string' && q['q7'].trim()) {
         complaints.push({ id: r.id, text: q['q7'] });
      }
      if (q['q10'] && typeof q['q10'] === 'string' && q['q10'].trim()) {
         suggestions.push({ id: r.id, text: q['q10'] });
      }
    });

    return {
      overall: overallCount ? (overallSum / overallCount).toFixed(1) : 0,
      delivery: deliveryTotal ? Math.round((deliveryYes / deliveryTotal) * 100) : 0,
      staff: staffCount ? (staffSum / staffCount).toFixed(1) : 0,
      respect: respectTotal ? Math.round((respectYes / respectTotal) * 100) : 0,
      loyalty: loyaltyTotal ? Math.round((loyaltyYes / loyaltyTotal) * 100) : 0,
      referral: referralTotal ? Math.round((referralYes / referralTotal) * 100) : 0,
      complaints: complaints.slice(0, 5),
      suggestions: suggestions.slice(0, 5)
    };
  }, [allReviews]);

  const recentSubmissions = useMemo(() =>
    [...allReviews]
      .filter(r => r.status !== 'reviewed')
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 5),
    [allReviews]
  );

  const handleUpdateReview = (id, updates) => {
    const updated = storeUpdateReview(id, updates);
    setAllReviews(updated);
  };

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <p className={styles.pageSubtitle}>
            <span style={{ textTransform: 'uppercase' }}>{corporationName}</span>&nbsp;·&nbsp;Client Review Dashboard
          </p>
        </div>
        <div className={styles.dateBadge}>
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>calendar_today</span>
          {today}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
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

      {/* ── Avg satisfaction ────────────────────────────── */}
      {insights.overall > 0 && (
        <div className={`${styles.satisfactionCard} ${getSatisfactionClass(Number(insights.overall), styles)}`}>
          <div className={styles.satisfactionLeft}>
            <span className={styles.satisfactionLabel}>
              Overall Satisfaction Score
            </span>
            <div className={styles.satisfactionScore}>
              <span className={styles.scoreNumber}>{insights.overall}</span>
              <div className={styles.scoreDetails}>
                <StarRating rating={Number(insights.overall)} size={22} />
                <span className={styles.scoreMeta}>
                  out of 5.0&nbsp;·&nbsp;{allReviews.filter(r => r.status !== 'reviewed').length} reviews
                </span>
              </div>
            </div>
          </div>
          <div className={styles.satisfactionIcon}>
            <span className={`material-icons-round ${styles.satisfactionIconColor}`}>star</span>
          </div>
        </div>
      )}

      {/* ── Insights Grid ─────────────────────────────────── */}
      <div className={styles.statsGrid} style={{ marginTop: '24px' }}>
        <div className={`${styles.statCard} ${styles.statCard_neutral}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Staff Rating</span>
            <span className={`material-icons-outlined ${styles.statIcon} ${styles.statIcon_neutral}`}>people</span>
          </div>
          <div className={styles.statValue}>{insights.staff}<span style={{fontSize: '1rem'}}>/5</span></div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_amber}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Delivery Reliability</span>
            <span className={`material-icons-outlined ${styles.statIcon} ${styles.statIcon_amber}`}>local_shipping</span>
          </div>
          <div className={styles.statValue}>{insights.delivery}%</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_green}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Customer Respect</span>
            <span className={`material-icons-outlined ${styles.statIcon} ${styles.statIcon_green}`}>handshake</span>
          </div>
          <div className={styles.statValue}>{insights.respect}%</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_neutral}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Loyalty Rate</span>
            <span className={`material-icons-outlined ${styles.statIcon} ${styles.statIcon_neutral}`}>favorite</span>
          </div>
          <div className={styles.statValue}>{insights.loyalty}%</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCard_green}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Referral Rate (NPS)</span>
            <span className={`material-icons-outlined ${styles.statIcon} ${styles.statIcon_green}`}>campaign</span>
          </div>
          <div className={styles.statValue}>{insights.referral}%</div>
        </div>
      </div>

      {/* ── Recent submissions ───────────────────────────── */}
      <div className={styles.recentSection} style={{ marginTop: '32px' }}>
        <div className={styles.recentHeader}>
          <h2 className={styles.sectionTitle}>Recent Client Reviews</h2>
          <Link to="/admin/reviews" className={styles.viewAll}>
            View all <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <div className={styles.submissionList}>
          {recentSubmissions.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <span className="material-icons-round" style={{ fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>history</span>
              <p style={{ color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px' }}>No Reviews Yet</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>Once clients start using your QR code, their feedback will appear here in real-time.</p>
            </div>
          ) : (
            recentSubmissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                onUpdate={handleUpdateReview}
                onOpen={() => navigate('/admin/reviews', { state: { openReviewId: sub.id } })}
              />
            ))
          )}
        </div>
      </div>

      {/* ── QR Code shortcut ── */}
      <div className={styles.qrShortcutCard}>
        <div className={styles.qrShortcutLeft}>
          <div className={styles.qrShortcutIcon}>
            <span className="material-icons-round">qr_code_2</span>
          </div>
          <div>
            <h3 className={styles.qrShortcutTitle}>Feedback QR Code</h3>
            <p className={styles.qrShortcutDesc}>Your feedback QR code is ready. Print it and display it at your service points.</p>
          </div>
        </div>
        <Link to="/admin/settings" className={styles.qrShortcutBtn}>
          Manage
        </Link>
      </div>
    </div>
  );
}

/* ── Submission Card ───────────────────────────────────── */
function SubmissionCard({ submission, onUpdate, onOpen }) {
  const { id, status, rating, shortDate, date, text, author } = submission;
  const isUnread = status === 'unread';

  const handleMarkRead = (e) => {
    e.stopPropagation();
    onUpdate(id, { status: 'read' });
  };

  const handleResolve = (e) => {
    e.stopPropagation();
    const rDate = new Date();
    const rawReviewedDate = rDate.getTime();
    const rDay = rDate.getDate().toString().padStart(2, '0');
    const rMonth = rDate.toLocaleString('default', { month: 'short' });
    const reviewedDateStr = `${rDay} ${rMonth} ${rDate.getFullYear()}`;
    onUpdate(id, { status: 'reviewed', rawReviewedDate, reviewedDateStr });
  };

  return (
    <div
      className={`${styles.subCard} ${isUnread ? styles.subCardUnread : ''}`}
      onClick={onOpen}
      style={{ cursor: 'pointer' }}
      title="Go to Reviews"
    >
      {/* Row 1: ref + badge + date */}
      <div className={styles.subCardTop}>
        <div className={styles.subCardMeta}>
          <span className={styles.subRef}>{id}</span>
          <span className={styles.driverBadgeCompact}>{submission.driverId}</span>
          <span className={`${styles.subBadge} ${isUnread ? styles.subBadgeUnread : styles.subBadgeRead}`}>
            {isUnread ? 'UNREAD' : 'READ'}
          </span>
        </div>
        <div className={styles.subActions}>
          <span className={styles.subDate}>{shortDate || date}</span>
          {isUnread && (
            <button className={styles.actionBtn} onClick={handleMarkRead}>Mark Read</button>
          )}
          <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={handleResolve}>Resolve</button>
        </div>
      </div>

      {/* Row 2: stars */}
      <div className={styles.subCardBody}>
        <StarRating rating={rating} size={16} />
        <span className={styles.subRatingText}>{RATING_LABELS[rating]}</span>
      </div>
      <p className={styles.subText}>{text}</p>
      {author && <p className={styles.subAuthor}>{typeof author === 'object' ? author.name : author}</p>}
    </div>
  );
}

export default DashboardPage;
