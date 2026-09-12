import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '1-0-1' },
  duration: { type: String, default: '3 days' },
  instruction: { type: String, default: 'After meals' },
});

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    visitId: { type: String, default: '' },
    doctorName: { type: String, default: 'Dr. CareVault' },
    medicines: [medicineSchema],
    advice: { type: String, default: 'Rest and hydration.' },
    followUp: { type: String, default: '7 days' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);
