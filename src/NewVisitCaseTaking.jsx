import { getPatientById } from './services/patientService.js';
import { useState } from 'react';
import './NewVisitCaseTaking.css';
import { getPatientProfile, saveNewVisit, saveDraftVisit, getDraftVisit } from './services/visitService';

// SVG Icons
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Previous Surgery',
  'Other'
];

export default function NewVisitCaseTaking({ session, onSignOut }) {
  const patientId = session?.patientId || (session?.role === 'patient' ? session?.id : '');
  const patient = { ...getPatientProfile(patientId), ...getPatientById(patientId), id: patientId };
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const doctorName = session?.name || session?.doctorName || (session?.role === 'doctor' ? `Dr. ${session?.id}` : 'Dr. Ananya Sharma');
  const hospitalName = session?.hospitalName || 'CareVault Multispecialty Hospital';

  // Form State
  const [formData, setFormData] = useState(() => {
    const draft = getDraftVisit(patientId);
    if (draft && draft.data) {
      return draft.data;
    }
    return {
      chiefComplaint: '',
      complaintDuration: '',
      complaintDurationUnit: 'Days',
      historyOfPresentIllness: '',
      medicalHistory: [],
      otherConditionText: '',
      additionalMedicalHistory: '',
      currentMedications: [],
      allergiesType: 'none', // 'none' | 'known'
      allergiesList: [],
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        spO2: '',
        weight: '',
        height: ''
      },
      examinationFindings: '',
      investigations: [],
      primaryDiagnosis: '',
      additionalDiagnosis: '',
      clinicalNotes: '',
      prescription: [],
      followUpRequired: 'No', // 'Yes' | 'No'
      followUpDate: '',
      followUpInstructions: ''
    };
  });

  // Validation & UI state
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Field change handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleVitalsChange = (vitalKey, value) => {
    setFormData(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [vitalKey]: value }
    }));
  };

  const handleMedicalHistoryToggle = (condition) => {
    setFormData(prev => {
      const exists = prev.medicalHistory.includes(condition);
      const updated = exists
        ? prev.medicalHistory.filter(c => c !== condition)
        : [...prev.medicalHistory, condition];
      return { ...prev, medicalHistory: updated };
    });
  };

  // Current Medications Handlers
  const handleMedRowChange = (index, field, value) => {
    const updated = [...formData.currentMedications];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, currentMedications: updated }));
  };

  const addMedRow = () => {
    setFormData(prev => ({
      ...prev,
      currentMedications: [
        ...prev.currentMedications,
        { medicine: '', dose: '', frequency: '', duration: '' }
      ]
    }));
  };

  const removeMedRow = (index) => {
    const updated = formData.currentMedications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, currentMedications: updated }));
  };

  // Allergies Handlers
  const handleAllergyRowChange = (index, field, value) => {
    const updated = [...formData.allergiesList];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, allergiesList: updated }));
  };

  const addAllergyRow = () => {
    setFormData(prev => ({
      ...prev,
      allergiesList: [
        ...prev.allergiesList,
        { allergen: '', reaction: '' }
      ]
    }));
  };

  const removeAllergyRow = (index) => {
    const updated = formData.allergiesList.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, allergiesList: updated }));
  };

  // Investigations Handlers
  const handleInvestigationRowChange = (index, field, value) => {
    const updated = [...formData.investigations];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, investigations: updated }));
  };

  const addInvestigationRow = () => {
    setFormData(prev => ({
      ...prev,
      investigations: [
        ...prev.investigations,
        { testName: '', type: 'Lab', instructions: '' }
      ]
    }));
  };

  const removeInvestigationRow = (index) => {
    const updated = formData.investigations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, investigations: updated }));
  };

  // Prescription Handlers
  const handleRxRowChange = (index, field, value) => {
    const updated = [...formData.prescription];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, prescription: updated }));
  };

  const addRxRow = () => {
    setFormData(prev => ({
      ...prev,
      prescription: [
        ...prev.prescription,
        { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    }));
  };

  const removeRxRow = (index) => {
    const updated = formData.prescription.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, prescription: updated }));
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    const ok = saveDraftVisit(formData, patientId);
    if (ok) {
      showToast('Draft clinical record saved successfully.', 'info');
    } else {
      showToast('Failed to save draft locally.', 'error');
    }
  };

  // Complete Visit Handler
  const handleCompleteVisit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // ONLY Chief Complaint is required!
    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'Main complaint / reason for visit is required.';
    }

    if (formData.followUpRequired === 'Yes' && !formData.followUpDate) {
      newErrors.followUpDate = 'Please select a follow-up date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix required fields before completing the visit.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Process & Save
    const payload = {
      patientId: patient.id,
      doctorId: session?.role === 'doctor' ? session.id : '',
      doctorName,
      hospitalName,
      chiefComplaint: formData.chiefComplaint,
      complaintDuration: formData.complaintDuration || '1',
      complaintDurationUnit: formData.complaintDurationUnit,
      historyOfPresentIllness: formData.historyOfPresentIllness,
      medicalHistory: formData.medicalHistory,
      otherConditionText: formData.otherConditionText,
      additionalMedicalHistory: formData.additionalMedicalHistory,
      currentMedications: formData.currentMedications.filter(m => m.medicine.trim() !== ''),
      allergies: {
        type: formData.allergiesType,
        list: formData.allergiesType === 'known' ? formData.allergiesList.filter(a => a.allergen.trim() !== '') : []
      },
      vitals: formData.vitals,
      examinationFindings: formData.examinationFindings,
      investigations: formData.investigations.filter(i => i.testName.trim() !== ''),
      primaryDiagnosis: formData.primaryDiagnosis,
      additionalDiagnosis: formData.additionalDiagnosis,
      clinicalNotes: formData.clinicalNotes,
      prescription: formData.prescription.filter(p => p.medicine.trim() !== ''),
      followUp: {
        required: formData.followUpRequired,
        date: formData.followUpRequired === 'Yes' ? formData.followUpDate : '',
        instructions: formData.followUpRequired === 'Yes' ? formData.followUpInstructions : ''
      }
    };

    const res = saveNewVisit(payload);
    if (res.success) {
      setSuccessResult(res.visit);
    } else {
      showToast('Failed to save visit record. Please try again.', 'error');
    }
  };

  const handleResetForm = () => {
    setFormData({
      chiefComplaint: '',
      complaintDuration: '',
      complaintDurationUnit: 'Days',
      historyOfPresentIllness: '',
      medicalHistory: [],
      otherConditionText: '',
      additionalMedicalHistory: '',
      currentMedications: [],
      allergiesType: 'none',
      allergiesList: [],
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        spO2: '',
        weight: '',
        height: ''
      },
      examinationFindings: '',
      investigations: [],
      primaryDiagnosis: '',
      additionalDiagnosis: '',
      clinicalNotes: '',
      prescription: [],
      followUpRequired: 'No',
      followUpDate: '',
      followUpInstructions: ''
    });
    setErrors({});
    showToast('Form cleared.', 'info');
  };

  return (
    <div className="case-taking-container">
      {/* Top Navbar */}
      <nav className="ct-navbar">
        <div className="ct-nav-brand">
          <img src="/logo.jpeg" alt="CareVault" className="ct-nav-logo" />
          <span className="ct-nav-title">CareVault</span>
          <span className="pd-nav-role-badge">Patient Portal</span>
        </div>

        {onSignOut && (
          <button type="button" className="pd-signout-btn" onClick={onSignOut}>
            <IconLogOut /> Sign Out
          </button>
        )}
      </nav>

      {/* Page Title Banner */}
      <header className="ct-header-banner">
        <div className="ct-header-content">
          <h1 className="ct-page-title">NEW VISIT / CASE-TAKING</h1>
          <p className="ct-page-subtitle">Record clinical information for this patient visit.</p>
        </div>
      </header>

      {/* Form Main Container */}
      <main className="ct-main">
        {/* Toast alert banner */}
        {toast && (
          <div className={`ct-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Patient Summary Card */}
        <section className="ct-summary-card">
          <div className="ct-summary-left">
            <div className="ct-patient-title-group">
              <h2 className="ct-patient-name">{patient.name}</h2>
              <span className="ct-patient-id">ID: {patient.id}</span>
            </div>
            <div className="ct-summary-meta">
              <span className="ct-meta-item">Age: <strong>{patient.age} Yrs</strong></span>
              <span className="ct-meta-divider">•</span>
              <span className="ct-meta-item">Gender: <strong>{patient.gender}</strong></span>
              <span className="ct-meta-divider">•</span>
              <span className="ct-meta-item">Blood Group: <strong>{patient.bloodGroup}</strong></span>
              <span className="ct-meta-divider">•</span>
              <span className="ct-meta-item">Doctor: <strong>{doctorName}</strong></span>
              <span className="ct-meta-divider">•</span>
              <span className="ct-meta-item">Hospital: <strong>{hospitalName}</strong></span>
            </div>
          </div>

          <div className="ct-summary-right">
            <span className="ct-new-visit-badge">NEW VISIT</span>
            <div className="ct-visit-date-box">
              Visit Date: <strong>{currentDateFormatted}</strong>
            </div>
          </div>
        </section>

        {/* SECTION A: CHIEF COMPLAINT ⭐ */}
        <section className={`ct-section-card ${errors.chiefComplaint ? 'has-error' : ''}`}>
          <div className="ct-section-header">
            <span className="ct-section-num">A</span>
            <h2 className="ct-section-title">CHIEF COMPLAINT ⭐</h2>
            <span className="ct-section-required-badge">Required</span>
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="chiefComplaint">
              Main Complaint / Reason for Visit <span className="req">*</span>
            </label>
            <textarea
              id="chiefComplaint"
              className={`ct-textarea ${errors.chiefComplaint ? 'is-invalid' : ''}`}
              placeholder="e.g. Severe throbbing headache with nausea, persistent fever..."
              value={formData.chiefComplaint}
              onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
            />
            {errors.chiefComplaint && <span className="ct-error-msg">{errors.chiefComplaint}</span>}
          </div>

          <div className="ct-grid-2">
            <div className="ct-form-group">
              <label className="ct-label" htmlFor="complaintDuration">Duration</label>
              <input
                id="complaintDuration"
                type="number"
                min="1"
                className="ct-input"
                placeholder="e.g. 3"
                value={formData.complaintDuration}
                onChange={(e) => handleInputChange('complaintDuration', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="complaintDurationUnit">Duration Unit</label>
              <select
                id="complaintDurationUnit"
                className="ct-select"
                value={formData.complaintDurationUnit}
                onChange={(e) => handleInputChange('complaintDurationUnit', e.target.value)}
              >
                <option value="Days">Days</option>
                <option value="Weeks">Weeks</option>
                <option value="Months">Months</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION B: HISTORY OF PRESENT ILLNESS */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">B</span>
            <h2 className="ct-section-title">HISTORY OF PRESENT ILLNESS</h2>
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="historyOfPresentIllness">Clinical History / HPI</label>
            <textarea
              id="historyOfPresentIllness"
              className="ct-textarea"
              style={{ minHeight: '120px' }}
              placeholder="Record onset, progression, and relevant history of the present illness..."
              value={formData.historyOfPresentIllness}
              onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
            />
          </div>
        </section>

        {/* SECTION C: MEDICAL HISTORY */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">C</span>
            <h2 className="ct-section-title">MEDICAL HISTORY</h2>
          </div>

          <div className="ct-form-group">
            <label className="ct-label">Common Conditions</label>
            <div className="ct-chip-options">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = formData.medicalHistory.includes(cond);
                return (
                  <label key={cond} className={`ct-chip-checkbox ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMedicalHistoryToggle(cond)}
                    />
                    {cond}
                  </label>
                );
              })}
            </div>
          </div>

          {formData.medicalHistory.includes('Other') && (
            <div className="ct-form-group">
              <label className="ct-label" htmlFor="otherConditionText">Specify Other Condition</label>
              <input
                id="otherConditionText"
                type="text"
                className="ct-input"
                placeholder="Specify condition name..."
                value={formData.otherConditionText}
                onChange={(e) => handleInputChange('otherConditionText', e.target.value)}
              />
            </div>
          )}

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="additionalMedicalHistory">Past Medical / Surgical History</label>
            <textarea
              id="additionalMedicalHistory"
              className="ct-textarea"
              placeholder="Detail any past hospitalizations, chronic illnesses, or surgeries..."
              value={formData.additionalMedicalHistory}
              onChange={(e) => handleInputChange('additionalMedicalHistory', e.target.value)}
            />
          </div>
        </section>

        {/* SECTION D: CURRENT MEDICATIONS */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">D</span>
            <h2 className="ct-section-title">CURRENT MEDICATIONS</h2>
          </div>

          {formData.currentMedications.length === 0 ? (
            <div className="ct-empty-list-msg">No current medications added.</div>
          ) : (
            <div className="ct-dynamic-table">
              {formData.currentMedications.map((med, idx) => (
                <div key={idx} className="ct-table-row">
                  <div className="ct-form-group" style={{ flex: 2 }}>
                    <label className="ct-label">Medicine</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Amlodipine 5mg"
                      value={med.medicine}
                      onChange={(e) => handleMedRowChange(idx, 'medicine', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Dose</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. 1 tab"
                      value={med.dose}
                      onChange={(e) => handleMedRowChange(idx, 'dose', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Frequency</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Once daily (OD)"
                      value={med.frequency}
                      onChange={(e) => handleMedRowChange(idx, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Duration</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. 30 days"
                      value={med.duration}
                      onChange={(e) => handleMedRowChange(idx, 'duration', e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="ct-table-row-remove-btn"
                    onClick={() => removeMedRow(idx)}
                    title="Remove medication"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="ct-add-row-btn" onClick={addMedRow}>
            <IconPlus /> Add Medicine
          </button>
        </section>

        {/* SECTION E: ALLERGIES */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">E</span>
            <h2 className="ct-section-title">ALLERGIES</h2>
          </div>

          <div className="ct-radio-group">
            <label className="ct-radio-label">
              <input
                type="radio"
                name="allergiesType"
                value="none"
                checked={formData.allergiesType === 'none'}
                onChange={() => handleInputChange('allergiesType', 'none')}
              />
              No Known Allergies (NKDA)
            </label>

            <label className="ct-radio-label">
              <input
                type="radio"
                name="allergiesType"
                value="known"
                checked={formData.allergiesType === 'known'}
                onChange={() => {
                  handleInputChange('allergiesType', 'known');
                  if (formData.allergiesList.length === 0) {
                    addAllergyRow();
                  }
                }}
              />
              Known Allergy
            </label>
          </div>

          {formData.allergiesType === 'known' && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {formData.allergiesList.length === 0 ? (
                <div className="ct-empty-list-msg">No allergies specified. Click below to add.</div>
              ) : (
                formData.allergiesList.map((alg, idx) => (
                  <div key={idx} className="ct-table-row">
                    <div className="ct-form-group" style={{ flex: 1 }}>
                      <label className="ct-label">Allergen</label>
                      <input
                        type="text"
                        className="ct-input"
                        placeholder="e.g. Penicillin, Peanuts"
                        value={alg.allergen}
                        onChange={(e) => handleAllergyRowChange(idx, 'allergen', e.target.value)}
                      />
                    </div>

                    <div className="ct-form-group" style={{ flex: 1 }}>
                      <label className="ct-label">Reaction</label>
                      <input
                        type="text"
                        className="ct-input"
                        placeholder="e.g. Rash, Anaphylaxis"
                        value={alg.reaction}
                        onChange={(e) => handleAllergyRowChange(idx, 'reaction', e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="ct-table-row-remove-btn"
                      onClick={() => removeAllergyRow(idx)}
                      title="Remove allergy"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))
              )}

              <button type="button" className="ct-add-row-btn" onClick={addAllergyRow}>
                <IconPlus /> Add Allergy
              </button>
            </div>
          )}
        </section>

        {/* SECTION F: VITALS */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">F</span>
            <h2 className="ct-section-title">VITALS</h2>
          </div>

          <div className="ct-grid-3">
            <div className="ct-form-group">
              <label className="ct-label" htmlFor="bp">Blood Pressure (mmHg)</label>
              <input
                id="bp"
                type="text"
                className="ct-input"
                placeholder="120/80"
                value={formData.vitals.bloodPressure}
                onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="hr">Heart Rate (bpm)</label>
              <input
                id="hr"
                type="number"
                className="ct-input"
                placeholder="72"
                value={formData.vitals.heartRate}
                onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="temp">Temperature (°F)</label>
              <input
                id="temp"
                type="text"
                className="ct-input"
                placeholder="98.6"
                value={formData.vitals.temperature}
                onChange={(e) => handleVitalsChange('temperature', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="spo2">SpO2 (%)</label>
              <input
                id="spo2"
                type="number"
                className="ct-input"
                placeholder="99"
                value={formData.vitals.spO2}
                onChange={(e) => handleVitalsChange('spO2', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="text"
                className="ct-input"
                placeholder="70"
                value={formData.vitals.weight}
                onChange={(e) => handleVitalsChange('weight', e.target.value)}
              />
            </div>

            <div className="ct-form-group">
              <label className="ct-label" htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="text"
                className="ct-input"
                placeholder="175"
                value={formData.vitals.height}
                onChange={(e) => handleVitalsChange('height', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SECTION G: EXAMINATION FINDINGS */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">G</span>
            <h2 className="ct-section-title">EXAMINATION FINDINGS</h2>
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="examinationFindings">Clinical Observations / Physical Examination</label>
            <textarea
              id="examinationFindings"
              className="ct-textarea"
              style={{ minHeight: '110px' }}
              placeholder="Record clinical observations and physical examination findings..."
              value={formData.examinationFindings}
              onChange={(e) => handleInputChange('examinationFindings', e.target.value)}
            />
          </div>
        </section>

        {/* SECTION H: INVESTIGATIONS / TESTS ⭐ */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">H</span>
            <h2 className="ct-section-title">INVESTIGATIONS / TESTS ⭐</h2>
          </div>

          {formData.investigations.length === 0 ? (
            <div className="ct-empty-list-msg">No investigations added.</div>
          ) : (
            <div className="ct-dynamic-table">
              {formData.investigations.map((inv, idx) => (
                <div key={idx} className="ct-table-row">
                  <div className="ct-form-group" style={{ flex: 2 }}>
                    <label className="ct-label">Test Name</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={inv.testName}
                      onChange={(e) => handleInvestigationRowChange(idx, 'testName', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Type</label>
                    <select
                      className="ct-select"
                      value={inv.type}
                      onChange={(e) => handleInvestigationRowChange(idx, 'type', e.target.value)}
                    >
                      <option value="Lab">Lab Test</option>
                      <option value="Radiology">Radiology / Imaging</option>
                      <option value="Diagnostic">Diagnostic Panel</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="ct-form-group" style={{ flex: 2 }}>
                    <label className="ct-label">Notes / Instructions</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Fasting sample required"
                      value={inv.instructions}
                      onChange={(e) => handleInvestigationRowChange(idx, 'instructions', e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="ct-table-row-remove-btn"
                    onClick={() => removeInvestigationRow(idx)}
                    title="Remove investigation"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="ct-add-row-btn" onClick={addInvestigationRow}>
            <IconPlus /> Add Investigation
          </button>
        </section>

        {/* SECTION I: DIAGNOSIS / ASSESSMENT */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">I</span>
            <h2 className="ct-section-title">DIAGNOSIS / ASSESSMENT</h2>
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="primaryDiagnosis">
              Primary Diagnosis
            </label>
            <input
              id="primaryDiagnosis"
              type="text"
              className="ct-input"
              placeholder="e.g. Acute Viral Fever"
              value={formData.primaryDiagnosis}
              onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
            />
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="additionalDiagnosis">Secondary / Differential Diagnosis</label>
            <input
              id="additionalDiagnosis"
              type="text"
              className="ct-input"
              placeholder="e.g. Mild Dehydration"
              value={formData.additionalDiagnosis}
              onChange={(e) => handleInputChange('additionalDiagnosis', e.target.value)}
            />
          </div>

          <div className="ct-form-group">
            <label className="ct-label" htmlFor="clinicalNotes">Clinical Notes / Assessment</label>
            <textarea
              id="clinicalNotes"
              className="ct-textarea"
              placeholder="Clinical notes, diagnostic assessment, or observations..."
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
            />
          </div>
        </section>

        {/* SECTION J: PRESCRIPTION / TREATMENT */}
        <section className="ct-section-card">
          <div className="ct-section-header">
            <span className="ct-section-num">J</span>
            <h2 className="ct-section-title">PRESCRIPTION / TREATMENT</h2>
          </div>

          {formData.prescription.length === 0 ? (
            <div className="ct-empty-list-msg">No medicines prescribed.</div>
          ) : (
            <div className="ct-dynamic-table">
              {formData.prescription.map((rx, idx) => (
                <div key={idx} className="ct-table-row">
                  <div className="ct-form-group" style={{ flex: 2 }}>
                    <label className="ct-label">Medicine</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Paracetamol 650mg"
                      value={rx.medicine}
                      onChange={(e) => handleRxRowChange(idx, 'medicine', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Dosage</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. 1 tab"
                      value={rx.dosage}
                      onChange={(e) => handleRxRowChange(idx, 'dosage', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Frequency</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Thrice daily (TID)"
                      value={rx.frequency}
                      onChange={(e) => handleRxRowChange(idx, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 1 }}>
                    <label className="ct-label">Duration</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. 5 days"
                      value={rx.duration}
                      onChange={(e) => handleRxRowChange(idx, 'duration', e.target.value)}
                    />
                  </div>

                  <div className="ct-form-group" style={{ flex: 2 }}>
                    <label className="ct-label">Instructions</label>
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="e.g. Take after food"
                      value={rx.instructions}
                      onChange={(e) => handleRxRowChange(idx, 'instructions', e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="ct-table-row-remove-btn"
                    onClick={() => removeRxRow(idx)}
                    title="Remove prescription"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="ct-add-row-btn" onClick={addRxRow}>
            <IconPlus /> Add Medicine
          </button>
        </section>

        {/* SECTION K: FOLLOW-UP */}
        <section className={`ct-section-card ${errors.followUpDate ? 'has-error' : ''}`}>
          <div className="ct-section-header">
            <span className="ct-section-num">K</span>
            <h2 className="ct-section-title">FOLLOW-UP</h2>
          </div>

          <div className="ct-form-group">
            <label className="ct-label">Follow-up Required?</label>
            <div className="ct-radio-group">
              <label className="ct-radio-label">
                <input
                  type="radio"
                  name="followUpRequired"
                  value="No"
                  checked={formData.followUpRequired === 'No'}
                  onChange={() => handleInputChange('followUpRequired', 'No')}
                />
                No
              </label>

              <label className="ct-radio-label">
                <input
                  type="radio"
                  name="followUpRequired"
                  value="Yes"
                  checked={formData.followUpRequired === 'Yes'}
                  onChange={() => handleInputChange('followUpRequired', 'Yes')}
                />
                Yes
              </label>
            </div>
          </div>

          {formData.followUpRequired === 'Yes' && (
            <div className="ct-grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="ct-form-group">
                <label className="ct-label" htmlFor="followUpDate">Follow-up Date <span className="req">*</span></label>
                <input
                  id="followUpDate"
                  type="date"
                  className={`ct-input ${errors.followUpDate ? 'is-invalid' : ''}`}
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
                {errors.followUpDate && <span className="ct-error-msg">{errors.followUpDate}</span>}
              </div>

              <div className="ct-form-group">
                <label className="ct-label" htmlFor="followUpInstructions">Follow-up Instructions</label>
                <input
                  id="followUpInstructions"
                  type="text"
                  className="ct-input"
                  placeholder="e.g. Recheck symptoms or lab reports"
                  value={formData.followUpInstructions}
                  onChange={(e) => handleInputChange('followUpInstructions', e.target.value)}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Sticky Action Area */}
      <footer className="ct-bottom-actions">
        <div className="ct-actions-inner">
          <button type="button" className="ct-btn-secondary" onClick={handleResetForm}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="ct-btn-draft" onClick={handleSaveDraft}>
              <IconSave /> Save Draft
            </button>

            <button
              type="button"
              className="ct-btn-primary"
              onClick={handleCompleteVisit}
              id="btn-complete-visit"
            >
              Complete Visit
            </button>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {successResult && (
        <div className="ct-modal-backdrop">
          <div className="ct-modal-card">
            <div className="ct-success-icon">
              <IconCheckCircle />
            </div>

            <h2 className="ct-success-title">Clinical Visit Completed</h2>

            <p className="ct-success-desc">
              The clinical case record for <strong>{patient.name}</strong> has been saved and registered under ID:
            </p>

            <div className="ct-visit-id-badge">
              {successResult.id}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Patient profile metrics (visit count, prescriptions, and follow-ups) have been updated automatically.
            </p>

            <div className="ct-modal-actions">
              <button
                type="button"
                className="ct-btn-secondary"
                onClick={() => setSuccessResult(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="ct-btn-primary"
                onClick={() => {
                  setSuccessResult(null);
                  handleResetForm();
                }}
              >
                + Start Next Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
