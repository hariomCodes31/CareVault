import { readFileSync } from 'node:fs';
const allowed = new Set(JSON.parse(readFileSync(new URL('./demoDoctorRegistrations.json', import.meta.url), 'utf8')));
export function normalizeDoctorRegistration(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}
export function isAllowedDoctorRegistration(value) {
  return allowed.has(normalizeDoctorRegistration(value));
}
