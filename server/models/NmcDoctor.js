import mongoose from 'mongoose';

const nmcDoctorSchema = new mongoose.Schema(
  {
    srNo: { type: Number },
    yearOfInfo: { type: String, default: '' },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    stateMedicalCouncil: { type: String, default: '' },
    doctorName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    source: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('NmcDoctor', nmcDoctorSchema);
