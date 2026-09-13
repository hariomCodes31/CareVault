import { registrationError } from '../config/authValidation.js';
import { randomInt, randomUUID, createHmac } from 'node:crypto';
import bcrypt from 'bcryptjs';
import Challenge from '../models/AuthChallenge.js';
import User from '../models/User.js';
import { verifyRequest } from './passwordResetController.js';

// SMS enforcement is a separate deployment opt-in after provider setup.
export const otpEnabled = () => process.env.AUTH_OTP_ENABLED === 'true';
const digest = value => createHmac('sha256', process.env.JWT_SECRET).update(value).digest('hex');
export function payloadDigest(body, purpose) {
  const payload = Object.fromEntries(Object.entries(body).filter(([key]) => !['captchaId', 'captchaAnswer', 'challengeId', 'code'].includes(key)));
  return digest(JSON.stringify({ purpose, payload }));
}
export async function captcha(req, res) {
  try {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const answer = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
    const id = randomUUID();
    await Challenge.create({ _id: id, kind: 'captcha', digest: digest(answer), expiresAt: new Date(Date.now() + 300000) });
    const letters = [...answer].map((char, i) => `<text x="${22 + i * 32}" y="${40 + randomInt(-5, 6)}" transform="rotate(${randomInt(-15, 16)} ${22 + i * 32} 35)">${char}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="64" viewBox="0 0 230 64"><rect width="230" height="64" fill="#edf3ee"/><g stroke="#9baa9e" fill="none"><path d="M0 12L230 49M0 50L230 18M10 30Q120 0 220 40"/></g><g font-family="monospace" font-size="29" font-weight="bold" fill="#203e30">${letters}</g></svg>`;
    res.set('Cache-Control', 'no-store');
    return res.json({ success: true, captchaId: id, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, otpEnabled: otpEnabled() });
  } catch { return res.status(503).json({ success: false, error: 'Unable to load CAPTCHA. Try again shortly.' }); }
}
export async function consumeCaptcha(body) {
  if (typeof body.captchaId !== 'string' || typeof body.captchaAnswer !== 'string') return false;
  const challenge = await Challenge.findOneAndDelete({ _id: body.captchaId, kind: 'captcha', expiresAt: { $gt: new Date() } });
  return Boolean(challenge && challenge.digest === digest(body.captchaAnswer.trim().toUpperCase()));
}
export function requireOtp(purpose) {
  return async (req, res, next) => {
    try {
      const body = req.body || {};
      if (!['doctor', 'patient'].includes(body.role) || (purpose === 'login' && (typeof body.id !== 'string' || !body.id.trim())) || typeof body.password !== 'string' || !body.password || Buffer.byteLength(body.password) > 72) return res.status(400).json({ success: false, error: 'Enter a valid role, account ID and password.' });
      if (purpose === 'register') { const error = registrationError(body); if (error) return res.status(400).json({ success: false, error }); }
      const boundDigest = payloadDigest(body, purpose);
      if (otpEnabled() && body.challengeId) {
        if (typeof body.challengeId !== 'string' || !/^\d{6}$/.test(body.code || '')) return res.status(400).json({ success: false, error: 'Enter the six-digit OTP.' });
        const challenge = await Challenge.findOneAndUpdate({ _id: body.challengeId, kind: purpose, digest: boundDigest, busy: false, attempts: { $lt: 5 }, expiresAt: { $gt: new Date() } }, { $set: { busy: true }, $inc: { attempts: 1 } }, { new: true });
        if (!challenge) return res.status(400).json({ success: false, restartVerification: true, error: 'Verification expired, details changed, or attempt limit reached. Request a new OTP.' });
        try {
          const result = await verifyRequest('VerificationCheck', { VerificationSid: challenge.verificationSid, Code: body.code });
          if (result.status !== 'approved') return res.status(400).json({ success: false, error: 'Incorrect OTP. Please try again.' });
          const consumed = await Challenge.findOneAndDelete({ _id: challenge._id, busy: true });
          if (!consumed) return res.status(400).json({ success: false, error: 'Verification already used.' });
          req.verifiedPhone = challenge.phone;
          return next();
        } finally { await Challenge.updateOne({ _id: challenge._id }, { $set: { busy: false } }); }
      }
      if (!await consumeCaptcha(body)) return res.status(400).json({ success: false, error: 'CAPTCHA is incorrect or expired. Enter a new CAPTCHA.' });
      if (!otpEnabled()) return next();
      let phone = body.phone;
      if (purpose === 'login') {
        const user = await User.findOne({ userId: body.id.trim().toUpperCase(), role: body.role });
        if (!user || !await bcrypt.compare(body.password, user.password)) return res.status(401).json({ success: false, error: 'Invalid account ID or password.' });
        phone = user.phone;
      }
      if (typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, error: 'A valid registered mobile number is required. Contact support for older accounts without a mobile number.' });
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) return res.status(503).json({ success: false, error: 'Mobile OTP service is not configured. Contact the administrator.' });
      const reservation = 'sms:' + digest(phone);
      try {
        await Challenge.findOneAndUpdate({ _id: reservation, expiresAt: { $lte: new Date() } }, { $set: { kind: 'cooldown', expiresAt: new Date(Date.now() + 60000) } }, { upsert: true });
      } catch (error) {
        if (error.code === 11000) return res.status(429).json({ success: false, error: 'Wait 60 seconds before requesting another OTP.' });
        throw error;
      }
      const verification = await verifyRequest('Verifications', { To: `+91${phone}`, Channel: 'sms' });
      const challengeId = randomUUID();
      await Challenge.create({ _id: challengeId, kind: purpose, digest: boundDigest, phone, verificationSid: verification.sid, expiresAt: new Date(Date.now() + 600000) });
      return res.json({ success: true, otpRequired: true, challengeId, message: `OTP sent to mobile ending ${phone.slice(-4)}. Valid for 10 minutes.`, retryAfter: 60 });
    } catch { return res.status(503).json({ success: false, error: 'SMS verification unavailable or expired. Please request a new OTP shortly.', restartVerification: true }); }
  };
}
