import { readFileSync } from 'node:fs';
const allowed = new Set(JSON.parse(readFileSync(new URL('./doctorRegistrations.json', import.meta.url), 'utf8')).map(doctor => doctor.registrationNumber));
export function normalizeDoctorRegistration(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}
export function isAllowedDoctorRegistration(value) {
  return allowed.has(normalizeDoctorRegistration(value));
}
