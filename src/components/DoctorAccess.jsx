import { useState } from 'react';
import { changeDoctorAccess } from '../services/api.js';
export default function DoctorAccess({ patientId, allowedDoctorIds = [] }) {
  const [doctors, setDoctors] = useState(allowedDoctorIds);
  const [doctorId, setDoctorId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function update(id, allow) {
    setBusy(true);
    const result = await changeDoctorAccess(patientId, id, allow);
    setBusy(false);
    if (!result.success) { setMessage(result.error); return; }
    setDoctors(result.allowedDoctorIds); setDoctorId('');
    setMessage(allow ? 'Doctor access granted.' : 'Doctor access removed.');
  }
  return <section className="pd-card" style={{ marginBottom: 20 }}>
    <h2 className="pd-card-title">Doctors with access</h2>
    <p className="pd-card-subtitle">Allow a doctor to view and update your patient record. You can remove access here.</p>
    <form onSubmit={e => { e.preventDefault(); update(doctorId, true); }} style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:16}}>
      <label htmlFor="allowed-doctor-id">Doctor ID</label>
      <input id="allowed-doctor-id" className="field-input" style={{flex:'1 1 220px'}} required pattern="DR[0-9]{4}-[0-9]{6}" placeholder="DR2026-123456" value={doctorId} onChange={e => setDoctorId(e.target.value.toUpperCase())} />
      <button className="pd-btn pd-btn-primary" disabled={busy}>Grant access</button>
    </form>
    <p role="status">{message}</p>
    {doctors.length === 0 ? <p>No doctors have access.</p> : doctors.map(id => <div key={id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0'}}><span>{id}</span><button className="pd-btn pd-btn-outline" disabled={busy} onClick={() => update(id, false)}>Remove access</button></div>)}
  </section>;
}
