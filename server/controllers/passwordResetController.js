import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function verifyRequest(resource, fields) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) throw new Error('SMS password recovery is not configured. Contact the administrator.');
  const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/${resource}`, {
    method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('SMS verification failed or expired. Please request a new code later.');
  return response.json();
}
const identity = body => ({ userId: String(body.id || '').trim().toUpperCase(), role: body.role });
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne(identity(req.body));
    if (!user || !/^[6-9]\d{9}$/.test(user.phone)) return res.status(400).json({ success: false, error: 'No recoverable account found. Older browser-only accounts need server registration with a mobile number.' });
    const now = new Date();
    const reserved = await User.findOneAndUpdate({ _id: user._id, $or: [{ resetRequestedAt: { $exists: false } }, { resetRequestedAt: { $lte: new Date(Date.now() - 60000) } }] }, { $set: { resetRequestedAt: now, resetAttempts: 0 } }, { new: true });
    if (!reserved) return res.status(429).json({ success: false, error: 'Wait 60 seconds before requesting another OTP.' });
    await verifyRequest('Verifications', { To: `+91${user.phone}`, Channel: 'sms' });
    return res.json({ success: true, message: `OTP sent to your registered mobile ending ${user.phone.slice(-4)}. Valid for 10 minutes.` });
  } catch (error) { return res.status(503).json({ success: false, error: error.message }); }
};
export const resetPassword = async (req, res) => {
  try {
    const { code, password } = req.body;
    if (!/^\d{6}$/.test(code || '') || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) return res.status(400).json({ success: false, error: 'Enter the 6-digit OTP and a password of 8?72 bytes.' });
    const user = await User.findOneAndUpdate({ ...identity(req.body), resetRequestedAt: { $gt: new Date(Date.now() - 600000) }, resetAttempts: { $lt: 5 } }, { $inc: { resetAttempts: 1 } }, { new: true });
    if (!user) return res.status(400).json({ success: false, error: 'OTP expired or attempt limit reached. Request a new code.' });
    const result = await verifyRequest('VerificationCheck', { To: `+91${user.phone}`, Code: code });
    if (result.status !== 'approved') return res.status(400).json({ success: false, error: 'Invalid OTP.' });
    const updated = await User.updateOne({ _id: user._id, resetRequestedAt: user.resetRequestedAt }, { $set: { password: await bcrypt.hash(password, 10) }, $unset: { resetRequestedAt: 1 } });
    if (!updated.modifiedCount) return res.status(400).json({ success: false, error: 'This reset has already been used. Request a new code.' });
    return res.json({ success: true, message: 'Password updated. Sign in with your new password.' });
  } catch (error) { return res.status(503).json({ success: false, error: error.message }); }
};
