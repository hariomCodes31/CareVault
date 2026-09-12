import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function requireAuthentication(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ success: false, error: 'Please sign in again.' });
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(claims.id);
    if (!user || !['patient', 'doctor'].includes(user.role)) throw new Error('Invalid user');
    req.auth = { userId: user.userId, role: user.role };
    return next();
  } catch { return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' }); }
}
export function patientAccessFilter(auth) {
  if (auth.role === 'patient') return { patientId: auth.userId };
  if (auth.role === 'doctor') return {};
  return { _id: null };
}
