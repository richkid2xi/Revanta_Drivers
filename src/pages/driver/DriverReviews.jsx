import React, { useState, useMemo, useEffect } from 'react';
import { getDriverReviews, getDriverSession, RATING_LABELS } from '../../store/reviewsStore';
import styles from '../admin/ReviewsPage.module.css';
import { ReviewSidebar, StarRating } from '../../components/ReviewSidebar';

export default function DriverReviews() {
  const session = getDriverSession();
  const [reviewsData, setReviewsData] = useState(() => session ? getDriverReviews(session.driverId) : []);
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const handleReviewsUpdate = () => {
      if (session) setReviewsData(getDriverReviews(session.driverId));
    };
    window.addEventListener('revanta_reviews_updated', handleReviewsUpdate);
    return () => window.removeEventListener('revanta_reviews_updated', handleReviewsUpdate);
  }, [session]);

  const handleUpdateReview = (id, updates) => {
    // Note: Drivers can't actually update review status in this restricted model usually,
    // but we keep the logic consistent if we want them to mark as read.
    // However, the user said they only 'view' their reviews. 
    // We'll keep the view-only nature for now by not providing update functions to the sidebar if needed.
  };

  const counts = useMemo(() => ({
    all: reviewsData.length,
    unread: reviewsData.filter(r => r.status === 'unread').length,
    read: reviewsData.filter(r => r.status === 'read').length,
    reviewed: reviewsData.filter(r => r.status === 'reviewed').length,
  }), [reviewsData]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = reviewsData;

    if (activeTab !== 'All') {
      result = result.filter(r => r.status.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.text.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'date') return b.rawDate - a.rawDate;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [reviewsData, activeTab, sortBy, searchQuery]);

  if (!session) return null;

  return (
    <>
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div className={styles.titleContainer}>
            <h1 className={styles.pageTitle}>My Reviews</h1>
            <p className={styles.pageSubtitle}>{counts.all} reviews total</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={`${styles.filterBtn} ${sortBy === 'date' ? styles.filterBtnActive : ''}`}
              onClick={() => setSortBy('date')}
            >
              Date
              {sortBy === 'date' && <span className={`material-icons-outlined ${styles.filterBtnIcon}`}>arrow_downward</span>}
            </button>
            <button 
              className={`${styles.filterBtn} ${sortBy === 'rating' ? styles.filterBtnActive : ''}`}
              onClick={() => setSortBy('rating')}
            >
              Rating
              {sortBy === 'rating' && <span className={`material-icons-outlined ${styles.filterBtnIcon}`}>arrow_downward</span>}
            </button>
          </div>
        </div>

        <div className={styles.tabsContainer}>
          {['All', 'Unread', 'Read', 'Reviewed'].map(tab => (
            <button 
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span className={styles.tabCount}>{counts[tab.toLowerCase()]}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchContainer}>
          <span className={`material-icons-outlined ${styles.searchIcon}`}>search</span>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search my reviews..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.reviewsList}>
          {filteredAndSortedReviews.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 10 }}>No reviews found matching your filters.</p>
          ) : (
            filteredAndSortedReviews.map((review) => (
              <div 
                key={review.id} 
                className={styles.card} 
                onClick={() => setSelectedReview(review)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.refId}>{review.id}</span>
                  <span className={styles.date}>{review.shortDate}</span>
                </div>
                
                <div className={styles.cardMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating rating={review.rating} />
                    <span className={styles.ratingText}>{RATING_LABELS[review.rating]}</span>
                  </div>
                  {review.status === 'unread' && (
                    <span className={`${styles.badge} ${styles.badgeUnread}`}>UNREAD</span>
                  )}
                </div>

                <p className={styles.comment}>{review.text}</p>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <span className={styles.driverBadge} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                    {review.servicesSelected?.[0] || 'Ride'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ReviewSidebar 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
        onUpdate={() => {}} // Read-only for drivers
        readOnly={true}
      />
    </>
  );
}
