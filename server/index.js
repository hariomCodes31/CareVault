import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js c-ares DNS resolver to use Google Public DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  console.log('🌐 Custom DNS Servers set (8.8.8.8, 8.8.4.4) for MongoDB Atlas SRV lookup');
} catch (e) {
  console.warn('⚠️ Could not override DNS servers:', e.message);
}

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
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CareVault Backend API',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas ✅ Connected' : 'MongoDB ❌ Disconnected',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CareVault Server running on http://localhost:${PORT}`);
});
