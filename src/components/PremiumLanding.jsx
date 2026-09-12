import { useEffect, useRef, useState } from 'react';
import LoginPage from '../LoginPage';
import Icon from './MedicalIcon';
import './PremiumLanding.css';

const features = [
  { icon: 'record', tag: 'YOUR COMPLETE PICTURE', title: 'Every record. One place.', text: 'Keep patient details, medical history, and visit notes together. Less searching, more understanding.', type: 'records' },
  { icon: 'doctor', tag: 'MADE FOR CLINICIANS', title: 'More time for what matters.', text: 'Move from patient lookup to structured case-taking in a focused, thoughtfully organized workspace.', type: 'clinical' },
  { icon: 'clock', tag: 'CONTINUITY OF CARE', title: 'A story that stays connected.', text: 'Follow the journey from the first visit to the next follow-up, with the context you need at every step.', type: 'timeline' },
];
const steps = [
  { title: 'Make yourself at home', description: 'Create your account as a patient or a doctor.', heading: 'Your journey. Your space.', text: 'A dedicated home for your health, whether you provide care or receive it.', icon: 'people', items: ['Choose your role', 'Create your account', 'Meet your workspace'] },
  { title: 'Bring your story together', description: 'Build a patient profile with the details that matter.', heading: 'The whole picture, together.', text: 'A clearer view of patient information, history, and every visit.', icon: 'record', items: ['Patient profile', 'Medical history', 'Visit timeline'] },
  { title: 'Keep care moving forward', description: 'Review records, capture visits, and stay connected.', heading: 'Ready for what comes next.', text: 'A structured workspace to help make every consultation count.', icon: 'doctor', items: ['Review the patient story', 'Record clinical observations', 'Plan the next steps'] },
];

