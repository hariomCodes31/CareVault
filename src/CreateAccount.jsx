import { useState, useRef, useEffect } from 'react';
import { generateDoctorId, generatePatientId, createAccount } from './services/authService';
import { registerPatient, parseAadhaarCard } from './services/patientService';
import './CreateAccount.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const IconDoctor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    <path d="M12 12v4" />
    <path d="M10 14h4" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M1 1l22 22" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
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



const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Format Aadhaar: XXXX XXXX XXXX
function formatAadhaar(val) {
  const digits = (val || '').replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Convert YYYY-MM-DD to DD-MM-YYYY
function toDDMMYYYY(val) {
  if (!val) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
}

// Convert DD-MM-YYYY to YYYY-MM-DD
function toYYYYMMDD(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-');
    return `${y}-${m}-${d}`;
  }
  return '';
}

// Format raw digits to DD-MM-YYYY
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

// Calculate age from DOB
function calculateAge(dobInput) {
  if (!dobInput) return '';
  const str = String(dobInput).trim();

  let day, month, year;
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (/^\d{8}$/.test(str)) {
    day = parseInt(str.slice(0, 2), 10);
    month = parseInt(str.slice(2, 4), 10);
    year = parseInt(str.slice(4, 8), 10);
  } else if (/^\d{4}$/.test(str)) {
    year = parseInt(str, 10);
    const currentYear = new Date().getFullYear();
    if (year >= 1900 && year <= currentYear) return String(currentYear - year);
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

const ROLES = [
  {
    id: 'doctor',
    name: 'Doctor',
    desc: 'Access patient history and case-taking',
    Icon: IconDoctor,
  },
  {
    id: 'patient',
    name: 'Patient',
    desc: 'Register health profile and access health locker',
    Icon: IconUser,
  },
];

export default function CreateAccount({ onReturnToLogin, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('doctor');
  
  // Single permanent ID generation per role selection session
  const [doctorCandidateId, setDoctorCandidateId] = useState(() => generateDoctorId());
  const [patientCandidateId, setPatientCandidateId] = useState(() => generatePatientId());

  // Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Patient Registration Details
  const [patientForm, setPatientForm] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    age: '',
    aadhaar: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    emergencyContact: '',
    emergencyContactRelationship: '',
  });

  // OCR state
  const [isScanningAadhaar, setIsScanningAadhaar] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [aadhaarExtractedInfo, setAadhaarExtractedInfo] = useState(null);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(null);

  const currentGeneratedId = selectedRole === 'doctor' ? doctorCandidateId : patientCandidateId;

  // Auto-calculate age from DOB
  useEffect(() => {
    if (patientForm.dob) {
      const calculated = calculateAge(patientForm.dob);
      if (calculated && calculated !== patientForm.age) {
        setPatientForm((prev) => ({ ...prev, age: calculated }));
        if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
      }
    }
  }, [patientForm.dob]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrors({});
    if (roleId === 'doctor' && !doctorCandidateId) {
      setDoctorCandidateId(generateDoctorId());
    } else if (roleId === 'patient' && !patientCandidateId) {
      setPatientCandidateId(generatePatientId());
    }
  };

  // OCR Scan handler
  const triggerAadhaarScan = async (fileOrPreset) => {
    setIsScanningAadhaar(true);
    setScanStepText('Initializing Aadhaar OCR engine...');
    try {
      const result = await parseAadhaarCard(fileOrPreset, (step) => {
        setScanStepText(step.text);
      });

      if (result.success && result.data) {
        setAadhaarExtractedInfo(result.data);
        setPatientForm((prev) => ({
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
        setErrors({});
      }
    } catch (err) {
      console.error('OCR Scanning error:', err);
    } finally {
      setIsScanningAadhaar(false);
      setScanStepText('');
    }
  };

  const validate = () => {
    const errs = {};

    if (!selectedRole) {
      errs.role = 'Please select a role to continue.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    // Additional validations for Patient
    if (selectedRole === 'patient') {
      if (!patientForm.name.trim()) errs.name = 'Patient Full Name is required.';
      if (!patientForm.gender) errs.gender = 'Gender is required.';
      if (!patientForm.dob || !patientForm.dob.trim()) {
        errs.dob = 'Date of Birth is required.';
      } else if (patientForm.dob.trim().length < 10) {
        errs.dob = 'Complete DD-MM-YYYY format.';
      }
      if (!patientForm.phone.trim()) {
        errs.phone = 'Mobile phone number is required.';
      } else if (!/^\d{10}$/.test(patientForm.phone.replace(/[- ]/g, ''))) {
        errs.phone = 'Enter a valid 10-digit mobile number.';
      }
      if (!patientForm.address.trim()) errs.address = 'Residential Address is required.';

      if (patientForm.aadhaar && patientForm.aadhaar.trim()) {
        const cleanAadhaar = patientForm.aadhaar.replace(/\D/g, '');
        if (cleanAadhaar.length !== 12) {
          errs.aadhaar = `Aadhaar must be 12 digits (currently ${cleanAadhaar.length}).`;
        }
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    await new Promise((res) => setTimeout(res, 500));

    if (selectedRole === 'patient') {
      // 1. Register Patient Profile in patientService
      registerPatient({
        patientId: currentGeneratedId,
        name: patientForm.name,
        gender: patientForm.gender,
        dob: patientForm.dob,
        age: patientForm.age,
        phone: patientForm.phone,
        email: patientForm.email,
        address: patientForm.address,
        aadhaar: patientForm.aadhaar,
        bloodGroup: patientForm.bloodGroup,
        emergencyContact: patientForm.emergencyContact,
        emergencyContactRelationship: patientForm.emergencyContactRelationship,
        fromAadhaar: Boolean(aadhaarExtractedInfo),
      });
    }

    // 2. Create Auth Account in authService
    const result = createAccount({
      role: selectedRole,
      id: currentGeneratedId,
      password,
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ form: result.error });
      return;
    }

    if (selectedRole === 'patient' && onLoginSuccess && result.session) {
      onLoginSuccess(result.session);
    } else {
      setCreatedSuccess({
        id: result.id,
        role: result.user.role,
        session: result.session,
      });
    }
  };

  const isDoctor = selectedRole === 'doctor';
  const idLabelText = isDoctor ? 'Doctor ID' : 'Patient ID';
  const idHintText = isDoctor ? 'Doctor ID generated automatically' : 'Patient ID generated automatically';

  return (
    <div className="create-account-page">
      <main className={`create-account-center-wrapper ${!isDoctor ? 'patient-wide' : ''}`}>
        <div className="create-account-card">
          {/* Top Bar */}
          <div className="create-account-top-bar">
            <button type="button" className="back-to-signin-btn" onClick={onReturnToLogin}>
              <IconArrowLeft /> Back to Sign In
            </button>
          </div>

          {/* Logo Header */}
          <div className="create-account-brand-header">
            <img src="/logo.jpeg" alt="CareVault Logo" className="create-account-logo-img" />
          </div>

          <header className="create-account-card-header">
            <h1 className="create-account-welcome">Create New Account</h1>
            <p className="create-account-subtitle">
              {isDoctor
                ? 'Create your CareVault doctor login credentials'
                : 'Create your CareVault patient account and register your health profile'}
            </p>
          </header>

          {createdSuccess ? (
            <div className="create-success-card" role="status" aria-live="polite">
              <div className="create-success-icon-wrap">
                <IconCheckCircle />
              </div>
              <h2 className="create-success-title">
                {createdSuccess.role === 'doctor'
                  ? 'Doctor account created successfully.'
                  : 'Patient account created successfully.'}
              </h2>
              <p className="create-success-subtext">
                Your account is ready. Use the ID below to sign in.
              </p>

              <div className="create-success-id-badge">
                {createdSuccess.role === 'doctor' ? 'Doctor ID:' : 'Patient ID:'}{' '}
                <strong>{createdSuccess.id}</strong>
              </div>

              <button
                type="button"
                className="create-account-btn-primary"
                onClick={() => {
                  if (createdSuccess.session && onLoginSuccess) {
                    onLoginSuccess(createdSuccess.session);
                  } else {
                    onReturnToLogin();
                  }
                }}
              >
                {createdSuccess.role === 'patient' ? 'Go to Patient Dashboard' : 'Continue to Sign In'} <IconArrow />
              </button>
            </div>
          ) : (
            <form className="create-account-form" onSubmit={handleSubmit} noValidate aria-label="Create account form">
              {errors.form && (
                <div className="create-form-error" role="alert">
                  <IconAlert />
                  {errors.form}
                </div>
              )}

              {/* Step 1: Role Selection */}
              <div className="role-section" role="group" aria-labelledby="create-role-label">
                <span className="role-label" id="create-role-label">STEP 1: SELECT YOUR ROLE</span>

                <div className="role-grid" role="radiogroup" aria-label="User role">
                  {ROLES.map(({ id, name, desc, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selectedRole === id}
                      id={`create-role-${id}`}
                      className={`role-card${selectedRole === id ? ' active' : ''}`}
                      onClick={() => handleRoleSelect(id)}
                    >
                      <div className="role-icon-wrap" aria-hidden="true">
                        <Icon />
                      </div>
                      <div className="role-info">
                        <div className="role-name">{name}</div>
                        <div className="role-desc">{desc}</div>
                      </div>
                      <div className="role-check" aria-hidden="true">
                        <IconCheck />
                      </div>
                    </button>
                  ))}
                </div>

                {errors.role && (
                  <div className="role-error" role="alert">
                    <IconAlert />
                    {errors.role}
                  </div>
                )}
              </div>

              {/* Patient ID Preview */}
              <div className="field-group">
                <label className="field-label" htmlFor="create-accountId">
                  {idLabelText}
                </label>
                <div className="field-input-wrap">
                  <input
                    id="create-accountId"
                    type="text"
                    className="field-input readonly-input"
                    value={currentGeneratedId}
                    readOnly
                    disabled
                  />
                  <span className="field-icon" aria-hidden="true">
                    {isDoctor ? <IconDoctor /> : <IconUser />}
                  </span>
                </div>
                <span className="field-hint">{idHintText}</span>
              </div>

              {/* ── PATIENT REGISTRATION SECTION (If role === 'patient') ── */}
              {!isDoctor && (
                <div className="patient-registration-step-wrap">
                  <div className="create-account-section-title">
                    STEP 2: PATIENT REGISTRATION INFORMATION
                  </div>

                  {/* Smart Aadhaar Card OCR Scanner */}
                  <div className="aadhaar-scanner-card" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                    <div className="aadhaar-header">
                      <div className="aadhaar-title-group">
                        <h3 className="aadhaar-heading">Smart Aadhaar Card OCR Scanner</h3>
                        <p className="aadhaar-desc">
                          Upload your Aadhaar card to automatically extract information into the registration form.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`aadhaar-dropzone ${isScanningAadhaar ? 'scanning' : ''}`}
                      onClick={() => !isScanningAadhaar && fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) triggerAadhaarScan(file);
                        }}
                      />
                      {isScanningAadhaar ? (
                        <div className="ocr-progress-box">
                          <div className="ocr-pulse-spinner" />
                          <div className="ocr-step-title">{scanStepText}</div>
                          <span className="ocr-subtitle">CareVault Intelligent Extraction in progress...</span>
                        </div>
                      ) : (
                        <div className="dropzone-content">
                          <div className="dropzone-icon"><IconUpload /></div>
                          <div className="dropzone-text">
                            <strong>Click to upload Aadhaar Card (Image / PDF)</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {aadhaarExtractedInfo && (
                      <div className="aadhaar-success-banner" style={{ marginTop: '0.6rem' }}>
                        <div className="success-banner-icon"><IconCheckCircle /></div>
                        <div className="success-banner-body">
                          <strong>Aadhaar Card Successfully Parsed!</strong> Please review and edit the autofilled details below before submitting.
                        </div>
                        <button
                          type="button"
                          className="banner-revert-btn"
                          onClick={() => setAadhaarExtractedInfo(null)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1. PATIENT INFORMATION */}
                  <div className="create-account-section-title">PATIENT INFORMATION</div>
                  <div className="create-account-form-grid">
                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-name">Patient Full Name *</label>
                      <input
                        id="patient-name"
                        type="text"
                        className={`field-input${errors.name ? ' error' : ''}`}
                        placeholder="e.g. Rahul Kumar"
                        value={patientForm.name}
                        onChange={(e) => {
                          setPatientForm({ ...patientForm, name: e.target.value });
                          if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                        }}
                      />
                      {errors.name && <span className="field-error"><IconAlert />{errors.name}</span>}
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-gender">Gender *</label>
                      <select
                        id="patient-gender"
                        className="field-input"
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-dob">Date of Birth (DD-MM-YYYY) *</label>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          id="patient-dob"
                          type="text"
                          maxLength={10}
                          className={`field-input${errors.dob ? ' error' : ''}`}
                          placeholder="DD-MM-YYYY"
                          value={patientForm.dob}
                          onChange={(e) => {
                            const formatted = formatDob(e.target.value);
                            setPatientForm((prev) => ({ ...prev, dob: formatted }));
                            if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }));
                          }}
                        />
                        <input
                          type="date"
                          aria-label="Pick date from calendar"
                          style={{ width: '38px', height: '38px', padding: 0, cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          value={toYYYYMMDD(patientForm.dob)}
                          onChange={(e) => {
                            if (e.target.value) {
                              const ddmmyyyy = toDDMMYYYY(e.target.value);
                              setPatientForm((prev) => ({ ...prev, dob: ddmmyyyy }));
                              if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }));
                            }
                          }}
                        />
                      </div>
                      {errors.dob && <span className="field-error"><IconAlert />{errors.dob}</span>}
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-age">Age (Years)</label>
                      <input
                        id="patient-age"
                        type="text"
                        className="field-input"
                        placeholder="Auto-calculated"
                        value={patientForm.age}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-bloodGroup">Blood Group</label>
                      <select
                        id="patient-bloodGroup"
                        className="field-input"
                        value={patientForm.bloodGroup}
                        onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                      >
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
                  </div>

                  {/* 2. CONTACT INFORMATION */}
                  <div className="create-account-section-title">CONTACT INFORMATION</div>
                  <div className="create-account-form-grid">
                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-phone">Mobile Phone *</label>
                      <input
                        id="patient-phone"
                        type="tel"
                        maxLength={10}
                        className={`field-input${errors.phone ? ' error' : ''}`}
                        placeholder="e.g. 9876543210"
                        value={patientForm.phone}
                        onChange={(e) => {
                          setPatientForm({ ...patientForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                          if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                        }}
                      />
                      {errors.phone && <span className="field-error"><IconAlert />{errors.phone}</span>}
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-email">Email Address</label>
                      <input
                        id="patient-email"
                        type="email"
                        className="field-input"
                        placeholder="e.g. patient@example.com"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      />
                    </div>

                    <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="field-label" htmlFor="patient-address">Residential Address *</label>
                      <input
                        id="patient-address"
                        type="text"
                        className={`field-input${errors.address ? ' error' : ''}`}
                        placeholder="e.g. Patna, Bihar"
                        value={patientForm.address}
                        onChange={(e) => {
                          setPatientForm({ ...patientForm, address: e.target.value });
                          if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
                        }}
                      />
                      {errors.address && <span className="field-error"><IconAlert />{errors.address}</span>}
                    </div>
                  </div>

                  {/* 3. IDENTIFICATION */}
                  <div className="create-account-section-title">IDENTIFICATION</div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="patient-aadhaar">Aadhaar Number / Government ID</label>
                    <input
                      id="patient-aadhaar"
                      type="text"
                      maxLength={14}
                      className={`field-input${errors.aadhaar ? ' error' : ''}`}
                      placeholder="e.g. 7845 9612 9012"
                      value={patientForm.aadhaar}
                      onChange={(e) => {
                        setPatientForm({ ...patientForm, aadhaar: formatAadhaar(e.target.value) });
                        if (errors.aadhaar) setErrors((p) => ({ ...p, aadhaar: undefined }));
                      }}
                    />
                    {errors.aadhaar && <span className="field-error"><IconAlert />{errors.aadhaar}</span>}
                  </div>

                  {/* 4. EMERGENCY CONTACT */}
                  <div className="create-account-section-title">EMERGENCY CONTACT</div>
                  <div className="create-account-form-grid">
                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-emergencyContact">Emergency Contact Number</label>
                      <input
                        id="patient-emergencyContact"
                        type="tel"
                        className="field-input"
                        placeholder="e.g. 9876543211"
                        value={patientForm.emergencyContact}
                        onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label" htmlFor="patient-emergencyRelationship">Relationship</label>
                      <input
                        id="patient-emergencyRelationship"
                        type="text"
                        className="field-input"
                        placeholder="e.g. Spouse / Parent"
                        value={patientForm.emergencyContactRelationship}
                        onChange={(e) => setPatientForm({ ...patientForm, emergencyContactRelationship: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 / Credentials: Password & Confirm Password */}
              <div className="create-account-section-title">
                {isDoctor ? 'ACCOUNT SECURITY' : 'STEP 3: ACCOUNT SECURITY'}
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="create-password">
                  Password
                </label>
                <div className="field-input-wrap">
                  <input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`field-input has-toggle${errors.password ? ' error' : ''}`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    disabled={loading}
                  />
                  <span className="field-icon" aria-hidden="true">
                    <IconLock />
                  </span>
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error" role="alert">
                    <IconAlert />
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="field-input-wrap">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`field-input has-toggle${errors.confirmPassword ? ' error' : ''}`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    disabled={loading}
                  />
                  <span className="field-icon" aria-hidden="true">
                    <IconLock />
                  </span>
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error" role="alert">
                    <IconAlert />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="create-account-submit-btn"
                className="create-account-btn-primary"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    {isDoctor ? 'Create Doctor Account' : 'Create Patient Account & Proceed'}
                    <IconArrow />
                  </>
                )}
              </button>

              {/* Return to Login */}
              <div className="create-account-footer-row">
                <span>Already have an account?</span>
                <button type="button" className="login-return-btn" onClick={onReturnToLogin}>
                  Sign In
                </button>
              </div>
            </form>
          )}

          <footer className="create-account-card-footer">
            © {new Date().getFullYear()} CareVault · Healthcare Management System
          </footer>
        </div>
      </main>
    </div>
  );
}
