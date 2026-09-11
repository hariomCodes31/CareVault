// authService.js — CareVault Authentication & Account Persistence Service

const ACCOUNTS_KEY = 'carevault_accounts';
const SESSION_KEY = 'carevault_session';

const INITIAL_SEED_ACCOUNTS = [
  {
    patientId: 'CV2026-000100',
    password: 'password123',
    role: 'doctor',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    patientId: 'CV2026-000101',
    password: 'password123',
    role: 'patient',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Helper to fetch stored accounts or initialize with seeds
 */
export function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_SEED_ACCOUNTS));
      return INITIAL_SEED_ACCOUNTS;
    }
    return JSON.parse(raw);
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
 * Automatically generate a guaranteed UNIQUE formatted Patient ID: CVYYYY-XXXXXX
 * Inspects all stored accounts in localStorage to prevent collision.
 */
export function generatePatientId() {
  const year = new Date().getFullYear();
  const accounts = getAccounts();
  let counter = accounts.length + 101;
  let candidate = `CV${year}-${String(counter).padStart(6, '0')}`;

  while (accounts.some((acc) => acc.patientId.toUpperCase() === candidate.toUpperCase())) {
    counter++;
    candidate = `CV${year}-${String(counter).padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Register a new account with a guaranteed unique Patient ID
 */
export function createAccount({ role, patientId, password }) {
  if (!role) {
    return { success: false, error: 'Role is required.' };
  }

  let finalId = (patientId || '').trim().toUpperCase();
  const accounts = getAccounts();

  // If no ID or if ID already exists, generate a guaranteed fresh unique ID
  if (!finalId || accounts.some((acc) => acc.patientId.toUpperCase() === finalId)) {
    finalId = generatePatientId();
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const newAccount = {
    patientId: finalId,
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  const updatedAccounts = [...accounts, newAccount];
  saveAccounts(updatedAccounts);

  return { success: true, user: newAccount };
}

/**
 * Authenticate existing user login
 */
export function authenticate({ role, patientId, password }) {
  if (!role) {
    return { success: false, error: 'Please select your role to continue.' };
  }

  const cleanId = (patientId || '').trim().toUpperCase();
  if (!cleanId) {
    return { success: false, error: 'Patient ID is required.' };
  }

  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  const accounts = getAccounts();
  const foundAccount = accounts.find((acc) => acc.patientId.toUpperCase() === cleanId);

  // If account does not exist or password is wrong
  if (!foundAccount || foundAccount.password !== password) {
    return { success: false, error: 'Invalid Patient ID or password.' };
  }

  // If password matches but role is wrong
  if (foundAccount.role !== role) {
    return { success: false, error: 'These credentials are not registered for the selected role.' };
  }

  // Successful authentication -> create session
  const session = {
    patientId: foundAccount.patientId,
    role: foundAccount.role,
    authenticatedAt: new Date().toISOString(),
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
