import { useState } from 'react';
import { authRequest } from '../services/api.js';

export default function PasswordReset({ role, initialId, onClose }) {
  const [id, setId] = useState(initialId);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (sent && password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true);
    const result = await authRequest(sent ? 'reset-password' : 'forgot-password', { role, id, code, password });
    setBusy(false);
    setMessage(result.message || result.error);
    if (result.success) { if (sent) setDone(true); else setSent(true); }
  }
  return <div style={{position:'fixed', inset:0, background:'#0009', zIndex:1000, display:'grid', placeItems:'center', padding:20}}>
    <section role="dialog" aria-modal="true" aria-labelledby="reset-title" style={{background:'white', padding:28, borderRadius:16, width:'min(440px,100%)', maxHeight:'90vh', overflowY:'auto'}}>
      <h2 id="reset-title">Reset password</h2>
      <p>Receive an SMS code on the mobile number registered with your {role} account.</p>
      <form onSubmit={submit}>
        <label htmlFor="reset-id">Account ID</label><input autoFocus id="reset-id" className="field-input" required value={id} disabled={sent || busy} onChange={e => setId(e.target.value)} />
        {sent && !done && <>
          <label htmlFor="reset-code">SMS OTP</label><input id="reset-code" className="field-input" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} />
          <label htmlFor="reset-password">New password (8?72 characters)</label><input id="reset-password" className="field-input" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} />
          <label htmlFor="reset-confirm">Confirm password</label><input id="reset-confirm" className="field-input" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
        </>}
        <p role="status">{message}</p>
        {!done && <button className="login-btn" disabled={busy}>{busy ? 'Please wait?' : sent ? 'Verify OTP and reset password' : 'Send OTP'}</button>}
        {sent && !done && <button type="button" disabled={busy} onClick={() => { setSent(false); setCode(''); setMessage('You can request another code after 60 seconds.'); }}>Request another code</button>}
        <button type="button" disabled={busy} onClick={onClose}>Back to sign in</button>
      </form>
    </section>
  </div>;
}