export default function PremiumLanding({ onLoginSuccess, onNavigateToCreateAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const rootRef = useRef(null);
  const currentStep = steps[activeStep];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    rootRef.current.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  const onStepKey = (event, index) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowDown' ? 1 : 2)) % 3;
    setActiveStep(next);
    document.getElementById(`journey-tab-${next}`)?.focus();
  };

  return (
    <div className={`cv-site ${motionPaused ? 'motion-paused' : ''}`} ref={rootRef}>
      <a className="cv-skip-link" href="#main-content">Skip to content</a>
      <header className="cv-header" onKeyDown={(event) => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.cv-menu-button')?.focus(); } }}>
        <a className="cv-brand" href="#" aria-label="CareVault home"><span className="cv-brand-symbol"><Icon /></span>Care<span>Vault</span><span className="cv-brand-dot">✦</span></a>
        <nav className={`cv-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation" id="main-navigation">
          <a href="#features" onClick={() => setMenuOpen(false)}>The platform</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#our-mission" onClick={() => setMenuOpen(false)}>Our purpose</a>
        </nav>
        <div className="cv-header-actions">
          <button className="cv-nav-signin" onClick={() => goTo('portal')}>Sign in <Icon name="arrow" /></button>
          <button className="cv-button cv-button-small" onClick={onNavigateToCreateAccount}>Get started <Icon name="plus" /></button>
          <button className="cv-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </header>
      <main id="main-content">
        <section className="cv-hero cv-section-width">
          <div className="cv-hero-copy">
            <div className="cv-eyebrow"><span className="cv-live-dot" /> A LITTLE MORE CONNECTED. A LOT MORE HUMAN.</div>
            <h1>Better care starts<br />with a <span className="cv-serif">clearer</span><br /><span className="cv-serif cv-hero-highlight">picture.</span><span className="cv-heading-star" aria-hidden="true">✳</span></h1>
            <p>Your health story deserves a home. Bring records, people, and every moment of care together in one thoughtful space.</p>
            <div className="cv-hero-buttons"><button className="cv-button" onClick={onNavigateToCreateAccount}>Start your care journey <Icon name="arrow" /></button><button className="cv-text-button" onClick={() => goTo('how-it-works')}><span className="cv-play-icon">↗</span> See how it works</button></div>
            <div className="cv-hero-note"><span className="cv-note-icon"><Icon name="people" /></span><div><strong>Built around people.</strong><span>For patients. For doctors. For better care.</span></div></div>
          </div>
          <div className="cv-care-visual" aria-label="Illustration of connected patient records and clinical care">
            <div className="cv-visual-grid" /><div className="cv-orbit cv-orbit-one" /><div className="cv-orbit cv-orbit-two" />
            <span className="cv-orbit-point point-one"><Icon name="plus" /></span><span className="cv-orbit-point point-two"><Icon name="shield" /></span>
            <div className="cv-visual-label"><span className="cv-live-dot" /> CARE, CONNECTED.</div>
            <div className="cv-central-cross" aria-hidden="true"><div /><div /><Icon /></div>
            <div className="cv-floating-card cv-record-card">
              <div className="cv-card-top"><span className="cv-mini-icon"><Icon name="record" /></span><span>YOUR HEALTH, TOGETHER</span><span className="cv-card-dots">•••</span></div>
              <div className="cv-demo-person"><span>JD</span><div><strong>Jamie Doe</strong><small>Sample patient profile</small></div><span className="cv-check-circle"><Icon name="check" /></span></div>
              <div className="cv-record-items">{['Medical history', 'Visit summaries', 'Prescriptions'].map((label) => <span key={label}><i />{label}<Icon name="check" /></span>)}</div>
              <div className="cv-card-bottom"><Icon name="shield" /> One connected health story</div>
            </div>
            <div className="cv-floating-card cv-pulse-card"><div className="cv-card-top"><span className="cv-live-dot" /> A CONTINUOUS JOURNEY</div><svg className="cv-heartbeat" viewBox="0 0 250 70" fill="none" aria-hidden="true"><path d="M0 36h45l9-10 12 20 18-40 19 58 16-28h28l9-10 12 20 18-40 19 58 16-28h29" /></svg><div><strong>Every moment matters.</strong><small>Care that moves with you.</small></div></div>
            <div className="cv-floating-card cv-doctor-card"><span className="cv-mini-icon"><Icon name="doctor" /></span><div><strong>A clearer clinical view</strong><small>The right context. At the right time.</small></div><span className="cv-check-circle"><Icon name="check" /></span></div>
            <span className="cv-visual-caption">ILLUSTRATIVE PLATFORM PREVIEW</span>
          </div>
        </section>
        <div className="cv-principles"><div className="cv-section-width"><span>THOUGHTFULLY BUILT FOR</span><span><Icon name="people" /> Patient-first care</span><span><Icon name="record" /> Organized health records</span><span><Icon name="doctor" /> Clinical clarity</span><span><Icon name="clock" /> Connected journeys</span></div></div>

        <section className="cv-features cv-section-width" id="features">
          <div className="cv-section-heading" data-reveal><div><span className="cv-eyebrow">LESS FRICTION. MORE CARE.</span><h2>A place for everything.<br /><span className="cv-serif">More space for care.</span></h2></div><p>Good care starts with understanding the whole story. We help bring the pieces together.</p></div>
          <div className="cv-feature-grid">{features.map((feature, index) => <article className={`cv-feature-card cv-feature-${feature.type}`} key={feature.type} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}>
            <span className="cv-feature-icon"><Icon name={feature.icon} /></span>
            <div className="cv-feature-mini" aria-hidden="true">{index === 0 ? <><div><Icon name="record" /><span>Visit summary<small>All the details, organized.</small></span><Icon name="check" /></div><div><Icon name="record" /><span>Medical history<small>Your story in one place.</small></span><Icon name="check" /></div></> : index === 1 ? <><div className="cv-mini-wave"><Icon /><span>Focus on your patient.</span></div><div className="cv-mini-bars">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div></> : <div className="cv-mini-timeline"><span><i />First consultation</span><span><i />A thoughtful care plan</span><span><i />The next chapter</span></div>}</div>
            <span className="cv-feature-tag">{feature.tag}</span><h3>{feature.title}</h3><p>{feature.text}</p>
          </article>)}</div>
        </section>

        <section className="cv-journey-section" id="how-it-works"><div className="cv-section-width cv-journey-grid">
          <div data-reveal><span className="cv-eyebrow">A SIMPLER WAY FORWARD</span><h2>From the first hello<br />to the <span className="cv-serif">next visit.</span></h2><p className="cv-journey-description">A familiar flow, with a little less paperwork and a lot more perspective.</p>
            <div className="cv-journey-steps" role="tablist" aria-label="Your care journey" aria-orientation="vertical">{steps.map((step, index) => <button key={step.title} role="tab" id={`journey-tab-${index}`} aria-selected={activeStep === index} aria-controls="journey-panel" tabIndex={activeStep === index ? 0 : -1} onKeyDown={(event) => onStepKey(event, index)} className={activeStep === index ? 'active' : ''} onClick={() => setActiveStep(index)}><span>0{index + 1}</span><div><strong>{step.title}</strong>{activeStep === index && <p>{step.description}</p>}</div><Icon name="arrow" /></button>)}</div>
          </div>
          <div className="cv-journey-preview" id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${activeStep}`} tabIndex={0} data-reveal><div className="cv-preview-window-top"><span /><span /><span /><small>YOUR CAREVAULT</small><Icon name="shield" /></div><div className="cv-preview-body" key={activeStep}><span className="cv-preview-icon"><Icon name={currentStep.icon} /></span><span className="cv-eyebrow">STEP 0{activeStep + 1}</span><h3>{currentStep.heading}</h3><p>{currentStep.text}</p><div className="cv-preview-checks">{currentStep.items.map((item) => <div key={item}><span><Icon name="check" /></span>{item}</div>)}</div><button className="cv-button" onClick={onNavigateToCreateAccount}>Find your space <Icon name="arrow" /></button></div><span className="cv-preview-caption">A simpler experience, from the start.</span></div>
        </div></section>

        <section className="cv-mission cv-section-width" id="our-mission" data-reveal><div className="cv-mission-art"><img src="/doctor-login-visual.jpg" alt="Healthcare professional ready to care for patients" loading="lazy" /><div className="cv-mission-photo-note"><Icon name="plus" /><span>Technology with purpose.<br /><strong>Care with a human touch.</strong></span></div></div><div className="cv-mission-copy"><span className="cv-eyebrow">THE HEART OF CAREVAULT</span><h2>Behind every record,<br />there’s a <span className="cv-serif">person.</span></h2><p>A question that needs answering. A history worth understanding. A next step that matters.</p><p>We believe healthcare technology should make room for the human side of medicine. CareVault brings clarity to the details, so you can focus on the person.</p><a className="cv-text-button" href="#portal">Experience a more thoughtful workspace <Icon name="arrow" /></a></div></section>

        <section className="cv-portal-section" id="portal"><div className="cv-portal-heading cv-section-width" data-reveal><span className="cv-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Welcome to your <span className="cv-serif">care space.</span></h2><p>One platform. A dedicated experience for you.</p></div><LoginPage onLoginSuccess={onLoginSuccess} onNavigateToCreateAccount={onNavigateToCreateAccount} /></section>
      </main>
      <footer className="cv-footer cv-section-width"><a href="#" className="cv-brand"><span className="cv-brand-symbol"><Icon /></span>Care<span>Vault</span></a><p>Better connected. Better cared for.</p><div><button className="cv-motion-toggle" onClick={() => setMotionPaused(!motionPaused)} aria-pressed={motionPaused}>{motionPaused ? 'Play animations' : 'Pause animations'}</button><span>© {new Date().getFullYear()} CareVault</span></div></footer>
    </div>
  );
}
