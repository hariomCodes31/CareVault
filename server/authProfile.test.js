import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { registerUser, doctorProfile } from './controllers/authController.js';
import { registrationError } from './config/authValidation.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const patient = { role: 'patient', id: 'CV2026-123456', password: 'testpassword', phone: '9876543210', profileData: { name: 'Test patient', gender: 'Female', address: 'Test address', dob: '2000-01-01', phone: '9876543210' } };
process.env.AUTH_OTP_ENABLED = 'false'; process.env.JWT_SECRET = 'test-only-secret';
test('signup rejects a patient profile phone differing from OTP target', () => {
 assert.ok(registrationError({ ...patient, profileData: { ...patient.profileData, phone: '9123456789' } }));
});
test('patient account and profile use the same transaction and return no token on failure', async () => {
 const marker = {};
 const tx = mock.method(mongoose.connection, 'transaction', async callback => callback(marker));
 const ue = mock.method(User, 'exists', async () => false); const pe = mock.method(Patient, 'exists', async () => false);
 const uc = mock.method(User, 'create', async (data, options) => { assert.equal(options.session, marker); assert.ok(Array.isArray(data)); return [{ ...data[0], _id: '123' }]; });
 let fail = true;
 const pc = mock.method(Patient, 'create', async (data, options) => { assert.equal(options.session, marker); assert.equal(data[0].phone, patient.phone); if (fail) throw new Error('database write failed'); return data; });
 try {
 const failed = response(); await registerUser({ body: patient }, failed); assert.equal(failed.code, 500); assert.equal(failed.body.token, undefined);
 fail = false; const success = response(); await registerUser({ body: patient }, success); assert.equal(success.code, 201); assert.ok(success.body.token); assert.equal(success.body.session.name, 'Test patient');
 } finally { for (const m of [tx,ue,pe,uc,pc]) m.mock.restore(); }
});
test('doctor profile update uses authenticated identity and whitelists editable fields', async () => {
 const m = mock.method(User, 'findOneAndUpdate', async (filter, update) => { assert.equal(filter.userId, 'DR2026-123456'); assert.equal(update.$set.phone, undefined); assert.equal(update.$set.role, undefined); assert.equal(update.$set.degree, 'MBBS'); return update.$set; });
 try {
 const res = response(); await doctorProfile({ method: 'PATCH', auth: { role: 'doctor', userId: 'DR2026-123456' }, body: { name: 'Test doctor', degree: 'MBBS', hospital: 'Test clinic', specialty: '', role: 'admin', phone: '9123456789' } }, res); assert.equal(res.body.success, true);
 const denied = response(); await doctorProfile({ auth: { role: 'patient' } }, denied); assert.equal(denied.code, 403);
 } finally { m.mock.restore(); }
});
