import NmcDoctor from '../models/NmcDoctor.js';

export const VERIFIED_NMC_DOCTORS = [
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

export async function seedNmcDoctors() {
  try {
    for (const doc of VERIFIED_NMC_DOCTORS) {
      await NmcDoctor.findOneAndUpdate(
        { registrationNumber: doc.registrationNumber },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Official NMC Doctors successfully synced in database (10 records).');
  } catch (err) {
    console.warn('⚠️ Could not seed NMC Doctors to database:', err.message);
  }
}
