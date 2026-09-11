import { useState, useEffect } from 'react';
import './PatientDashboard.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

const IconPill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
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

const IconPlusCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconPrinter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Default Mock Patient (SIH Flowchart Demo Alignment) ────────────────────
const DEFAULT_PATIENT = {
  name: 'Rahul Kumar',
  patientId: 'CV2026-000452',
  age: 28,
  gender: 'Male',
  phone: '9876543210',
  address: 'Patna, Bihar',
  aadhaar: '1234 5678 9012',
  bloodGroup: 'O+',
  knownConditions: 'None',
  allergies: 'Not Reported',
  emergencyContact: '+91 9876543211',
  vitals: {
    bp: '120/80 mmHg',
    hr: '98 bpm',
    temp: '101°F',
    spo2: '98%',
  },
  stats: {
    totalVisits: 5,
    reportsCount: 2,
    activeFollowUps: 1,
  },
  visits: [
    {
      id: 'v1',
      date: '08 Sep 2026',
      type: 'OPD Visit',
      chiefComplaint: 'Fever, headache & body ache',
      doctor: 'Dr. Ananya Sharma',
      department: 'General Medicine',
      diagnosis: 'Acute Viral Pyrexia',
      status: 'Completed',
    },
    {
      id: 'v2',
      date: '12 Apr 2026',
      type: 'OPD Visit',
      chiefComplaint: 'Viral infection & cough',
      doctor: 'Dr. Rajesh Verma',
      department: 'Internal Medicine',
      diagnosis: 'Upper Respiratory Tract Infection',
      status: 'Completed',
    },
    {
      id: 'v3',
      date: '03 Jan 2026',
      type: 'OPD Visit',
      chiefComplaint: 'Lower back pain',
      doctor: 'Dr. Vikram Seth',
      department: 'Orthopedics',
      diagnosis: 'Lumbar Muscle Strain',
      status: 'Completed',
    },
    {
      id: 'v4',
      date: '21 Aug 2025',
      type: 'OPD Visit',
      chiefComplaint: 'General routine checkup',
      doctor: 'Dr. Ananya Sharma',
      department: 'General Medicine',
      diagnosis: 'Healthy / Routine Clearance',
      status: 'Completed',
    },
  ],
  reports: [
    {
      id: 'r1',
      title: 'Complete Blood Count (CBC)',
      date: '08 Sep 2026',
      category: 'Laboratory',
      status: 'Completed',
      issuedBy: 'CareVault Central Diagnostics',
      fileSize: '1.2 MB',
    },
    {
      id: 'r2',
      title: 'Chest X-Ray PA View',
      date: '12 Apr 2026',
      category: 'Radiology',
      status: 'Completed',
      issuedBy: 'Radiology Dept - City Hospital',
      fileSize: '4.8 MB',
    },
  ],
  prescriptions: [
    {
      id: 'p1',
      date: '08 Sep 2026',
      doctor: 'Dr. Ananya Sharma',
      medicines: [
        { name: 'Paracetamol 500 mg', dosage: '1-0-1', duration: '3 days', instruction: 'After meals' },
        { name: 'ORS Powder', dosage: '1 sachet/day', duration: '5 days', instruction: 'Dissolve in 1L water' },
        { name: 'Tab Cetirizine 10 mg', dosage: '0-0-1', duration: '3 days', instruction: 'At bedtime' },
      ],
      advice: 'Rest and adequate hydration. Avoid cold items.',
      followUp: '7 days',
    },
  ],
};

