// Official NMC Doctors Directory (West Bengal Medical Council - Year 1925)
export const OFFICIAL_NMC_DOCTORS = [
  { srNo: 1, yearOfInfo: '1925', registrationNumber: '5027', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Ramranjan Basu' },
  { srNo: 2, yearOfInfo: '1925', registrationNumber: '5040', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Ramcharan Chakrabarti' },
  { srNo: 3, yearOfInfo: '1925', registrationNumber: '5060', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Satkari Pramanik' },
  { srNo: 4, yearOfInfo: '1925', registrationNumber: '5061', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Pramathanath Kolay' },
  { srNo: 5, yearOfInfo: '1925', registrationNumber: '5062', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Raman Thekre Kunneth' },
  { srNo: 6, yearOfInfo: '1925', registrationNumber: '5067', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Keramat Ali' },
  { srNo: 7, yearOfInfo: '1925', registrationNumber: '5068', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Ramendranath Mitra' },
  { srNo: 8, yearOfInfo: '1925', registrationNumber: '5117', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Ramananda Bandyopadhyay' },
  { srNo: 9, yearOfInfo: '1925', registrationNumber: '5130', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Pramod Chandra De' },
  { srNo: 10, yearOfInfo: '1925', registrationNumber: '5132', stateMedicalCouncil: 'West Bengal Medical Council', doctorName: 'Rames Chandra Datta' },
];

export function normalizeNmcCode(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^(?:(?:NMC|WBMC|WB)[-\s/]+)?(\d{4,8})$/i);
  if (match) return match[1];
  return trimmed;
}

export function checkNmcDoctor(value) {
  const norm = normalizeNmcCode(value);
  if (!norm) return null;
  return OFFICIAL_NMC_DOCTORS.find(d => d.registrationNumber === norm) || null;
}
