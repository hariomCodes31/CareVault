import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    aadhaar: { type: String, default: '' },
    bloodGroup: { type: String, default: 'O+' },
    knownConditions: { type: String, default: 'None' },
    allergies: { type: String, default: 'Not Reported' },
    emergencyContact: { type: String, default: '' },
    vitals: {
      bp: { type: String, default: '120/80 mmHg' },
      hr: { type: String, default: '72 bpm' },
      temp: { type: String, default: '98.6°F' },
      spo2: { type: String, default: '98%' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
