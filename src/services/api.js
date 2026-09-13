import { getSession } from './authService.js';
// CareVault API Client — Connects Frontend to MongoDB Express Backend

export function authorizationHeaders() {
  const token = getSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || '/api';

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
  if (!patientId) {
    return { success: false, status: 400, error: 'Patient ID is required.' };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${encodeURIComponent(patientId)}/dashboard`, {
      headers: authorizationHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => null);
    const defaultError = res.status === 401 || res.status === 403
      ? 'Record unavailable or access denied. Sign in again or ask the patient to grant access.'
      : res.status === 404
      ? 'Patient record not found.'
      : 'Failed to load patient dashboard. Please try again.';
    return {
      success: false,
      status: res.status,
      error: errData?.error || defaultError,
    };
  } catch (err) {
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return {
      success: false,
      status: isTimeout ? 408 : 0,
      isTimeout,
      error: isTimeout
        ? 'Request timed out while loading dashboard. The server took too long to respond.'
        : (err?.message || 'Network error. Could not connect to server.'),
    };
  }
}

/**
 * Fetch all registered patients from MongoDB
 */
export async function getAllPatientsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      headers: authorizationHeaders(),
      signal: AbortSignal.timeout(10000),
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
      headers: { 'Content-Type': 'application/json', ...authorizationHeaders() },
      body: JSON.stringify(patientDetails),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function authRequest(path, body) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Unable to reach the account server. Please try again.' };
  }
}

export async function changeDoctorAccess(patientId, doctorId, allow) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${encodeURIComponent(patientId)}/doctor-access`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authorizationHeaders() },
      body: JSON.stringify({ doctorId, allow }), signal: AbortSignal.timeout(10000),
    });
    return await response.json();
  } catch { return { success: false, error: 'Unable to update access. Please try again.' }; }
}

export async function getCaptcha() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/captcha`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    return await response.json();
  } catch { return { success: false, error: 'Unable to load CAPTCHA. Check the backend connection and refresh.' }; }
}

export async function doctorProfileRequest(profile) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/doctor-profile`, {
      method: profile ? 'PATCH' : 'GET', headers: { 'Content-Type': 'application/json', ...authorizationHeaders() },
      ...(profile ? { body: JSON.stringify(profile) } : {}), signal: AbortSignal.timeout(10000),
    });
    return await response.json();
  } catch { return { success: false, error: 'Unable to reach the profile server. Please try again.' }; }
}
