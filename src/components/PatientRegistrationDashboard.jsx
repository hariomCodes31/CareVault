import { useState, useRef, useEffect } from 'react';
import {
  getPatients,
  getPatientById,
  searchPatients,
  registerPatient,
  parseAadhaarCard,
  generateNextPatientId,
} from '../services/patientService';
import './PatientRegistrationDashboard.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconShieldLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="10" width="6" height="5" rx="1" />
    <path d="M10 10V8a2 2 0 0 1 4 0v2" />
  </svg>
);

const IconPrinter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconAlertCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Format raw digits into 4-4-4 Aadhaar format: XXXX XXXX XXXX (Max 12 digits)
function formatAadhaar(val) {
  const digits = (val || '').replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Convert YYYY-MM-DD or any date to DD-MM-YYYY
function toDDMMYYYY(val) {
  if (!val) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
}

// Convert DD-MM-YYYY to YYYY-MM-DD for native date input
function toYYYYMMDD(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  return '';
}

// Format raw digits into DD-MM-YYYY format
function formatDob(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return toDDMMYYYY(val);
  }
  const clean = val.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
}

// Calculate age instantly from DOB in any format (DD-MM-YYYY, YYYY-MM-DD, D-M-YYYY, DD/MM/YYYY, continuous 8 digits)
function calculateAge(dobInput) {
  if (!dobInput) return '';
  const str = String(dobInput).trim();

  let day, month, year;

  // Case 1: YYYY-MM-DD (ISO)
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  }
  // Case 2: DD-MM-YYYY or D-M-YYYY or DD/MM/YYYY
  else if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }
  // Case 3: 8 continuous digits like 15081998 (DDMMYYYY)
  else if (/^\d{8}$/.test(str)) {
    day = parseInt(str.slice(0, 2), 10);
    month = parseInt(str.slice(2, 4), 10);
    year = parseInt(str.slice(4, 8), 10);
  }
  // Case 4: 4 digit birth year e.g. 1998
  else if (/^\d{4}$/.test(str)) {
    year = parseInt(str, 10);
    const currentYear = new Date().getFullYear();
    if (year >= 1900 && year <= currentYear) {
      return String(currentYear - year);
    }
    return '';
  } else {
    return '';
  }

  const currentYear = new Date().getFullYear();
  if (!year || year < 1900 || year > currentYear) return '';
  if (!month || month < 1 || month > 12) return '';
  if (!day || day < 1 || day > 31) return '';

  const birth = new Date(year, month - 1, day);
  if (isNaN(birth.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? String(age) : '0';
}

export default function PatientRegistrationDashboard({
  userRole = 'doctor',
  currentId = 'DR2026-000100',
  onRegistrationComplete,
  onBack,
  onDoctorSelectPatient,
  onDoctorStartVisit,
}) {
  const isPatient = userRole === 'patient';
  // If patient, directly start on 'register' tab; if doctor, start on 'search'
  const [activeTab, setActiveTab] = useState(isPatient ? 'register' : 'search');

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  // Check if this patient already has a record in storage
  const existingPatient = isPatient && currentId ? getPatientById(currentId) : null;

  // Search state — Patient details are NOT displayed by default
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Registration form state
  const [formData, setFormData] = useState(() => ({
    name: existingPatient?.name || '',
    age: existingPatient?.age ? String(existingPatient.age) : '',
    dob: toDDMMYYYY(existingPatient?.dob || ''),
    gender: existingPatient?.gender || 'Male',
    phone: existingPatient?.phone || '',
    email: existingPatient?.email || '',
    address: existingPatient?.address || '',
    aadhaar: existingPatient?.aadhaar || '',
    bloodGroup: existingPatient?.bloodGroup || '',
    emergencyContact: existingPatient?.emergencyContact || '',
    emergencyContactRelationship: existingPatient?.emergencyContactRelationship || '',
    knownConditions: existingPatient?.knownConditions || 'None',
    allergies: existingPatient?.allergies || 'Not Reported',
    chiefComplaint: existingPatient?.recentComplaint || 'General OPD Registration',
  }));

  useEffect(() => {
    if (existingPatient) {
      setFormData({
        name: existingPatient.name || '',
        age: existingPatient.age ? String(existingPatient.age) : '',
        dob: toDDMMYYYY(existingPatient.dob || ''),
        gender: existingPatient.gender || 'Male',
        phone: existingPatient.phone || '',
        email: existingPatient.email || '',
        address: existingPatient.address || '',
        aadhaar: existingPatient.aadhaar || '',
        bloodGroup: existingPatient.bloodGroup || '',
        emergencyContact: existingPatient.emergencyContact || '',
        emergencyContactRelationship: existingPatient.emergencyContactRelationship || '',
        knownConditions: existingPatient.knownConditions || 'None',
        allergies: existingPatient.allergies || 'Not Reported',
        chiefComplaint: existingPatient.recentComplaint || 'General OPD Registration',
      });
    }
  }, [existingPatient?.patientId]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPatientIdPreview, setNextPatientIdPreview] = useState(() =>
    isPatient ? currentId : generateNextPatientId()
  );

  // Aadhaar OCR Scanner state
  const [isScanningAadhaar, setIsScanningAadhaar] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [aadhaarExtractedInfo, setAadhaarExtractedInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Success OPD Token Slip Modal state
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [newlyRegisteredRecord, setNewlyRegisteredRecord] = useState(null);

  // Total patient count for live stats
  const [allPatientsCount, setAllPatientsCount] = useState(() => getPatients().length);

  // Live Auto-Calculation: Compute Age instantly whenever DOB is entered or changed
  useEffect(() => {
    if (formData.dob) {
      const calculated = calculateAge(formData.dob);
      if (calculated && calculated !== formData.age) {
        setFormData((prev) => ({ ...prev, age: calculated }));
        if (formErrors.age) {
          setFormErrors((prev) => ({ ...prev, age: undefined }));
        }
      }
    }
  }, [formData.dob]);

  // ── Handle Search ──────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      setSelectedPatient(null);
      return;
    }

    const results = searchPatients(searchQuery);
    setSearchResults(results);
    setHasSearched(true);

    if (results.length === 1) {
      setSelectedPatient(results[0]);
    } else if (results.length > 1) {
      setSelectedPatient(results[0]); // Select first result by default
    } else {
      setSelectedPatient(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
    setSelectedPatient(null);
  };

  const handlePresetSearch = (term) => {
    setSearchQuery(term);
    const results = searchPatients(term);
    setSearchResults(results);
    setHasSearched(true);
    if (results.length > 0) {
      setSelectedPatient(results[0]);
    }
  };

  // ── Handle Aadhaar OCR Scan ────────────────────────────────────────────────
  const triggerAadhaarScan = async (fileOrPreset) => {
    setIsScanningAadhaar(true);
    setScanStepText('Initializing Aadhaar OCR engine...');
    try {
      const result = await parseAadhaarCard(fileOrPreset, (step) => {
        setScanStepText(step.text);
      });

      if (result.success && result.data) {
        setAadhaarExtractedInfo(result.data);
        // Autofill the form
        setFormData((prev) => ({
          ...prev,
          name: result.data.name || prev.name,
          age: result.data.age ? String(result.data.age) : prev.age,
          dob: result.data.dob ? toDDMMYYYY(result.data.dob) : prev.dob,
          gender: result.data.gender || prev.gender,
          aadhaar: result.data.aadhaar ? formatAadhaar(result.data.aadhaar) : prev.aadhaar,
          address: result.data.address || prev.address,
          phone: result.data.phone || prev.phone,
          bloodGroup: result.data.bloodGroup || prev.bloodGroup,
        }));
        // Clear any validation errors for autofilled fields
        setFormErrors({});
      }
    } catch (err) {
      console.error('OCR Parsing Error:', err);
    } finally {
      setIsScanningAadhaar(false);
      setScanStepText('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerAadhaarScan(file);
    }
  };

  // ── Handle Form Validation & Submission ────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Patient Full Name is required.';
    if (!formData.age || !formData.age.trim()) {
      errors.age = 'Age is required.';
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        errors.age = 'Please enter a valid age (1 - 120).';
      }
    }
    if (!formData.gender) errors.gender = 'Gender is required.';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
      errors.phone = 'Enter a valid 10-digit mobile number.';
    }
    if (!formData.address.trim()) errors.address = 'Address / Location is required.';

    if (formData.dob && formData.dob.trim()) {
      if (formData.dob.length < 10) {
        errors.dob = 'Complete DD-MM-YYYY format.';
      } else {
        const parts = formData.dob.split('-');
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const y = parseInt(parts[2], 10);
          const currentYear = new Date().getFullYear();
          if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > currentYear) {
            errors.dob = 'Enter a valid date (DD-MM-YYYY).';
          }
        } else {
          errors.dob = 'Format must be DD-MM-YYYY.';
        }
      }
    }

    if (formData.aadhaar && formData.aadhaar.trim()) {
      const cleanAadhaar = formData.aadhaar.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        errors.aadhaar = `Aadhaar must be exactly 12 digits (currently ${cleanAadhaar.length}).`;
      }
    }

    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    // Simulate database write
    await new Promise((r) => setTimeout(r, 600));

    const result = registerPatient({
      ...formData,
      patientId: isPatient ? currentId : undefined,
      fromAadhaar: Boolean(aadhaarExtractedInfo),
    });

    setIsSubmitting(false);

    if (result.success) {
      setNewlyRegisteredRecord(result);
      setShowSlipModal(true);
      setAllPatientsCount((prev) => prev + 1);
      if (!isPatient) {
        setNextPatientIdPreview(generateNextPatientId());
      }
    }
  };

  const handleCloseSlipModal = (viewInSearch = false) => {
    setShowSlipModal(false);
    if (isPatient && onRegistrationComplete) {
      onRegistrationComplete(newlyRegisteredRecord?.patient);
      return;
    }
    if (!isPatient && viewInSearch && newlyRegisteredRecord) {
      setActiveTab('search');
      setSearchQuery(newlyRegisteredRecord.patient.patientId);
      setSearchResults([newlyRegisteredRecord.patient]);
      setSelectedPatient(newlyRegisteredRecord.patient);
      setHasSearched(true);
    }
    if (!isPatient) {
      // Reset form only for doctor (new patient)
      setFormData({
        name: '',
        age: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        aadhaar: '',
        bloodGroup: '',
        emergencyContact: '',
        emergencyContactRelationship: '',
        knownConditions: 'None',
        allergies: 'Not Reported',
        chiefComplaint: 'General OPD Consultation',
      });
      setAadhaarExtractedInfo(null);
    }
  };

  return (
    <div className="patient-reg-dashboard">
      {/* ── Top Navigation Bar with Back Button ───────────────────────── */}
      <div className="prd-top-nav-bar">
        <button
          type="button"
          className="prd-back-btn"
          onClick={handleBackClick}
          aria-label="Go back"
        >
          <IconArrowLeft /> Back
        </button>
      </div>

      {/* ── Subheader / Control Banner ─────────────────────────────────── */}
      <div className="prd-banner">
        {isPatient ? (
          <>
            <div className="prd-banner-left">
              <div className="prd-badge-step">CareVault Step 2</div>
              <h2 className="prd-title">Patient Registration Form</h2>
              <p className="prd-subtitle">
                Fill out your details below or upload your Aadhaar card for instant AI auto-fill.
              </p>
            </div>

            <div className="prd-banner-stats">
              <div className="prd-stat-chip highlight">
                <span className="chip-label">Your Patient ID</span>
                <span className="chip-val">{currentId}</span>
              </div>
              <div className="prd-stat-chip">
                <span className="chip-label">KYC Status</span>
                <span className="chip-val">{formData.aadhaar || aadhaarExtractedInfo ? 'Aadhaar Verified' : 'Pending Verification'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="prd-banner-left">
              <div className="prd-badge-step">Doctor Clinical Workspace</div>
              <h2 className="prd-title">Search & Retrieve Patient Record</h2>
              <p className="prd-subtitle">
                Enter a Patient ID to access complete medical history, recent activity, cases, and prescriptions.
              </p>
            </div>

            <div className="prd-banner-stats">
              <div className="prd-stat-chip">
                <span className="chip-label">Active Doctor</span>
                <span className="chip-val">{currentId}</span>
              </div>
              <div className="prd-stat-chip">
                <span className="chip-label">Registered Patients</span>
                <span className="chip-val">{allPatientsCount}</span>
              </div>
              <div className="prd-stat-chip highlight">
                <span className="chip-label">CareVault Clinical</span>
                <span className="chip-val">EHR Network</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* SEARCH EXISTING PATIENT (DOCTOR SEARCH WORKSPACE)                */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'search' && (
        <div className="prd-content-section">
          {/* Search Bar Bar */}
          <div className="prd-search-card">
            <form className="prd-search-form" onSubmit={handleSearchSubmit}>
              <div className="prd-search-input-wrap">
                <span className="search-icon"><IconSearch /></span>
                <input
                  type="text"
                  className="prd-search-input"
                  placeholder="Enter Patient ID (e.g. CV2026-000110), Name, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" className="prd-clear-btn" onClick={handleClearSearch} title="Clear search">
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="prd-btn-primary">
                Search Patient
              </button>
            </form>

            {/* Instant Demo Suggestion Chips */}
            <div className="prd-search-presets">
              <span className="presets-label">Quick Lookups (Demo):</span>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handlePresetSearch('CV2026-000110')}
              >
                CV2026-000110 (Vikram Malhotra)
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handlePresetSearch('CV2026-000452')}
              >
                CV2026-000452 (Rahul Kumar)
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handlePresetSearch('CV2026-000101')}
              >
                CV2026-000101 (Ananya Verma)
              </button>
              <button
                type="button"
                className="preset-chip"
                onClick={() => handlePresetSearch('CV2026-000214')}
              >
                CV2026-000214 (Rajesh Sharma)
              </button>
            </div>
          </div>

          {/* PRIVACY DEFAULT STATE: If doctor hasn't searched yet */}
          {!hasSearched && (
            <div className="prd-privacy-empty-state">
              <div className="privacy-icon-box">
                <IconShieldLock />
              </div>
              <h3 className="privacy-heading">Patient Data Privacy Protection Active</h3>
              <p className="privacy-desc">
                In accordance with CareVault clinical protocols, patient records are <strong>hidden by default</strong> upon login.
                Please enter a Patient ID (CV2026-000110), Name, or Phone in the search bar above to look up records.
              </p>
              <div className="privacy-actions">
                <button
                  type="button"
                  className="prd-btn-primary"
                  onClick={() => handlePresetSearch('CV2026-000110')}
                >
                  <IconSearch /> Search Demo Patient (CV2026-000110)
                </button>
              </div>
            </div>
          )}

          {/* SEARCH RESULTS DISPLAY */}
          {hasSearched && searchResults.length === 0 && (
            <div className="prd-no-results">
              <div className="no-results-icon"><IconAlertCircle /></div>
              <h3>Patient Not Found</h3>
              <p>No CareVault patient was found with this Patient ID. Please verify the ID and try again.</p>
            </div>
          )}

          {/* Multiple matches list */}
          {hasSearched && searchResults.length > 1 && (
            <div className="prd-multiple-results-bar">
              <span className="results-count-badge">Found {searchResults.length} patients</span>
              <div className="results-chips-list">
                {searchResults.map((p) => (
                  <button
                    key={p.patientId}
                    type="button"
                    className={`patient-selector-btn ${selectedPatient?.patientId === p.patientId ? 'active' : ''}`}
                    onClick={() => setSelectedPatient(p)}
                  >
                    <strong>{p.name}</strong> ({p.patientId}) - {p.gender}, {p.age}y
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SELECTED PATIENT RECORD (Step 2: Existing Patient Record Retrieval) */}
          {hasSearched && selectedPatient && (
            <div className="prd-patient-record-card">
              <div className="patient-record-header">
                <div className="patient-avatar-box">
                  <span className="avatar-initials">
                    {selectedPatient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>

                <div className="patient-header-details">
                  <div className="patient-name-row">
                    <h3 className="patient-name">{selectedPatient.name}</h3>
                    <span className="patient-status-chip">✓ Verified Record</span>
                  </div>
                  <div className="patient-meta-row">
                    <span className="patient-id-badge">Patient ID: {selectedPatient.patientId}</span>
                    <span className="meta-sep">•</span>
                    <span className="patient-age-gender">Age: {selectedPatient.age} Yrs | {selectedPatient.gender}</span>
                    <span className="meta-sep">•</span>
                    <span className="patient-phone">Mobile: {selectedPatient.phone}</span>
                  </div>
                </div>

                <div className="patient-header-actions">
                  <button
                    type="button"
                    className="prd-btn-outline"
                    onClick={() => {
                      if (onDoctorStartVisit) {
                        onDoctorStartVisit(selectedPatient);
                      } else if (onDoctorSelectPatient) {
                        onDoctorSelectPatient(selectedPatient);
                      }
                    }}
                  >
                    + New Case / Visit
                  </button>
                  <button
                    type="button"
                    className="prd-btn-primary"
                    onClick={() => {
                      if (onDoctorSelectPatient) {
                        onDoctorSelectPatient(selectedPatient);
                      } else {
                        alert(`Patient Record Opened: ${selectedPatient.name} (${selectedPatient.patientId})`);
                      }
                    }}
                  >
                    Open Patient Overview & Records <IconArrowRight />
                  </button>
                </div>
              </div>

              {/* Verified Demographics & Registration Details */}
              <div className="patient-record-details-grid">
                <div className="record-detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value bold">{selectedPatient.name}</span>
                </div>
                <div className="record-detail-item">
                  <span className="detail-label">CareVault Patient ID</span>
                  <span className="detail-value mono bold text-blue">{selectedPatient.patientId}</span>
                </div>
                <div className="record-detail-item">
                  <span className="detail-label">Age & Gender</span>
                  <span className="detail-value">{selectedPatient.age} Years / {selectedPatient.gender}</span>
                </div>
                <div className="record-detail-item">
                  <span className="detail-label">Registered Mobile</span>
                  <span className="detail-value">{selectedPatient.phone}</span>
                </div>
                <div className="record-detail-item">
                  <span className="detail-label">Residential Address</span>
                  <span className="detail-value">{selectedPatient.address}</span>
                </div>
                <div className="record-detail-item">
                  <span className="detail-label">Aadhaar (KYC Status)</span>
                  <span className="detail-value mono">{selectedPatient.aadhaar ? `${selectedPatient.aadhaar} (Verified)` : 'Not Linked'}</span>
                </div>
              </div>

              <div className="patient-record-footer-note">
                <IconCheckCircle />
                <span>Patient identity confirmed. Clinical Case-Taking and Medical Timeline will be managed in Step 3 & 4.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 2: NEW PATIENT REGISTRATION + AADHAAR AI OCR AUTO-FILL       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'register' && (
        <div className="prd-registration-workspace">
          {/* AADHAAR OCR SCANNER CARD */}
          <div className="aadhaar-scanner-card">
            <div className="aadhaar-header">
              <div className="aadhaar-title-group">
                <h3 className="aadhaar-heading">Smart Aadhaar Card OCR Scanner</h3>
                <p className="aadhaar-desc">
                  Upload your Aadhaar card to automatically extract information into the registration form.
                </p>
              </div>
            </div>

            {/* Drag and Drop / File Input Dropzone */}
            <div
              className={`aadhaar-dropzone ${isScanningAadhaar ? 'scanning' : ''}`}
              onClick={() => !isScanningAadhaar && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />

              {isScanningAadhaar ? (
                <div className="ocr-progress-box">
                  <div className="ocr-pulse-spinner" />
                  <div className="ocr-step-title">{scanStepText}</div>
                  <div className="ocr-progress-bar">
                    <div className="ocr-progress-fill" />
                  </div>
                  <span className="ocr-subtitle">CareVault Intelligent Extraction in progress...</span>
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="dropzone-icon"><IconUpload /></div>
                  <div className="dropzone-text">
                    <strong>Click to upload or drag & drop Aadhaar Card</strong>
                    <span>Supports JPG, PNG, WEBP, or scanned PDF document</span>
                  </div>
                  <button type="button" className="dropzone-browse-btn">
                    Browse File
                  </button>
                </div>
              )}
            </div>

            {/* Aadhaar Extracted Confirmation Pill Banner */}
            {aadhaarExtractedInfo && (
              <div className="aadhaar-success-banner">
                <div className="success-banner-icon"><IconCheckCircle /></div>
                <div className="success-banner-body">
                  <strong>Aadhaar Card Successfully Parsed & Verified!</strong>
                  <div className="extracted-chips">
                    <span className="verified-chip">Name: {aadhaarExtractedInfo.name}</span>
                    <span className="verified-chip">Age: {aadhaarExtractedInfo.age} Yrs</span>
                    <span className="verified-chip">Gender: {aadhaarExtractedInfo.gender}</span>
                    <span className="verified-chip">UID: {aadhaarExtractedInfo.aadhaar}</span>
                    <span className="verified-chip">Address: {aadhaarExtractedInfo.address.split(',')[0]}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="banner-revert-btn"
                  onClick={() => setAadhaarExtractedInfo(null)}
                  title="Clear extracted info"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* PATIENT REGISTRATION FORM (Matching Card 2 in Poster) */}
          <div className="prd-form-card">
            <div className="form-card-header">
              <div>
                <h3 className="form-title">Patient Registration Form</h3>
                <p className="form-subtitle">Fields marked with * are required for generating OPD tokens.</p>
              </div>
              <div className="form-id-preview-badge">
                <span>{isPatient ? 'Your Patient ID:' : 'Next Patient ID:'}</span>
                <strong>{isPatient ? currentId : nextPatientIdPreview}</strong>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-grid-2col">
                {/* Full Name */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientName">
                    Patient Full Name *
                    {aadhaarExtractedInfo && <span className="autofill-tag">✓ Autofilled from Aadhaar</span>}
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    className={`prd-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                    }}
                  />
                  {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
                </div>

                {/* Gender */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientGender">
                    Gender *
                  </label>
                  <select
                    id="patientGender"
                    className="prd-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth (DD-MM-YYYY) - First field in the row */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientDob">
                    Date of Birth (DD-MM-YYYY) *
                    {aadhaarExtractedInfo && <span className="autofill-tag">✓ Autofilled</span>}
                  </label>
                  <div className="input-with-addon">
                    <input
                      id="patientDob"
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      className={`prd-input mono ${formErrors.dob ? 'input-error' : ''}`}
                      placeholder="DD-MM-YYYY"
                      value={formData.dob}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        const formatted = formatDob(inputVal);
                        const calculatedAge = calculateAge(formatted) || calculateAge(inputVal);
                        setFormData((prev) => ({
                          ...prev,
                          dob: formatted,
                          age: calculatedAge || prev.age,
                        }));
                        if (formErrors.dob) setFormErrors((p) => ({ ...p, dob: undefined }));
                        if (formErrors.age && calculatedAge) setFormErrors((p) => ({ ...p, age: undefined }));
                      }}
                      onBlur={() => {
                        if (formData.dob) {
                          const parts = formData.dob.trim().split(/[-/.]/);
                          if (parts.length === 3) {
                            let [d, m, y] = parts;
                            if (y.length === 4 && d.length <= 2 && m.length <= 2) {
                              d = d.padStart(2, '0');
                              m = m.padStart(2, '0');
                              const normalized = `${d}-${m}-${y}`;
                              const calculatedAge = calculateAge(normalized);
                              setFormData((prev) => ({
                                ...prev,
                                dob: normalized,
                                age: calculatedAge || prev.age,
                              }));
                            }
                          }
                        }
                      }}
                    />
                    <div className="date-picker-wrapper" title="Click to pick from calendar">
                      <input
                        type="date"
                        aria-label="Pick date from calendar"
                        className="native-calendar-picker-input"
                        max={new Date().toISOString().split('T')[0]}
                        value={toYYYYMMDD(formData.dob)}
                        onChange={(e) => {
                          const isoVal = e.target.value;
                          if (isoVal) {
                            const ddmmyyyy = toDDMMYYYY(isoVal);
                            const calculatedAge = calculateAge(ddmmyyyy);
                            setFormData((prev) => ({
                              ...prev,
                              dob: ddmmyyyy,
                              age: calculatedAge || prev.age,
                            }));
                            if (formErrors.dob) setFormErrors((p) => ({ ...p, dob: undefined }));
                            if (formErrors.age && calculatedAge) setFormErrors((p) => ({ ...p, age: undefined }));
                          }
                        }}
                      />
                      <span className="calendar-icon-indicator">📅</span>
                    </div>
                  </div>
                  {formErrors.dob && <span className="form-error-msg">{formErrors.dob}</span>}
                </div>

                {/* Age (Years) - Placed right beside Date of Birth */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientAge">
                    Age (Years) *
                    {calculateAge(formData.dob) ? (
                      <span className="autofill-tag">✓ Auto-calculated from DOB</span>
                    ) : (
                      aadhaarExtractedInfo && <span className="autofill-tag">✓ Autofilled</span>
                    )}
                  </label>
                  <div className="input-with-addon">
                    <input
                      id="patientAge"
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      className={`prd-input ${formErrors.age ? 'input-error' : ''}`}
                      placeholder="Auto-calculated (e.g. 28)"
                      value={formData.age}
                      onChange={(e) => {
                        const cleanAge = e.target.value.replace(/\D/g, '').slice(0, 3);
                        let estimatedDob = formData.dob;
                        if (cleanAge && (!formData.dob || formData.dob.length < 10)) {
                          const estYear = new Date().getFullYear() - parseInt(cleanAge, 10);
                          estimatedDob = `01-01-${estYear}`;
                        }
                        setFormData({ ...formData, age: cleanAge, dob: estimatedDob });
                        if (formErrors.age) setFormErrors((p) => ({ ...p, age: undefined }));
                      }}
                    />
                    <span className="input-addon-badge">Years</span>
                  </div>
                  {formErrors.age && <span className="form-error-msg">{formErrors.age}</span>}
                </div>

                {/* Phone Number */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientPhone">
                    Mobile Phone *
                  </label>
                  <input
                    id="patientPhone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className={`prd-input ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const cleanPhone = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: cleanPhone });
                      if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: undefined }));
                    }}
                  />
                  {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
                </div>

                {/* Address */}
                <div className="prd-form-group full-width">
                  <label className="prd-form-label" htmlFor="patientAddress">
                    Residential Address *
                    {aadhaarExtractedInfo && <span className="autofill-tag">✓ Autofilled from Aadhaar</span>}
                  </label>
                  <input
                    id="patientAddress"
                    type="text"
                    className={`prd-input ${formErrors.address ? 'input-error' : ''}`}
                    placeholder="e.g. Mohalla Kankarbagh, Patna, Bihar - 800020"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (formErrors.address) setFormErrors((p) => ({ ...p, address: undefined }));
                    }}
                  />
                  {formErrors.address && <span className="form-error-msg">{formErrors.address}</span>}
                </div>

                {/* Aadhaar Number (Max 12 Digits - Formatted XXXX XXXX XXXX) */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientAadhaar">
                    Aadhaar Number (12 Digits - Optional)
                  </label>
                  <input
                    id="patientAadhaar"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    className={`prd-input mono ${formErrors.aadhaar ? 'input-error' : ''}`}
                    placeholder="e.g. 1234 5678 9012"
                    value={formData.aadhaar}
                    onChange={(e) => {
                      const formatted = formatAadhaar(e.target.value);
                      setFormData({ ...formData, aadhaar: formatted });
                      if (formErrors.aadhaar) setFormErrors((p) => ({ ...p, aadhaar: undefined }));
                    }}
                  />
                  {formErrors.aadhaar && <span className="form-error-msg">{formErrors.aadhaar}</span>}
                </div>

                {/* Blood Group */}
                <div className="prd-form-group">
                  <label className="prd-form-label" htmlFor="patientBloodGroup">
                    Blood Group
                  </label>
                  <select
                    id="patientBloodGroup"
                    className="prd-select"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="">Select Blood Group...</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                    <option value="Unknown">Unknown / Not Tested</option>
                  </select>
                </div>

                {/* Chief Complaint / Reason for visit */}
                <div className="prd-form-group full-width">
                  <label className="prd-form-label" htmlFor="chiefComplaint">
                    Chief Complaint / Primary Symptom (Optional)
                  </label>
                  <input
                    id="chiefComplaint"
                    type="text"
                    className="prd-input"
                    placeholder="e.g. Fever since 3 days, headache, throat irritation"
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  />
                </div>
              </div>

              {/* Form Footer Note & Submit Button */}
              <div className="form-footer-action">
                <div className="footer-patient-note">
                  <IconCheckCircle />
                  <span>
                    {isPatient
                      ? `Your registration details will be linked to Patient ID ${currentId}`
                      : 'Patient ID will be generated automatically upon registration.'}
                  </span>
                </div>

                <button
                  type="submit"
                  className="prd-btn-primary large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Saving Patient Identity…'
                  ) : (
                    <>
                      {isPatient ? 'Complete Registration & Get Token' : 'Create Patient'} <IconArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* SUCCESS OPD TOKEN SLIP MODAL                                      */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showSlipModal && newlyRegisteredRecord && (
        <div className="prd-modal-backdrop">
          <div className="prd-modal-slip">
            <div className="slip-printable" id="printable-opd-slip">
              {/* Slip Header */}
              <div className="slip-header">
                <div className="slip-brand">
                  <img src="/logo.jpeg" alt="CareVault" className="slip-logo" />
                  <div>
                    <h2 className="slip-hospital-title">CareVault Healthcare System</h2>
                    <p className="slip-hospital-subtitle">Smart India Hackathon 2026 · Digital OPD Token</p>
                  </div>
                </div>
                <div className="slip-token-badge">
                  <span className="token-label">OPD TOKEN</span>
                  <span className="token-number">{newlyRegisteredRecord.tokenNumber || 'TK-104'}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="slip-divider" />

              {/* Details grid */}
              <div className="slip-grid">
                <div className="slip-field">
                  <span className="field-key">Patient ID:</span>
                  <span className="field-val bold text-blue">{newlyRegisteredRecord.patient.patientId}</span>
                </div>
                <div className="slip-field">
                  <span className="field-key">Registration Date:</span>
                  <span className="field-val">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="slip-field">
                  <span className="field-key">Patient Name:</span>
                  <span className="field-val bold">{newlyRegisteredRecord.patient.name}</span>
                </div>
                <div className="slip-field">
                  <span className="field-key">Age / Gender:</span>
                  <span className="field-val">{newlyRegisteredRecord.patient.age} Yrs / {newlyRegisteredRecord.patient.gender}</span>
                </div>
                <div className="slip-field">
                  <span className="field-key">Phone:</span>
                  <span className="field-val">{newlyRegisteredRecord.patient.phone}</span>
                </div>
                <div className="slip-field">
                  <span className="field-key">Blood Group:</span>
                  <span className="field-val">{newlyRegisteredRecord.patient.bloodGroup}</span>
                </div>
                <div className="slip-field full">
                  <span className="field-key">Address:</span>
                  <span className="field-val">{newlyRegisteredRecord.patient.address}</span>
                </div>
                {newlyRegisteredRecord.patient.aadhaar && (
                  <div className="slip-field full">
                    <span className="field-key">Aadhaar (KYC):</span>
                    <span className="field-val mono">{newlyRegisteredRecord.patient.aadhaar} (UIDAI Verified)</span>
                  </div>
                )}
                <div className="slip-field full">
                  <span className="field-key">Chief Complaint:</span>
                  <span className="field-val">{newlyRegisteredRecord.patient.recentComplaint}</span>
                </div>
              </div>

              {/* Barcode & Instruction Box */}
              <div className="slip-barcode-box">
                <div className="mock-barcode" />
                <span className="barcode-code">{newlyRegisteredRecord.patient.patientId}</span>
                <p className="slip-notice">
                  Please proceed to Doctor Consultation Desk with this token slip. Valid for OPD visit today.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="slip-modal-actions">
              <button
                type="button"
                className="prd-btn-outline"
                onClick={() => window.print()}
              >
                <IconPrinter /> Print Token Slip
              </button>
              {isPatient ? (
                <button
                  type="button"
                  className="prd-btn-primary"
                  onClick={() => handleCloseSlipModal(false)}
                >
                  Done / View Form <IconArrowRight />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="prd-btn-secondary"
                    onClick={() => handleCloseSlipModal(false)}
                  >
                    Register Another Patient
                  </button>
                  <button
                    type="button"
                    className="prd-btn-primary"
                    onClick={() => handleCloseSlipModal(true)}
                  >
                    View in Search Records <IconArrowRight />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
