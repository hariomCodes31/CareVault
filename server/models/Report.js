import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Laboratory' },
    issuedBy: { type: String, default: 'CareVault Diagnostics' },
    status: { type: String, default: 'Completed' },
    fileSize: { type: String, default: '1.2 MB' },
    fileUrl: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
