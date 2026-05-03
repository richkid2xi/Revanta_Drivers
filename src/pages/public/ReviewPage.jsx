import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findDriverByToken, addReview, RATING_LABELS, getCorporationSettings, getActiveDriverId } from '../../store/reviewsStore';
import styles from './ReviewPage.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SERVICES = [
  { id: 'ride',      label: 'Ride',             icon: 'directions_car' },
  { id: 'delivery',  label: 'Delivery',         icon: 'local_shipping' },
  { id: 'luxury',    label: 'Luxury',           icon: 'auto_awesome' },
  { id: 'express',   label: 'Express',          icon: 'bolt' },
  { id: 'intercity', label: 'Intercity',        icon: 'map' },
  { id: 'other',     label: 'Other',            icon: 'more_horiz' },
];

const QUESTIONS = [
  // OVERALL EXPERIENCE
  { id: 'q1', text: 'How would you rate your overall trip experience?', type: 'rating', section: 'OVERALL EXPERIENCE' },
  
  // SAFETY & COMPLIANCE
  { id: 'q2', text: 'Did you feel safe during the trip?', type: 'rating', section: 'SAFETY & COMPLIANCE' },
  { id: 'q3', text: 'Did the driver obey road rules and traffic regulations?', type: 'choice', options: ['Yes', 'No', 'Not Sure'], section: 'SAFETY & COMPLIANCE' },
  { id: 'q4', text: 'Was the vehicle overloaded beyond passenger capacity?', type: 'choice', options: ['Yes', 'No'], section: 'SAFETY & COMPLIANCE' },
  { id: 'q5', text: 'Did the driver avoid making unnecessary phone calls while driving?', type: 'choice', options: ['Yes', 'No'], section: 'SAFETY & COMPLIANCE' },
  
  // PROFESSIONALISM
  { id: 'q6', text: 'Was the driver respectful and professional?', type: 'rating', section: 'PROFESSIONALISM' },
  
  // VEHICLE CONDITION
  { id: 'q7', text: 'Was the vehicle clean and comfortable?', type: 'rating', section: 'VEHICLE CONDITION' },
  { id: 'q8', text: 'Was the vehicle in good mechanical condition? (Brakes, tires, lights, seats, etc.)', type: 'choice', options: ['Yes', 'No', 'Not Sure'], section: 'VEHICLE CONDITION' },
  
  // RECOMMENDATION
  { id: 'q9', text: 'Would you recommend this driver or service to others?', type: 'choice', options: ['Yes', 'No', 'Maybe'], section: 'RECOMMENDATION' },
  
  // ADDITIONAL COMMENTS
  { id: 'q10', text: 'Additional comments or complaints', type: 'text', section: 'ADDITIONAL COMMENTS', optional: true }
];

const RATING_OPTIONS = [
  { value: 1, label: '1', icon: 'sentiment_very_dissatisfied' },
  { value: 2, label: '2',      icon: 'sentiment_dissatisfied' },
  { value: 3, label: '3',           icon: 'sentiment_neutral' },
  { value: 4, label: '4',         icon: 'sentiment_satisfied' },
  { value: 5, label: '5',    icon: 'sentiment_very_satisfied' },
];

