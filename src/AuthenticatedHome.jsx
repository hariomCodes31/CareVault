import PatientRegistrationDashboard from './components/PatientRegistrationDashboard';
import './AuthenticatedHome.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconStethoscope = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
    <path d="M9 12.5V17a3 3 0 0 0 6 0v-2.5" />
    <circle cx="15" cy="14.5" r="2" />
  </svg>
);

export default function AuthenticatedHome({ session, onSignOut }) {
  const isDoctor = session?.role === 'doctor';
  const accountId = session?.id || session?.doctorId || session?.patientId;

  return (
    <div className="auth-home-container">
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <nav className="auth-nav">
        <div className="auth-nav-brand">
          <img src="/logo.jpeg" alt="CareVault" className="auth-nav-logo" />
          <div className="auth-brand-text">
            <span className="auth-nav-title">CareVault</span>
            <span className="auth-nav-tagline">Smarter Records · Healthier People</span>
          </div>
          <span className={`auth-nav-role-badge ${isDoctor ? 'doctor' : 'patient'}`}>
            {isDoctor ? <IconStethoscope /> : <IconUser />}
            {isDoctor ? 'Doctor Workspace' : 'Patient Health Locker'}
          </span>
        </div>

        <div className="auth-nav-right">
          <div className="auth-user-chip">
            <span className="user-role-label">{isDoctor ? 'Doctor ID' : 'Patient ID'}:</span>
            <strong className="user-id-code">{accountId}</strong>
          </div>

          <button type="button" className="auth-signout-btn" onClick={onSignOut}>
            <IconLogOut /> Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main Portal Content ────────────────────────────────────────── */}
      <main className="auth-main-content">
        <PatientRegistrationDashboard
          userRole={isDoctor ? 'doctor' : 'patient'}
          currentId={accountId}
        />
      </main>
    </div>
  );
}
