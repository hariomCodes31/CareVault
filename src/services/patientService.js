// patientService.js — CareVault Patient Data & Aadhaar OCR Service

const PATIENTS_STORAGE_KEY = 'carevault_patients';
const TOKENS_STORAGE_KEY = 'carevault_tokens_counter';

// Initial Seed Patients based on the SIH 2026 Workflow Poster
const INITIAL_PATIENTS = [
  {
    patientId: 'CV2026-000452',
    name: 'Rahul Kumar',
    age: 28,
    dob: '1998-05-14',
    gender: 'Male',
    phone: '9876543210',
    address: 'Patna, Bihar',
    aadhaar: '7845 9612 9012',
    bloodGroup: 'O+',
    knownConditions: 'None',
    allergies: 'Not Reported',
    totalVisits: 5,
    reportsCount: 2,
    activeFollowUp: 1,
    registrationComplete: true,
    createdAt: '2026-01-15T09:30:00.000Z',
    recentComplaint: 'Fever (since 3 days)',
    timeline: [
      { date: '08 Sep 2026', type: 'OPD Visit', details: 'Fever, headache', status: 'Completed' },
      { date: '12 Apr 2026', type: 'OPD Visit', details: 'Viral infection', status: 'Completed' },
      { date: '03 Jan 2026', type: 'OPD Visit', details: 'Back pain', status: 'Completed' },
      { date: '21 Aug 2025', type: 'OPD Visit', details: 'General checkup', status: 'Completed' },
    ],
  },
  {
    patientId: 'CV2026-000101',
    name: 'Ananya Verma',
    age: 24,
    dob: '2002-09-20',
    gender: 'Female',
    phone: '9812345678',
    address: 'Ranchi, Jharkhand',
    aadhaar: '6512 8743 1123',
    bloodGroup: 'B+',
    knownConditions: 'Mild Asthma',
    allergies: 'Penicillin',
    totalVisits: 2,
    reportsCount: 1,
    activeFollowUp: 0,
    registrationComplete: true,
    createdAt: '2026-02-10T11:15:00.000Z',
    recentComplaint: 'Seasonal Allergy',
    timeline: [
      { date: '14 Feb 2026', type: 'OPD Visit', details: 'Respiratory checkup', status: 'Completed' },
      { date: '02 Oct 2025', type: 'OPD Visit', details: 'Routine health screening', status: 'Completed' },
    ],
  },
  {
    patientId: 'CV2026-000214',
    name: 'Rajesh Sharma',
    age: 45,
    dob: '1981-11-04',
    gender: 'Male',
    phone: '9432167890',
    address: 'Varanasi, Uttar Pradesh',
    aadhaar: '9012 3456 7890',
    bloodGroup: 'A+',
    knownConditions: 'Hypertension',
    allergies: 'None',
    totalVisits: 3,
    reportsCount: 4,
    activeFollowUp: 1,
    registrationComplete: true,
    createdAt: '2026-03-01T14:20:00.000Z',
    recentComplaint: 'Blood Pressure Monitoring',
    timeline: [
      { date: '28 Aug 2026', type: 'OPD Visit', details: 'Hypertension review', status: 'Completed' },
      { date: '15 May 2026', type: 'Lab Test', details: 'Lipid Profile & ECG', status: 'Completed' },
    ],
  },
];

/**
 * Fetch all patients from localStorage or initialize with seed data
 */
export function getPatients() {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PATIENTS;
  }
}

/**
 * Check if a patient profile has all required fields completed
 */
export function isProfileComplete(patient) {
  if (!patient) return false;
  if (patient.registrationComplete === true) return true;
  const hasName = Boolean(patient.name && patient.name.trim());
  const hasGender = Boolean(patient.gender && patient.gender.trim());
  const hasDob = Boolean(patient.dob && patient.dob.trim());
  const hasPhone = Boolean(patient.phone && patient.phone.trim());
  const hasAddress = Boolean(patient.address && patient.address.trim());
  return hasName && hasGender && hasDob && hasPhone && hasAddress;
}

/**
 * Save updated patients list
 */
function savePatients(patients) {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch {
    // localStorage fallback
  }
}

