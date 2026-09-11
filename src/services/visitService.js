// CareVault Visit & Patient Data Service

const PATIENT_KEY = 'carevault_patient_data';
const VISITS_KEY = 'carevault_visits';
const DRAFT_KEY = 'carevault_visit_draft';

const DEFAULT_PATIENT = {
  id: 'CV2026-000102',
  name: 'Rahul Kumar',
  age: 28,
  gender: 'Male',
  bloodGroup: 'O+',
  contact: '+91 98765 43210',
  email: 'rahul.kumar@example.com',
  address: 'B-104, Green Park Avenue, New Delhi',
  visitCount: 2,
  prescriptionCount: 2,
  reportCount: 3,
  activeFollowUpCount: 1
};

const DEFAULT_VISITS = [
  {
    id: 'VIS-2026-002',
    patientId: 'CV2026-000102',
    doctorId: 'DOC-2026-044',
    doctorName: 'Dr. Ananya Sharma',
    hospitalName: 'CareVault Multispecialty Hospital',
    date: '2026-09-01',
    time: '10:30 AM',
    chiefComplaint: 'Intermittent mild headache and dizziness',
    complaintDuration: '3',
    complaintDurationUnit: 'Days',
    historyOfPresentIllness: 'Patient reported onset of mild frontal headaches after prolonged work hours. No vomiting, vision blur, or fever.',
    medicalHistory: ['Hypertension'],
    additionalMedicalHistory: 'Family history of hypertension.',
    currentMedications: [
      { medicine: 'Amlodipine 5mg', dose: '1 tablet', frequency: 'Once daily (OD)', duration: '30 Days' }
    ],
    allergies: { type: 'known', details: 'Penicillin', reaction: 'Skin rash and itching' },
    vitals: {
      bloodPressure: '128/82',
      heartRate: '74',
      temperature: '98.4',
      spO2: '99',
      weight: '72',
      height: '175'
    },
    examinationFindings: 'Patient is conscious, coherent, and oriented. CNS examination normal. BP slightly elevated.',
    primaryDiagnosis: 'Mild Tension Headache secondary to Eye Strain',
    additionalDiagnosis: 'Essential Hypertension (Controlled)',
    clinicalNotes: 'Advised routine screen-time breaks and hydration.',
    prescription: [
      { medicine: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'As needed (SOS)', duration: '5 Days', instructions: 'Take after food for headache' },
      { medicine: 'Multivitamin Supplements', dosage: '1 capsule', frequency: 'Once daily (OD)', duration: '30 Days', instructions: 'Take in morning' }
    ],
    followUp: {
      required: 'Yes',
      date: '2026-09-15',
      instructions: 'Check blood pressure log and evaluate headache recovery.'
    }
  },
  {
    id: 'VIS-2026-001',
    patientId: 'CV2026-000102',
    doctorId: 'DOC-2026-012',
    doctorName: 'Dr. Rajesh Verma',
    hospitalName: 'CareVault Multispecialty Hospital',
    date: '2026-08-15',
    time: '04:15 PM',
    chiefComplaint: 'Fever and sore throat',
    complaintDuration: '2',
    complaintDurationUnit: 'Days',
    historyOfPresentIllness: 'Sudden onset fever with body ache and discomfort swallowing.',
    medicalHistory: [],
    additionalMedicalHistory: 'None',
    currentMedications: [],
    allergies: { type: 'none', details: '', reaction: '' },
    vitals: {
      bloodPressure: '120/80',
      heartRate: '82',
      temperature: '100.2',
      spO2: '98',
      weight: '71.5',
      height: '175'
    },
    examinationFindings: 'Pharyngeal congestion present. Tonsils mildly enlarged.',
    primaryDiagnosis: 'Acute Upper Respiratory Tract Infection',
    additionalDiagnosis: '',
    clinicalNotes: 'Symptomatic treatment provided.',
    prescription: [
      { medicine: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily (TID)', duration: '5 Days', instructions: 'Complete full course' },
      { medicine: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Thrice daily (TID)', duration: '3 Days', instructions: 'For fever' }
    ],
    followUp: {
      required: 'No',
      date: '',
      instructions: 'Return if fever persists beyond 3 days.'
    }
  }
];

export function getPatientProfile(patientId = 'CV2026-000102') {
  try {
    const data = localStorage.getItem(PATIENT_KEY);
    if (!data) {
      localStorage.setItem(PATIENT_KEY, JSON.stringify(DEFAULT_PATIENT));
      return DEFAULT_PATIENT;
    }
    const patient = JSON.parse(data);
    if (patient.id === patientId) {
      return patient;
    }
    return { ...DEFAULT_PATIENT, id: patientId };
  } catch (e) {
    console.error('Error fetching patient profile:', e);
    return DEFAULT_PATIENT;
  }
}

export function getPatientVisits(patientId = 'CV2026-000102') {
  try {
    const data = localStorage.getItem(VISITS_KEY);
    if (!data) {
      localStorage.setItem(VISITS_KEY, JSON.stringify(DEFAULT_VISITS));
      return DEFAULT_VISITS;
    }
    const visits = JSON.parse(data);
    return visits.filter(v => v.patientId === patientId);
  } catch (e) {
    console.error('Error fetching patient visits:', e);
    return DEFAULT_VISITS;
  }
}

export function getVisitById(visitId) {
  try {
    const data = localStorage.getItem(VISITS_KEY);
    const visits = data ? JSON.parse(data) : DEFAULT_VISITS;
    return visits.find(v => v.id === visitId) || null;
  } catch (e) {
    console.error('Error fetching visit by ID:', e);
    return null;
  }
}

export function saveNewVisit(visitForm) {
  try {
    const existingVisitsData = localStorage.getItem(VISITS_KEY);
    const existingVisits = existingVisitsData ? JSON.parse(existingVisitsData) : DEFAULT_VISITS;

    // Generate unique Visit ID
    const nextNum = existingVisits.length + 3; // offset based on initial count
    const visitId = `VIS-2026-${String(nextNum).padStart(3, '0')}`;

    const newVisitObj = {
      id: visitId,
      patientId: visitForm.patientId || 'CV2026-000102',
      doctorId: visitForm.doctorId || 'DOC-2026-044',
      doctorName: visitForm.doctorName || 'Dr. Ananya Sharma',
      hospitalName: 'CareVault Multispecialty Hospital',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...visitForm
    };

    const updatedVisits = [newVisitObj, ...existingVisits];
    localStorage.setItem(VISITS_KEY, JSON.stringify(updatedVisits));

    // Update patient counters
    const currentPatient = getPatientProfile(newVisitObj.patientId);
    const hasPrescriptions = visitForm.prescription && visitForm.prescription.some(p => p.medicine.trim() !== '');
    const hasActiveFollowUp = visitForm.followUp && visitForm.followUp.required === 'Yes';

    const updatedPatient = {
      ...currentPatient,
      visitCount: (currentPatient.visitCount || 0) + 1,
      prescriptionCount: hasPrescriptions ? (currentPatient.prescriptionCount || 0) + 1 : (currentPatient.prescriptionCount || 0),
      activeFollowUpCount: hasActiveFollowUp ? (currentPatient.activeFollowUpCount || 0) + 1 : (currentPatient.activeFollowUpCount || 0)
    };

    localStorage.setItem(PATIENT_KEY, JSON.stringify(updatedPatient));

    // Clear draft if saved
    clearDraftVisit(newVisitObj.patientId);

    return { success: true, visit: newVisitObj, patient: updatedPatient };
  } catch (e) {
    console.error('Error saving visit:', e);
    return { success: false, error: e.message };
  }
}

export function saveDraftVisit(draftData) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      data: draftData
    }));
    return true;
  } catch (e) {
    console.error('Error saving draft:', e);
    return false;
  }
}

export function getDraftVisit() {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function clearDraftVisit() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error('Error clearing draft:', e);
  }
}
