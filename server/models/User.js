import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, enum: ['patient', 'doctor', 'nurse', 'reception', 'admin'], default: 'patient' },
    password: { type: String, required: true },
    name: { type: String, trim: true, default: '' },
    email: { type: String, lowercase: true, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
