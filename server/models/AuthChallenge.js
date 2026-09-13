import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: String, kind: String, digest: String, phone: String, verificationSid: String,
  attempts: { type: Number, default: 0 }, busy: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export default mongoose.model('AuthChallenge', schema);
