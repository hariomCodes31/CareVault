import { useState, useEffect } from 'react';
import './LogoIntro.css';

/**
 * LogoIntro component:
 * Plays a calm, elegant brand introduction sequence when CareVault loads.
 * Slowly fades in, grows from 0.92 to normal size with subtle blur-to-clear.
 * Sits smoothly, then triggers onComplete to transition to the storytelling view.
 */
export default function LogoIntro({ onComplete }) {
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Settle for ~2.3 seconds then begin smooth dismissal
    const settleTimer = setTimeout(() => {
      setDismissing(true);
    }, 2400);

    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3100);

    return () => {
      clearTimeout(settleTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setDismissing(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  return (
    <div
      className={`logo-intro-overlay ${dismissing ? 'dismissing' : ''}`}
      role="banner"
      aria-label="CareVault Brand Introduction"
    >
      <div className="logo-intro-ambient" aria-hidden="true" />

      <div className="logo-intro-content">
        <div className="logo-intro-img-wrap">
          <img
            src="/logo.jpeg"
            alt="CareVault Logo"
            className="logo-intro-img"
          />
        </div>

        <div className="logo-intro-caption">
          <h1 className="logo-intro-title">CareVault</h1>
          <p className="logo-intro-tagline">Your Health, Securely Always</p>
        </div>
      </div>

      <button
        type="button"
        className="logo-intro-skip"
        onClick={handleSkip}
        aria-label="Skip introduction"
      >
        Enter CareVault →
      </button>
    </div>
  );
}
