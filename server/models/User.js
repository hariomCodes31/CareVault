import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, enum: ['patient', 'doctor', 'nurse', 'reception', 'admin'], default: 'patient' },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    nmcRegistrationNumber: { type: String, trim: true, uppercase: true },
    registrationVerification: { type: String, enum: ['demo-allowlist'] },
    phoneVerifiedAt: Date,
    degree: { type: String, trim: true, default: '' },
    hospital: { type: String, trim: true, default: '' },
    specialty: { type: String, trim: true, default: '' },
    resetRequestedAt: Date,
    resetAttempts: { type: Number, default: 0 },
    name: { type: String, trim: true, default: '' },
    email: { type: String, lowercase: true, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
