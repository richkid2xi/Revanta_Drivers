import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import styles from './LoginPage.module.css';

const DEMO_USER = { username: 'admin@Revanta.com', password: 'Revantax01!' };

function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // errorType: null | 'empty' | 'invalid'
  const [errorType, setErrorType] = useState(null);
  const [loading, setLoading] = useState(false);

  function fillDemo() {
    setUsername(DEMO_USER.username);
    setPassword(DEMO_USER.password);
    setErrorType(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorType(null);

    // Client-side: empty field check
    if (!username.trim() || !password) {
      setErrorType('empty');
      return;
    }

    setLoading(true);
    // Simulate async auth (replace with real API call)
    await new Promise((r) => setTimeout(r, 900));

    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      localStorage.setItem('Revanta_session_corporation_id', 'H001');
      navigate('/admin/overview');
    } else {
      setErrorType('invalid');
    }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      {/* ── Theme toggle ──────────────────────────────── */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className="material-icons-round" style={{ fontSize: 20 }}>
          {theme === 'dark' ? 'wb_sunny' : 'dark_mode'}
        </span>
      </button>

      {/* ── Card ──────────────────────────────────────── */}
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.wordmark}>
            <h1 className={styles.brand}>Revanta</h1>
          </div>
          <p className={styles.corporation}>EliTech CreaTives</p>
          <p className={styles.system}>Client Feedback Platform</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-username">
              Username
            </label>
            <div className={styles.inputWrapper}>
              <span className={`material-icons-outlined ${styles.inputIcon}`}>
                person
              </span>
              <input
                id="login-username"
                type="text"
                className={styles.input}
                placeholder="somebody@gmail.com"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrorType(null); }}
                autoComplete="username"
                spellCheck={false}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="login-password">
                Password
              </label>
              <button type="button" className={styles.inlineForgotBtn}>
                Forgot?
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <span className={`material-icons-outlined ${styles.inputIcon}`}>
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.inputWithEndIcon}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorType(null); }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <span className="material-icons-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorType === 'empty' && (
            <div className={styles.errorMsg} role="alert">
              <span className="material-icons-round" style={{ fontSize: 16 }}>error_outline</span>
              Enter credentials to continue.
            </div>
          )}
          {errorType === 'invalid' && (
            <div className={`${styles.errorMsg} ${styles.errorInvalid}`} role="alert">
              <span className="material-icons-round" style={{ fontSize: 16 }}>lock_person</span>
              Incorrect login details.
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-sign-in"
            type="submit"
            className={styles.signInBtn}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <div className={styles.signupPrompt}>
          New to Revanta? <button className={styles.signupLink} onClick={() => navigate('/signup')}>Create your business account</button>
        </div>

        {/* Demo account box */}
        <div className={styles.demoBox}>
          <div className={styles.demoHeader}>
            <span className={styles.demoLabel}>Demo Account</span>
            <button
              id="btn-use-demo"
              type="button"
              className={styles.useThisBtn}
              onClick={fillDemo}
            >
              Autofill
            </button>
          </div>
          <div className={styles.demoCredentials}>
            <code className={styles.demoCode}>{DEMO_USER.username}</code>
            <code className={styles.demoCode}>{DEMO_USER.password}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
