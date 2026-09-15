import { useEffect, useId, useState } from 'react';
import './AuthVerification.css';

export default function AuthVerification({ flow, disabled }) {
  const id = useId();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!flow.pending) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [flow.pending]);
  const seconds = Math.max(0, Math.ceil((flow.retryAt - now) / 1000));
  if (flow.pending) return <section className="auth-verification" aria-label="Mobile verification">
    <p role="status">{flow.pending.message}</p>
    <label htmlFor={id}>Mobile OTP</label>
    <input id={id} value={flow.code} onChange={e => flow.setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} disabled={disabled} />
    <button type="button" disabled={disabled || seconds > 0} onClick={flow.restart}>{seconds > 0 ? `Request another OTP in ${seconds}s` : 'Request another OTP / edit details'}</button>
    <small>To resend, complete a new CAPTCHA and submit again.</small>
  </section>;
  return <section className="auth-verification" aria-label="CAPTCHA verification">
    <label htmlFor={id}>Security CAPTCHA</label>
    <div className="captcha-image-box">{flow.challenge ? <img src={flow.challenge.image} alt="CAPTCHA characters to enter below" /> : <span>{flow.loading ? 'Loading CAPTCHA?' : 'CAPTCHA unavailable'}</span>}</div>
    <input id={id} value={flow.answer} onChange={e => flow.setAnswer(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))} placeholder="Enter the characters above" maxLength={6} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={disabled || !flow.challenge} />
    <button type="button" disabled={disabled || flow.loading} onClick={flow.refresh}>Refresh CAPTCHA</button>
    {flow.error && <p role="alert">{flow.error}</p>}
    <small>CAPTCHA is case-insensitive and expires in 5 minutes.</small>
  </section>;
}
