import { isAllowedDoctorRegistration } from './doctorRegistration.js';
import { validatePatientDetails } from '../../src/services/patientValidation.js';
export function registrationError(body) {
  if (!['doctor', 'patient'].includes(body.role) || typeof body.password !== 'string' || body.password.length < 8 || Buffer.byteLength(body.password) > 72) return 'Choose a password of at least 8 characters and at most 72 bytes.';
  if (typeof body.phone !== 'string' || !/^[6-9]\d{9}$/.test(body.phone)) return 'Enter a valid ten-digit mobile number.';
  if (body.role === 'doctor') {
    if (!isAllowedDoctorRegistration(body.nmcRegistrationNumber)) return 'Enter an approved demo NMC registration code.';
    if (['name', 'degree', 'hospital'].some(key => typeof body[key] !== 'string' || !body[key].trim() || body[key].length > 160)) return 'Doctor name, degree and hospital are required (up to 160 characters).';
  } else {
    const profile = body.profileData;
    if (!profile || typeof profile.name !== 'string' || !profile.name.trim() || typeof profile.address !== 'string' || !profile.address.trim() || !['Male', 'Female', 'Other'].includes(profile.gender)) return 'Patient name, gender and address are required.';
    if (profile.phone !== body.phone) return 'Patient mobile number must match the number being verified.';
    const errors = validatePatientDetails(profile);
    if (Object.keys(errors).length) return Object.values(errors)[0];
  }
  return null;
}