/**
 * Generate next unique Patient ID: CV2026-XXXXXX
 * Checks both patient records and auth accounts to ensure uniqueness
 */
export function generateNextPatientId() {
  const year = new Date().getFullYear();
  const patients = getPatients();
  let maxNum = 452;

  patients.forEach((p) => {
    const match = (p.patientId || '').match(/CV\d{4}-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  try {
    const rawAccounts = localStorage.getItem('carevault_accounts');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      accounts.forEach((acc) => {
        if (acc.role === 'patient' && acc.patientId) {
          const match = acc.patientId.match(/CV\d{4}-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      });
    }
  } catch {
    // Fallback
  }

  const nextNum = maxNum + 1;
  return `CV${year}-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Generate next OPD token number
 */
export function getNextTokenNumber() {
  try {
    const current = parseInt(localStorage.getItem(TOKENS_STORAGE_KEY) || '103', 10);
    const next = current + 1;
    localStorage.setItem(TOKENS_STORAGE_KEY, String(next));
    return `TK-${String(next).padStart(3, '0')}`;
  } catch {
    return `TK-104`;
  }
}

/**
 * Search patients by query (matching Patient ID, Name, Phone, Aadhaar)
 */
export function searchPatients(query) {
  if (!query || !query.trim()) return [];
  const clean = query.trim().toLowerCase().replace(/[- ]/g, '');
  const patients = getPatients();

  return patients.filter((patient) => {
    const id = (patient.patientId || '').toLowerCase().replace(/[- ]/g, '');
    const name = (patient.name || '').toLowerCase();
    const phone = (patient.phone || '').toLowerCase().replace(/[- ]/g, '');
    const aadhaar = (patient.aadhaar || '').toLowerCase().replace(/[- ]/g, '');

    return (
      id.includes(clean) ||
      name.includes(query.trim().toLowerCase()) ||
      phone.includes(clean) ||
      aadhaar.includes(clean)
    );
  });
}

/**
 * Get single patient by ID
 */
export function getPatientById(id) {
  if (!id) return null;
  const clean = id.trim().toUpperCase();
  const patients = getPatients();
  return patients.find((p) => (p.patientId || '').toUpperCase() === clean) || null;
}

/**
 * Register a new patient
 */
export function registerPatient(patientData) {
  const patients = getPatients();
  const patientId = patientData.patientId || generateNextPatientId();
  const tokenNumber = patientData.tokenNumber || getNextTokenNumber();

  const newPatient = {
    patientId,
    tokenNumber,
    name: (patientData.name || '').trim(),
    age: parseInt(patientData.age, 10) || 0,
    dob: patientData.dob || '',
    gender: patientData.gender || 'Male',
    phone: (patientData.phone || '').trim(),
    email: (patientData.email || '').trim(),
    address: (patientData.address || '').trim(),
    aadhaar: (patientData.aadhaar || '').trim(),
    bloodGroup: patientData.bloodGroup || 'Not Specified',
    emergencyContact: (patientData.emergencyContact || '').trim(),
    emergencyContactRelationship: (patientData.emergencyContactRelationship || '').trim(),
    knownConditions: patientData.knownConditions?.trim() || 'None',
    allergies: patientData.allergies?.trim() || 'None Reported',
    registrationComplete: true,
    totalVisits: 1,
    reportsCount: 0,
    activeFollowUp: 0,
    createdAt: new Date().toISOString(),
    recentComplaint: patientData.chiefComplaint || 'New Patient OPD Registration',
    registeredFromAadhaar: Boolean(patientData.fromAadhaar),
    timeline: [
      {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: 'OPD Registration',
        details: 'Initial registration and vitals intake',
        status: 'Active',
      },
    ],
  };

  const existingIndex = patients.findIndex((p) => p.patientId === patientId);
  if (existingIndex >= 0) {
    patients[existingIndex] = { ...patients[existingIndex], ...newPatient, registrationComplete: true };
    savePatients([...patients]);
  } else {
    savePatients([newPatient, ...patients]);
  }

  return { success: true, patient: newPatient, tokenNumber };
}

// Sample Aadhaar Cards for quick Hackathon Demo & Testing
export const SAMPLE_AADHAAR_PRESETS = [
  {
    id: 'sample_rahul',
    name: 'Rahul Kumar',
    age: 28,
    dob: '1998-05-14',
    gender: 'Male',
    aadhaar: '7845 9612 9012',
    address: 'Mohalla Kankarbagh, Near Main Road, Patna, Bihar - 800020',
    phone: '9876543210',
    bloodGroup: 'O+',
    label: 'Sample 1: Rahul Kumar (Patna, Bihar)',
  },
  {
    id: 'sample_sunita',
    name: 'Sunita Devi',
    age: 34,
    dob: '1992-08-22',
    gender: 'Female',
    aadhaar: '4589 1234 6701',
    address: 'Gram Post Dumra, Ward No 4, Sitamarhi, Bihar - 843302',
    phone: '9823456781',
    bloodGroup: 'B+',
    label: 'Sample 2: Sunita Devi (Sitamarhi, Bihar)',
  },
  {
    id: 'sample_amit',
    name: 'Amit Vikram Singh',
    age: 41,
    dob: '1985-02-18',
    gender: 'Male',
    aadhaar: '8912 3401 7845',
    address: 'House 14, Civil Lines, Prayagraj, UP - 211001',
    phone: '9456123890',
    bloodGroup: 'A+',
    label: 'Sample 3: Amit Vikram Singh (Prayagraj, UP)',
  },
];

/**
 * Simulated AI/OCR Aadhaar Card Parsing Engine
 * Reads Aadhaar image file or sample preset, extracts details with simulated OCR confidence
 */
export async function parseAadhaarCard(fileOrPreset, onProgress) {
  // Simulated progressive OCR scanning steps
  if (onProgress) onProgress({ step: 1, text: 'Scanning Aadhaar card image geometry...' });
  await new Promise((r) => setTimeout(r, 450));

  if (onProgress) onProgress({ step: 2, text: 'Running CareVault Neural OCR text extraction...' });
  await new Promise((r) => setTimeout(r, 550));

  if (onProgress) onProgress({ step: 3, text: 'Parsing UIDAI barcode, QR & KYC identity fields...' });
  await new Promise((r) => setTimeout(r, 450));

  // If a preset was picked
  if (typeof fileOrPreset === 'string') {
    const preset = SAMPLE_AADHAAR_PRESETS.find((p) => p.id === fileOrPreset) || SAMPLE_AADHAAR_PRESETS[0];
    return {
      success: true,
      confidence: 98.4,
      data: {
        name: preset.name,
        age: preset.age,
        dob: preset.dob,
        gender: preset.gender,
        aadhaar: preset.aadhaar,
        address: preset.address,
        phone: preset.phone,
        bloodGroup: preset.bloodGroup,
      },
      source: 'preset',
    };
  }

  // If a real file was uploaded, extract realistic details based on file name or simulated OCR
  const fileName = fileOrPreset?.name || '';
  const isFemale = /female|sunita|priya|ananya|rekha|geeta|devi/i.test(fileName);
  const isElder = /elder|senior|dada|sharma/i.test(fileName);

  // Generate deterministic random Aadhaar from filename length / timestamp
  const randomAadhaar = `2${String(Math.floor(100 + Math.random() * 899))} ${String(Math.floor(1000 + Math.random() * 8999))} ${String(Math.floor(1000 + Math.random() * 8999))}`;
  const defaultAge = isElder ? 52 : isFemale ? 31 : 28;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - defaultAge;

  // Let's create an intuitive name fallback
  let extractedName = 'Rahul Kumar';
  if (isFemale) extractedName = 'Pooja Kumari';
  else if (isElder) extractedName = 'Ramchandra Prasad';

  return {
    success: true,
    confidence: 96.7,
    fileName: fileOrPreset?.name,
    data: {
      name: extractedName,
      age: defaultAge,
      dob: `${birthYear}-06-15`,
      gender: isFemale ? 'Female' : 'Male',
      aadhaar: randomAadhaar,
      address: 'Near Gandhi Chowk, Boring Road, Patna, Bihar - 800001',
      phone: '9876543210',
      bloodGroup: isFemale ? 'B+' : 'O+',
    },
    source: 'upload',
  };
}
