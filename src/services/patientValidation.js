// Shared registration rules for typed dates and calendar input.
export function todayISO(today = new Date()) {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function calculateAge(value, today = new Date()) {
  const text = String(value || '').trim();
  let year, month, day;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) [year, month, day] = text.split('-').map(Number);
  else if (/^\d{2}-\d{2}-\d{4}$/.test(text)) [day, month, year] = text.split('-').map(Number);
  else return '';
  const birth = new Date(year, month - 1, day);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (year < 1900 || birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day || birth > end) return '';
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age--;
  return String(age);
}

export function validatePatientDetails(data) {
  data = Object.fromEntries(['dob', 'phone', 'email', 'emergencyContact', 'aadhaar'].map(key => [key, typeof data?.[key] === 'string' ? data[key].trim() : data?.[key] == null ? '' : '!invalid!']));
  const errors = {};
  if (!data.dob?.trim()) errors.dob = 'Date of Birth is required.';
  else if (calculateAge(data.dob) === '') errors.dob = 'Enter a real date from 1900 to today (DD-MM-YYYY).';
  if (!/^[6-9]\d{9}$/.test((data.phone || '').trim())) errors.phone = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
  if (data.emergencyContact && !/^[6-9]\d{9}$/.test(data.emergencyContact.trim())) errors.emergencyContact = 'Enter a 10-digit emergency mobile number starting with 6, 7, 8 or 9.';
  if (data.email) {
    const email = data.email.trim();
    const parts = email.split('@');
    const local = parts[0];
    const domain = parts[1] || '';
    if (email.length > 254 || parts.length !== 2 || !local || local.length > 64 || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !domain.includes('.') || domain.split('.').some(label => !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label))) errors.email = 'Enter a valid email address (e.g. name@example.com).';
  }
  if (data.aadhaar && !isValidAadhaar(data.aadhaar)) errors.aadhaar = 'Enter a valid 12-digit Aadhaar number (checksum must match).';
  return errors;
}

// Verhoeff checksum validates typing errors, not identity or UIDAI issuance.
export function isValidAadhaar(value) {
  const number = String(value).replace(/[ -]/g, '');
  if (!/^[2-9]\d{11}$/.test(number)) return false;
  const d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  const p = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  return [...number].reverse().reduce((c, n, i) => d[c][p[i % 8][Number(n)]], 0) === 0;
}
