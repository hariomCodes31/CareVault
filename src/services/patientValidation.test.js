import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, validatePatientDetails, todayISO, isValidAadhaar } from './patientValidation.js';
const today = new Date(2026, 8, 12);
test('DOB rejects impossible dates, incomplete dates, and future dates', () => {
  for (const dob of ['31-02-2020', '31-04-2020', '29-02-2025', '00-12-2000', '12-13-2000', '2020', '12-09-1899', '13-09-2026']) assert.equal(calculateAge(dob, today), '', dob);
});
test('age respects birthdays, leap years, ISO dates and newborns', () => {
  assert.equal(calculateAge('12-09-2000', today), '26');
  assert.equal(calculateAge('13-09-2000', today), '25');
  assert.equal(calculateAge('29-02-2024', today), '2');
  assert.equal(calculateAge('2000-09-12', today), '26');
  assert.equal(calculateAge('12-09-2026', today), '0');
  assert.equal(calculateAge('', today), '');
  assert.equal(todayISO(today), '2026-09-12');
});
const valid = { dob: '12-09-2000', phone: '9876543210', emergencyContact: '6789012345', email: 'person+care@example.co.in' };
test('valid contacts pass and optional contacts can be omitted', () => {
  assert.deepEqual(validatePatientDetails(valid), {});
  assert.deepEqual(validatePatientDetails({ ...valid, emergencyContact: '', email: '' }), {});
});
test('both mobile fields reject malformed and invalid numbers', () => {
  for (const number of ['1234567890', '0000000000', '987654321', '98765432101', '98765abcde', '+919876543210']) {
    const errors = validatePatientDetails({ ...valid, phone: number, emergencyContact: number });
    assert.ok(errors.phone, number);
    assert.ok(errors.emergencyContact, number);
  }
});
test('invalid email addresses and absent DOB are rejected', () => {
  for (const email of ['name', 'name@', '@example.com', 'a b@example.com', 'a..b@example.com', 'a@example', 'a@-example.com', 'a@example..com']) assert.ok(validatePatientDetails({ ...valid, email }).email, email);
  assert.ok(validatePatientDetails({ ...valid, dob: '' }).dob);
});

test('Aadhaar accepts checksum-valid formatting and rejects bad digits', () => {
  assert.equal(isValidAadhaar('234567890124'), true);
  assert.equal(isValidAadhaar('2345 6789 0124'), true);
  for (const value of ['234567890125', '123456789012', '000000000000', '23456789012', '2345678901245', '2345x67890124']) assert.equal(isValidAadhaar(value), false, value);
});
test('non-string API fields fail validation without throwing', () => {
  const errors = validatePatientDetails({ dob: {}, phone: 9876543210, email: [], emergencyContact: {}, aadhaar: {} });
  assert.equal(Object.keys(errors).length, 5);
});
