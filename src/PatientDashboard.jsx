import { useState, useEffect } from 'react';
import './PatientDashboard.css';
import { getPatientProfile, getPatientVisits } from './services/visitService';
import { getPatientById } from './services/patientService';
import { getPatientDashboardFromBackend } from './services/api';

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
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
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

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Default patient fallback (Vikram Malhotra)
const DEFAULT_PATIENT = {
  name: 'Vikram Malhotra',
  patientId: 'CV2026-000110',
  age: 32,
  dob: '1994-07-12',
  gender: 'Male',
  phone: '9876512340',
  email: 'vikram.malhotra@example.com',
  address: 'Boring Road, Patna, Bihar - 800001',
  aadhaar: '7812 3456 9012',
  bloodGroup: 'B+',
  knownConditions: 'None Reported',
  allergies: 'Not Reported',
  emergencyContact: '9876512341',
  emergencyContactRelationship: 'Spouse',
  vitals: {
    bp: '120/80 mmHg',
    hr: '76 bpm',
    temp: '98.6°F',
    spo2: '99%',
  },
  stats: {
    totalVisits: 3,
    reportsCount: 2,
    activeFollowUps: 1,
  },
  reports: [
    {
      id: 'r1',
      title: 'Complete Blood Count (CBC)',
      date: '10 Sep 2026',
      category: 'Laboratory',
      status: 'Completed',
      issuedBy: 'CareVault Central Diagnostics',
      fileSize: '1.2 MB',
    },
    {
      id: 'r2',
      title: 'Chest X-Ray PA View',
      date: '15 May 2026',
      category: 'Radiology',
      status: 'Completed',
      issuedBy: 'Radiology Dept - CareVault Hospital',
      fileSize: '4.8 MB',
    },
  ],
  prescriptions: [
    {
      id: 'p1',
      date: '10 Sep 2026',
      doctor: 'Dr. Ananya Sharma',
      medicines: [
        { name: 'Paracetamol 650 mg', dosage: '1-0-1', duration: '5 days', instruction: 'After meals' },
        { name: 'Tab Cetirizine 10 mg', dosage: '0-0-1', duration: '3 days', instruction: 'At bedtime' },
        { name: 'Cough Syrup (100ml)', dosage: '2 tsp', frequency: 'TID', duration: '5 days', instruction: 'After meals' },
      ],
      advice: 'Rest, warm fluids, and adequate hydration.',
      followUp: '15 Sep 2026',
    },
  ],
};

