// authService.js — CareVault Authentication & Account Persistence Service

const ACCOUNTS_KEY = 'carevault_accounts';
const SESSION_KEY = 'carevault_session';

const INITIAL_SEED_ACCOUNTS = [
  {
    role: 'doctor',
    doctorId: 'DR2026-000100',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    role: 'patient',
    patientId: 'CV2026-000110',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    role: 'patient',
    patientId: 'CV2026-000101',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    role: 'patient',
    patientId: 'CV2026-000452',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    role: 'patient',
    patientId: 'CV2026-000214',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Helper to fetch stored accounts or initialize with seeds & safe data migration
 */
export function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_SEED_ACCOUNTS));
      return INITIAL_SEED_ACCOUNTS;
    }
    const accounts = JSON.parse(raw);

    // Safe migration: fix any legacy doctor account stored with patientId instead of doctorId
    let migrated = false;
    const sanitized = accounts.map((acc) => {
      if (acc.role === 'doctor' && !acc.doctorId) {
        migrated = true;
        const legacyVal = acc.patientId || '';
        const newDoctorId = legacyVal.startsWith('CV')
          ? legacyVal.replace('CV', 'DR')
          : `DR2026-${String(Math.floor(Math.random() * 900000 + 100000))}`;
        const { patientId: _, ...rest } = acc;
        return { ...rest, doctorId: newDoctorId };
      }
      return acc;
    });

    if (migrated) {
      saveAccounts(sanitized);
    }

    return sanitized;
  } catch {
    return INITIAL_SEED_ACCOUNTS;
  }
}

/**
 * Helper to save accounts list
 */
function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Local storage fallback
  }
}

/**
 * Automatically generate a guaranteed UNIQUE Doctor ID: DRYYYY-XXXXXX
 */
