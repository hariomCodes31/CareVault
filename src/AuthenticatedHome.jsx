import { useState } from 'react';
import PatientRegistrationDashboard from './components/PatientRegistrationDashboard';
import PatientDashboard from './PatientDashboard';
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
  const roleName = isDoctor ? 'Doctor' : 'Patient';
  const idLabel = isDoctor ? 'Doctor ID:' : 'Patient ID:';
  const accountId = session?.id || session?.doctorId || session?.patientId;

  // View state: for patient (dashboard, registration, session), for doctor (registration, session)
  const [activeView, setActiveView] = useState(() => (isDoctor ? 'registration' : 'dashboard'));

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
            <span className="user-role-label">{idLabel}</span>
            <strong className="user-id-code">{accountId}</strong>
          </div>

          {!isDoctor && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`auth-signout-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                Patient Dashboard
              </button>

              <button
                type="button"
                className={`auth-signout-btn ${activeView === 'registration' ? 'active' : ''}`}
                onClick={() => setActiveView('registration')}
              >
                Search / Registration
              </button>
            </div>
          )}

          {isDoctor && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`auth-signout-btn ${activeView === 'registration' ? 'active' : ''}`}
                onClick={() => setActiveView('registration')}
              >
                Doctor Workspace
              </button>

              <button
                type="button"
                className={`auth-signout-btn ${activeView === 'session' ? 'active' : ''}`}
                onClick={() => setActiveView('session')}
              >
                Session Info
              </button>
            </div>
          )}

          <button type="button" className="auth-signout-btn" onClick={onSignOut}>
            <IconLogOut /> Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="auth-main-content">
        {!isDoctor && activeView === 'dashboard' && (
          <PatientDashboard
            patientData={{ patientId: accountId }}
            onNavigateToCaseTaking={() => alert('Redirecting to Case-Taking Module...')}
          />
        )}

        {activeView === 'registration' && (
          <PatientRegistrationDashboard
            userRole={isDoctor ? 'doctor' : 'patient'}
            currentId={accountId}
          />
        )}

        {activeView === 'session' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem', width: '100%' }}>
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
                {!isDoctor && (
                  <button
                    type="button"
                    className="auth-action-btn primary"
                    onClick={() => setActiveView('dashboard')}
                  >
                    Open Patient Dashboard
                  </button>
                )}
                <button
                  type="button"
                  className="auth-action-btn secondary"
                  onClick={onSignOut}
                >
                  <IconLogOut /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
