import { useState } from 'react';
import './PatientDashboard.css';
import { getPatientProfile, getPatientVisits } from './services/visitService';

// SVG Icons
const IconPlusCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
    <path d="M8.5 8.5l7 7" />
  </svg>
);

const IconFileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function PatientDashboard({ onSignOut, onNavigateToNewVisit, selectedVisitIdToOpen }) {
  const patient = getPatientProfile('CV2026-000102');
  const visits = getPatientVisits('CV2026-000102');
  const [activeTab, setActiveTab] = useState('visits');
  const [selectedVisitModal, setSelectedVisitModal] = useState(() => {
    if (selectedVisitIdToOpen) {
      return visits.find(v => v.id === selectedVisitIdToOpen) || null;
    }
    return null;
  });

  if (!patient) return null;

  return (
    <div className="patient-dashboard-container">
      {/* CareVault Header */}
      <nav className="pd-navbar">
        <div className="pd-nav-brand">
          <img src="/logo.jpeg" alt="CareVault" className="pd-nav-logo" />
          <span className="pd-nav-title">CareVault</span>
          <span className="pd-nav-role-badge">Doctor & Patient Portal</span>
        </div>

        <button type="button" className="pd-signout-btn" onClick={onSignOut}>
          <IconLogOut /> Sign Out
        </button>
      </nav>

      {/* Dashboard Body */}
      <main className="pd-main">
        {/* Patient Profile Banner */}
        <section className="pd-profile-card">
          <div className="pd-profile-info">
            <div className="pd-avatar">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="pd-details">
              <div className="pd-patient-name-row">
                <h1 className="pd-patient-name">{patient.name}</h1>
                <span className="pd-patient-id-tag">ID: {patient.id}</span>
              </div>
              <div className="pd-meta-chips">
                <span className="pd-chip">Age: <strong>{patient.age} Yrs</strong></span>
                <span className="pd-chip">Gender: <strong>{patient.gender}</strong></span>
                <span className="pd-chip blood-chip">Blood Group: <strong>{patient.bloodGroup}</strong></span>
                <span className="pd-chip">Contact: <strong>{patient.contact}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="pd-cta-btn"
            onClick={onNavigateToNewVisit}
            id="btn-new-visit-case-taking"
          >
            <IconPlusCircle /> New Visit Case-Taking
          </button>
        </section>

        {/* Key Metrics */}
        <section className="pd-metrics-grid">
          <div className="pd-metric-card">
            <div className="pd-metric-icon blue">
              <IconCalendar />
            </div>
            <div className="pd-metric-content">
              <span className="pd-metric-value">{visits.length}</span>
              <span className="pd-metric-label">Total Clinical Visits</span>
            </div>
          </div>

          <div className="pd-metric-card">
            <div className="pd-metric-icon teal">
              <IconPill />
            </div>
            <div className="pd-metric-content">
              <span className="pd-metric-value">{patient.prescriptionCount || 0}</span>
              <span className="pd-metric-label">Prescriptions</span>
            </div>
          </div>

          <div className="pd-metric-card">
            <div className="pd-metric-icon purple">
              <IconFileText />
            </div>
            <div className="pd-metric-content">
              <span className="pd-metric-value">{patient.reportCount || 3}</span>
              <span className="pd-metric-label">Diagnostic Reports</span>
            </div>
          </div>

          <div className="pd-metric-card">
            <div className="pd-metric-icon amber">
              <IconClock />
            </div>
            <div className="pd-metric-content">
              <span className="pd-metric-value">{patient.activeFollowUpCount || 0}</span>
              <span className="pd-metric-label">Active Follow-ups</span>
            </div>
          </div>
        </section>

        {/* Tabbed Content */}
        <section className="pd-tabs-container">
          <div className="pd-tabs-header">
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>

            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'visits' ? 'active' : ''}`}
              onClick={() => setActiveTab('visits')}
            >
              Visits <span className="pd-tab-badge">{visits.length}</span>
            </button>

            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions <span className="pd-tab-badge">{patient.prescriptionCount || 0}</span>
            </button>

            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports <span className="pd-tab-badge">{patient.reportCount || 3}</span>
            </button>
          </div>

          <div className="pd-tab-body">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>Patient Summary</h3>
                  <p style={{ color: '#475569', fontSize: '0.925rem' }}>
                    Rahul Kumar (28, Male) is registered under ID <strong>CV2026-000102</strong>. Blood Group <strong>O+</strong>.
                    Primary physician: <strong>Dr. Ananya Sharma</strong>.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Last Recorded Vitals</div>
                    {visits[0]?.vitals ? (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="v-pill">BP: <strong>{visits[0].vitals.bloodPressure || '120/80'} mmHg</strong></span>
                        <span className="v-pill">HR: <strong>{visits[0].vitals.heartRate || '72'} bpm</strong></span>
                        <span className="v-pill">Temp: <strong>{visits[0].vitals.temperature || '98.6'} °F</strong></span>
                        <span className="v-pill">SpO2: <strong>{visits[0].vitals.spO2 || '99'} %</strong></span>
                        <span className="v-pill">Weight: <strong>{visits[0].vitals.weight || '72'} kg</strong></span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No recent vitals</span>
                    )}
                  </div>

                  <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Active Follow-up</div>
                    {visits[0]?.followUp?.required === 'Yes' ? (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#0f172a' }}>
                        Scheduled for: <strong>{visits[0].followUp.date}</strong><br />
                        <span style={{ fontSize: '0.825rem', color: '#64748b' }}>{visits[0].followUp.instructions}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>No active follow-up pending.</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div>
                    <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>Ready to start a new consultation?</strong>
                    <p style={{ fontSize: '0.85rem', color: '#1d4ed8', margin: 0 }}>Click below to open the Case-Taking record form.</p>
                  </div>
                  <button type="button" className="pd-cta-btn" onClick={onNavigateToNewVisit}>
                    <IconPlusCircle /> New Visit Case-Taking
                  </button>
                </div>
              </div>
            )}

            {/* VISITS TAB */}
            {activeTab === 'visits' && (
              <div className="visits-list">
                {visits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No visit records found. Click "+ New Visit Case-Taking" to create one.
                  </div>
                ) : (
                  visits.map((visit) => (
                    <div key={visit.id} className="visit-item-card">
                      <div className="visit-item-header">
                        <div className="visit-id-group">
                          <span className="visit-id">{visit.id}</span>
                          <span className="visit-date">{visit.date} {visit.time ? `• ${visit.time}` : ''}</span>
                        </div>
                        <div className="visit-doctor">{visit.doctorName || 'Dr. Ananya Sharma'}</div>
                      </div>

                      <div className="visit-section-grid">
                        <div>
                          <div className="visit-field-label">Chief Complaint</div>
                          <div className="visit-field-val">
                            {visit.chiefComplaint} ({visit.complaintDuration} {visit.complaintDurationUnit})
                          </div>
                        </div>

                        <div>
                          <div className="visit-field-label">Primary Diagnosis</div>
                          <div className="visit-field-val" style={{ color: '#2563eb', fontWeight: 600 }}>
                            {visit.primaryDiagnosis}
                          </div>
                        </div>

                        <div>
                          <div className="visit-field-label">Vitals</div>
                          <div className="vitals-pill-group">
                            {visit.vitals?.bloodPressure && <span className="v-pill">BP: {visit.vitals.bloodPressure}</span>}
                            {visit.vitals?.heartRate && <span className="v-pill">HR: {visit.vitals.heartRate}</span>}
                            {visit.vitals?.temperature && <span className="v-pill">Temp: {visit.vitals.temperature}°F</span>}
                            {visit.vitals?.spO2 && <span className="v-pill">SpO2: {visit.vitals.spO2}%</span>}
                          </div>
                        </div>
                      </div>

                      <div className="visit-actions-bar">
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => setSelectedVisitModal(visit)}
                        >
                          View Case Record →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Recent Prescriptions</h3>
                {visits.flatMap(v => (v.prescription || []).map(p => ({ ...p, visitId: v.id, date: v.date }))).length === 0 ? (
                  <p style={{ color: '#64748b' }}>No prescriptions found.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {visits.flatMap(v => (v.prescription || []).map(p => ({ ...p, visitId: v.id, date: v.date, doctor: v.doctorName })))
                      .filter(p => p.medicine)
                      .map((med, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '0.95rem' }}>{med.medicine}</div>
                          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                            Dose: <strong>{med.dosage || med.dose}</strong> | Freq: <strong>{med.frequency}</strong>
                          </div>
                          <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                            Duration: {med.duration} | Instructions: {med.instructions || 'Take as directed'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                            Prescribed on {med.date} • {med.visitId}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Diagnostic Reports & Lab Results</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>Complete Blood Count (CBC)</span>
                      <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>Normal</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '6px' }}>Date: 2026-08-20 • CareVault Labs</p>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>Lipid Profile Panel</span>
                      <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>Normal</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '6px' }}>Date: 2026-07-10 • CareVault Labs</p>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>ECG / Electrocardiogram</span>
                      <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>Reviewed</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '6px' }}>Date: 2026-06-05 • Cardiology Wing</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Case Details Modal */}
      {selectedVisitModal && (
        <div className="modal-backdrop" onClick={() => setSelectedVisitModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Clinical Case Record: {selectedVisitModal.id}</h2>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Visit Date: {selectedVisitModal.date} • Attending: {selectedVisitModal.doctorName || 'Dr. Ananya Sharma'}
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedVisitModal(null)}>×</button>
            </div>

            <div className="modal-body">
              <div>
                <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chief Complaint</h4>
                <p style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '500', marginTop: '4px' }}>
                  {selectedVisitModal.chiefComplaint} ({selectedVisitModal.complaintDuration} {selectedVisitModal.complaintDurationUnit})
                </p>
              </div>

              {selectedVisitModal.historyOfPresentIllness && (
                <div>
                  <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History of Present Illness</h4>
                  <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '4px' }}>{selectedVisitModal.historyOfPresentIllness}</p>
                </div>
              )}

              {selectedVisitModal.vitals && (
                <div>
                  <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vitals</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '6px' }}>
                    {selectedVisitModal.vitals.bloodPressure && <span className="v-pill">BP: {selectedVisitModal.vitals.bloodPressure} mmHg</span>}
                    {selectedVisitModal.vitals.heartRate && <span className="v-pill">Heart Rate: {selectedVisitModal.vitals.heartRate} bpm</span>}
                    {selectedVisitModal.vitals.temperature && <span className="v-pill">Temp: {selectedVisitModal.vitals.temperature} °F</span>}
                    {selectedVisitModal.vitals.spO2 && <span className="v-pill">SpO2: {selectedVisitModal.vitals.spO2}%</span>}
                    {selectedVisitModal.vitals.weight && <span className="v-pill">Weight: {selectedVisitModal.vitals.weight} kg</span>}
                    {selectedVisitModal.vitals.height && <span className="v-pill">Height: {selectedVisitModal.vitals.height} cm</span>}
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis & Assessment</h4>
                <div style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: '700', marginTop: '4px' }}>
                  Primary: {selectedVisitModal.primaryDiagnosis}
                </div>
                {selectedVisitModal.additionalDiagnosis && (
                  <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '2px' }}>
                    Secondary: {selectedVisitModal.additionalDiagnosis}
                  </div>
                )}
                {selectedVisitModal.clinicalNotes && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                    Notes: "{selectedVisitModal.clinicalNotes}"
                  </div>
                )}
              </div>

              {selectedVisitModal.prescription && selectedVisitModal.prescription.length > 0 && (
                <div>
                  <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rx Prescriptions</h4>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '4px', fontSize: '0.9rem', color: '#334155' }}>
                    {selectedVisitModal.prescription.map((p, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        <strong>{p.medicine}</strong> — {p.dosage || p.dose} ({p.frequency}) for {p.duration}. <span style={{ color: '#64748b' }}>{p.instructions}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedVisitModal.followUp && selectedVisitModal.followUp.required === 'Yes' && (
                <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <strong style={{ color: '#b45309', fontSize: '0.875rem' }}>Follow-up Scheduled:</strong> {selectedVisitModal.followUp.date}
                  <div style={{ fontSize: '0.825rem', color: '#92400e', marginTop: '2px' }}>{selectedVisitModal.followUp.instructions}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-view-details"
                style={{ background: '#1e293b', color: '#fff', border: 'none' }}
                onClick={() => setSelectedVisitModal(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
