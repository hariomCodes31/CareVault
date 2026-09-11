// CareVault API Client — Connects Frontend to MongoDB Express Backend

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Health check to verify backend server status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Login user via MongoDB backend
 */
export async function loginWithBackend({ role, id, password }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, id, password }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Backend unreachable. Operating in offline mode.' };
  }
}

/**
 * Fetch patient dashboard details from MongoDB
 */
export async function getPatientDashboardFromBackend(patientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/dashboard`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch all registered patients from MongoDB
 */
export async function getAllPatientsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.patients || [];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save newly registered patient to MongoDB
 */
export async function savePatientToBackend(patientDetails) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientDetails),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
