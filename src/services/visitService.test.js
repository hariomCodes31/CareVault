import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPatientProfile, getPatientVisits, saveNewVisit, saveDraftVisit, getDraftVisit } from './visitService.js';
const data = new Map();
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
const a = 'CV2026-000001', b = 'CV2026-000002';
test('missing and mismatched records never return sample patient information', () => {
  data.clear();
  assert.equal(getPatientProfile(a).name, '');
  assert.deepEqual(getPatientVisits(a), []);
  data.set('carevault_patient_data', JSON.stringify({ id: b, name: 'Another patient' }));
  assert.equal(getPatientProfile(a).name, '');
  assert.equal(getPatientProfile(b).name, 'Another patient');
});
test('drafts and visit counters stay with their own patient', () => {
  data.clear();
  saveDraftVisit({ chiefComplaint: 'A' }, a); saveDraftVisit({ chiefComplaint: 'B' }, b);
  assert.equal(getDraftVisit(a).data.chiefComplaint, 'A');
  const result = saveNewVisit({ patientId: a, chiefComplaint: 'A' });
  assert.equal(result.success, true);
  assert.equal(getPatientVisits(a).length, 1); assert.equal(getPatientVisits(b).length, 0);
  assert.equal(getPatientProfile(a).visitCount, 1); assert.equal(getPatientProfile(b).visitCount, 0);
  assert.equal(getDraftVisit(a), null); assert.equal(getDraftVisit(b).data.chiefComplaint, 'B');
  assert.equal(saveNewVisit({ chiefComplaint: 'No patient' }).success, false);
});
