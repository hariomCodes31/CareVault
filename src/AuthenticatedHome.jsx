import './AuthenticatedHome.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function AuthenticatedHome({ session, onSignOut }) {
  const isDoctor = session?.role === 'doctor';
  const roleName = isDoctor ? 'Doctor' : 'Patient';
  const idLabel = isDoctor ? 'Doctor ID:' : 'Patient ID:';
  const accountId = session?.id || session?.doctorId || session?.patientId;

  return (
    <div className="auth-home-container">
      {/* Top Navbar */}
      <nav className="auth-nav">
        <div className="auth-nav-brand">
          <img src="/logo.jpeg" alt="CareVault" className="auth-nav-logo" />
          <span className="auth-nav-title">CareVault</span>
          <span className="auth-nav-role-badge">{roleName} Portal</span>
        </div>

        <button type="button" className="auth-signout-btn" onClick={onSignOut}>
          <IconLogOut /> Sign Out
        </button>
      </nav>

      {/* Main Content */}
      <main className="auth-home-main">
        <div className="auth-home-card">
          <div className="auth-status-badge">
            <IconCheckCircle /> Authenticated Session
          </div>

          <h1 className="auth-welcome-title">Welcome to CareVault</h1>
          <p className="auth-welcome-desc">
            You are signed in as a registered <strong>{roleName}</strong>.
          </p>

          <div className="auth-user-info-box">
            <div className="info-row">
              <span className="info-label">{idLabel}</span>
              <span className="info-val"><strong>{accountId}</strong></span>
            </div>
            <div className="info-row">
              <span className="info-label">Selected Role:</span>
              <span className="info-val">{roleName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Session Status:</span>
              <span className="info-val status-active">Active</span>
            </div>
          </div>

          <div className="auth-actions-group">
            <button
              type="button"
              className="auth-action-btn secondary"
              onClick={onSignOut}
            >
              <IconLogOut /> Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
