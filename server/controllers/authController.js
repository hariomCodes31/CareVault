import mongoose from 'mongoose';
import { otpEnabled } from './authVerification.js';
import { registrationError } from '../config/authValidation.js';
import { calculateAge } from '../../src/services/patientValidation.js';
import Patient from '../models/Patient.js';
import { isAllowedDoctorRegistration, normalizeDoctorRegistration } from '../config/doctorRegistration.js';
import { createWithUniqueAccountId } from '../config/accountId.js';
import { validatePatientDetails } from '../../src/services/patientValidation.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const jwtSecret = () => { if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.'); return process.env.JWT_SECRET; };

export const registerUser = async (req, res) => {
  try {
    const { role, password, name, email, phone, profileData, nmcRegistrationNumber, degree, hospital, specialty } = req.body;
    if (!['doctor', 'patient'].includes(role) || typeof password !== 'string' || password.length < 4 || password.length > 72 || !/^[6-9]\d{9}$/.test(phone || '')) return res.status(400).json({ success: false, error: 'Valid role, mobile and password (4?72 characters) are required.' });
    if (role === 'doctor' && !isAllowedDoctorRegistration(nmcRegistrationNumber)) {
      return res.status(400).json({ success: false, error: 'Enter an approved demo NMC registration code to create a doctor account.' });
    }
    if (role === 'patient') {
      const errors = validatePatientDetails(profileData || {});
      if (Object.keys(errors).length) return res.status(400).json({ success: false, error: Object.values(errors)[0], errors });
    }
    const validationError = registrationError(req.body);
    if (validationError) return res.status(400).json({ success: false, error: validationError });
    if (otpEnabled() && req.verifiedPhone !== phone) return res.status(403).json({ success: false, error: 'Mobile verification is required.' });
    jwtSecret();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const accountData = {
      role,
      password: hashedPassword,
      phone,
      ...(req.verifiedPhone ? { phoneVerifiedAt: new Date() } : {}),
      ...(role === 'doctor' ? { degree, hospital, specialty: typeof specialty === 'string' ? specialty.slice(0, 160) : '' } : {}),
      ...(role === 'doctor' ? { nmcRegistrationNumber: normalizeDoctorRegistration(nmcRegistrationNumber), registrationVerification: 'demo-allowlist' } : {}),
      name: name || profileData?.name || '',
      email: email || profileData?.email || '',
    };
    const newUser = await createWithUniqueAccountId(role, async cleanId => {
      const data = { ...accountData, userId: cleanId };
      if (role === 'doctor') return User.create(data);
      let created;
      await mongoose.connection.transaction(async transaction => {
        [created] = await User.create([data], { session: transaction });
        const profile = Object.fromEntries(['name', 'gender', 'dob', 'email', 'address', 'aadhaar', 'bloodGroup', 'emergencyContact', 'emergencyContactRelationship'].map(key => [key, profileData[key]]));
        await Patient.create([{ ...profile, patientId: cleanId, phone, age: Number(calculateAge(profileData.dob)) }], { session: transaction });
      });
      return created;
    });

    const token = jwt.sign({ id: newUser._id, userId: newUser.userId, role: newUser.role }, jwtSecret(), {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      id: newUser.userId,
      session: { ...publicProfile(newUser), id: newUser.userId, patientId: newUser.userId, role: newUser.role, authenticatedAt: new Date().toISOString() },
      user: { userId: newUser.userId, role: newUser.role, name: newUser.name },
    });
  } catch {
    return res.status(500).json({ success: false, restartVerification: true, error: 'Account request could not be completed. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { role, id, password } = req.body;
    const cleanId = String(id || '').trim().toUpperCase();

    if (!['doctor', 'patient'].includes(role) || !cleanId || typeof password !== 'string' || !password || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ success: false, error: 'Role, ID, and Password are required.' });
    }

    const user = await User.findOne({ userId: cleanId, role });
    if (!user) {
      return res.status(401).json({ success: false, error: `Invalid ${role} ID or credentials.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const isValid = isMatch;

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid account ID or password.' });
    }

    if (otpEnabled() && req.verifiedPhone !== user.phone) return res.status(403).json({ success: false, error: 'Mobile verification is required.' });
    if (req.verifiedPhone) await User.updateOne({ _id: user._id }, { $set: { phoneVerifiedAt: new Date() } });
    const token = jwt.sign({ id: user._id, userId: user.userId, role: user.role }, jwtSecret(), {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      session: {
        ...publicProfile(user),
        id: user.userId,
        patientId: user.userId,
        role: user.role,
        authenticatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return res.status(500).json({ success: false, restartVerification: true, error: 'Account request could not be completed. Please try again.' });
  }
};

export function publicProfile(user) { return { name: user.name, degree: user.degree, hospital: user.hospital, specialty: user.specialty, nmcRegistrationNumber: user.nmcRegistrationNumber, email: user.email }; }
export async function doctorProfile(req, res) {
  if (req.auth.role !== 'doctor') return res.status(403).json({ success: false, error: 'Doctor access required.' });
  try {
    const filter = { userId: req.auth.userId, role: 'doctor' };
    let user;
    if (req.method === 'PATCH') {
      const fields = ['name', 'degree', 'hospital', 'specialty'];
      if (fields.some(key => typeof req.body[key] !== 'string' || req.body[key].length > 160) || fields.slice(0, 3).some(key => !req.body[key].trim())) return res.status(400).json({ success: false, error: 'Name, degree and hospital are required (up to 160 characters).' });
      user = await User.findOneAndUpdate(filter, { $set: Object.fromEntries(fields.map(key => [key, req.body[key].trim()])) }, { new: true, runValidators: true });
    } else user = await User.findOne(filter);
    if (!user) return res.status(404).json({ success: false, error: 'Doctor profile not found.' });
    return res.json({ success: true, profile: publicProfile(user) });
  } catch { return res.status(503).json({ success: false, error: 'Unable to load or save doctor profile.' }); }
}
