import React, { useState, useEffect, useRef } from 'react';
import LoginPage from '../LoginPage';
import CareAnimation from './CareAnimation';
import './StorytellingLanding.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconShieldCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconFileHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18l-1.5-1.5a2.5 2.5 0 0 1 3.5-3.5l.5.5.5-.5a2.5 2.5 0 0 1 3.5 3.5L12 18z" />
  </svg>
);

const IconTimeline = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconLabReport = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3v6l-5 9a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3l-5-9V3" />
    <line x1="8" y1="3" x2="16" y2="3" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
);

const IconPill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSparkles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0l-2.121-2.121M8.757 8.757L6.636 6.636" />
  </svg>
);

export default function StorytellingLanding({
  onLoginSuccess,
  onNavigateToCreateAccount,
  onReplayIntro,
  onDirectDemoLogin,
}) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const portalRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    if (!isAboutOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    aboutRef.current?.querySelector("button")?.focus();
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const buttons = aboutRef.current?.querySelectorAll("button, a[href], input, [tabindex='0']");
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      previousFocus?.focus();
    };
  }, [isAboutOpen]);

  const scrollToPortal = () => {
    if (portalRef.current) {
      portalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close About panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAboutOpen) {
        setIsAboutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAboutOpen]);

  return (
    <div className="story-wrapper">
      {/* ── Sticky Navigation ── */}
      <header className="story-nav">
        <div className="cv-container story-nav-inner">
          <a className="story-nav-brand" href="#visual-story">
            <img src="/logo.jpeg" alt="CareVault" className="story-nav-logo" />
            <span className="story-nav-title">CareVault</span>
            <span className="story-nav-tag">Clinical Vault</span>
          </a>

          <nav className="story-nav-links" aria-label="Main Navigation">
            <a href="#visual-story" className="story-nav-link">Clinical Care</a>
            <a href="#mission" className="story-nav-link">Mission</a>
            <a href="#features" className="story-nav-link">Platform Pillars</a>
            <a href="#portal" className="story-nav-link">Portal Access</a>
          </nav>

          <div className="story-nav-actions">
            {onReplayIntro && (
              <button
                type="button"
                className="story-btn-text"
                onClick={onReplayIntro}
                title="Replay CareVault Logo Introduction"
              >
                Replay Intro
              </button>
            )}

            {/* NEW: "About" navigation item next to "Sign In" */}
            <button
              type="button"
              className={`story-btn-about ${isAboutOpen ? 'active' : ''}`}
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              aria-expanded={isAboutOpen}
              aria-controls="about-carevault-panel"
              title="About CareVault Platform"
            >
              <span>About</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="story-btn-about-icon">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>

            <button
              type="button"
              className="story-btn-primary"
              onClick={scrollToPortal}
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </header>

      {/* ── NEW: Smooth, Elegant About CareVault Panel ── */}
      {isAboutOpen && (
        <div
          id="about-carevault-panel"
          ref={aboutRef}
          className="about-panel-backdrop"
          onClick={() => setIsAboutOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-panel-title"
        >
          <div className="about-panel-card" onClick={(e) => e.stopPropagation()}>
            <div className="about-panel-header">
              <div className="about-panel-brand">
                <img src="/logo.jpeg" alt="CareVault" className="about-panel-logo" />
                <div>
                  <h3 id="about-panel-title" className="about-panel-title">CareVault</h3>
                  <span className="about-panel-tag">Clinical Architecture</span>
                </div>
              </div>

              <button
                type="button"
                className="about-panel-close"
                onClick={() => setIsAboutOpen(false)}
                aria-label="Close About CareVault Panel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="about-panel-body">
              <div className="about-panel-badge">
                <span className="about-panel-badge-dot" />
                <span>About The Platform</span>
              </div>

              <h4 className="about-panel-heading">
                Next-Generation Clinical Documentation & Continuity of Care
              </h4>

              <p className="about-panel-desc">
                CareVault bridges healthcare providers and patients into one cohesive, trustworthy ecosystem. Engineered for clinical precision and minimal cognitive burden, it streamlines outpatient case-taking, diagnostic timelines, and lifelong patient records in one secure sanctuary.
              </p>

              <div className="about-panel-features">
                <div className="about-feature-chip">
                  <span className="about-chip-icon">🩺</span>
                  <div>
                    <strong>Structured OPD Case-Taking</strong>
                    <p>Rapid symptom recording with standardized M-A-N prescriptions.</p>
                  </div>
                </div>

                <div className="about-feature-chip">
                  <span className="about-chip-icon">🛡️</span>
                  <div>
                    <strong>Unified Diagnostic Archives</strong>
                    <p>Tamper-proof pathology, imaging, and longitudinal visit continuity.</p>
                  </div>
                </div>

                <div className="about-feature-chip">
                  <span className="about-chip-icon">🔒</span>
                  <div>
                    <strong>Role-Isolated Privacy</strong>
                    <p>Tailored physician and patient views with SIH 2026 security compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-panel-footer">
              <button
                type="button"
                className="about-panel-action"
                onClick={() => {
                  setIsAboutOpen(false);
                  scrollToPortal();
                }}
              >
                <span>Access Clinical Portal</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scene 1 & 2: First Visual (Children / Compassionate Care) ── */}
      <section id="visual-story" className="story-hero-section">
        <div className="story-hero-ambient" aria-hidden="true" />

        <div className="cv-container">
          <div className="story-hero-header">
            <div className="story-hero-badge">
              <IconSparkles />
              <span>Compassionate Pediatric & Family Healthcare</span>
            </div>
            <h1 className="story-hero-title">
              Where Trust Meets Clinical Precision
            </h1>
            <p className="story-hero-subtitle">
              CareVault bridges doctors and patients through unified clinical case-taking,
              longitudinal medical records, and tamper-proof continuity of care.
            </p>
          </div>

          {/* Canvas presenting the high-quality Children / Healthcare visual */}
          <div className="story-care-grid">
            <CareAnimation />
          <div className="story-visual-canvas">
            <div className="story-main-img-wrap">
              <img
                src="/children-care-visual.jpg"
                alt="Pediatrician gently caring for a child in a serene clinic"
                className="story-main-img"
              />
              <div className="story-img-overlay" />
              <div className="story-img-badge-overlay">
                <div className="story-caption-content">
                  <h3>Gentle Care, Protected by Robust Data</h3>
                  <p>Every consultation securely preserved for lifelong continuity</p>
                </div>
                <div className="story-trust-pill">
                  <IconShieldCheck /> Verified Clinical Continuity
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Metric Summary Strip */}
          <div className="story-metric-strip">
            <div className="story-metric-item">
              <span className="story-metric-val">100%</span>
              <span className="story-metric-label">Record Privacy & Fidelity</span>
            </div>
            <div className="story-metric-item">
              <span className="story-metric-val">Unified</span>
              <span className="story-metric-label">OPD Case-Taking Flow</span>
            </div>
            <div className="story-metric-item">
              <span className="story-metric-val">Instant</span>
              <span className="story-metric-label">Longitudinal Visit History</span>
            </div>
            <div className="story-metric-item">
              <span className="story-metric-val">Structured</span>
              <span className="story-metric-label">M-A-N Prescriptions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scene 3: Philosophy & Human Clinical Mission ── */}
      <section id="mission" className="story-mission-section">
        <div className="cv-container">
          <div className="story-mission-grid">
            <div className="story-mission-text">
              <span className="story-section-eyebrow">Our Clinical Philosophy</span>
              <h2 className="story-mission-title">
                Designed Around Patients. Engineered for Physicians.
              </h2>
              <p className="story-mission-desc">
                Fragmented medical records cause diagnostic delays, duplicated tests, and patient anxiety.
                CareVault unifies the entire clinical lifecycle — from structured symptom case-taking to
                lifelong diagnostic archives — into a secure, harmonious sanctuary.
              </p>

              <div className="story-mission-points">
                <div className="story-point-item">
                  <div className="story-point-icon">
                    <IconCheck />
                  </div>
                  <div className="story-point-content">
                    <h4>No Fragmented Portals</h4>
                    <p>Both doctors and patients access a unified platform tailored to their exact workflow.</p>
                  </div>
                </div>

                <div className="story-point-item">
                  <div className="story-point-icon">
                    <IconCheck />
                  </div>
                  <div className="story-point-content">
                    <h4>Verified Prescriptions & Clear Dosages</h4>
                    <p>Structured morning-afternoon-night regimens with clear doctor advice and follow-up guidance.</p>
                  </div>
                </div>

                <div className="story-point-item">
                  <div className="story-point-icon">
                    <IconCheck />
                  </div>
                  <div className="story-point-content">
                    <h4>Lifetime Diagnostic Archive</h4>
                    <p>Pathology, radiology, and vitals indexed chronologically for comprehensive clinical context.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Showcase Preview */}
            <div className="story-showcase-card">
              <div className="story-showcase-header">
                <div className="story-showcase-brand">
                  <img src="/logo.jpeg" alt="CareVault Logo" className="story-showcase-logo" />
                  <div>
                    <div className="story-showcase-brand-name">CareVault Clinical Core</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cv-text-muted)' }}>SIH Healthcare Architecture</div>
                  </div>
                </div>
                <span className="story-badge-live">
                  <span className="story-badge-pulse" /> Active Protection
                </span>
              </div>

              <div className="story-showcase-tiles">
                <div className="story-tile">
                  <span className="story-tile-label">Role Isolation</span>
                  <span className="story-tile-val">Doctor / Patient</span>
                </div>
                <div className="story-tile">
                  <span className="story-tile-label">Case Taking</span>
                  <span className="story-tile-val">Structured & Fast</span>
                </div>
                <div className="story-tile">
                  <span className="story-tile-label">Vitals Tracking</span>
                  <span className="story-tile-val">BP, HR, SpO2, Temp</span>
                </div>
                <div className="story-tile">
                  <span className="story-tile-label">Prescription</span>
                  <span className="story-tile-val">One-Click Print</span>
                </div>
              </div>

              <div style={{
                padding: '0.85rem 1rem',
                background: 'var(--cv-sage-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                color: 'var(--cv-green-primary)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <IconShieldCheck />
                <span>Encrypted at rest and in transit with complete audit trails.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scene 4: Pillars & Feature Storytelling ── */}
      <section id="features" className="story-features-section">
        <div className="cv-container">
          <div className="story-features-header">
            <span className="story-section-eyebrow">Platform Capabilities</span>
            <h2 className="story-features-title">
              Four Foundations of the CareVault Experience
            </h2>
            <p className="story-features-subtitle">
              Every touchpoint is designed with medical clarity, minimal cognitive load, and visual elegance.
            </p>
          </div>

          <div className="story-pillars-grid">
            <div className="story-pillar-card">
              <div className="story-pillar-icon-wrap">
                <IconFileHeart />
              </div>
              <h3 className="story-pillar-title">Structured Case-Taking</h3>
              <p className="story-pillar-desc">
                Streamlined clinical interview intake allowing doctors to record symptoms, history, and examination notes without clutter.
              </p>
              <div className="story-pillar-meta">
                <span>Doctor Case-Taking</span> →
              </div>
            </div>

            <div className="story-pillar-card">
              <div className="story-pillar-icon-wrap">
                <IconTimeline />
              </div>
              <h3 className="story-pillar-title">Longitudinal Timeline</h3>
              <p className="story-pillar-desc">
                Chronological visualization of patient history, OPD visits, diagnoses, and attending physician details in one fluid stream.
              </p>
              <div className="story-pillar-meta">
                <span>Patient Timeline</span> →
              </div>
            </div>

            <div className="story-pillar-card">
              <div className="story-pillar-icon-wrap">
                <IconLabReport />
              </div>
              <h3 className="story-pillar-title">Diagnostic Reports Vault</h3>
              <p className="story-pillar-desc">
                Instant access to laboratory investigations, radiology scans, and pathology results with verifiable digital integrity.
              </p>
              <div className="story-pillar-meta">
                <span>Lab & Radiology</span> →
              </div>
            </div>

            <div className="story-pillar-card">
              <div className="story-pillar-icon-wrap">
                <IconPill />
              </div>
              <h3 className="story-pillar-title">Smart E-Prescriptions</h3>
              <p className="story-pillar-desc">
                Clear morning-afternoon-night (M-A-N) schedules, dietary instructions, and printable medical slips eliminating medication ambiguity.
              </p>
              <div className="story-pillar-meta">
                <span>Printable Prescriptions</span> →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scene 5: Gateway to Authentication Portal ── */}
      <section id="portal" ref={portalRef} className="story-portal-section">
        <div className="cv-container">
          <div className="story-portal-header">
            <span className="story-section-eyebrow">Secure Gateway</span>
            <h2 className="story-portal-title">
              Sign In to Your CareVault Account
            </h2>
            <p className="story-portal-subtitle">
              Select your role to access your personalized doctor clinical workspace or patient health vault.
            </p>
          </div>

          {/* The Existing CareVault Login Form embedded seamlessly */}
          <div className="story-login-container">
            <LoginPage
              onLoginSuccess={onLoginSuccess}
              onNavigateToCreateAccount={onNavigateToCreateAccount}
              onDirectDemoLogin={onDirectDemoLogin}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="story-footer">
        <div className="cv-container story-footer-inner">
          <div className="story-footer-top">
            <div className="story-footer-brand">
              <img src="/logo.jpeg" alt="CareVault" className="story-footer-logo" />
              <div>
                <div className="story-footer-name">CareVault</div>
                <div className="story-footer-tagline">Your Health, Securely Always</div>
              </div>
            </div>

            <div className="story-footer-badges">
              <span className="story-footer-badge">
                <IconShieldCheck /> SIH 2026 Healthcare Platform
              </span>
              <span className="story-footer-badge">
                Role-Based Confidentiality
              </span>
            </div>
          </div>

          <div className="story-footer-bottom">
            <span>© {new Date().getFullYear()} CareVault Healthcare System. All rights reserved.</span>
            <span>Designed for clinical excellence and patient trust.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
