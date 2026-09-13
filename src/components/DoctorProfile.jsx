import { useEffect, useState } from 'react';
import { doctorProfileRequest } from '../services/api.js';
import { getSession, setSession } from '../services/authService.js';
import './AuthVerification.css';
const labels = { name: 'Full name', degree: 'Degree / Qualification', hospital: 'Hospital / Clinic', specialty: 'Specialty' };
export default function DoctorProfile({ session }) {
  const [profile, setProfile] = useState(session);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { let active = true;
    doctorProfileRequest().then(result => { if (!active) return; if (result.success) setProfile(result.profile); else setError(result.error); });
    return () => { active = false; };
  }, []);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const result = await doctorProfileRequest(draft);
    setBusy(false);
    if (!result.success) { setError(result.error); return; }
    setProfile(result.profile); setDraft(null); setMessage('Profile saved.');
    const current = getSession();
    if (current?.id === session.id) setSession({ ...current, ...result.profile });
  }
  return <section className="doctor-profile-card" aria-label="Your doctor profile">
    <h2>{profile.name ? `Welcome, ${profile.name}` : 'Your doctor profile'}</h2>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {draft ? <form className="auth-verification" onSubmit={save}>
      {Object.entries(labels).map(([key, label]) => <label key={key}>{label}{key !== 'specialty' && ' *'}<input value={draft[key]} maxLength={160} required={key !== 'specialty'} disabled={busy} onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}
      <button type="submit" disabled={busy}>{busy ? 'Saving?' : 'Save profile'}</button>
      <button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button>
    </form> : <>
      <dl>{Object.entries({ ...labels, nmcRegistrationNumber: 'Registration number', id: 'Doctor ID' }).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{(key === 'id' ? session.id : profile[key]) || 'Not added'}</dd></div>)}</dl>
      <button className="auth-signout-btn" type="button" style={{ marginTop: 20 }} onClick={() => { setDraft(Object.fromEntries(Object.keys(labels).map(key => [key, profile[key] || '']))); setMessage(''); }}>Edit profile</button>
    </>}
  </section>;
}
