import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './SignIn.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSendLink = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setStep(3);
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            navigate('/signin');
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, navigate]);

  useEffect(() => {
    let s = 0;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  return (
    <div className="auth-page-wrapper">
      <div className="bg-grid"></div>
      
      <button type="button" className="auth-theme-toggle" onClick={toggleTheme}>
        <span className="material-icons-round">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>

      <div className="auth-card">
        {step === 1 && (
          <form onSubmit={handleSendLink} className="auth-form">
            <h2 className="step-title" style={{ textAlign: 'center' }}>Reset Password</h2>
            <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '-16px', marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Enter your email and we'll send a reset link.
            </p>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@corporation.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Send Reset Link</button>
            <div className="auth-footer">
              <Link to="/signin" className="text-link">&larr; Back to Sign In</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="auth-form" style={{ textAlign: 'center' }}>
            <div className="success-icon-anim" style={{ width: '64px', height: '64px' }}>
              <span className="material-icons-round" style={{ fontSize: '32px' }}>mark_email_read</span>
            </div>
            <h2 className="step-title">Check your inbox</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              We sent a reset link to <br/><strong>{email}</strong>
            </p>
            <button className="btn-primary" onClick={() => setStep(4)}>Enter New Password</button>
            <button className="btn-ghost" style={{ marginTop: '16px' }} onClick={() => alert('Link resent!')}>Resend link</button>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <h2 className="step-title" style={{ textAlign: 'center' }}>New Password</h2>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <div className="strength-meter">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`strength-segment ${i <= strength ? 'active' : ''}`} />
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary">Reset Password</button>
          </form>
        )}

        {step === 3 && (
          <div className="auth-form" style={{ textAlign: 'center' }}>
            <div className="success-icon-anim" style={{ width: '64px', height: '64px' }}>
              <span className="material-icons-round" style={{ fontSize: '32px' }}>check</span>
            </div>
            <h2 className="step-title">Password Reset</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Your password has been updated successfully.
            </p>
            <p style={{ fontFamily: 'JetBrains Mono', color: '#2563EB', fontWeight: 700, fontSize: '18px', marginTop: '24px' }}>
              Redirecting in {countdown}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
