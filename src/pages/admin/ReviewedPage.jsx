import React, { useState, useMemo } from 'react';
import { getReviews, updateReview as storeUpdateReview } from '../../store/reviewsStore';
import { ReviewSidebar, StarRating } from '../../components/ReviewSidebar';
import styles from './ReviewedPage.module.css';

function ReviewedPage() {
  const [reviewsData, setReviewsData] = useState(() => {
    const all = getReviews();
    return all.filter(r => r.status === 'reviewed');
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  const handleUpdateReview = (id, updates) => {
    const updated = storeUpdateReview(id, updates);
    setReviewsData(updated.filter(r => r.status === 'reviewed'));
    if (selectedReview && selectedReview.id === id) {
      setSelectedReview({ ...selectedReview, ...updates });
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = reviewsData;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.text.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.author && r.author.name.toLowerCase().includes(q))
      );
    }

    if (fromDate) {
      const fromTime = new Date(fromDate).getTime();
      if (!isNaN(fromTime)) {
        result = result.filter(r => r.rawReviewedDate >= fromTime);
      }
    }
    
    if (toDate) {
      // Add a full day to include the toDate up to midnight
      const toTime = new Date(toDate).getTime() + 86400000;
      if (!isNaN(toTime)) {
        result = result.filter(r => r.rawReviewedDate <= toTime);
      }
    }

    result = [...result].sort((a, b) => {
      if (sortDesc) {
        return b.rawReviewedDate - a.rawReviewedDate;
      } else {
        return a.rawReviewedDate - b.rawReviewedDate;
      }
    });

    return result;
  }, [reviewsData, searchQuery, fromDate, toDate, sortDesc]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Reviewed Reviews</h1>
          <p className={styles.pageSubtitle}>{reviewsData.length} reviewed reviews</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.filterBtn}
            onClick={() => setSortDesc(!sortDesc)}
          >
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>sort</span>
            Resolution Date {sortDesc ? '↓' : '↑'}
          </button>
          <button className={styles.exportBtn}>
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>download</span>
            Export CSV
          </button>
        </div>
      </div>



      {/* Search */}
      <div className={styles.searchContainer}>
        <span className={`material-icons-outlined ${styles.searchIcon}`}>search</span>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search reviewed reviews..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className={styles.reviewsList}>
        {filteredAndSorted.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: 10 }}>No reviewed reviews match your filters.</p>
        ) : (
          filteredAndSorted.map((review) => (
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
                <StarRating rating={review.rating} />
                <span className={`${styles.badge} ${styles.badgeReviewed}`}>REVIEWED</span>
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

      <ReviewSidebar 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
        onUpdate={handleUpdateReview}
      />
    </div>
  );
}

export default ReviewedPage;
