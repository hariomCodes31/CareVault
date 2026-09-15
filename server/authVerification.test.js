import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { captcha, consumeCaptcha, payloadDigest, requireOtp } from './controllers/authVerification.js';
import Challenge from './models/AuthChallenge.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
const response = () => ({ status(code) { this.code = code; return this; }, set() {}, json(body) { this.body = body; return this; } });
const body = { role: 'doctor', id: 'DR2026-123456', password: 'password123' };
process.env.JWT_SECRET = 'test-only-secret';
process.env.AUTH_OTP_ENABLED = 'true';
for (const key of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID']) process.env[key] = 'test';
const hash = value => createHmac('sha256', process.env.JWT_SECRET).update(value).digest('hex');
test('CAPTCHA uses server-side digest, expiry and one-use consumption', async () => {
 const previousEnv = process.env.NODE_ENV;
 process.env.NODE_ENV = 'production';
 let stored;
 const create = mock.method(Challenge, 'create', async data => { stored = data; });
 const res = response();
 try { await captcha({}, res); } finally { if (previousEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousEnv; }
 assert.ok(res.body.image.startsWith('data:image/svg+xml;base64,')); assert.equal(res.body.answer, undefined); assert.ok(stored.expiresAt > new Date());
 create.mock.restore();
 const consume = mock.method(Challenge, 'findOneAndDelete', async filter => { assert.ok(filter.expiresAt.$gt); const value = stored; stored = null; return value; });
 stored = { digest: hash('ABC234') };
 assert.equal(await consumeCaptcha({ captchaId: 'test', captchaAnswer: ' abc234 ' }), true);
 assert.equal(await consumeCaptcha({ captchaId: 'test', captchaAnswer: 'ABC234' }), false);
 stored = { digest: hash('ABC234') };
 assert.equal(await consumeCaptcha({ captchaId: 'test', captchaAnswer: 'WRONG' }), false);
 assert.equal(await consumeCaptcha({ captchaId: 'test', captchaAnswer: 'ABC234' }), false);
 consume.mock.restore();
});
test('payload proof binds purpose, role, password and phone but excludes verification inputs', () => {
 assert.equal(payloadDigest(body, 'login'), payloadDigest({ ...body, code: '123456', captchaId: 'x' }, 'login'));
 for (const change of [{ role: 'patient' }, { password: 'changed' }, { phone: '9876543210' }]) assert.notEqual(payloadDigest(body, 'login'), payloadDigest({ ...body, ...change }, 'login'));
 assert.notEqual(payloadDigest(body, 'login'), payloadDigest(body, 'register'));
});
test('wrong CAPTCHA never reaches credentials, SMS or login', async () => {
 const c = mock.method(Challenge, 'findOneAndDelete', async () => null);
 let calls = 0; const u = mock.method(User, 'findOne', async () => { calls++; });
 const res = response(); await requireOtp('login')({ body: { ...body, captchaId: 'x', captchaAnswer: 'WRONG' } }, res, () => calls++);
 assert.equal(res.code, 400); assert.equal(calls, 0); c.mock.restore(); u.mock.restore();
});
test('login sends to stored mobile and issues no authenticated session before OTP', async () => {
 const c = mock.method(Challenge, 'findOneAndDelete', async () => ({ digest: hash('ABC234') }));
 const u = mock.method(User, 'findOne', async () => ({ phone: '9876543210', password: await bcrypt.hash(body.password, 4) }));
 const reserve = mock.method(Challenge, 'findOneAndUpdate', async () => ({}));
 const create = mock.method(Challenge, 'create', async () => ({}));
 const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => { assert.equal(options.body.get('To'), '+919876543210'); return { ok: true, json: async () => ({ sid: 'VEtest' }) }; });
 try {
 const res = response(); await requireOtp('login')({ body: { ...body, phone: '9123456789', captchaId: 'x', captchaAnswer: 'ABC234' } }, res, () => assert.fail('Authenticated too early'));
 assert.equal(res.body.otpRequired, true); assert.equal(res.body.token, undefined); assert.equal(res.body.session, undefined);
 } finally { for (const m of [c,u,reserve,create,fetchMock]) m.mock.restore(); }
});
test('OTP enforces expiry, five attempts, payload binding, exclusive claim and consumption', async () => {
 const update = mock.method(Challenge, 'findOneAndUpdate', async filter => {
 assert.equal(filter.attempts.$lt, 5); assert.equal(filter.busy, false); assert.ok(filter.expiresAt.$gt); assert.equal(filter.digest, payloadDigest(body, 'login'));
 return { _id: 'challenge', phone: '9876543210', verificationSid: 'VEtest' };
 });
 const release = mock.method(Challenge, 'updateOne', async () => ({}));
 let available = true; const consume = mock.method(Challenge, 'findOneAndDelete', async () => { if (!available) return null; available = false; return {}; });
 const f = mock.method(globalThis, 'fetch', async (url, options) => { assert.equal(options.body.get('VerificationSid'), 'VEtest'); return { ok: true, json: async () => ({ status: 'approved' }) }; });
 try { let calls = 0; const req = { body: { ...body, challengeId: 'challenge', code: '123456' } }; await requireOtp('login')(req, response(), () => calls++); assert.equal(calls, 1); assert.equal(req.verifiedPhone, '9876543210');
 const res = response(); await requireOtp('login')(req, res, () => calls++); assert.equal(calls, 1); assert.equal(res.code, 400);
 } finally { for (const m of [update,release,consume,f]) m.mock.restore(); }
});
test('expired or changed OTP challenge cannot authenticate', async () => {
 const m = mock.method(Challenge, 'findOneAndUpdate', async () => null);
 const res = response(); await requireOtp('login')({ body: { ...body, challengeId: 'expired', code: '123456' } }, res, () => assert.fail());
 assert.equal(res.code, 400); assert.equal(res.body.restartVerification, true); m.mock.restore();
});

test('wrong OTP cannot authenticate and releases the verification lock', async () => {
 const claim = mock.method(Challenge, 'findOneAndUpdate', async () => ({ _id: 'x', verificationSid: 'VEtest' }));
 let released = false; const release = mock.method(Challenge, 'updateOne', async () => { released = true; });
 const f = mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ status: 'pending' }) }));
 try { const res = response(); await requireOtp('login')({ body: { ...body, challengeId: 'x', code: '000000' } }, res, () => assert.fail()); assert.equal(res.code, 400); assert.ok(released); }
 finally { for (const m of [claim, release, f]) m.mock.restore(); }
});
test('disabled OTP still requires CAPTCHA and does not call SMS', async () => {
 process.env.AUTH_OTP_ENABLED = 'false';
 const c = mock.method(Challenge, 'findOneAndDelete', async () => ({ digest: hash('ABC234') }));
 const f = mock.method(globalThis, 'fetch', async () => assert.fail('SMS should remain off'));
 try { let called = false; await requireOtp('login')({ body: { ...body, captchaId: 'x', captchaAnswer: 'ABC234' } }, response(), () => { called = true; }); assert.ok(called); }
 finally { c.mock.restore(); f.mock.restore(); process.env.AUTH_OTP_ENABLED = 'true'; }
});
test('enabled OTP fails closed with missing SMS configuration', async () => {
 delete process.env.TWILIO_AUTH_TOKEN;
 const c = mock.method(Challenge, 'findOneAndDelete', async () => ({ digest: hash('ABC234') }));
 const u = mock.method(User, 'findOne', async () => ({ phone: '9876543210', password: await bcrypt.hash(body.password, 4) }));
 try { const res = response(); await requireOtp('login')({ body: { ...body, captchaId: 'x', captchaAnswer: 'ABC234' } }, res, () => assert.fail()); assert.equal(res.code, 503); }
 finally { c.mock.restore(); u.mock.restore(); process.env.TWILIO_AUTH_TOKEN = 'test'; }
});
test('SMS cooldown rejects without contacting provider', async () => {
 const c = mock.method(Challenge, 'findOneAndDelete', async () => ({ digest: hash('ABC234') }));
 const u = mock.method(User, 'findOne', async () => ({ phone: '9876543210', password: await bcrypt.hash(body.password, 4) }));
 const reserve = mock.method(Challenge, 'findOneAndUpdate', async () => { throw Object.assign(new Error(), { code: 11000 }); });
 const f = mock.method(globalThis, 'fetch', async () => assert.fail());
 try { const res = response(); await requireOtp('login')({ body: { ...body, captchaId: 'x', captchaAnswer: 'ABC234' } }, res, () => assert.fail()); assert.equal(res.code, 429); }
 finally { for (const m of [c,u,reserve,f]) m.mock.restore(); }
});


