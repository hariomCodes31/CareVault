import { useState } from 'react';
import './LoginPage.css';

// ── CareVault Brand Logo Component ──────────────────────────────────────────

const CareVaultLogo = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="40" height="40" rx="10" fill="url(#cv-logo-grad)" />
    {/* Shield outline */}
    <path
      d="M20 8L29 12V19.5C29 25 25.2 29.8 20 31.2C14.8 29.8 11 25 11 19.5V12L20 8Z"
      fill="white"
      fillOpacity="0.2"
      stroke="white"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Medical Cross */}
    <path
      d="M20 14V25M14.5 19.5H25.5"
      stroke="white"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="cv-logo-grad"
        x1="0"
        y1="0"
        x2="40"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

// ── SVG Icons ───────────────────────────────────────────────────────────────

const IconDoctor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
    <path d="M8 9V7a4 4 0 0 1 8 0v2"/>
    <path d="M12 12v4"/>
    <path d="M10 14h4"/>
  </svg>
);

const IconNurse = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const IconReception = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);

const IconAdmin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M12 14c-6 0-8 2-8 4v2h16v-2c0-2-2-4-8-4z"/>
    <path d="M17.5 15.5l1.5 1.5 3-3"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M1 1l22 22"/>
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

// ── Role Definitions ─────────────────────────────────────────────────────────

const ROLES = [
  {
    id: 'doctor',
    name: 'Doctor',
    desc: 'Access patient history and case-taking',
    Icon: IconDoctor,
  },
  {
    id: 'nurse',
    name: 'Nurse',
    desc: 'Record vitals and assist with visits',
    Icon: IconNurse,
  },
  {
    id: 'reception',
    name: 'Reception',
    desc: 'Register patients and manage appointments',
    Icon: IconReception,
  },
  {
    id: 'admin',
    name: 'Admin',
    desc: 'Manage users and system settings',
    Icon: IconAdmin,
  },
];

// ── Validation ───────────────────────────────────────────────────────────────

function validate({ userId, password, role }) {
  const errors = {};

  if (!role) {
    errors.role = 'Please select your role to continue.';
  }

  if (!userId.trim()) {
    errors.userId = 'User ID or email is required.';
  } else if (
    userId.includes('@') &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId)
  ) {
    errors.userId = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 4) {
    errors.password = 'Password must be at least 4 characters.';
  }

  return errors;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleUserId = (e) => {
    setUserId(e.target.value);
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }));
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate({ userId, password, role: selectedRole });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    // Mock login delay
    await new Promise((res) => setTimeout(res, 1500));

    setLoading(false);

    const roleName = ROLES.find((r) => r.id === selectedRole)?.name;
    showToast(`Welcome! Signed in as ${roleName}.`);
  };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ──────────────────────────────── */}
      <div className="login-left">
        <div className="left-grid" aria-hidden="true" />

        <div className="left-content">
          {/* Brand */}
          <div className="left-brand">
            <CareVaultLogo size={38} />
            <span className="left-brand-name">CareVault</span>
          </div>

          {/* Visual */}
          <div className="left-visual">
            <img
              src="/healthcare-visual.png"
              alt="Healthcare management illustration"
              className="left-visual-img"
            />
          </div>

          {/* Taglines */}
          <div className="left-taglines">
            <h1 className="left-tagline-main">
              Every Visit.<br />
              <span>A Clearer Tomorrow.</span>
            </h1>
            <p className="left-tagline-sub">
              Unified healthcare records for every patient, every visit —
              built for teams that put care first.
            </p>

            <div className="left-pills" role="list">
              {['Structured Case-Taking', 'Smarter Healthcare', 'Stronger Continuity'].map((pill) => (
                <span className="left-pill" role="listitem" key={pill}>
                  <span className="left-pill-dot" aria-hidden="true" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="sih-badge">
              <IconAward />
              Smart India Hackathon 2026
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────── */}
      <main className="login-right">
        <div className="login-card">
          {/* Mobile-only brand header */}
          <div className="login-logo-mobile" aria-hidden="true">
            <CareVaultLogo size={32} />
            <span className="login-logo-mobile-name">CareVault</span>
          </div>

          <header className="login-card-header">
            <h2 className="login-welcome">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to access your CareVault dashboard.
            </p>
          </header>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="CareVault login form"
          >
            {/* Role Selection */}
            <div className="role-section" role="group" aria-labelledby="role-label">
              <span className="role-label" id="role-label">Select your role</span>

              <div className="role-grid" role="radiogroup" aria-label="User role">
                {ROLES.map(({ id, name, desc, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selectedRole === id}
                    id={`role-${id}`}
                    className={`role-card${selectedRole === id ? ' active' : ''}`}
                    onClick={() => handleRoleSelect(id)}
                  >
                    <div className="role-icon-wrap" aria-hidden="true">
                      <Icon />
                    </div>
                    <div className="role-info">
                      <div className="role-name">{name}</div>
                      <div className="role-desc">{desc}</div>
                    </div>
                    <div className="role-check" aria-hidden="true">
                      <IconCheck />
                    </div>
                  </button>
                ))}
              </div>

              {errors.role && (
                <div className="role-error" role="alert" aria-live="assertive">
                  <IconAlert />
                  {errors.role}
                </div>
              )}
            </div>

            {/* User ID */}
            <div className="field-group">
              <label className="field-label" htmlFor="userId">
                User ID / Email
              </label>
              <div className="field-input-wrap">
                <input
                  id="userId"
                  type="text"
                  className={`field-input${errors.userId ? ' error' : ''}`}
                  placeholder="Enter your user ID or email"
                  value={userId}
                  onChange={handleUserId}
                  autoComplete="username"
                  aria-describedby={errors.userId ? 'userId-error' : undefined}
                  aria-invalid={!!errors.userId}
                  disabled={loading}
                />
                <span className="field-icon" aria-hidden="true">
                  <IconUser />
                </span>
              </div>
              {errors.userId && (
                <span
                  id="userId-error"
                  className="field-error"
                  role="alert"
                  aria-live="assertive"
                >
                  <IconAlert />
                  {errors.userId}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="field-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`field-input has-toggle${errors.password ? ' error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePassword}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                  disabled={loading}
                />
                <span className="field-icon" aria-hidden="true">
                  <IconLock />
                </span>
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                  disabled={loading}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && (
                <span
                  id="password-error"
                  className="field-error"
                  role="alert"
                  aria-live="assertive"
                >
                  <IconAlert />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Forgot password */}
            <div className="login-form-row">
              <a
                href="#forgot"
                className="forgot-link"
                onClick={(e) => e.preventDefault()}
                aria-label="Reset your password"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="login-btn"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="login-btn-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <IconArrow />
                </>
              )}
            </button>
          </form>

          <footer className="login-card-footer">
            © {new Date().getFullYear()} CareVault · Smart India Hackathon 2026
          </footer>
        </div>
      </main>

      {/* Success Toast */}
      {toastVisible && (
        <div
          className="login-toast"
          role="status"
          aria-live="polite"
          aria-label={toastMessage}
        >
          <div className="login-toast-icon">
            <IconCheckCircle />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
