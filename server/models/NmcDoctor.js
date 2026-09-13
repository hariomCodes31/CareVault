import mongoose from 'mongoose';

const nmcDoctorSchema = new mongoose.Schema(
  {
    srNo: { type: Number },
    yearOfInfo: { type: String, default: '1925' },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    stateMedicalCouncil: { type: String, default: 'West Bengal Medical Council' },
    doctorName: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('NmcDoctor', nmcDoctorSchema);
