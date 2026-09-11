import { useState } from 'react';
import { authenticate } from './services/authService';
import './LoginPage.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconDoctor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    <path d="M12 12v4" />
    <path d="M10 14h4" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M1 1l22 22" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Role Definitions (Doctor & Patient Only) ─────────────────────────────────
const ROLES = [
  {
    id: 'doctor',
    name: 'Doctor',
    desc: 'Access patient history and case-taking',
    Icon: IconDoctor,
  },
  {
    id: 'patient',
    name: 'Patient',
    desc: 'View your health records, prescriptions, appointments and follow-up information.',
    Icon: IconUser,
  },
];

// Regex Format Rules
const DOCTOR_ID_REGEX = /^DR\d{4}-\d{6}$/i;
const PATIENT_ID_REGEX = /^CV\d{4}-\d{6}$/i;

// ── Client Format Validation ──────────────────────────────────────────────────
function validate({ accountId, password, role }) {
  const errors = {};

  if (!role) {
    errors.role = 'Please select your role to continue.';
    return errors;
  }

  const idLabel = role === 'doctor' ? 'Doctor ID' : 'Patient ID';
  const cleanId = (accountId || '').trim();

  if (!cleanId) {
    errors.accountId = `${idLabel} is required.`;
  } else if (role === 'doctor' && !DOCTOR_ID_REGEX.test(cleanId)) {
    errors.accountId = 'Please enter a valid Doctor ID (DRYYYY-XXXXXX).';
  } else if (role === 'patient' && !PATIENT_ID_REGEX.test(cleanId)) {
    errors.accountId = 'Please enter a valid Patient ID (CVYYYY-XXXXXX).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage({ onLoginSuccess, onNavigateToCreateAccount }) {
  // Default selected role is Doctor
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // When switching roles, clear the identifier input to prevent accidental leakage
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setAccountId('');
    setErrors({});
  };

  const handleAccountId = (e) => {
    setAccountId(e.target.value);
    if (errors.accountId || errors.form) {
      setErrors((prev) => ({ ...prev, accountId: undefined, form: undefined }));
    }
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (errors.password || errors.form) {
      setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate({ accountId, password, role: selectedRole });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    await new Promise((res) => setTimeout(res, 600));

    // Call authentication service with role, id, and password
    const authResult = authenticate({
      role: selectedRole,
      id: accountId,
      password,
    });

    setLoading(false);

    if (!authResult.success) {
      setErrors({ form: authResult.error });
      return;
    }

    const roleName = ROLES.find((r) => r.id === selectedRole)?.name;
    showToast(`Welcome! Signed in as ${roleName}.`);

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(authResult.session);
      }
    }, 400);
  };



  const idLabelText = selectedRole === 'doctor' ? 'Doctor ID' : 'Patient ID';
  const idPlaceholderText = selectedRole === 'doctor' ? 'Enter your Doctor ID' : 'Enter your Patient ID';

  return (
    <div className="login-page">
      <main className="login-center-wrapper">
        {/* CHANGE 2: Small and elegant About CareVault introduction */}
        <div className="login-about-intro" aria-label="About CareVault">
          <div className="login-about-tag">
            <span className="login-about-dot" aria-hidden="true" />
            <span>About CareVault</span>
          </div>
          <p className="login-about-heading">
            CareVault brings patient information, clinical history and healthcare workflows together in one secure digital platform.
          </p>
          <p className="login-about-subtext">
            Engineered for clinical precision, patient privacy, and uninterrupted continuity of care.
          </p>
        </div>

        {/* CHANGE 1: Landscape Layout (1/3 Supportive Doctor Image + 2/3 Main Login Section) */}
        <div className="login-landscape-card">
          {/* 1/3 Supportive Healthcare Professional Visual */}
          <aside className="login-doctor-panel" aria-label="Clinical Professional Support">
            <div className="login-doctor-img-container">
              <img
                src="/doctor-login-visual.jpg"
                alt="Healthcare professional in clinical environment"
                className="login-doctor-photo"
              />
              <div className="login-doctor-gradient" aria-hidden="true" />
              <div className="login-doctor-overlay-card">
                <span className="login-doctor-chip">Clinical Sanctuary</span>
                <p className="login-doctor-quote">
                  "Guarding every patient story with precision, trust, and continuous care."
                </p>
              </div>
            </div>
          </aside>

          {/* 2/3 Main Login Section */}
          <section className="login-form-panel">
            {/* CareVault Logo Header using logo.jpeg */}
            <div className="login-brand-header">
              <img
                src="/logo.jpeg"
                alt="CareVault Logo"
                className="login-logo-img"
              />
            </div>

          <header className="login-card-header">
            <h1 className="login-welcome">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to access your CareVault account.
            </p>
          </header>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="CareVault login form"
          >
            {errors.form && (
              <div className="login-form-error" role="alert">
                <IconAlert />
                {errors.form}
              </div>
            )}

            {/* Role Selection */}
            <div className="role-section" role="group" aria-labelledby="role-label">
              <span className="role-label" id="role-label">SELECT YOUR ROLE</span>

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

            {/* Role-Specific ID Field (Doctor ID vs Patient ID) */}
            <div className="field-group">
              <label className="field-label" htmlFor="accountId">
                {idLabelText}
              </label>
              <div className="field-input-wrap">
                <input
                  id="accountId"
                  type="text"
                  className={`field-input${errors.accountId ? ' error' : ''}`}
                  placeholder={idPlaceholderText}
                  value={accountId}
                  onChange={handleAccountId}
                  autoComplete="username"
                  aria-describedby={errors.accountId ? 'accountId-error' : undefined}
                  aria-invalid={!!errors.accountId}
                  disabled={loading}
                />
                <span className="field-icon" aria-hidden="true">
                  {selectedRole === 'doctor' ? <IconDoctor /> : <IconUser />}
                </span>
              </div>
              {errors.accountId && (
                <span
                  id="accountId-error"
                  className="field-error"
                  role="alert"
                  aria-live="assertive"
                >
                  <IconAlert />
                  {errors.accountId}
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

          {/* Create New Account Option */}
          <div className="login-create-account-wrap">
            <span className="create-account-text">New to CareVault?</span>
            <button
              type="button"
              className="create-account-btn"
              onClick={onNavigateToCreateAccount}
            >
              Create New Account
            </button>
          </div>

          <footer className="login-card-footer">
            © {new Date().getFullYear()} CareVault · Healthcare Management System
          </footer>
          </section>
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
