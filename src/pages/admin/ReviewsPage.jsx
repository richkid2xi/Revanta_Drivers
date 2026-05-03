import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getReviews, updateReview as storeUpdateReview, getCorporationSettings, RATING_LABELS } from '../../store/reviewsStore';
import styles from './ReviewsPage.module.css';

import { ReviewSidebar, StarRating } from '../../components/ReviewSidebar';

function ReviewsPage() {
  const [reviewsData, setReviewsData] = useState(() => getReviews());
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDriverFilter = queryParams.get('driver') || 'All';
  const [driverFilter, setDriverFilter] = useState(initialDriverFilter);

  const settings = useMemo(() => getCorporationSettings(), []);
  const drivers = useMemo(() => settings.drivers || [], [settings]);

  useEffect(() => {
    if (location.state?.openReviewId) {
      const rev = reviewsData.find(r => r.id === location.state.openReviewId);
      if (rev) setSelectedReview(rev);
    }
    const drv = new URLSearchParams(location.search).get('driver');
    if (drv) setDriverFilter(drv);
  }, [location.state, location.search, reviewsData]);

  useEffect(() => {
    const handleReviewsUpdate = () => setReviewsData(getReviews());
    window.addEventListener('revanta_reviews_updated', handleReviewsUpdate);
    return () => window.removeEventListener('revanta_reviews_updated', handleReviewsUpdate);
  }, []);

  const handleUpdateReview = (id, updates) => {
    const updated = storeUpdateReview(id, updates);
    setReviewsData(updated);
    // Update the selected review so the sidebar reflects changes immediately if needed
    if (selectedReview && selectedReview.id === id) {
      setSelectedReview({ ...selectedReview, ...updates });
    }
  };

  const counts = useMemo(() => ({
    all: reviewsData.length,
    unread: reviewsData.filter(r => r.status === 'unread').length,
    read: reviewsData.filter(r => r.status === 'read').length,
    reviewed: reviewsData.filter(r => r.status === 'reviewed').length,
  }), [reviewsData]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = reviewsData;

    // 1. Filter by Tab
    if (activeTab !== 'All') {
      result = result.filter(r => r.status.toLowerCase() === activeTab.toLowerCase());
    }

    // 1.5 Filter by Driver
    if (driverFilter !== 'All') {
      result = result.filter(r => String(r.driverId) === String(driverFilter));
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.text.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        (r.author && r.author.name.toLowerCase().includes(query))
      );
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return b.rawDate - a.rawDate; // Newest first
      } else if (sortBy === 'rating') {
        return b.rating - a.rating; // Highest rating first
      }
      return 0;
    });

    return result;
  }, [reviewsData, activeTab, sortBy, searchQuery, driverFilter]);

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleContainer}>
            <h1 className={styles.pageTitle}>All Reviews</h1>
            <p className={styles.pageSubtitle}>{counts.all} reviews total</p>
          </div>
          <div className={styles.headerActions}>
            <select 
              className={styles.driverSelect}
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <option value="All">All Drivers</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
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

        {/* Tabs */}
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

        {/* Search */}
        <div className={styles.searchContainer}>
          <span className={`material-icons-outlined ${styles.searchIcon}`}>search</span>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search by comment, reference or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className={styles.reviewsList}>
          {filteredAndSortedReviews.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 10 }}>No reviews match your filters.</p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={styles.driverBadge}>{review.driverId}</span>
                    <span className={styles.date}>{review.shortDate}</span>
                  </div>
                </div>
                
                <div className={styles.cardMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating rating={review.rating} />
                    <span className={styles.ratingText}>{RATING_LABELS[review.rating]}</span>
                  </div>
                  {review.status === 'unread' && (
                    <span className={`${styles.badge} ${styles.badgeUnread}`}>UNREAD</span>
                  )}
                  {review.isAnonymous && (
                    <span className={`${styles.badge} ${styles.badgeAnonymous}`}>ANONYMOUS</span>
                  )}
                </div>

                <p className={styles.comment}>{review.text}</p>

                {review.author && (
                  <div className={styles.authorContainer}>
                    <span className={`material-icons-outlined ${styles.authorIcon}`}>person_outline</span>
                    <span className={styles.authorName}>
                      {review.author.name} · {review.author.email}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ReviewSidebar review={selectedReview} onClose={() => setSelectedReview(null)} onUpdate={handleUpdateReview} />
    </>
  );
}

export default ReviewsPage;
