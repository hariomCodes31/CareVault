import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPatientDashboardFromBackend } from './api.js';

test('getPatientDashboardFromBackend handles errors, timeouts, and successful responses accurately', async () => {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Missing patientId
    const missingRes = await getPatientDashboardFromBackend('');
    assert.equal(missingRes.success, false);
    assert.equal(missingRes.status, 400);

    // 2. Successful response
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        patient: { patientId: 'CV2026-123456', name: 'Test Patient' },
        visits: [],
        reports: [],
        prescriptions: [],
      }),
    });
    const successRes = await getPatientDashboardFromBackend('CV2026-123456');
    assert.equal(successRes.success, true);
    assert.equal(successRes.patient.name, 'Test Patient');

    // 3. 403 Forbidden / Access denied
    globalThis.fetch = async () => ({
      ok: false,
      status: 403,
      json: async () => ({ success: false, error: 'Access denied to this record.' }),
    });
    const deniedRes = await getPatientDashboardFromBackend('CV2026-123456');
    assert.equal(deniedRes.success, false);
    assert.equal(deniedRes.status, 403);
    assert.equal(deniedRes.error, 'Access denied to this record.');

    // 4. 404 Not Found
    globalThis.fetch = async () => ({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: 'Patient record not found.' }),
    });
    const notFoundRes = await getPatientDashboardFromBackend('CV2026-999999');
    assert.equal(notFoundRes.success, false);
    assert.equal(notFoundRes.status, 404);
    assert.match(notFoundRes.error, /not found/i);

    // 5. Timeout Error (AbortError / TimeoutError)
    globalThis.fetch = async () => {
      const err = new Error('The operation was aborted due to timeout');
      err.name = 'TimeoutError';
      throw err;
    };
    const timeoutRes = await getPatientDashboardFromBackend('CV2026-123456');
    assert.equal(timeoutRes.success, false);
    assert.equal(timeoutRes.status, 408);
    assert.equal(timeoutRes.isTimeout, true);
    assert.match(timeoutRes.error, /timed out/i);

    // 6. Network error
    globalThis.fetch = async () => {
      throw new Error('Failed to fetch');
    };
    const networkRes = await getPatientDashboardFromBackend('CV2026-123456');
    assert.equal(networkRes.success, false);
    assert.equal(networkRes.status, 0);
    assert.equal(networkRes.isTimeout, false);
    assert.match(networkRes.error, /Failed to fetch/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
