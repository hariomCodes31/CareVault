import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    visitId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, ref: 'Patient' },
    doctorName: { type: String, default: 'Dr. CareVault' },
    department: { type: String, default: 'General Medicine' },
    type: { type: String, default: 'OPD Visit' },
    chiefComplaint: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Scheduled', 'In-Progress', 'Completed'], default: 'Completed' },
  },
  { timestamps: true }
);

export default mongoose.model('Visit', visitSchema);
