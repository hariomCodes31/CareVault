import { randomInt } from 'node:crypto';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

export async function createWithUniqueAccountId(role, create, {
  candidate = () => `${role === 'doctor' ? 'DR' : 'CV'}${new Date().getFullYear()}-${randomInt(0, 1000000).toString().padStart(6, '0')}`,
  exists = async id => await User.exists({ userId: id }) || await Patient.exists({ patientId: id }),
} = {}) {
  if (!['doctor', 'patient'].includes(role)) throw new Error('Invalid account role');
  for (let attempt = 0; attempt < 30; attempt++) {
    const id = candidate();
    if (await exists(id)) continue;
    try { return await create(id); }
    catch (error) {
      // Handle a simultaneous signup winning the unique-index race.
      if (error.code !== 11000 || !(error.keyPattern?.userId || error.keyPattern?.patientId)) throw error;
    }
  }
  throw new Error('Unable to allocate an account ID. Please retry.');
}