export default function PatientDashboard({
  patientData: customPatientData,
  onNavigateToCaseTaking,
  onNavigateToNewVisit,
  onSignOut,
  selectedVisitIdToOpen,
}) {
  const targetId = customPatientData?.patientId || customPatientData?.id || 'CV2026-000110';

  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [serviceVisits, setServiceVisits] = useState([]);
  const [selectedVisitModal, setSelectedVisitModal] = useState(null);

  // Sync and load patient details from MongoDB Express Backend, services, & props
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch directly from MongoDB Express Backend if available
    getPatientDashboardFromBackend(targetId)
      .then((res) => {
        if (isMounted && res?.success && res?.patient) {
          const dbPatient = res.patient;
          setPatient((prev) => ({
            ...prev,
            name: dbPatient.name || prev.name,
            patientId: dbPatient.patientId || prev.patientId,
            age: dbPatient.age || prev.age,
            gender: dbPatient.gender || prev.gender,
            phone: dbPatient.phone || prev.phone,
            address: dbPatient.address || prev.address,
            aadhaar: dbPatient.aadhaar || prev.aadhaar,
            bloodGroup: dbPatient.bloodGroup || prev.bloodGroup,
            knownConditions: dbPatient.knownConditions || prev.knownConditions,
            allergies: dbPatient.allergies || prev.allergies,
            vitals: dbPatient.vitals || prev.vitals,
          }));
        }
      })
      .catch((err) => console.warn('MongoDB fetch notice:', err));

    // 2. Local fallback sync
    const regPatient = getPatientById(targetId);
    const profile = getPatientProfile(targetId);
    const vList = getPatientVisits(targetId);
    setServiceVisits(vList || []);

    if (selectedVisitIdToOpen) {
      const found = (vList || []).find((v) => v.id === selectedVisitIdToOpen);
      if (found) setSelectedVisitModal(found);
    }

    setPatient((prev) => ({
      ...prev,
      ...profile,
      ...regPatient,
      name: customPatientData?.name || regPatient?.name || profile.name || prev.name,
      patientId: targetId,
      age: customPatientData?.age || regPatient?.age || profile.age || prev.age,
      gender: customPatientData?.gender || regPatient?.gender || profile.gender || prev.gender,
      phone: customPatientData?.phone || regPatient?.phone || profile.contact || prev.phone,
      email: regPatient?.email || profile.email || prev.email,
      address: customPatientData?.address || regPatient?.address || profile.address || prev.address,
      aadhaar: customPatientData?.aadhaar || regPatient?.aadhaar || profile.aadhaar || prev.aadhaar,
      bloodGroup: customPatientData?.bloodGroup || regPatient?.bloodGroup || profile.bloodGroup || prev.bloodGroup,
      emergencyContact: regPatient?.emergencyContact || prev.emergencyContact,
      emergencyContactRelationship: regPatient?.emergencyContactRelationship || prev.emergencyContactRelationship,
      knownConditions: regPatient?.knownConditions || profile.knownConditions || prev.knownConditions,
      allergies: regPatient?.allergies || profile.allergies || prev.allergies,
      vitals: { ...prev.vitals, ...(customPatientData?.vitals || {}) },
      stats: {
        totalVisits: (vList && vList.length > 0) ? vList.length : prev.stats.totalVisits,
        reportsCount: profile.reportCount || prev.stats.reportsCount,
        activeFollowUps: profile.activeFollowUpCount || prev.stats.activeFollowUps,
      },
    }));

    return () => {
      isMounted = false;
    };
  }, [customPatientData, targetId, selectedVisitIdToOpen]);

  const handleNewVisitAction = () => {
    if (onNavigateToCaseTaking) {
      onNavigateToCaseTaking();
    } else if (onNavigateToNewVisit) {
      onNavigateToNewVisit();
    }
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  // Initials for avatar
  const initials = (patient.name || 'Vikram Malhotra')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const displayVisits = serviceVisits.length > 0
    ? serviceVisits.map((v) => ({
        id: v.id,
        date: v.date,
        time: v.time,
        type: 'OPD Visit',
        chiefComplaint: `${v.chiefComplaint}${v.complaintDuration ? ` (${v.complaintDuration} ${v.complaintDurationUnit || 'Days'})` : ''}`,
        doctor: v.doctorName || 'Dr. Ananya Sharma',
        department: 'General Medicine',
        diagnosis: v.primaryDiagnosis || 'Clinical Assessment',
        vitals: v.vitals,
        prescription: v.prescription,
        historyOfPresentIllness: v.historyOfPresentIllness,
        followUp: v.followUp,
        rawVisitObj: v,
      }))
    : [
        {
          id: 'VIS-2026-003',
          date: '10 Sep 2026',
          type: 'OPD Visit',
          chiefComplaint: 'Chest congestion & fever since 3 days',
          doctor: 'Dr. Ananya Sharma',
          department: 'General Medicine',
          diagnosis: 'Acute Viral Pyrexia & Bronchitis',
          status: 'Completed',
        },
        {
          id: 'VIS-2026-002',
          date: '15 May 2026',
          type: 'Lab Test',
          chiefComplaint: 'Routine Lab Screening',
          doctor: 'Dr. Rajesh Verma',
          department: 'Internal Medicine',
          diagnosis: 'Chest X-Ray & CBC Screening',
          status: 'Completed',
        },
      ];

  const patientCases = [
    {
      id: 'CASE-2026-081',
      title: 'Acute Viral Pyrexia & Respiratory Infection',
      startDate: '10 Sep 2026',
      status: 'Active',
      primaryDiagnosis: 'Acute Viral Pyrexia',
      secondaryDiagnosis: 'Upper Respiratory Tract Congestion',
      doctor: 'Dr. Ananya Sharma',
      department: 'General Medicine',
      lastUpdated: '10 Sep 2026',
    },
    {
      id: 'CASE-2026-042',
      title: 'Hypertension Monitoring & Blood Pressure Control',
      startDate: '15 May 2026',
      status: 'Closed',
      primaryDiagnosis: 'Essential Hypertension (Controlled)',
      secondaryDiagnosis: 'Mild Hyperlipidemia',
      doctor: 'Dr. Rajesh Verma',
      department: 'Internal Medicine',
      lastUpdated: '28 Aug 2026',
    },
  ];

  const patientAppointments = [
    {
      id: 'APT-2026-104',
      date: '15 Sep 2026',
      time: '10:00 AM',
      type: 'Follow-up Consultation',
      tokenNumber: 'TK-104',
      department: 'General Medicine',
      doctor: 'Dr. Ananya Sharma',
      status: 'Confirmed',
    },
    {
      id: 'APT-2026-088',
      date: '10 Sep 2026',
      time: '10:30 AM',
      type: 'OPD Consultation',
      tokenNumber: 'TK-102',
      department: 'General Medicine',
      doctor: 'Dr. Ananya Sharma',
      status: 'Completed',
    },
  ];

  const patientDocuments = [
    {
      id: 'doc-1',
      title: 'UIDAI Aadhaar KYC Identity Document',
      category: 'Identity Record',
      uploadDate: '10 Jan 2026',
      fileSize: '1.4 MB',
      fileType: 'PDF Document',
    },
    {
      id: 'doc-2',
      title: 'Hospital Clinical Summary & Vitals Card',
      category: 'Clinical Record',
      uploadDate: '15 May 2026',
      fileSize: '2.8 MB',
      fileType: 'PDF Document',
    },
  ];

  return (
    <div className="patient-dashboard-container">
      {/* ── Top Header Navbar (if Sign Out is available directly) ── */}
      {onSignOut && (
        <nav className="pd-navbar" style={{ marginBottom: '1.25rem', borderRadius: '12px' }}>
          <div className="pd-nav-brand">
            <img src="/logo.jpeg" alt="CareVault" className="pd-nav-logo" />
            <span className="pd-nav-title">CareVault</span>
            <span className="pd-nav-role-badge">Doctor & Patient Portal</span>
          </div>
          <button type="button" className="pd-signout-btn" onClick={onSignOut}>
            <IconLogOut /> Sign Out
          </button>
        </nav>
      )}

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
                <strong>Age:</strong> {patient.age} Yrs
              </span>
              <span className="pd-meta-divider">•</span>
              <span className="pd-meta-item">
                <strong>Gender:</strong> {patient.gender}
              </span>
              <span className="pd-meta-divider">•</span>
              <span className="pd-meta-item">
                <strong>Blood Group:</strong> {patient.bloodGroup}
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
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={handleNewVisitAction}
            id="btn-new-visit-case-taking"
          >
            <IconPlusCircle /> + Start Consultation / New Case
          </button>
        </div>
      </header>

      {/* ── Navigation Tabs (8 Dedicated Tabs) ── */}
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
          className={`pd-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <IconCalendar /> Medical History ({displayVisits.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          <IconBriefcase /> Cases ({patientCases.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <IconClock /> Appointments ({patientAppointments.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <IconPill /> Prescriptions ({patient.prescriptions?.length || 1})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <IconFileText /> Lab Reports ({patient.reports?.length || 2})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <IconFolder /> Documents ({patientDocuments.length})
        </button>
        <button
          type="button"
          className={`pd-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <IconUser /> Profile
        </button>
      </nav>

      {/* ── Main Tab Content ── */}
      <main className="pd-tab-content">
        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="pd-overview-grid">
            {/* RECENT ACTIVITY FEED */}
            <div className="pd-card pd-key-info-card" style={{ gridColumn: '1 / -1' }}>
              <div className="pd-card-header-flex">
                <h2 className="pd-card-title">Recent Activity</h2>
                <span className="pd-vitals-date">Timeline of recent patient updates</span>
              </div>
              <div className="pd-timeline" style={{ marginTop: '0.75rem' }}>
                <div className="pd-timeline-item">
                  <div className="pd-timeline-dot" />
                  <div className="pd-timeline-content">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-date">10 Sep 2026</span>
                      <span className="pd-visit-type-badge">New Consultation / Case</span>
                    </div>
                    <h4 className="pd-visit-complaint">Chest congestion & fever evaluation</h4>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      Primary Diagnosis: <strong>Acute Viral Pyrexia & Bronchitis</strong>. Prescribed Paracetamol 650mg & Cetirizine.
                    </p>
                  </div>
                </div>

                <div className="pd-timeline-item">
                  <div className="pd-timeline-dot" />
                  <div className="pd-timeline-content">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-date">10 Sep 2026</span>
                      <span className="pd-visit-type-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Lab Report Ready</span>
                    </div>
                    <h4 className="pd-visit-complaint">Complete Blood Count (CBC) Diagnostic Result</h4>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      Issued by CareVault Central Diagnostics. Status: Completed.
                    </p>
                  </div>
                </div>

                <div className="pd-timeline-item">
                  <div className="pd-timeline-dot" />
                  <div className="pd-timeline-content">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-date">15 Sep 2026</span>
                      <span className="pd-visit-type-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Follow-up Scheduled</span>
                    </div>
                    <h4 className="pd-visit-complaint">Clinical Review & Vitals Check</h4>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      Scheduled OPD Token: <strong>TK-104</strong> with Dr. Ananya Sharma.
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                  <span className="pd-info-value">{patient.emergencyContact || patient.phone}</span>
                </div>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="pd-stats-row">
              <div className="pd-stat-card">
                <span className="pd-stat-number">{displayVisits.length}</span>
                <span className="pd-stat-label">Total Visits</span>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-number">{patient.reports?.length || 2}</span>
                <span className="pd-stat-label">Lab Reports</span>
              </div>
              <div className="pd-stat-card highlight">
                <span className="pd-stat-number">{patient.stats?.activeFollowUps || 1}</span>
                <span className="pd-stat-label">Active Follow-up</span>
              </div>
            </div>

            {/* Today's Vitals Summary */}
            <div className="pd-card pd-vitals-card">
              <div className="pd-card-header-flex">
                <h2 className="pd-card-title">Latest Recorded Vitals</h2>
                <span className="pd-vitals-date">{displayVisits[0]?.date || '10 Sep 2026'}</span>
              </div>
              <div className="pd-vitals-grid">
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">BP</span>
                  <span className="pd-vital-val">{displayVisits[0]?.vitals?.bloodPressure || patient.vitals?.bp || '120/80 mmHg'}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">Heart Rate</span>
                  <span className="pd-vital-val">{displayVisits[0]?.vitals?.heartRate ? `${displayVisits[0].vitals.heartRate} bpm` : (patient.vitals?.hr || '76 bpm')}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">Temperature</span>
                  <span className="pd-vital-val warning">{displayVisits[0]?.vitals?.temperature ? `${displayVisits[0].vitals.temperature}°F` : (patient.vitals?.temp || '98.6°F')}</span>
                </div>
                <div className="pd-vital-tile">
                  <span className="pd-vital-name">SpO2</span>
                  <span className="pd-vital-val">{displayVisits[0]?.vitals?.spO2 ? `${displayVisits[0].vitals.spO2}%` : (patient.vitals?.spo2 || '99%')}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Case-Taking Card */}
            <div className="pd-card pd-action-banner">
              <div className="pd-banner-content">
                <span className="pd-banner-badge">Smart Consultation</span>
                <h3>Start New Clinical Case</h3>
                <p>Begin dynamic case-taking, vitals intake, diagnosis, and prescription recording.</p>
              </div>
              <button
                type="button"
                className="pd-btn pd-btn-secondary"
                onClick={handleNewVisitAction}
              >
                + Start Consultation <IconArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. MEDICAL HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="pd-card pd-visits-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Patient Timeline & Medical History</h2>
                <p className="pd-card-subtitle">Chronological record of consultations, complaints & diagnoses</p>
              </div>
              <button
                type="button"
                className="pd-btn pd-btn-primary"
                onClick={handleNewVisitAction}
              >
                <IconPlusCircle /> + Start Consultation
              </button>
            </div>

            <div className="pd-timeline">
              {displayVisits.map((visit) => (
                <div key={visit.id} className="pd-timeline-item">
                  <div className="pd-timeline-dot" />
                  <div className="pd-timeline-content">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-date">{visit.date} {visit.time ? `• ${visit.time}` : ''}</span>
                      <span className="pd-visit-type-badge">{visit.type || 'OPD Visit'}</span>
                      <span className="visit-id" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{visit.id}</span>
                    </div>

                    <h4 className="pd-visit-complaint">{visit.chiefComplaint}</h4>

                    <div className="pd-visit-meta">
                      <span><strong>Doctor:</strong> {visit.doctor}</span>
                      <span>•</span>
                      <span><strong>Dept:</strong> {visit.department || 'General Medicine'}</span>
                    </div>

                    <div className="pd-visit-diagnosis">
                      <strong>Diagnosis:</strong> {visit.diagnosis}
                    </div>

                    {visit.vitals && (
                      <div className="vitals-pill-group" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {visit.vitals.bloodPressure && <span className="v-pill">BP: {visit.vitals.bloodPressure}</span>}
                        {visit.vitals.heartRate && <span className="v-pill">HR: {visit.vitals.heartRate} bpm</span>}
                        {visit.vitals.temperature && <span className="v-pill">Temp: {visit.vitals.temperature}°F</span>}
                        {visit.vitals.spO2 && <span className="v-pill">SpO2: {visit.vitals.spO2}%</span>}
                      </div>
                    )}

                    <button
                      type="button"
                      className="pd-btn-text"
                      onClick={() => setSelectedVisitModal(visit.rawVisitObj || visit)}
                    >
                      View Case Record Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 3. CASES TAB ==================== */}
        {activeTab === 'cases' && (
          <div className="pd-card pd-visits-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Clinical Cases</h2>
                <p className="pd-card-subtitle">Active and past medical cases recorded for this patient</p>
              </div>
              <button type="button" className="pd-btn pd-btn-primary" onClick={handleNewVisitAction}>
                <IconPlusCircle /> + Create New Case
              </button>
            </div>

            <div className="pd-reports-list">
              {patientCases.map((c) => (
                <div key={c.id} className="pd-report-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconBriefcase />
                      <h4 className="pd-report-title">{c.title}</h4>
                      <span className="mono" style={{ fontSize: '0.8rem', color: '#64748b' }}>({c.id})</span>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: c.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                        color: c.status === 'Active' ? '#15803d' : '#475569',
                      }}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                    <strong>Primary Diagnosis:</strong> {c.primaryDiagnosis} {c.secondaryDiagnosis ? `| Secondary: ${c.secondaryDiagnosis}` : ''}
                  </div>

                  <div className="pd-report-meta">
                    <span>Started: {c.startDate}</span> • <span>Doctor: {c.doctor}</span> • <span>Dept: {c.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 4. APPOINTMENTS TAB ==================== */}
        {activeTab === 'appointments' && (
          <div className="pd-card pd-visits-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Appointments & OPD Tokens</h2>
                <p className="pd-card-subtitle">Scheduled and completed consultations</p>
              </div>
            </div>

            <div className="pd-reports-list">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="pd-report-card">
                  <div className="pd-report-icon">
                    <IconClock />
                  </div>
                  <div className="pd-report-info">
                    <h4 className="pd-report-title">{apt.type} — {apt.tokenNumber}</h4>
                    <div className="pd-report-meta">
                      <span>Date: {apt.date} at {apt.time}</span> • <span>Doctor: {apt.doctor}</span> • <span>Dept: {apt.department}</span>
                    </div>
                  </div>
                  <div className="pd-report-right">
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: apt.status === 'Confirmed' ? '#e0f2fe' : '#dcfce7',
                        color: apt.status === 'Confirmed' ? '#0369a1' : '#15803d',
                      }}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 5. PRESCRIPTIONS TAB ==================== */}
        {activeTab === 'prescriptions' && (
          <div className="pd-card pd-rx-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Active & Past Prescriptions</h2>
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
                    <strong>Next Follow-up:</strong> {rx.followUp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== 6. LAB REPORTS TAB ==================== */}
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
                    <span className="pd-status-tag completed" style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{report.status}</span>
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

        {/* ==================== 7. DOCUMENTS TAB ==================== */}
        {activeTab === 'documents' && (
          <div className="pd-card pd-reports-section">
            <div className="pd-card-header-flex">
              <div>
                <h2 className="pd-card-title">Uploaded Medical Documents</h2>
                <p className="pd-card-subtitle">KYC records, discharge summaries, and external documents</p>
              </div>
            </div>

            <div className="pd-reports-list">
              {patientDocuments.map((doc) => (
                <div key={doc.id} className="pd-report-card">
                  <div className="pd-report-icon">
                    <IconFolder />
                  </div>
                  <div className="pd-report-info">
                    <h4 className="pd-report-title">{doc.title}</h4>
                    <div className="pd-report-meta">
                      <span>Category: {doc.category}</span> • <span>Uploaded: {doc.uploadDate}</span> • <span>Type: {doc.fileType}</span>
                    </div>
                  </div>
                  <div className="pd-report-right">
                    <button
                      type="button"
                      className="pd-btn pd-btn-outline"
                      onClick={() => alert(`Downloading document: ${doc.title}`)}
                    >
                      <IconDownload /> Download ({doc.fileSize})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 8. PROFILE TAB ==================== */}
        {activeTab === 'profile' && (
          <div className="pd-card pd-key-info-card">
            <div className="pd-card-header-flex">
              <h2 className="pd-card-title">Patient Demographic Profile</h2>
              <span className="pd-vitals-date">Registered Identity Information</span>
            </div>

            <div className="pd-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1rem' }}>
              <div className="pd-info-box">
                <span className="pd-info-label">Full Name</span>
                <span className="pd-info-value">{patient.name}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">CareVault Patient ID</span>
                <span className="pd-info-value highlight-blue">{patient.patientId}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Age / Gender</span>
                <span className="pd-info-value">{patient.age} Yrs / {patient.gender}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Date of Birth</span>
                <span className="pd-info-value">{patient.dob || '12 Jul 1994'}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Mobile Phone</span>
                <span className="pd-info-value">{patient.phone}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Email Address</span>
                <span className="pd-info-value">{patient.email || 'Not Provided'}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Blood Group</span>
                <span className="pd-info-value highlight-red">{patient.bloodGroup}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Aadhaar (KYC Status)</span>
                <span className="pd-info-value">{patient.aadhaar ? `${patient.aadhaar} (Verified)` : 'Not Provided'}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Emergency Contact</span>
                <span className="pd-info-value">{patient.emergencyContact || 'Not Provided'}</span>
              </div>
              <div className="pd-info-box">
                <span className="pd-info-label">Relationship</span>
                <span className="pd-info-value">{patient.emergencyContactRelationship || 'Spouse / Relative'}</span>
              </div>
              <div className="pd-info-box" style={{ gridColumn: '1 / -1' }}>
                <span className="pd-info-label">Residential Address</span>
                <span className="pd-info-value">{patient.address}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Clinical Case Details Modal ── */}
      {selectedVisitModal && (
        <div className="modal-backdrop" onClick={() => setSelectedVisitModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Clinical Case Record: {selectedVisitModal.id}</h2>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Visit Date: {selectedVisitModal.date} • Attending: {selectedVisitModal.doctorName || selectedVisitModal.doctor || 'Dr. Ananya Sharma'}
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedVisitModal(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div>
                <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chief Complaint</h4>
                <p style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '500', marginTop: '4px' }}>
                  {selectedVisitModal.chiefComplaint}
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
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ color: '#1e3a8a', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis & Assessment</h4>
                <div style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: '700', marginTop: '4px' }}>
                  Primary: {selectedVisitModal.primaryDiagnosis || selectedVisitModal.diagnosis || 'Clinical Assessment'}
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
                className="pd-btn pd-btn-secondary"
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
