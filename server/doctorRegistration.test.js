import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isAllowedDoctorRegistration } from './config/doctorRegistration.js';
import { registerUser } from './controllers/authController.js';
import User from './models/User.js';
const codes = JSON.parse(readFileSync(new URL('./config/doctorRegistrations.json', import.meta.url))).map(doctor => doctor.registrationNumber);
test('exactly 49 supplied registration numbers are accepted; arbitrary inputs are rejected', () => {
 assert.equal(codes.length, 49); assert.equal(new Set(codes).size, 49);
 for (const code of codes) { assert.ok(isAllowedDoctorRegistration(code)); assert.ok(isAllowedDoctorRegistration(' '+code.toLowerCase()+' ')); }
 for (const value of ['', undefined, {}, '123456', 'DEMO-NMC-INVALID', 'DMC/R/999999', '513']) assert.equal(isAllowedDoctorRegistration(value), false);
});
test('doctor API rejects missing or unknown codes before creating an account', async () => {
 const create = mock.method(User, 'create', async () => { throw new Error('Must not create'); });
 try { for (const code of [undefined, 'DEMO-NMC-INVALID', 'DMC/R/999999', '513']) {
  const res = { status(n) { this.code=n; return this; }, json(data) { this.body=data; return this; } };
  await registerUser({ body: { role:'doctor', id:'DR2026-123456', password:'testpassword', phone:'9876543210', nmcRegistrationNumber:code } }, res);
  assert.equal(res.code,400); assert.equal(res.body.success,false);
 } assert.equal(create.mock.callCount(),0); } finally { create.mock.restore(); }
});
