import { readFileSync } from 'node:fs';
import NmcDoctor from '../models/NmcDoctor.js';
export const PROVIDED_NMC_DOCTORS = JSON.parse(readFileSync(new URL('./doctorRegistrations.json', import.meta.url), 'utf8'));
export async function seedNmcDoctors() {
  return NmcDoctor.bulkWrite(PROVIDED_NMC_DOCTORS.map(doctor => ({ updateOne: {
    filter: { registrationNumber: doctor.registrationNumber },
    update: { $set: doctor }, upsert: true,
  } })));
}
