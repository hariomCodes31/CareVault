// clinicalReviewService.js — CareVault Clinical Review & AI Assistance Service
// Provides structured clinical intake data, completeness calculations,
// red flag detection, lab abnormal value checks, and medication safety interaction checks.

export const CLINICAL_SECTIONS = [
  { id: 'chiefComplaint', title: 'Chief Complaint', category: 'core', required: true },
  { id: 'historyOfPresentIllness', title: 'History of Present Illness (HPI)', category: 'core', required: true },
  { id: 'pastMedicalHistory', title: 'Past Medical History', category: 'history', required: true },
  { id: 'pastSurgicalHistory', title: 'Past Surgical History', category: 'history', required: true },
  { id: 'drugHistory', title: 'Drug History', category: 'medications', required: true },
  { id: 'allergyHistory', title: 'Allergy History', category: 'safety', required: true },
  { id: 'familyHistory', title: 'Family History', category: 'history', required: false },
  { id: 'personalSocialHistory', title: 'Personal / Social History', category: 'lifestyle', required: false },
  { id: 'reviewOfSystems', title: 'Review of Systems (ROS)', category: 'clinical', required: true },
  { id: 'vitals', title: 'Vitals', category: 'vitals', required: true },
  { id: 'previousInvestigations', title: 'Previous Investigations', category: 'investigations', required: false },
  { id: 'currentSymptoms', title: 'Current Symptoms', category: 'symptoms', required: true },
  { id: 'relevantPreviousHistory', title: 'Relevant Previous History', category: 'history', required: false },
];

/**
 * Calculates Clinical Case Completeness percentage and identifies missing sections
 */
export function calculateCaseCompleteness(caseData) {
  if (!caseData) return { percentage: 0, missingCount: 0, checklist: [] };

  const requiredSections = CLINICAL_SECTIONS.filter((s) => s.required);
  let completedCount = 0;
  const missingItems = [];

  const checklist = requiredSections.map((sec) => {
    let isPresent = false;
    const value = caseData[sec.id];

    if (sec.id === 'vitals') {
      isPresent = Boolean(
        value &&
        value.temperature &&
        value.heartRate &&
        value.bloodPressure &&
        value.bloodPressure !== 'Pending' &&
        value.spO2
      );
    } else if (sec.id === 'allergyHistory') {
      isPresent = Boolean(
        value &&
        value.status !== 'unreported' &&
        value.text &&
        !value.text.toLowerCase().includes('not recorded') &&
        !value.text.toLowerCase().includes('pending')
      );
    } else if (sec.id === 'reviewOfSystems') {
      isPresent = Boolean(
        value &&
        value.status !== 'incomplete' &&
        value.text &&
        !value.text.toLowerCase().includes('unverified')
      );
    } else if (Array.isArray(value)) {
      isPresent = value.length > 0;
    } else if (typeof value === 'object' && value !== null) {
      isPresent = Boolean(value.text && value.text.trim().length > 0);
    } else {
      isPresent = Boolean(value && String(value).trim().length > 0);
    }

    if (isPresent) {
      completedCount++;
    } else {
      missingItems.push(sec);
    }

    return {
      id: sec.id,
      title: sec.title,
      isComplete: isPresent,
    };
  });

  const percentage = Math.round((completedCount / requiredSections.length) * 100);

  return {
    percentage,
    completedCount,
    totalRequired: requiredSections.length,
    missingCount: missingItems.length,
    missingItems,
    checklist,
    isFullyComplete: missingItems.length === 0,
  };
}

/**
 * Default Clinical Case Data Model for Rahul Sharma (CV2026-000452)
 */
