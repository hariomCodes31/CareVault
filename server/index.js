import express from 'express';
import dns from 'node:dns';
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

// Optional app-only DNS override for networks that reject SRV lookups.
if (process.env.MONGO_DNS_SERVERS) {
  dns.setServers(process.env.MONGO_DNS_SERVERS.split(',').map(value => value.trim()).filter(Boolean));
}

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
    onRetry: (err) => {
      const sanitizedMsg = err?.message
        ? String(err.message).replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb$1://<redacted>@')
        : '';
      console.warn(`Database unreachable${sanitizedMsg ? `: ${sanitizedMsg}` : ''}. Retrying in 5 seconds. Check Atlas IP Access List, cluster availability, and outbound TCP port 27017.`);
    },
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || (req.method === 'GET' && req.path === '/auth/captcha')) return next();
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
