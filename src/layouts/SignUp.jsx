import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './SignUp.css';

const steps = [
  { id: 1, label: 'Corporation' },
  { id: 2, label: 'Fleet' },
  { id: 3, label: 'Plan' },
  { id: 4, label: 'Admin' },
  { id: 5, label: 'Payment' },
];

const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", 
  "Greater Accra", "North East", "Northern", "Oti", "Savannah", 
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const VEHICLE_TYPES = [
  'Taxi', 'Ride-hailing', 'Bus', 'Minibus', 'Intercity', 'Other'
];

const JOB_TITLES = [
  'Operations Manager', 'Corporation Admin', 'Owner', 'IT Manager', 'Other'
];

const PRICING_TIERS = [
  { id: 'starter', label: 'Starter', range: '1-50 Cars', price: 500, max: 50 },
  { id: 'pro', label: 'Pro', range: '51-100 Cars', price: 900, max: 100 },
  { id: 'enterprise', label: 'Enterprise', range: '101+ Cars', price: 1500, max: 1000 }
];

export default function SignUp() {
  const { theme, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    corpName: '',
    regNumber: '',
    region: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    driverCount: 1,
    vehicleTypes: [],
    plan: 'starter',
    fullName: '',
    jobTitle: '',
    adminPhone: '',
    adminEmail: '',
    password: '',
    paymentNumber: ''
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const selectedTier = useMemo(() => {
    return PRICING_TIERS.find(t => t.id === formData.plan) || PRICING_TIERS[0];
  }, [formData.plan]);

  useEffect(() => {
    // Auto-update plan based on driver count
    if (formData.driverCount <= 50) updateFormData('plan', 'starter');
    else if (formData.driverCount <= 100) updateFormData('plan', 'pro');
    else updateFormData('plan', 'enterprise');
  }, [formData.driverCount]);

  const handleNext = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(s => Math.min(s + 1, 6));
  };

  const handlePrev = () => {
    setCurrentStep(s => Math.max(s - 1, 1));
  };

  const toggleVehicleType = (type) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type) 
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Password strength calculation
  useEffect(() => {
    let score = 0;
    const p = formData.password;
    if (p.length > 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPasswordStrength(score);
  }, [formData.password]);

  if (currentStep === 6) {
    const trialDate = new Date();
    trialDate.setDate(trialDate.getDate() + 14);
    const trialStr = trialDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <div className="auth-page-wrapper">
        <div className="bg-grid"></div>
        <div className="success-card">
          <div className="success-icon-anim">
            <span className="material-icons-round">check</span>
          </div>
          <h1 className="success-title">Welcome to Revanta!</h1>
          <p className="success-corp-name">{formData.corpName}</p>
          
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Fleet Size</span>
              <span className="summary-value mono">{formData.driverCount} Drivers</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Selected Tier</span>
              <span className="summary-value mono">{selectedTier.label} ({selectedTier.range})</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Trial Period</span>
              <span className="summary-value mono">Ends {trialStr}</span>
            </div>
          </div>

          <Link to="/admin/overview" className="btn-primary success-btn">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="bg-grid"></div>
      
      <button type="button" className="auth-theme-toggle" onClick={toggleTheme}>
        <span className="material-icons-round">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>

      <div className="signup-wizard-container">
        {/* Stepper Header */}
        <div className="wizard-stepper">
          {steps.map(s => (
            <div key={s.id} className={`wizard-step ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'completed' : ''}`}>
              <div className="step-num">
                {currentStep > s.id ? <span className="material-icons-round">check</span> : s.id}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="auth-card wizard-card">
          {currentStep === 1 && (
            <form onSubmit={handleNext} className="auth-form">
              <h2 className="step-title">Corporation Details</h2>
              <div className="form-group">
                <label>Corporation name</label>
                <input type="text" placeholder="e.g. Accra Executive Transport" value={formData.corpName} onChange={e => updateFormData('corpName', e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Registration number</label>
                  <input type="text" placeholder="REG-123456" value={formData.regNumber} onChange={e => updateFormData('regNumber', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select value={formData.region} onChange={e => updateFormData('region', e.target.value)} required>
                    <option value="">Select Region</option>
                    {ghanaRegions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Office address</label>
                <input type="text" placeholder="123 Street, Accra" value={formData.address} onChange={e => updateFormData('address', e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact phone</label>
                  <input type="tel" placeholder="+233 XXX XXX XXX" value={formData.phone} onChange={e => updateFormData('phone', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Contact email</label>
                  <input type="email" placeholder="contact@corp.com" value={formData.email} onChange={e => updateFormData('email', e.target.value)} required />
                </div>
              </div>
              <div className="wizard-actions">
                <Link to="/signin" className="text-link">Already have an account?</Link>
                <button type="submit" className="btn-primary">Next Step</button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleNext} className="auth-form">
              <h2 className="step-title">Fleet Information</h2>
              <div className="form-group">
                <label>Vehicle count (Total Fleet Size)</label>
                <div className="stepper-input">
                  <button type="button" onClick={() => updateFormData('driverCount', Math.max(1, formData.driverCount - 1))}>
                    <span className="material-icons-round">remove</span>
                  </button>
                  <span className="mono">{formData.driverCount}</span>
                  <button type="button" onClick={() => updateFormData('driverCount', formData.driverCount + 1)}>
                    <span className="material-icons-round">add</span>
                  </button>
                </div>
                <p className="form-hint">Current Tier: <strong>{selectedTier.label}</strong> ({selectedTier.range})</p>
              </div>
              <div className="form-group">
                <label>Vehicle types</label>
                <div className="vehicle-grid">
                  {VEHICLE_TYPES.map(type => (
                    <div 
                      key={type} 
                      className={`vehicle-chip ${formData.vehicleTypes.includes(type) ? 'active' : ''}`}
                      onClick={() => toggleVehicleType(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
              <div className="wizard-actions">
                <button type="button" className="btn-ghost" onClick={handlePrev}>Back</button>
                <button type="submit" className="btn-primary">Next Step</button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleNext} className="auth-form">
              <h2 className="step-title">Subscription Tier</h2>
              <div className="plan-selection tiered">
                {PRICING_TIERS.map(tier => (
                  <div 
                    key={tier.id}
                    className={`plan-option-card ${formData.plan === tier.id ? 'active' : ''} ${tier.id === 'pro' ? 'premium' : ''}`}
                    onClick={() => {
                      updateFormData('plan', tier.id);
                      // Adjust count if it's below the tier's logic? 
                      // Actually, better to just let the tier be selected based on count, 
                      // but if they click a tier here, maybe we should adjust the count?
                      // No, let's keep it informative.
                    }}
                  >
                    {tier.id === 'pro' && <div className="most-popular">Recommended</div>}
                    <div className="plan-info">
                      <h3>{tier.label}</h3>
                      <p>{tier.range}</p>
                    </div>
                    <div className="plan-cost">
                      <span className="mono">GH₵{tier.price}</span>
                      <span className="unit">/month</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-calculation-box">
                <span className="calc-label">Total Monthly Subscription</span>
                <span className="calc-total mono">GH₵{selectedTier.price}</span>
              </div>

              <div className="wizard-actions">
                <button type="button" className="btn-ghost" onClick={handlePrev}>Back</button>
                <button type="submit" className="btn-primary">Next Step</button>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleNext} className="auth-form">
              <h2 className="step-title">Admin Account</h2>
              <div className="form-group">
                <label>Full name</label>
                <input type="text" placeholder="Kofi Asante" value={formData.fullName} onChange={e => updateFormData('fullName', e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job title</label>
                  <select value={formData.jobTitle} onChange={e => updateFormData('jobTitle', e.target.value)} required>
                    <option value="">Select Title</option>
                    {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="+233 XXX XXX XXX" value={formData.adminPhone} onChange={e => updateFormData('adminPhone', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="admin@corp.com" value={formData.adminEmail} onChange={e => updateFormData('adminEmail', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={formData.password} onChange={e => updateFormData('password', e.target.value)} required />
                <div className="strength-meter">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`strength-segment ${i <= passwordStrength ? 'active' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="label-text">I agree to the Terms and Conditions</span>
                </label>
              </div>
              <div className="wizard-actions">
                <button type="button" className="btn-ghost" onClick={handlePrev}>Back</button>
                <button type="submit" className="btn-primary">Next Step</button>
              </div>
            </form>
          )}

          {currentStep === 5 && (
            <form onSubmit={handleNext} className="auth-form">
              <h2 className="step-title">Payment Activation</h2>
              <div className="order-summary">
                <div className="order-item">
                  <span>{selectedTier.label} Plan ({selectedTier.range})</span>
                  <span className="mono">GH₵{selectedTier.price}</span>
                </div>
                <div className="trial-note">14-day free trial applies. No charges today.</div>
              </div>

              <div className="payment-toggle">
                <button type="button" className="pay-tab active">MoMo / Telecel Cash</button>
              </div>

              <div className="form-group">
                <label>Mobile Money number</label>
                <input type="tel" placeholder="0XX XXX XXXX" value={formData.paymentNumber} onChange={e => updateFormData('paymentNumber', e.target.value)} required />
              </div>

              <div className="grand-total-box">
                <span className="label">Grand Total</span>
                <span className="total mono">GH₵{selectedTier.price}</span>
              </div>

              <button type="submit" className="btn-primary pay-button">
                Activate Subscription
              </button>

              <div className="wizard-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn-ghost" onClick={handlePrev}>Back</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
