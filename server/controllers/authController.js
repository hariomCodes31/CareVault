import Patient from '../models/Patient.js';
import { isAllowedDoctorRegistration, normalizeDoctorRegistration } from '../config/doctorRegistration.js';
import { randomInt } from 'node:crypto';
import { validatePatientDetails } from '../../src/services/patientValidation.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const jwtSecret = () => { if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.'); return process.env.JWT_SECRET; };

export const registerUser = async (req, res) => {
  try {
    const { role, id, password, name, email, phone, profileData, nmcRegistrationNumber } = req.body;
    if (!['doctor', 'patient'].includes(role) || typeof password !== 'string' || password.length < 4 || password.length > 72 || !/^[6-9]\d{9}$/.test(phone || '')) return res.status(400).json({ success: false, error: 'Valid role, mobile and password (4?72 characters) are required.' });
    if (role === 'doctor' && !isAllowedDoctorRegistration(nmcRegistrationNumber)) {
      return res.status(400).json({ success: false, error: 'Enter an approved demo NMC registration code to create a doctor account.' });
    }
    if (role === 'patient') {
      const errors = validatePatientDetails(profileData || {});
      if (Object.keys(errors).length) return res.status(400).json({ success: false, error: Object.values(errors)[0], errors });
    }
    jwtSecret();
    let cleanId = String(id || '').trim().toUpperCase();

    if (!role || !cleanId || !password) {
      return res.status(400).json({ success: false, error: 'Role, ID, and Password are required.' });
    }

    while (await User.exists({ userId: cleanId }) || await Patient.exists({ patientId: cleanId })) {
      cleanId = `${role === 'doctor' ? 'DR' : 'CV'}${new Date().getFullYear()}-${randomInt(100000, 1000000)}`;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      userId: cleanId,
      role,
      password: hashedPassword,
      phone,
      ...(role === 'doctor' ? { nmcRegistrationNumber: normalizeDoctorRegistration(nmcRegistrationNumber), registrationVerification: 'demo-allowlist' } : {}),
      name: name || profileData?.name || '',
      email: email || profileData?.email || '',
    });

    const token = jwt.sign({ id: newUser._id, userId: newUser.userId, role: newUser.role }, jwtSecret(), {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      id: newUser.userId,
      session: { id: newUser.userId, patientId: newUser.userId, role: newUser.role, authenticatedAt: new Date().toISOString() },
      user: { userId: newUser.userId, role: newUser.role, name: newUser.name },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { role, id, password } = req.body;
    const cleanId = String(id || '').trim().toUpperCase();

    if (!role || !cleanId || !password) {
      return res.status(400).json({ success: false, error: 'Role, ID, and Password are required.' });
    }

    const user = await User.findOne({ userId: cleanId, role });
    if (!user) {
      return res.status(401).json({ success: false, error: `Invalid ${role} ID or credentials.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const isValid = isMatch;

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user._id, userId: user.userId, role: user.role }, jwtSecret(), {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      session: {
        id: user.userId,
        patientId: user.userId,
        role: user.role,
        authenticatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
