import { randomInt } from 'node:crypto';
import User from '../models/User.js';
import { patientAccessFilter } from '../middleware/patientAccess.js';
import { calculateAge, validatePatientDetails } from '../../src/services/patientValidation.js';
import Patient from '../models/Patient.js';
import Visit from '../models/Visit.js';
import Prescription from '../models/Prescription.js';
import Report from '../models/Report.js';

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find(patientAccessFilter(req.auth)).sort({ createdAt: -1 });
    return res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientDashboard = async (req, res) => {
  try {
    const { patientId } = req.params;
    const cleanId = (patientId || '').trim().toUpperCase();

    let patient = await Patient.findOne({ $and: [{ patientId: cleanId }, patientAccessFilter(req.auth)] });

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

    let targetId = (patientId && patientId.trim())
      ? patientId.trim().toUpperCase() 
      : `CV2026-${String(Math.floor(Math.random() * 900000 + 100000))}`;

    if (req.auth.role === 'doctor' && req.body.createNew === true) {
      do { targetId = `CV${new Date().getFullYear()}-${randomInt(100000, 1000000)}`; }
      while (await Patient.exists({ patientId: targetId }) || await User.exists({ userId: targetId }));
    }
    if (req.auth.role === 'patient') {
      if (patientId && targetId !== req.auth.userId) return res.status(403).json({ success: false, error: 'You can update only your own record.' });
      targetId = req.auth.userId;
    }
    const details = {
      patientId: targetId, name, age: Number(calculateAge(req.body.dob)), dob: req.body.dob,
      email: req.body.email || '', emergencyContact: req.body.emergencyContact || '',
      emergencyContactRelationship: req.body.emergencyContactRelationship || '',
      gender: gender || 'Male', phone: phone || '', address: address || '', aadhaar: aadhaar || '',
      bloodGroup: bloodGroup || '', knownConditions: knownConditions || '', allergies: allergies || '',
    };
    let updatedPatient;
    const exists = await Patient.exists({ patientId: targetId });
    if (exists) {
      updatedPatient = await Patient.findOneAndUpdate(
        { $and: [{ patientId: targetId }, patientAccessFilter(req.auth)] },
        { $set: details }, { returnDocument: 'after', runValidators: true });
      if (!updatedPatient) return res.status(403).json({ success: false, error: 'You do not have access to this patient.' });
    } else {
      // Doctor registration cannot reserve or overwrite another patient's account ID.
      if (req.auth.role === 'doctor') {
        do { targetId = `CV${new Date().getFullYear()}-${randomInt(100000, 1000000)}`; }
        while (await Patient.exists({ patientId: targetId }) || await User.exists({ userId: targetId }));
      }
      updatedPatient = await Patient.create({ ...details, patientId: targetId, allowedDoctorIds: req.auth.role === 'doctor' ? [req.auth.userId] : [] });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient registered/updated successfully in MongoDB Atlas',
      patient: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