export default function PatientDashboard({ patientData: customPatientData, onNavigateToCaseTaking }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Sync data from props or localStorage (Registration integration fallback)
  useEffect(() => {
    if (customPatientData && Object.keys(customPatientData).length > 0) {
      setPatient((prev) => ({
        ...prev,
        ...customPatientData,
        vitals: { ...prev.vitals, ...(customPatientData.vitals || {}) },
        stats: { ...prev.stats, ...(customPatientData.stats || {}) },
      }));
      return;
    }

    // Try reading registration data saved in localStorage by Registration teammate module
    try {
      const savedReg = localStorage.getItem('carevault_registered_patient') || localStorage.getItem('registeredPatient');
      if (savedReg) {
        const parsed = JSON.parse(savedReg);
        setPatient((prev) => ({
          ...prev,
          name: parsed.name || parsed.fullName || prev.name,
          patientId: parsed.patientId || parsed.id || prev.patientId,
          age: parsed.age || prev.age,
          gender: parsed.gender || prev.gender,
          phone: parsed.phone || prev.phone,
          address: parsed.address || prev.address,
          aadhaar: parsed.aadhaar || prev.aadhaar,
          bloodGroup: parsed.bloodGroup || prev.bloodGroup,
          knownConditions: parsed.knownConditions || prev.knownConditions,
          allergies: parsed.allergies || prev.allergies,
        }));
      }
    } catch (e) {
      console.warn('Could not load stored patient registration', e);
    }
  }, [customPatientData]);

  // Compute Initials for Avatar
  const initials = (patient.name || 'Rahul Kumar')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handlePrintPrescription = () => {
    window.print();
  };

  return (
    <div className="patient-dashboard-container">
      {/* ── Top Header Profile Card ── */}
      <header className="pd-header-card">
        <div className="pd-profile-left">
          <div className="pd-avatar">{initials}</div>
          <div className="pd-profile-info">
            <div className="pd-name-row">
              <h1 className="pd-patient-name">{patient.name}</h1>
              <span className="pd-id-badge">{patient.patientId}</span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-item">
                <strong>Age:</strong> {patient.age}
              </span>
              <span className="pd-meta-divider">•</span>
              <span className="pd-meta-item">
                <strong>Gender:</strong> {patient.gender}
              </span>
              <span className="pd-meta-divider">•</span>
              <span className="pd-meta-item icon-item">
                <IconPhone /> {patient.phone}
              </span>
              <span className="pd-meta-divider">•</span>
              <span className="pd-meta-item icon-item">
                <IconMapPin /> {patient.address}
              </span>
            </div>
          </div>
        </div>

        <div className="pd-header-actions">
          {patient.aadhaar && (
            <div className="pd-aadhaar-chip">
              <IconShield /> Aadhaar: •••• •••• {String(patient.aadhaar).slice(-4)}
            </div>
          )}
          {onNavigateToCaseTaking && (
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={onNavigateToCaseTaking}
            >
              <IconPlusCircle /> New Visit Case-Taking
            </button>
          )}
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav className="pd-tabs-nav">
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <IconActivity /> Overview
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          <IconCalendar /> Visits ({patient.visits.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <IconFileText /> Reports ({patient.reports.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <IconPill /> Prescriptions ({patient.prescriptions.length})
        </button>
      </nav>

      {/* ── Main Tab Content ── */}
      <main className="pd-tab-content">
        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="pd-overview-grid">
            {/* Key Information Box */}
            <div className="pd-card pd-key-info-card">
              <h2 className="pd-card-title">Key Medical Information</h2>
              <div className="pd-info-grid">
                <div className="pd-info-box">
                  <span className="pd-info-label">Blood Group</span>
                  <span className="pd-info-value highlight-red">{patient.bloodGroup}</span>
                </div>
                <div className="pd-info-box">
                  <span className="pd-info-label">Known Conditions</span>
                  <span className="pd-info-value">{patient.knownConditions}</span>
                </div>
                <div className="pd-info-box">
                  <span className="pd-info-label">Allergies</span>
                  <span className="pd-info-value">{patient.allergies}</span>
                </div>
                <div className="pd-info-box">
                  <span className="pd-info-label">Emergency Contact</span>
                  <span className="pd-info-value">{patient.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="pd-stats-row">
              <div className="pd-stat-card">
                <span className="pd-stat-number">{patient.stats.totalVisits}</span>
                <span className="pd-stat-label">Total Visits</span>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-number">{patient.stats.reportsCount}</span>
                <span className="pd-stat-label">Lab Reports</span>
              </div>
              <div className="pd-stat-card highlight">
                <span className="pd-stat-number">{patient.stats.activeFollowUps}</span>
                <span className="pd-stat-label">Active Follow-up</span>
              </div>
            </div>

            {/* Today's Vitals Summary */}
            <div className="pd-card pd-vitals-card">
              <div className="pd-card-header-flex">
                <h2 className="pd-card-title">Latest Recorded Vitals</h2>
                <span className="pd-vitals-date">08 Sep 2026</span>
              </div>
              <div className="pd-vitals-grid">
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">BP</span>
                  <span className="pd-vital-val">{patient.vitals.bp}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">Heart Rate</span>
                  <span className="pd-vital-val">{patient.vitals.hr}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">Temperature</span>
                  <span className="pd-vital-val warning">{patient.vitals.temp}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">SpO2</span>
                  <span className="pd-vital-val">{patient.vitals.spo2}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Case-Taking Card */}
            <div className="pd-card pd-action-banner">
              <div className="pd-banner-content">
                <span className="pd-banner-badge">Smart Case-Taking</span>
                <h3>Need a new consultation?</h3>
                <p>Start a structured case-taking dynamic form with AI complaint assistance.</p>
              </div>
              <button
                type="button"
                className="pd-btn pd-btn-secondary"
                onClick={() => {
                  if (onNavigateToCaseTaking) {
                    onNavigateToCaseTaking();
                  } else {
                    setActiveTab('visits');
                  }
                }}
              >
                View Timeline <IconArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. VISITS TIMELINE TAB ==================== */}
        {activeTab === 'visits' && (
          <div className="pd-card pd-visits-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Patient Timeline & Visit History</h2>
                <p className="pd-card-subtitle">Chronological record of consultations, complaints & diagnoses</p>
              </div>
            </div>

            <div className="pd-timeline">
              {patient.visits.map((visit, index) => (
                <div key={visit.id} className="pd-timeline-item">
                  <div className="pd-timeline-dot" />
                  <div className="pd-timeline-content">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-date">{visit.date}</span>
                      <span className="pd-visit-type-badge">{visit.type}</span>
                    </div>

                    <h4 className="pd-visit-complaint">{visit.chiefComplaint}</h4>

                    <div className="pd-visit-meta">
                      <span><strong>Doctor:</strong> {visit.doctor}</span>
                      <span>•</span>
                      <span><strong>Dept:</strong> {visit.department}</span>
                    </div>

                    <div className="pd-visit-diagnosis">
                      <strong>Diagnosis:</strong> {visit.diagnosis}
                    </div>

                    <button
                      type="button"
                      className="pd-btn-text"
                      onClick={() => setSelectedVisit(selectedVisit === visit.id ? null : visit.id)}
                    >
                      {selectedVisit === visit.id ? 'Hide Details' : 'View Full Details →'}
                    </button>

                    {selectedVisit === visit.id && (
                      <div className="pd-visit-expanded">
                        <h5>Visit Notes</h5>
                        <p>Patient presented with moderate symptoms. Structured case-taking completed. Vitals stable. Follow-up advised within 7 days.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 3. REPORTS TAB ==================== */}
        {activeTab === 'reports' && (
          <div className="pd-card pd-reports-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Diagnostic Reports & Lab Results</h2>
                <p className="pd-card-subtitle">Access lab tests, imaging, and pathology documents</p>
              </div>
            </div>

            <div className="pd-reports-list">
              {patient.reports.map((report) => (
                <div key={report.id} className="pd-report-card">
                  <div className="pd-report-icon">
                    <IconFileText />
                  </div>
                  <div className="pd-report-info">
                    <h4 className="pd-report-title">{report.title}</h4>
                    <div className="pd-report-meta">
                      <span>{report.category}</span> • <span>{report.date}</span> • <span>{report.issuedBy}</span>
                    </div>
                  </div>
                  <div className="pd-report-right">
                    <span className="pd-status-tag completed">{report.status}</span>
                    <button
                      type="button"
                      className="pd-btn pd-btn-outline"
                      onClick={() => alert(`Downloading report: ${report.title}`)}
                    >
                      <IconDownload /> Download ({report.fileSize})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 4. PRESCRIPTIONS TAB ==================== */}
        {activeTab === 'prescriptions' && (
          <div className="pd-card pd-rx-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Active & Recent Prescriptions</h2>
                <p className="pd-card-subtitle">Medications prescribed by attending doctors</p>
              </div>
              <button type="button" className="pd-btn pd-btn-outline" onClick={handlePrintPrescription}>
                <IconPrinter /> Print Prescription
              </button>
            </div>

            {patient.prescriptions.map((rx) => (
              <div key={rx.id} className="pd-rx-card">
                <div className="pd-rx-header">
                  <div>
                    <span className="pd-rx-badge">Rx #{rx.id.toUpperCase()}</span>
                    <span className="pd-rx-doctor">Prescribed by {rx.doctor}</span>
                  </div>
                  <span className="pd-rx-date">{rx.date}</span>
                </div>

                <div className="pd-rx-table-wrapper">
                  <table className="pd-rx-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage (M-A-N)</th>
                        <th>Duration</th>
                        <th>Instruction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td className="pd-med-name">
                            <IconPill /> {med.name}
                          </td>
                          <td>
                            <span className="pd-dosage-chip">{med.dosage}</span>
                          </td>
                          <td>{med.duration}</td>
                          <td className="pd-med-instruction">{med.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pd-rx-footer">
                  <div className="pd-rx-note">
                    <strong>Doctor's Advice:</strong> {rx.advice}
                  </div>
                  <div className="pd-rx-followup">
                    <strong>Next Follow-up:</strong> In {rx.followUp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