export function generateDoctorId() {
  const year = new Date().getFullYear();
  const accounts = getAccounts();
  const doctors = accounts.filter((acc) => acc.role === 'doctor');
  let counter = doctors.length + 100;
  let candidate = `DR${year}-${String(counter).padStart(6, '0')}`;

  while (accounts.some((acc) => (acc.doctorId || '').toUpperCase() === candidate.toUpperCase())) {
    counter++;
    candidate = `DR${year}-${String(counter).padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Automatically generate a guaranteed UNIQUE Patient ID: CVYYYY-XXXXXX
 * Checks both accounts and stored patient records to prevent collisions
 */
export function generatePatientId() {
  const year = new Date().getFullYear();
  const accounts = getAccounts();
  
  // Read stored patients directly from localStorage to prevent circular imports
  let storedPatients = [];
  try {
    const raw = localStorage.getItem('carevault_patients');
    if (raw) storedPatients = JSON.parse(raw);
  } catch {
    // Fallback
  }

  let maxNum = 452;

  accounts.forEach((acc) => {
    if (acc.role === 'patient' && acc.patientId) {
      const match = acc.patientId.match(/CV\d{4}-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });

  storedPatients.forEach((p) => {
    if (p.patientId) {
      const match = p.patientId.match(/CV\d{4}-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });

  let nextNum = maxNum + 1;
  let candidate = `CV${year}-${String(nextNum).padStart(6, '0')}`;

  while (
    accounts.some((acc) => (acc.patientId || '').toUpperCase() === candidate.toUpperCase()) ||
    storedPatients.some((p) => (p.patientId || '').toUpperCase() === candidate.toUpperCase())
  ) {
    nextNum++;
    candidate = `CV${year}-${String(nextNum).padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Helper to generate unique ID according to role
 */
export function generateIdForRole(role) {
  return role === 'doctor' ? generateDoctorId() : generatePatientId();
}

/**
 * Register a new account with role-specific ID (Doctor ID vs Patient ID)
 * Now supports passing optional patient profile data during registration.
 */
export function createAccount({ role, id, password, profileData }) {
  if (!role) {
    return { success: false, error: 'Role is required.' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const accounts = getAccounts();
  let cleanId = (id || '').trim().toUpperCase();

  if (role === 'doctor') {
    if (!cleanId || accounts.some((acc) => (acc.doctorId || '').toUpperCase() === cleanId)) {
      cleanId = generateDoctorId();
    }

    const newAccount = {
      role: 'doctor',
      doctorId: cleanId,
      password,
      createdAt: new Date().toISOString(),
    };

    saveAccounts([...accounts, newAccount]);
    const session = {
      id: cleanId,
      doctorId: cleanId,
      role: 'doctor',
      authenticatedAt: new Date().toISOString(),
    };
    setSession(session);
    return { success: true, user: newAccount, id: cleanId, session };
  } else {
    if (!cleanId || accounts.some((acc) => (acc.patientId || '').toUpperCase() === cleanId)) {
      cleanId = generatePatientId();
    }

    const newAccount = {
      role: 'patient',
      patientId: cleanId,
      password,
      createdAt: new Date().toISOString(),
    };

    saveAccounts([...accounts, newAccount]);

    if (profileData) {
      try {
        const raw = localStorage.getItem('carevault_patients');
        const patients = raw ? JSON.parse(raw) : [];
        const newPatient = {
          patientId: cleanId,
          name: (profileData.name || '').trim(),
          age: parseInt(profileData.age, 10) || 0,
          dob: profileData.dob || '',
          gender: profileData.gender || 'Male',
          phone: (profileData.phone || '').trim(),
          email: (profileData.email || '').trim(),
          address: (profileData.address || '').trim(),
          aadhaar: (profileData.aadhaar || '').trim(),
          bloodGroup: profileData.bloodGroup || 'Not Specified',
          emergencyContact: (profileData.emergencyContact || '').trim(),
          emergencyContactRelationship: (profileData.emergencyContactRelationship || '').trim(),
          registrationComplete: true,
          createdAt: new Date().toISOString(),
        };
        const idx = patients.findIndex((p) => p.patientId === cleanId);
        if (idx >= 0) {
          patients[idx] = { ...patients[idx], ...newPatient };
        } else {
          patients.unshift(newPatient);
        }
        localStorage.setItem('carevault_patients', JSON.stringify(patients));
      } catch (e) {
        console.warn('Could not save patient profile in createAccount', e);
      }
    }

    const session = {
      id: cleanId,
      patientId: cleanId,
      role: 'patient',
      authenticatedAt: new Date().toISOString(),
      isNewAccount: true,
    };
    setSession(session);

    return { success: true, user: newAccount, id: cleanId, session };
  }
}

/**
 * Authenticate user login checking ID, Password, and Role
 */
export function authenticate({ role, id, password }) {
  if (!role) {
    return { success: false, error: 'Please select your role to continue.' };
  }

  const cleanId = (id || '').trim().toUpperCase();
  const idLabel = role === 'doctor' ? 'Doctor ID' : 'Patient ID';

  if (!cleanId) {
    return { success: false, error: `${idLabel} is required.` };
  }

  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  const accounts = getAccounts();

  // Check if ID exists in ANY account
  const anyMatchingAccount = accounts.find(
    (acc) => (acc.doctorId || acc.patientId || '').toUpperCase() === cleanId
  );

  // Check if ID exists specifically for the selected role
  const foundAccount = accounts.find(
    (acc) =>
      acc.role === role &&
      (role === 'doctor' ? acc.doctorId : acc.patientId)?.toUpperCase() === cleanId
  );

  // If the ID exists under a DIFFERENT role -> return role mismatch error
  if (!foundAccount && anyMatchingAccount && anyMatchingAccount.role !== role) {
    return { success: false, error: 'These credentials are not registered for the selected role.' };
  }

  // If account does not exist or password is wrong
  if (!foundAccount || foundAccount.password !== password) {
    return { success: false, error: `Invalid ${idLabel} or password.` };
  }

  // Successful authentication -> create session
  const userIdentifier = role === 'doctor' ? foundAccount.doctorId : foundAccount.patientId;

  const session = {
    id: userIdentifier,
    patientId: userIdentifier, // For backwards compatibility
    role: foundAccount.role,
    authenticatedAt: new Date().toISOString(),
    isNewAccount: false,
  };

  setSession(session);

  return { success: true, user: foundAccount, session };
}

/**
 * Session management helpers
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Fallback
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Fallback
  }
}
