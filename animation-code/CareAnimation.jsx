import Icon from './MedicalIcon';
import './CareAnimation.css';

export default function CareAnimation() {
  return (
    <div className="cv-animation">
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
    </div>
  );
}
