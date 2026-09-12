import { todayISO } from './patientValidation.js';
// CareVault Visit & Patient Data Service

const PATIENT_KEY = 'carevault_patient_data';
const VISITS_KEY = 'carevault_visits';
const DRAFT_KEY = 'carevault_visit_draft';

export function getPatientProfile(patientId = '') {
  const empty = { id: patientId, name: '', age: '', gender: '', bloodGroup: '', contact: '', email: '', address: '', visitCount: 0, prescriptionCount: 0, reportCount: 0, activeFollowUpCount: 0 };
  try {
    const patient = JSON.parse(localStorage.getItem(`${PATIENT_KEY}:${patientId}`) || localStorage.getItem(PATIENT_KEY) || 'null');
    return patient?.id === patientId ? { ...empty, ...patient } : empty;
  } catch { return empty; }
}

export function getPatientVisits(patientId = '') {
  try {
    const visits = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
    return Array.isArray(visits) ? visits.filter(v => v.patientId === patientId) : [];
  } catch { return []; }
}

export function getVisitById(visitId) {
  try {
    const data = localStorage.getItem(VISITS_KEY);
    const visits = data ? JSON.parse(data) : [];
    return visits.find(v => v.id === visitId) || null;
  } catch (e) {
    console.error('Error fetching visit by ID:', e);
    return null;
  }
}

export function saveNewVisit(visitForm) {
  try {
    if (!/^CV\d{4}-\d{6}$/.test(visitForm.patientId || '')) return { success: false, error: 'Select a valid patient before saving a visit.' };
    const existingVisitsData = localStorage.getItem(VISITS_KEY);
    const existingVisits = existingVisitsData ? JSON.parse(existingVisitsData) : [];

    // Generate unique Visit ID
    const visitId = `VIS-${new Date().getFullYear()}-${crypto.randomUUID()}`;

    const newVisitObj = {
      id: visitId,
      patientId: visitForm.patientId,
      doctorId: visitForm.doctorId || '',
      doctorName: visitForm.doctorName || '',
      hospitalName: 'CareVault Multispecialty Hospital',
      date: todayISO(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...visitForm
    };

    const updatedVisits = [newVisitObj, ...existingVisits];
    localStorage.setItem(VISITS_KEY, JSON.stringify(updatedVisits));

    // Update patient counters
    const currentPatient = getPatientProfile(newVisitObj.patientId);
    const hasPrescriptions = visitForm.prescription && visitForm.prescription.some(p => p.medicine.trim() !== '');
    const hasActiveFollowUp = visitForm.followUp && visitForm.followUp.required === 'Yes';

    const updatedPatient = {
      ...currentPatient,
      visitCount: (currentPatient.visitCount || 0) + 1,
      prescriptionCount: hasPrescriptions ? (currentPatient.prescriptionCount || 0) + 1 : (currentPatient.prescriptionCount || 0),
      activeFollowUpCount: hasActiveFollowUp ? (currentPatient.activeFollowUpCount || 0) + 1 : (currentPatient.activeFollowUpCount || 0)
    };

    localStorage.setItem(`${PATIENT_KEY}:${newVisitObj.patientId}`, JSON.stringify(updatedPatient));

    // Clear draft if saved
    clearDraftVisit(newVisitObj.patientId);

    return { success: true, visit: newVisitObj, patient: updatedPatient };
  } catch (e) {
    console.error('Error saving visit:', e);
    return { success: false, error: e.message };
  }
}

export function saveDraftVisit(draftData, patientId) {
  try {
    localStorage.setItem(`${DRAFT_KEY}:${patientId}`, JSON.stringify({
      savedAt: new Date().toISOString(),
      data: draftData
    }));
    return true;
  } catch (e) {
    console.error('Error saving draft:', e);
    return false;
  }
}

export function getDraftVisit(patientId) {
  try {
    const draft = localStorage.getItem(`${DRAFT_KEY}:${patientId}`);
    return draft ? JSON.parse(draft) : null;
  } catch {
    return null;
  }
}

export function clearDraftVisit(patientId) {
  try {
    localStorage.removeItem(`${DRAFT_KEY}:${patientId}`);
  } catch (e) {
    console.error('Error clearing draft:', e);
  }
}
