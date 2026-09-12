import Patient from '../models/Patient.js';
import Visit from '../models/Visit.js';
import Prescription from '../models/Prescription.js';
import Report from '../models/Report.js';

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientDashboard = async (req, res) => {
  try {
    const { patientId } = req.params;
    const cleanId = (patientId || '').trim().toUpperCase();

    let patient = await Patient.findOne({ patientId: cleanId });

    if (!patient) {
      patient = {
        name: 'Rahul Kumar',
        patientId: cleanId || 'CV2026-000452',
        age: 28,
        gender: 'Male',
        phone: '9876543210',
        address: 'Patna, Bihar',
        aadhaar: '1234 5678 9012',
        bloodGroup: 'O+',
        knownConditions: 'None',
        allergies: 'Not Reported',
        emergencyContact: '+91 9876543211',
        vitals: {
          bp: '120/80 mmHg',
          hr: '98 bpm',
          temp: '101°F',
          spo2: '98%',
        },
      };
    }

    const visits = await Visit.find({ patientId: cleanId }).sort({ date: -1 });
    const prescriptions = await Prescription.find({ patientId: cleanId }).sort({ date: -1 });
    const reports = await Report.find({ patientId: cleanId }).sort({ date: -1 });

    return res.json({
      success: true,
      patient,
      visits: visits.length > 0 ? visits : undefined,
      prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
      reports: reports.length > 0 ? reports : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { patientId, name, age, gender, phone, address, aadhaar, bloodGroup, knownConditions, allergies } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Patient name is required.' });
    }

    const targetId = (patientId && patientId.trim()) 
      ? patientId.trim().toUpperCase() 
      : `CV2026-${String(Math.floor(Math.random() * 900000 + 100000))}`;

    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: targetId },
      {
        $set: {
          patientId: targetId,
          name,
          age: age || 25,
          gender: gender || 'Male',
          phone: phone || '',
          address: address || '',
          aadhaar: aadhaar || '',
          bloodGroup: bloodGroup || 'O+',
          knownConditions: knownConditions || 'None',
          allergies: allergies || 'Not Reported',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Patient registered/updated successfully in MongoDB Atlas',
      patient: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