test('local CAPTCHA loads without MongoDB and remains single-use and expiring', async () => {
 const previousEnv = process.env.NODE_ENV;
 process.env.NODE_ENV = 'development';
 const create = mock.method(Challenge, 'create', async () => assert.fail('Must not require MongoDB'));
 const remove = mock.method(Challenge, 'findOneAndDelete', async () => assert.fail('Local consumption must not query MongoDB'));
 const issue = async () => {
   const res = response(); await captcha({}, res);
   assert.equal(res.body.success, true);
   const svg = Buffer.from(res.body.image.split(',')[1], 'base64').toString();
   const answer = [...svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(match => match[1]).join('');
   assert.equal(answer.length, 6);
   assert.match(answer, /[A-Z]/);
   assert.match(answer, /[a-z]/);
   return { captchaId: res.body.captchaId, captchaAnswer: answer };
 };
 try {
   const valid = await issue();
   assert.equal(await consumeCaptcha({ ...valid, captchaAnswer: valid.captchaAnswer.toLowerCase() }), true);
   const uppercase = await issue();
   assert.equal(await consumeCaptcha({ ...uppercase, captchaAnswer: uppercase.captchaAnswer.toUpperCase() }), true);
   const mixed = await issue();
   assert.equal(await consumeCaptcha(mixed), true);
   assert.equal(await consumeCaptcha(valid), false);
   const wrong = await issue();
   assert.equal(await consumeCaptcha({ ...wrong, captchaAnswer: 'INVALID' }), false);
   assert.equal(await consumeCaptcha(wrong), false);
   const expired = await issue();
   const RealDate = globalThis.Date;
   const future = RealDate.now() + 300001;
   const clock = mock.method(globalThis, 'Date', class extends RealDate { constructor(...args) { super(...(args.length ? args : [future])); } });
   try { assert.equal(await consumeCaptcha(expired), false); } finally { clock.mock.restore(); }
 } finally {
   create.mock.restore(); remove.mock.restore();
   if (previousEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousEnv;
 }
});
