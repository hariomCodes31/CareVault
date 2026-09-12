import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, default: 0 },
    dob: { type: String, default: '' },
    email: { type: String, default: '' },
    emergencyContactRelationship: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    aadhaar: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    knownConditions: { type: String, default: '' },
    allergies: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    vitals: {
      bp: { type: String, default: '' },
      hr: { type: String, default: '' },
      temp: { type: String, default: '' },
      spo2: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