function generateRefNumber() {
  const digits = '0123456789';
  const rand = (len) =>
    Array.from({ length: len }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
  return `RDR-2026-${rand(5)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ReviewPage() {
  const navigate = useNavigate();
  const settings = useMemo(() => getCorporationSettings(), []);
  const activeDriverId = useMemo(() => getActiveDriverId(), []);
  const activeDriver = useMemo(() => settings.drivers?.find(d => d.id === activeDriverId), [settings, activeDriverId]);

  // Active services (filtered by business settings)
  const SERVICES = useMemo(() => {
    return ALL_SERVICES.filter((s) => settings.services[s.id]);
  }, [settings]);

  // Form state
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [mainRatings, setMainRatings] = useState({});
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [showValidationError, setShowValidationError] = useState(false);
  const [otherServices, setOtherServices] = useState('');
  const [spamError, setSpamError] = useState(null);

  useEffect(() => {
    const lastSubmission = localStorage.getItem('last_review_submission');
    if (lastSubmission) {
      const elapsed = Date.now() - parseInt(lastSubmission);
      const remaining = 2 * 60 * 1000 - elapsed; // Reduced for testing
      if (remaining > 0) {
        setSpamError(Math.ceil(remaining / 1000 / 60));
      }
    }
  }, []);

  const [refNumber] = useState(generateRefNumber);

  // ─── Dynamic step list ─────────────────────────────────────────────────────
  const dynamicSteps = useMemo(() => {
    const steps = [];
    steps.push({ type: 'welcome' });
    steps.push({ type: 'serviceSelection' });
    QUESTIONS.forEach((q, idx) => steps.push({ type: 'mainQ', data: q, index: idx + 1 }));

    steps.push({ type: 'contact' });
    steps.push({ type: 'summary' });
    return steps;
  }, [selectedServices]);

  const currentStepData = dynamicSteps[step];
  const TOTAL_STEPS = dynamicSteps.length - 1;
  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      setShowValidationError(true);
    } else {
      setShowValidationError(false);
      handleNext();
    }
  };

  // ─── Rating handlers ────────────────────────────────────────────────────────
  const toggleService = (label) =>
    setSelectedServices((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const handleMainRating = (id, val) =>
    setMainRatings((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = async () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const processedServices = selectedServices.includes('Other')
      ? [
          ...selectedServices.filter(s => s !== 'Other'),
          ...otherServices.split(',').map(s => s.trim()).filter(Boolean)
        ]
      : selectedServices;

    const reviewData = {
      corporationId:         settings.corporationId,
      driverId:        activeDriverId || 'DRV-0042', 
      id:              refNumber,
      rawDate:         now.getTime(),
      date:            `${now.toLocaleString('default', { weekday: 'long' })}, ${pad(now.getDate())} ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} at ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      shortDate:       `${pad(now.getDate())} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      rating:          mainRatings['q1'] || 0,
      status:          'unread',
      isAnonymous,
      servicesSelected: processedServices,
      text:            mainRatings['q10'] || 'No additional comments.',
      author:          isAnonymous ? null : { ...contact },
      questions:       QUESTIONS.map((q) => ({ id: q.id, label: `Q${q.id.replace('q','')}`, text: q.text, value: mainRatings[q.id] })),
      notes:           '',
      rawReviewedDate: null,
      reviewedDateStr: null,
    };

    addReview(reviewData);
    localStorage.setItem('last_review_submission', Date.now().toString());
    navigate('/thank-you', { state: { ref: refNumber, name: isAnonymous ? null : contact.name }, replace: true });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {spamError && (
        <div className={styles.landingContainer} style={{ textAlign: 'center' }}>
          <span className="material-icons-round" style={{ fontSize: 64, color: 'var(--color-primary)', marginBottom: 24 }}>timer</span>
          <h2 className={styles.mainTitle}>Recently Submitted</h2>
          <p className={styles.subtitle}>You have already submitted a review recently.</p>
          <p className={styles.description}>
            To prevent spam, we only allow one submission every 2 minutes. 
            Please come back in about <strong>{spamError} minute{spamError > 1 ? 's' : ''}</strong>.
          </p>
          <div className={styles.divider} />
          <p className={styles.footerNote}>Thank you for your patience.</p>
        </div>
      )}

      {!spamError && (
        <>
      {/* ── Top Progress Bar ── */}
      {step > 0 && step <= TOTAL_STEPS && (
        <div className={styles.topProgressWrap}>
          <div className={styles.topProgressText}>
            <span>
              {currentStepData.type === 'serviceSelection' && 'Experience'}
              {currentStepData.type === 'mainQ'            && `${currentStepData.data.section}`}
              {currentStepData.type === 'contact'          && 'Contact Info'}
              {currentStepData.type === 'summary'          && 'Review'}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* ── Step 0: Welcome ── */}
      {currentStepData.type === 'welcome' && (
        <div className={styles.landingContainer}>
          <div className={styles.brandGroup}>
            <h1 className={styles.mainLogo}>Revanta</h1>
            <div className={styles.corporationBadge}>
              <span className="material-icons-round">business</span>
              <span>{settings.name}</span>
            </div>
            {activeDriver && (
              <div className={styles.corporationBadge} style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', color: '#2563EB' }}>
                <span className="material-icons-round">person</span>
                <span>Driver: {activeDriver.name}</span>
              </div>
            )}
          </div>

          <div className={styles.contentGroup}>
            <h2 className={styles.mainTitle}>Share Your Experience</h2>
            <p className={styles.subtitle}>Your feedback helps us serve you better.</p>
            <p className={styles.description}>
              Help us improve our service by sharing your thoughts about your recent experience.
            </p>
          </div>

          <button className={styles.startBtn} onClick={handleNext}>
            Start Review
          </button>

          <div className={styles.estimateTime}>
            <span className="material-icons-outlined">schedule</span>
            <div className={styles.timeBadge}>Takes about 2 minutes</div>
          </div>

          <div className={styles.divider} />

          <div className={styles.footer}>
            <p className={styles.footerNote}>Reference: {refNumber}</p>
          </div>
        </div>
      )}

      {/* ── Step 1: Service Selection ── */}
      {currentStepData.type === 'serviceSelection' && (
        <div className={styles.stepContainer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={handleBack}>
              <span className="material-icons-round">arrow_back</span>
              <span>Back</span>
            </button>
          )}

          <div className={styles.stepContent}>
            <h2 className={styles.serviceHeading}>Which services did you make use of?</h2>
            <p className={styles.serviceSubtext}>Select all that apply.</p>

            <div className={styles.serviceGrid}>
              {SERVICES.map((s) => {
                const isActive = selectedServices.includes(s.label);
                return (
                  <div
                    key={s.id}
                    className={`${styles.serviceCard} ${isActive ? styles.serviceCardActive : ''}`}
                    onClick={() => {
                      toggleService(s.label);
                      if (showValidationError) setShowValidationError(false);
                    }}
                  >
                    {isActive && (
                      <span className={`material-icons-round ${styles.checkIconSmall}`}>
                        check_circle
                      </span>
                    )}
                    <span className="material-icons-round">{s.icon}</span>
                    <span className={styles.serviceLabel}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {selectedServices.includes('Other') && (
              <div className={styles.textareaWrapper} style={{ marginTop: '24px' }}>
                <label className={styles.inputLabel} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>SPECIFY OTHER SERVICES</label>
                <textarea
                  className={styles.feedbackTextarea}
                  placeholder="e.g. Airport Transfer, City Tour"
                  value={otherServices}
                  onChange={(e) => setOtherServices(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>
            )}

            {showValidationError && (
              <p className={styles.validationText}>Please select at least one option to continue.</p>
            )}
          </div>

          <div className={styles.actionFixed}>
            <button
              className={`${styles.continueBtn} ${selectedServices.length > 0 ? styles.continueBtnActive : ''}`}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Main Rating Questions ── */}
      {currentStepData.type === 'mainQ' && (
        <div className={styles.stepContainer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={handleBack}>
              <span className="material-icons-round">arrow_back</span>
              <span>Back</span>
            </button>
          )}

          <div className={styles.stepContent}>
            <div className={styles.qIndexBadge}>
              {currentStepData.data.section}
            </div>
            <h2 className={styles.stepHeading}>{currentStepData.data.text}</h2>

            {currentStepData.data.type === 'rating' && (
              <div className={styles.optionsList}>
                {RATING_OPTIONS.map((opt) => {
                  const currentVal = mainRatings[currentStepData.data.id];
                  const isActive = currentVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={`${styles.ratingOptionCard} ${isActive ? styles.ratingOptionActive : ''}`}
                      onClick={() => handleMainRating(currentStepData.data.id, opt.value)}
                    >
                      <span className="material-icons-round" style={{ fontSize: '32px' }}>{opt.icon}</span>
                      <span className={styles.ratingLabel} style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                        {RATING_LABELS[opt.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStepData.data.type === 'choice' && (
              <div className={styles.optionsList}>
                {currentStepData.data.options.map((opt) => {
                  const currentVal = mainRatings[currentStepData.data.id];
                  const isActive = currentVal === opt;
                  return (
                    <button
                      key={opt}
                      className={`${styles.ratingOptionCard} ${isActive ? styles.ratingOptionActive : ''}`}
                      onClick={() => handleMainRating(currentStepData.data.id, opt)}
                    >
                      <span className={styles.ratingLabel} style={{ marginLeft: '12px' }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStepData.data.type === 'text' && (
              <div className={styles.textareaWrapper}>
                <textarea
                  className={styles.feedbackTextarea}
                  placeholder="Type your answer here..."
                  value={mainRatings[currentStepData.data.id] || ''}
                  onChange={(e) => handleMainRating(currentStepData.data.id, e.target.value)}
                />
              </div>
            )}
          </div>

          <div className={styles.actionFixed}>
            {(() => {
              const val = mainRatings[currentStepData.data.id];
              const hasSelected = currentStepData.data.optional ? true : (val !== undefined && val !== '');
              return (
                <button
                  className={`${styles.continueBtn} ${hasSelected ? styles.continueBtnActive : ''}`}
                  onClick={() => { if (hasSelected) handleNext(); }}
                >
                  {currentStepData.data.optional && !val ? 'Skip' : 'Continue'}
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Contact Info Step ── */}
      {currentStepData.type === 'contact' && (
        <div className={styles.stepContainer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={handleBack}>
              <span className="material-icons-round">arrow_back</span>
              <span>Back</span>
            </button>
          )}

          <div className={styles.stepContent}>
            <h2 className={styles.stepHeading}>Would you like us to follow up?</h2>

            <div
              className={`${styles.toggleCard} ${!isAnonymous ? styles.toggleCardActive : ''}`}
              onClick={() => setIsAnonymous((v) => !v)}
            >
              <div className={`${styles.toggleSwitch} ${!isAnonymous ? styles.toggleSwitchActive : ''}`}>
                <div className={styles.toggleKnob} />
              </div>
              <span className={styles.toggleLabel}>
                {isAnonymous ? 'Stay Anonymous' : 'I am willing to be contacted'}
              </span>
            </div>

            {!isAnonymous && (
              <div className={styles.contactForm}>
                {[
                  { key: 'name',  label: 'Name',  type: 'text' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                  { key: 'email', label: 'Email', type: 'email' },
                ].map(({ key, label, type }) => (
                  <div key={key} className={styles.inputGroup}>
                    <label className={styles.inputLabel}>{label}</label>
                    <input
                      type={type}
                      className={styles.contactInput}
                      value={contact[key]}
                      onChange={(e) => setContact((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actionFixed}>
            <button
              className={`${styles.continueBtn} ${isAnonymous || (contact.name && contact.phone) ? styles.continueBtnActive : ''}`}
              onClick={() => {
                if (isAnonymous || (contact.name && contact.phone)) handleNext();
              }}
            >
              Review Submission
            </button>
          </div>
        </div>
      )}

      {/* ── Summary & Submit ── */}
      {currentStepData.type === 'summary' && (
        <div className={styles.stepContainer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={handleBack}>
              <span className="material-icons-round">arrow_back</span>
              <span>Back</span>
            </button>
          )}

          <div className={styles.stepContent}>
            <h2 className={styles.stepHeading}>Review your feedback</h2>

            <div className={styles.summaryCard}>
              {/* Services Used */}
              <div className={styles.summarySection}>
                <label>SERVICES USED</label>
                <div className={styles.pillsRow}>
                  {selectedServices.map((s) => (
                    <span key={s} className={styles.pill}>{s}</span>
                  ))}
                </div>
              </div>

              {/* General Ratings */}
              <div className={styles.summarySection}>
                <label>RESPONSES</label>
                <div className={styles.summaryRatingsList}>
                  {QUESTIONS.map((q, idx) => {
                    const ans = mainRatings[q.id];
                    return (
                    <div key={q.id} className={styles.summaryRatingRow} style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '12px'}}>
                      <span className={styles.qLabel} style={{ fontWeight: 600 }}>{q.text}</span>
                      {q.type === 'rating' ? (
                        <div className={styles.qScore} data-rating={ans}>
                          <span>{RATING_LABELS[ans]}</span>
                        </div>
                      ) : (
                        <span className={styles.summaryValue} style={{ color: 'var(--color-primary)' }}>{ans || 'No response'}</span>
                      )}
                    </div>
                  )})}
                </div>
              </div>

              {/* Reference Number */}
              <div className={styles.refBox}>
                <label>YOUR REFERENCE NUMBER</label>
                <div className={styles.refCodeLarge}>{refNumber}</div>
              </div>
            </div>
          </div>

          <div className={styles.actionFixed}>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              <span className="material-icons-round">send</span>
              Submit Feedback
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default ReviewPage;
