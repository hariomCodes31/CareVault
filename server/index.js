import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import { connectWithRetry } from './config/connectWithRetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔑 MONGO_URI loaded:', process.env.MONGO_URI ? 'YES ✅' : 'NO ❌');

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env!');
    return;
  }
  const conn = await connectWithRetry(() => mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  }), {
    onRetry: () => console.warn('Database unreachable. Retrying in 5 seconds; check your network connection.'),
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, error: 'Database connection is unavailable. The server is reconnecting; check your network and try again shortly.' });
  return next();
});
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'OK' : 'DEGRADED',
    smsRecoveryConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID),
    service: 'CareVault Backend API',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas ✅ Connected' : 'MongoDB ❌ Disconnected',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CareVault Server running on http://localhost:${PORT}`);
});
