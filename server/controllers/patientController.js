import { calculateAge, validatePatientDetails } from '../../src/services/patientValidation.js';
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

    if (!patient) return res.status(404).json({ success: false, error: 'Patient record not found.' });

    const visits = await Visit.find({ patientId: cleanId }).sort({ date: -1 });
    const prescriptions = await Prescription.find({ patientId: cleanId }).sort({ date: -1 });
    const reports = await Report.find({ patientId: cleanId }).sort({ date: -1 });

    return res.json({
      success: true,
      patient,
      visits,
      prescriptions,
      reports,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { patientId, name, gender, phone, address, aadhaar, bloodGroup, knownConditions, allergies } = req.body;

    const errors = validatePatientDetails(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors, error: Object.values(errors)[0] });
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
          age: Number(calculateAge(req.body.dob)),
          dob: req.body.dob,
          email: req.body.email || '',
          emergencyContact: req.body.emergencyContact || '',
          emergencyContactRelationship: req.body.emergencyContactRelationship || '',
          gender: gender || 'Male',
          phone: phone || '',
          address: address || '',
          aadhaar: aadhaar || '',
          bloodGroup: bloodGroup || '',
          knownConditions: knownConditions || '',
          allergies: allergies || '',
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
