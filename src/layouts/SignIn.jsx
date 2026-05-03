import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { driverLogin, adminLogin, changeDriverPin } from '../store/reviewsStore';
import './SignIn.css';

const DEMO_CREDENTIALS = {
  email: 'demo@revanta.app',
  password: 'demo1234',
};

const DRIVER_DEMO = {
  phone: '0240000000',
  pin: '1234'
};

export default function SignIn() {
  const [role, setRole] = useState('corporation'); // 'corporation' or 'driver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetState, setResetState] = useState({ active: false, driverId: null });
  
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleCorpSubmit = (e) => {
    e.preventDefault();
    const result = adminLogin(email, password);
    if (result.success) {
      navigate('/admin/overview');
    } else {
      setError(result.message);
    }
  };

  const handleDriverSubmit = (e) => {
    e.preventDefault();
    const result = driverLogin(phone, pin);
    if (result.success) {
      if (result.needsPinReset) {
        setResetState({ active: true, driverId: result.driverId });
        setError('');
      } else {
        navigate('/driver/overview');
      }
    } else {
      setError(result.message);
    }
  };

  const handlePinReset = (e) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    changeDriverPin(resetState.driverId, newPin);
    const result = driverLogin(phone, newPin);
    if (result.success) {
      navigate('/driver/overview');
    }
  };

  const handleDemoFill = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  const handleDriverDemoFill = () => {
    setPhone(DRIVER_DEMO.phone);
    setPin(DRIVER_DEMO.pin);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="bg-grid"></div>
      
      <button type="button" className="auth-theme-toggle" onClick={toggleTheme}>
        <span className="material-icons-round">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>

      <div className="auth-card">
        {resetState.active ? (
          <form onSubmit={handlePinReset} className="auth-form">
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create New PIN</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                For security, please set a new 4-digit PIN for your account.
              </p>
            </div>

            <div className="form-group">
              <label>New 4-Digit PIN</label>
              <input
                type="password"
                className="mono-input"
                placeholder="••••"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New PIN</label>
              <input
                type="password"
                className="mono-input"
                placeholder="••••"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            {error && <p className="error-text" style={{ marginTop: '16px' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
              Set PIN & Continue
            </button>
          </form>
        ) : (
          <>
            <div className="auth-header">
              <div className="brand-logo">
                <span className="brand-wordmark">Revanta</span>
                <span className="material-icons-round brand-icon">directions_car</span>
              </div>

              <div className="role-toggles">
                <button 
                  className={`role-tab ${role === 'corporation' ? 'active' : ''}`}
                  onClick={() => { setRole('corporation'); setError(''); }}
                >
                  Corporation
                </button>
                <button 
                  className={`role-tab ${role === 'driver' ? 'active' : ''}`}
                  onClick={() => { setRole('driver'); setError(''); }}
                >
                  Driver
                </button>
              </div>
            </div>

            {role === 'corporation' ? (
              <form onSubmit={handleCorpSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@revanta.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <span className="material-icons-round">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <label className="checkbox-container">
                    <input type="checkbox" />
                    <span className="checkmark" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" title="Forgot Password Page" className="text-link">
                    Forgot password?
                  </Link>
                </div>

                {error && <p className="error-text" style={{ marginTop: '16px' }}>{error}</p>}

                <button type="submit" className="btn-primary">
                  Sign In
                </button>

                <button type="button" className="btn-outline" onClick={handleDemoFill}>
                  Use Demo Account
                </button>

                <div className="auth-footer">
                  No account?{' '}
                  <Link to="/signup" title="Sign Up Page" className="text-link">
                    Sign up free
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDriverSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="e.g. 0240000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pin">PIN</label>
                  <input
                    type="password"
                    id="pin"
                    className="mono-input"
                    placeholder="••••"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {error && <p className="error-text" style={{ marginTop: '16px' }}>{error}</p>}

                <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
                  Sign In
                </button>

                <button type="button" className="btn-outline" onClick={handleDriverDemoFill}>
                  Use Demo Driver Account
                </button>

                <div className="driver-helper">
                  <p>Log in with your registered phone number and the PIN provided by your corporation.</p>
                  <Link to="#" onClick={(e) => { e.preventDefault(); alert('Please contact your corporation admin to reset your PIN.'); }} className="text-link small">
                    Forgot PIN?
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
