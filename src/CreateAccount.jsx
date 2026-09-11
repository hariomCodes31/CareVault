import { useState } from 'react';
import { generatePatientId, createAccount } from './services/authService';
import './CreateAccount.css';

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

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ── Roles ────────────────────────────────────────────────────────────────────
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

export default function CreateAccount({ onReturnToLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  // Auto-generate guaranteed unique Patient ID lazily from storage
  const [patientId] = useState(() => generatePatientId());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(null);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
  };

  const validate = () => {
    const errs = {};

    if (!selectedRole) {
      errs.role = 'Please select a role to continue.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    await new Promise((res) => setTimeout(res, 600));

    const result = createAccount({
      role: selectedRole,
      patientId,
      password,
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ form: result.error });
      return;
    }

    setCreatedSuccess({
      patientId: result.user.patientId,
      role: result.user.role,
    });
  };

  return (
    <div className="create-account-page">
      <main className="create-account-center-wrapper">
        <div className="create-account-card">
          {/* Top Bar with Back Button */}
          <div className="create-account-top-bar">
            <button
              type="button"
              className="back-to-signin-btn"
              onClick={onReturnToLogin}
            >
              <IconArrowLeft /> Back to Sign In
            </button>
          </div>

          {/* Logo Header */}
          <div className="create-account-brand-header">
            <img
              src="/logo.jpeg"
              alt="CareVault Logo"
              className="create-account-logo-img"
            />
          </div>

          <header className="create-account-card-header">
            <h1 className="create-account-welcome">Create New Account</h1>
            <p className="create-account-subtitle">
              Create your CareVault login credentials
            </p>
          </header>

          {createdSuccess ? (
            <div className="create-success-card" role="status" aria-live="polite">
              <div className="create-success-icon-wrap">
                <IconCheckCircle />
              </div>
              <h2 className="create-success-title">Account created successfully.</h2>
              <p className="create-success-subtext">
                Your account is ready. Use the Patient ID below to sign in.
              </p>

              <div className="create-success-id-badge">
                Patient ID: <strong>{createdSuccess.patientId}</strong>
              </div>

              <button
                type="button"
                className="create-account-btn-primary"
                onClick={onReturnToLogin}
              >
                Continue to Sign In <IconArrow />
              </button>
            </div>
          ) : (
            <form
              className="create-account-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Create account form"
            >
              {errors.form && (
                <div className="create-form-error" role="alert">
                  <IconAlert />
                  {errors.form}
                </div>
              )}

              {/* Role Selection */}
              <div className="role-section" role="group" aria-labelledby="create-role-label">
                <span className="role-label" id="create-role-label">SELECT YOUR ROLE</span>

                <div className="role-grid" role="radiogroup" aria-label="User role">
                  {ROLES.map(({ id, name, desc, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selectedRole === id}
                      id={`create-role-${id}`}
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
                  <div className="role-error" role="alert">
                    <IconAlert />
                    {errors.role}
                  </div>
                )}
              </div>

              {/* Patient ID (Read-only / Immutable) */}
              <div className="field-group">
                <label className="field-label" htmlFor="create-patientId">
                  Patient ID
                </label>
                <div className="field-input-wrap">
                  <input
                    id="create-patientId"
                    type="text"
                    className="field-input readonly-input"
                    value={patientId}
                    readOnly
                    disabled
                    aria-describedby="create-patientId-hint"
                  />
                  <span className="field-icon" aria-hidden="true">
                    <IconUser />
                  </span>
                </div>
                <span id="create-patientId-hint" className="field-hint">
                  Patient ID generated automatically
                </span>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="create-password">
                  Password
                </label>
                <div className="field-input-wrap">
                  <input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`field-input has-toggle${errors.password ? ' error' : ''}`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    aria-describedby={errors.password ? 'create-password-error' : undefined}
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
                    disabled={loading}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && (
                  <span id="create-password-error" className="field-error" role="alert">
                    <IconAlert />
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="field-input-wrap">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`field-input has-toggle${errors.confirmPassword ? ' error' : ''}`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    aria-invalid={!!errors.confirmPassword}
                    disabled={loading}
                  />
                  <span className="field-icon" aria-hidden="true">
                    <IconLock />
                  </span>
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span id="confirm-password-error" className="field-error" role="alert">
                    <IconAlert />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="create-account-submit-btn"
                className="create-account-btn-primary"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <IconArrow />
                  </>
                )}
              </button>

              {/* Return to Login */}
              <div className="create-account-footer-row">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="login-return-btn"
                  onClick={onReturnToLogin}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          <footer className="create-account-card-footer">
            © {new Date().getFullYear()} CareVault · Healthcare Management System
          </footer>
        </div>
      </main>
    </div>
  );
}
