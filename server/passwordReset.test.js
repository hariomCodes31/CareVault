import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { forgotPassword, resetPassword } from './controllers/passwordResetController.js';
const response = () => ({ statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.body = data; return this; } });
test('reset rejects malformed input without querying the database', async () => {
  const res = response(); await resetPassword({ body: { code: '123', password: 'short' } }, res);
  assert.equal(res.statusCode, 400);
});
test('reset requires an active challenge and respects attempt limits', async () => {
  const find = mock.method(User, 'findOneAndUpdate', async () => null);
  try { const res = response(); await resetPassword({ body: { id: 'CV2026-000001', role: 'patient', code: '123456', password: 'newpassword' } }, res); assert.equal(res.statusCode, 400); assert.equal(find.mock.calls[0].arguments[0].resetAttempts.$lt, 5); } finally { find.mock.restore(); }
});
test('SMS is sent only to the stored account number; approved OTP stores a hash', async () => {
  const old = { ...process.env };
  Object.assign(process.env, { TWILIO_ACCOUNT_SID: 'test', TWILIO_AUTH_TOKEN: 'test', TWILIO_VERIFY_SERVICE_SID: 'test' });
  const user = { _id: 'test', phone: '9876543210', resetRequestedAt: new Date() };
  const find = mock.method(User, 'findOne', async () => user);
  const reserve = mock.method(User, 'findOneAndUpdate', async () => user);
  const update = mock.method(User, 'updateOne', async () => ({ modifiedCount: 1 }));
  const network = mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ status: 'approved' }) }));
  try {
    const res = response(); await forgotPassword({ body: { id: 'CV2026-000001', role: 'patient', phone: '6666666666' } }, res);
    assert.equal(res.body.success, true); assert.equal(network.mock.calls[0].arguments[1].body.get('To'), '+919876543210');
    const reset = response(); await resetPassword({ body: { id: 'CV2026-000001', role: 'patient', code: '123456', password: 'newpassword' } }, reset);
    assert.equal(reset.body.success, true);
    assert.equal(await bcrypt.compare('newpassword', update.mock.calls[0].arguments[1].$set.password), true);
    assert.ok(update.mock.calls[0].arguments[1].$unset.resetRequestedAt);
  } finally { find.mock.restore(); reserve.mock.restore(); update.mock.restore(); network.mock.restore(); for (const key of ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_VERIFY_SERVICE_SID']) { if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key]; } }
});

test('wrong OTP cannot change the password', async () => {
  const previous = [process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_VERIFY_SERVICE_SID];
  Object.assign(process.env, { TWILIO_ACCOUNT_SID: 'test', TWILIO_AUTH_TOKEN: 'test', TWILIO_VERIFY_SERVICE_SID: 'test' });
  const find = mock.method(User, 'findOneAndUpdate', async () => ({ phone: '9876543210' }));
  const update = mock.method(User, 'updateOne', async () => { throw new Error('Must not update'); });
  const network = mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ status: 'pending' }) }));
  try {
    const res = response(); await resetPassword({ body: { role: 'patient', id: 'CV2026-000001', code: '654321', password: 'newpassword' } }, res);
    assert.equal(res.statusCode, 400); assert.equal(update.mock.callCount(), 0);
  } finally { find.mock.restore(); update.mock.restore(); network.mock.restore(); ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_VERIFY_SERVICE_SID'].forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; }); }
});
test('resend cooldown does not call the SMS provider', async () => {
  const find = mock.method(User, 'findOne', async () => ({ _id: 'test', phone: '9876543210' }));
  const reserve = mock.method(User, 'findOneAndUpdate', async () => null);
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Must not send'); });
  try { const res = response(); await forgotPassword({ body: { role: 'patient', id: 'CV2026-000001' } }, res); assert.equal(res.statusCode, 429); assert.equal(network.mock.callCount(), 0); }
  finally { find.mock.restore(); reserve.mock.restore(); network.mock.restore(); }
});
