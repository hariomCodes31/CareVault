import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isAllowedDoctorRegistration } from './config/doctorRegistration.js';
import { registerUser } from './controllers/authController.js';
import User from './models/User.js';
const codes = JSON.parse(readFileSync(new URL('./config/demoDoctorRegistrations.json', import.meta.url)));
test('exactly 50 unique demo codes are accepted; arbitrary inputs are rejected', () => {
 assert.equal(codes.length, 50); assert.equal(new Set(codes).size, 50);
 for (const code of codes) { assert.ok(isAllowedDoctorRegistration(code)); assert.ok(isAllowedDoctorRegistration(' '+code.toLowerCase()+' ')); }
 for (const value of ['', undefined, {}, '123456', 'DEMO-NMC-INVALID']) assert.equal(isAllowedDoctorRegistration(value), false);
});
test('doctor API rejects missing or unknown codes before creating an account', async () => {
 const create = mock.method(User, 'create', async () => { throw new Error('Must not create'); });
 try { for (const code of [undefined, 'DEMO-NMC-INVALID']) {
  const res = { status(n) { this.code=n; return this; }, json(data) { this.body=data; return this; } };
  await registerUser({ body: { role:'doctor', id:'DR2026-123456', password:'testpassword', phone:'9876543210', nmcRegistrationNumber:code } }, res);
  assert.equal(res.code,400); assert.equal(res.body.success,false);
 } assert.equal(create.mock.callCount(),0); } finally { create.mock.restore(); }
});