export function getClinicalReviewData(patientId = 'CV2026-000452') {
  return {
    patient: {
      patientId: 'CV2026-000452',
      name: 'Rahul Sharma',
      age: 38,
      gender: 'Male',
      contact: '+91 98765 43210',
      bloodGroup: 'B+',
      visitType: 'General Consultation / Outpatient',
      visitDate: 'Sept 12, 2026',
      intakeTime: '09:45 AM IST',
      attendingPhysician: 'Dr. Ananya Sharma, MD (Reg #MCI-2024-8842)',
    },

    // 13 Structured Clinical Sections with Sources & Confidence
    summarySections: {
      chiefComplaint: {
        title: 'Chief Complaint',
        text: 'Fever for 3 days (highest recorded 101.4 °F) associated with mild frontal headache, body ache, and general weakness.',
        source: 'patient-voice',
        sourceLabel: 'Patient Voice Input',
        confidence: 'High confidence (98%)',
        isComplete: true,
      },
      historyOfPresentIllness: {
        title: 'History of Present Illness (HPI)',
        text: 'Patient reports sudden onset of moderate to high-grade fever 3 days ago, peaking in the evening hours with mild chills. Accompanying dull aching frontal headache partially relieved by OTC paracetamol. Mild photophobia reported; no persistent neck rigidity. No history of vomiting, rash, or hemoptysis.',
        source: 'patient-voice',
        sourceLabel: 'Patient Voice & Intake Form',
        confidence: 'High confidence (95%)',
        isComplete: true,
      },
      pastMedicalHistory: {
        title: 'Past Medical History',
        text: 'Known history of mild seasonal allergic rhinitis. No reported hypertension, diabetes mellitus, asthma, tuberculosis, or coronary artery disease.',
        source: 'previous-record',
        sourceLabel: 'CareVault EHR (2025 Visit)',
        confidence: 'High confidence (99%)',
        isComplete: true,
      },
      pastSurgicalHistory: {
        title: 'Past Surgical History',
        text: 'Elective open appendectomy performed in October 2019 at Apollo Hospital, New Delhi. Uneventful post-operative recovery with no chronic sequelae.',
        source: 'previous-record',
        sourceLabel: 'Hospital Discharge Summary (2019)',
        confidence: 'High confidence (96%)',
        isComplete: true,
      },
      drugHistory: {
        title: 'Drug History',
        text: 'Current: Tab Paracetamol 650mg SOS (taken 2 doses in last 24 hours). Multivitamin capsule once daily for general wellbeing. No regular prescription antihypertensives or immunosuppressants.',
        source: 'patient-voice',
        sourceLabel: 'Patient Reported & Prescription OCR',
        confidence: 'High confidence (94%)',
        isComplete: true,
      },
      allergyHistory: {
        title: 'Allergy History',
        text: '⚠ Allergy history not fully recorded. Patient verbally mentioned sensitivity to cold dust, but drug allergies (penicillin, sulfa drugs, NSAIDs) have not been formally confirmed.',
        source: 'patient-voice',
        sourceLabel: 'Intake Note',
        confidence: 'Medium confidence (70%)',
        isComplete: false,
        status: 'unreported',
      },
      familyHistory: {
        title: 'Family History',
        text: 'Father has Type 2 Diabetes Mellitus (diagnosed at age 52, on oral hypoglycemics). Mother has essential hypertension. No known family history of early coronary disease or autoimmune disorders.',
        source: 'previous-record',
        sourceLabel: 'Patient EHR Profile',
        confidence: 'High confidence (92%)',
        isComplete: true,
      },
      personalSocialHistory: {
        title: 'Personal / Social History',
        text: 'Software consultant. Non-smoker, occasional social alcohol consumption (<2 units/month). Sedentary desk occupation. Regular diet, normal sleep cycle prior to current fever episode.',
        source: 'patient-intake',
        sourceLabel: 'Patient Registration Form',
        confidence: 'High confidence (96%)',
        isComplete: true,
      },
      reviewOfSystems: {
        title: 'Review of Systems (ROS)',
        text: '⚠ Review of systems incomplete. Constitutional: Positive for fever, malaise, anorexia. HEENT: Positive for dull frontal headache; no sore throat or ear discharge. Respiratory & Cardiovascular: Patient denied dyspnea, but formal chest auscultation is unverified.',
        source: 'ai-nlp',
        sourceLabel: 'AI Synthesis (Partial)',
        confidence: 'Medium confidence (76%)',
        isComplete: false,
        status: 'incomplete',
      },
      vitals: {
        title: 'Vitals',
        text: 'Temperature: 101.4 °F (Febrile) | Heart Rate: 98 bpm (Mild sinus tachycardia) | Blood Pressure: 120/80 mmHg (Normal) | SpO2: 98% on room air | Respiratory Rate: 18 /min.',
        source: 'device-vitals',
        sourceLabel: 'Nurse Station IoT Vitals Monitor',
        confidence: 'High confidence (99%)',
        isComplete: true,
        data: {
          temperature: '101.4 °F',
          heartRate: '98 bpm',
          bloodPressure: '120/80 mmHg',
          spO2: '98%',
          respiratoryRate: '18 /min',
        },
      },
      previousInvestigations: {
        title: 'Previous Investigations',
        text: 'Complete Blood Count (CBC) from Dr. Lal PathLabs (Jan 11, 2026): Hb 10.2 g/dL (mild microcytic anemia), WBC 8,400 /µL, Platelets 185,000 /µL. Fasting Blood Sugar: 128 mg/dL.',
        source: 'document-ocr',
        sourceLabel: 'Uploaded CBC Lab Report (Jan 2026)',
        confidence: 'High confidence (97%)',
        isComplete: true,
      },
      currentSymptoms: {
        title: 'Current Symptoms',
        text: '1. High-grade fever for 3 days with evening spikes.\n2. Mild-to-moderate dull frontal headache.\n3. Generalized myalgia and fatigue.\n4. Mild anorexia without nausea or vomiting.',
        source: 'patient-voice',
        sourceLabel: 'Patient Voice Intake',
        confidence: 'High confidence (98%)',
        isComplete: true,
      },
      relevantPreviousHistory: {
        title: 'Relevant Previous History',
        text: 'Previous episode of viral pyrexia in July 2024 resolved completely with symptomatic antipyretics and hydration within 5 days. No history of recurrent urinary tract infections or dengue fever.',
        source: 'previous-record',
        sourceLabel: 'Hospital EHR Historical Logs',
        confidence: 'High confidence (93%)',
        isComplete: true,
      },
    },

    // Clinical Attention & Red Flags
    clinicalAttention: [
      {
        id: 'rf-1',
        title: 'Persistent High-Grade Fever with Headache',
        priority: 'HIGH',
        priorityLabel: 'Requires Physician Review',
        description: 'Patient reports persistent fever for 3 days (101.4 °F) with dull headache and generalized weakness. No classical signs of meningism, but requires clinical review to rule out acute dengue, malaria, or typhoid pyrexia.',
        action: 'Perform physical examination, check for neck stiffness, and consider baseline NS1 antigen & blood smear for malarial parasite.',
        source: 'Clinical Rule Engine & Voice Intake',
      },
      {
        id: 'rf-2',
        title: 'Mild Microcytic Anemia & Borderline Fasting Hyperglycemia',
        priority: 'MEDIUM',
        priorityLabel: 'Clinical Follow-up Recommended',
        description: 'Uploaded lab report shows Hemoglobin 10.2 g/dL (reference 13.5 - 17.5 g/dL) and Fasting Blood Sugar 128 mg/dL. Non-urgent, but requires nutritional and HbA1c review once acute febrile illness subsides.',
        action: 'Review dietary iron intake and schedule fasting HbA1c after fever recovery.',
        source: 'OCR Lab Report Extraction',
      },
    ],

    // Missing Information Detection
    missingInformation: [
      {
        id: 'missing-allergy',
        field: 'Allergy History',
        status: 'Unreported',
        description: 'Drug allergy history (penicillin, sulfa drugs, NSAIDs) is not formally recorded.',
        suggestedQuestion: 'Have you ever had an allergic reaction, hives, swelling, or breathing issues after taking penicillin, antibiotics, or pain medicines?',
      },
      {
        id: 'missing-ros',
        field: 'Review of Systems',
        status: 'Incomplete',
        description: 'Cardiovascular and respiratory symptoms have not been cross-verified with auscultation.',
        suggestedQuestion: 'Are you currently experiencing any chest tightness, shortness of breath on exertion, or sudden cough?',
      },
    ],

    // Lab / Abnormal Value Insights
    labInsights: [
      {
        id: 'lab-hb',
        test: 'Hemoglobin (Hb)',
        value: '10.2',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5 g/dL',
        status: 'abnormal',
        statusLabel: '⚠ Potentially abnormal',
        interpretation: 'Mild microcytic anemia. Possible nutritional iron deficiency.',
        documentRef: 'CBC_Report_Jan2026.pdf',
      },
      {
        id: 'lab-wbc',
        test: 'Total Leukocyte Count (WBC)',
        value: '8,400',
        unit: '/µL',
        referenceRange: '4,000 - 11,000 /µL',
        status: 'normal',
        statusLabel: '✓ Within reported range',
        interpretation: 'Normal leukocyte response. No marked leukocytosis.',
        documentRef: 'CBC_Report_Jan2026.pdf',
      },
      {
        id: 'lab-plt',
        test: 'Platelet Count',
        value: '185,000',
        unit: '/µL',
        referenceRange: '150,000 - 450,000 /µL',
        status: 'normal',
        statusLabel: '✓ Within reported range',
        interpretation: 'Adequate platelet reserve. Monitor if fever persists.',
        documentRef: 'CBC_Report_Jan2026.pdf',
      },
      {
        id: 'lab-fbs',
        test: 'Fasting Blood Sugar (FBS)',
        value: '128',
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'abnormal',
        statusLabel: '⚠ Potentially abnormal',
        interpretation: 'Elevated fasting glucose. Transient stress hyperglycemia vs early impaired fasting glucose.',
        documentRef: 'Biochemistry_Panel_Jan2026.pdf',
      },
    ],

    // Medication Insights & Interaction Checking
    medicationInsights: [
      {
        id: 'med-1',
        medicine: 'Paracetamol (Acetaminophen)',
        dosage: '650 mg',
        frequency: 'SOS (as needed)',
        duration: 'Last 24 hours (2 doses taken)',
        source: 'Patient Reported',
        status: 'Active',
      },
      {
        id: 'med-2',
        medicine: 'Multivitamin & Zinc Capsule',
        dosage: '1 Cap',
        frequency: 'OD (Once Daily)',
        duration: 'Ongoing (1 month)',
        source: 'Previous Prescription Slip',
        status: 'Active',
      },
    ],

    medicationInteractions: [
      {
        id: 'warn-1',
        title: 'Potential Medication Interaction / Cumulative Dosage Warning',
        severity: 'REVIEW_RECOMMENDED',
        severityLabel: 'Review Recommended',
        description: 'Patient is self-administering Paracetamol 650mg. Ensure any newly prescribed cough/cold formulations do not contain hidden acetaminophen to prevent exceeding the 4g/day hepatic toxicity threshold.',
        action: 'Educate patient on maximum daily paracetamol dosing and verify combination remedies.',
      },
    ],

    // Previous Visit Comparison
    visitComparison: {
      previousDate: 'Aug 14, 2025 (4 weeks ago)',
      currentDate: 'Sept 12, 2026 (Today)',
      comparisons: [
        {
          parameter: 'Symptoms',
          previous: 'Routine health checkup. No acute fever, cough, or pain reported.',
          current: 'Acute fever for 3 days with frontal headache and generalized malaise.',
          hasChanged: true,
          badge: 'New Acute Symptoms',
        },
        {
          parameter: 'Body Temperature',
          previous: '98.4 °F (Afebrile)',
          current: '101.4 °F (Febrile, 3-day duration)',
          hasChanged: true,
          badge: 'Significant Elevation',
        },
        {
          parameter: 'Blood Pressure',
          previous: '118/76 mmHg',
          current: '120/80 mmHg',
          hasChanged: false,
          badge: 'Stable Normotensive',
        },
        {
          parameter: 'Active Medications',
          previous: 'Multivitamin 1 capsule daily.',
          current: 'Added Paracetamol 650mg SOS for fever control.',
          hasChanged: true,
          badge: 'Added Antipyretic',
        },
        {
          parameter: 'Pending Investigations',
          previous: 'Annual executive blood profile completed.',
          current: 'Awaiting acute fever workup (Dengue NS1 / Peripheral Smear).',
          hasChanged: true,
          badge: 'Workup Recommended',
        },
      ],
    },

    // Uploaded Documents & OCR Insights
    documentInsights: [
      {
        id: 'doc-cbc',
        name: 'Complete Blood Count (CBC) Panel',
        type: 'Lab Report',
        date: 'Jan 11, 2026',
        facility: 'Dr. Lal PathLabs, New Delhi',
        ocrStatus: 'Completed (100%)',
        extractedCount: '5 parameters extracted',
        abnormalCount: '1 potentially abnormal value',
        rawText: `DR. LAL PATHLABS - AUTOMATED HEMATOLOGY REPORT
Patient: Rahul Sharma | Age: 38Y / M | Ref: Dr. R. K. Verma
Sample Date: 11-Jan-2026 08:30 AM | Status: Final Verified

TEST RESULTS:
- HEMOGLOBIN (Cyanmethemoglobin): 10.2 g/dL (Reference: 13.5 - 17.5) [LOW]
- TOTAL LEUKOCYTE COUNT: 8,400 /cumm (Reference: 4,000 - 11,000) [NORMAL]
- DIFFERENTIAL COUNT:
  * Neutrophils: 64% (40 - 75)
  * Lymphocytes: 28% (20 - 45)
  * Monocytes: 5% (2 - 10)
  * Eosinophils: 3% (1 - 6)
- PLATELET COUNT: 185,000 /cumm (Reference: 150,000 - 450,000) [NORMAL]
- PCV (Hematocrit): 32.4% (Reference: 40 - 50) [LOW]

Remarks: Red blood cells show mild anisopoikilocytosis and hypochromia.
Report signed digitally by Consultant Pathologist.`,
      },
      {
        id: 'doc-rx',
        name: 'OPD Prescription Slip',
        type: 'Prescription',
        date: 'Jan 10, 2026',
        facility: 'Max Super Specialty Hospital',
        ocrStatus: 'Completed (96%)',
        extractedCount: '2 medications extracted',
        abnormalCount: '0 warnings',
        rawText: `MAX HEALTHCARE OPD PRESCRIPTION
Date: 10/01/2026 | Dr. R. K. Verma, MD (Internal Medicine)
Patient: Rahul Sharma, 38 M

Rx:
1. Tab. Paracetamol 650 mg - 1 tab SOS for temp > 100°F (Max 3 tabs/day)
2. Cap. Becosules Z - 1 cap daily after breakfast x 30 days
3. Oral Rehydration Salts (ORS) - 1 sachet in 1 liter boiled water daily

Advice:
Drink plenty of fluids (coconut water, clear soups).
If fever persists beyond 72 hours, review with CBC and Dengue Serology.`,
      },
      {
        id: 'doc-discharge',
        name: 'Discharge Summary (Appendectomy)',
        type: 'Discharge Summary',
        date: 'Oct 22, 2019',
        facility: 'Apollo Hospital, New Delhi',
        ocrStatus: 'Completed (98%)',
        extractedCount: 'Surgical diagnosis & discharge state',
        abnormalCount: '0 active concerns',
        rawText: `APOLLO HOSPITALS - DISCHARGE SUMMARY
IPD No: AP-2019-77491 | Admission Date: 18-Oct-2019 | Discharge: 22-Oct-2019
Diagnosis: Acute Catarrhal Appendicitis
Procedure: Open Appendectomy under General Anesthesia on 19-Oct-2019
Operative Findings: Inflamed retrocecal appendix, no perforation or gangrene.
Course in Hospital: Uneventful recovery. Sutures removed on post-op day 8.
Discharge Condition: Stable, wound healed well.`,
      },
    ],

    // Original Patient Intake Voice Transcript
    originalTranscript: `Language Detected: Mixed Hindi-English (Hinglish)
Audio Length: 24 seconds | Quality: High SNR
Session ID: AUD-2026-0912-9912

Patient Audio Transcript:
"Doctor sahab, mujhe pichhle teen din se kaafi tez fever aa raha hai. Kal shaam ko temperature 101.4 measure kiya tha. Iske saath sar mein aage ki taraf thoda dull headache bana hua hai aur poori body mein thakaan aur weakness lag rahi hai. Maine kal do baar Paracetamol 650mg li thi jisse thoda time aaram milta hai par bukhar fir chad jata hai. Pehle 2019 mein mera appendix ka operation hua tha par uske baad koi badi takleef nahi thi."`,

    // Original Intake Answers
    originalPatientAnswers: [
      { question: 'What is the main reason for your visit today?', answer: 'Fever for 3 days with mild headache and body weakness.' },
      { question: 'When did your fever start and how severe is it?', answer: 'Started 3 days ago, reaching up to 101.4 °F in the evening.' },
      { question: 'Have you taken any medicines so far?', answer: 'Took Paracetamol 650mg twice in the last 24 hours.' },
      { question: 'Do you have any cough, sore throat, or breathing issues?', answer: 'No cough, no throat pain, breathing is normal.' },
      { question: 'Any known medical conditions or past surgeries?', answer: 'Had an appendectomy in 2019; no chronic diseases.' },
    ],
  };
}
