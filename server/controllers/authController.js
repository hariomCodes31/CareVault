import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'carevault_secret_key_2026';

export const registerUser = async (req, res) => {
  try {
    const { role, id, password, name, email } = req.body;
    const cleanId = (id || '').trim().toUpperCase();

    if (!role || !cleanId || !password) {
      return res.status(400).json({ success: false, error: 'Role, ID, and Password are required.' });
    }

    const existing = await User.findOne({ userId: cleanId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this ID already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      userId: cleanId,
      role,
      password: hashedPassword,
      name: name || '',
      email: email || '',
    });

    const token = jwt.sign({ id: newUser._id, userId: newUser.userId, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { userId: newUser.userId, role: newUser.role, name: newUser.name },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { role, id, password } = req.body;
    const cleanId = (id || '').trim().toUpperCase();

    if (!role || !cleanId || !password) {
      return res.status(400).json({ success: false, error: 'Role, ID, and Password are required.' });
    }

    const user = await User.findOne({ userId: cleanId, role });
    if (!user) {
      return res.status(401).json({ success: false, error: `Invalid ${role} ID or credentials.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const isValid = isMatch || password === user.password;

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user._id, userId: user.userId, role: user.role }, JWT_SECRET, {
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
