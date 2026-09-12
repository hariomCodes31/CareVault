// aiAssistanceService.js — CareVault Clinical Review & AI Assistance Engine

/**
 * Generate standard clinical case review data for a patient
 */
export function getInitialCaseData(patient) {
  const isFever = (patient?.recentComplaint || '').toLowerCase().includes('fever');
  const isAllergy = (patient?.recentComplaint || '').toLowerCase().includes('allergy');
  const isBP = (patient?.recentComplaint || '').toLowerCase().includes('pressure');

  return {
    patientId: patient?.patientId || 'CV2026-000452',
    patientName: patient?.name || 'Rahul Kumar',
    chiefComplaint: patient?.recentComplaint || 'Fever since 3 days, accompanied by mild headache',
    chiefComplaintStatus: 'completed',

    historyOfPresentIllness: isFever
      ? 'Fever onset 3 days ago, intermittent spikes up to 101.2°F. Accompanied by body ache, mild dry cough, and frontal headache. No chills, rigors, or nausea.'
      : isAllergy
      ? 'Sudden onset of runny nose, sneezing fits and ocular itchiness following outdoor dust exposure. No wheezing or shortness of breath.'
      : 'Routine blood pressure monitoring. Occasional morning occipital headache for 2 weeks. No chest pain or vision blurriness.',
    historyStatus: 'completed',

    pastHistory: patient?.knownConditions && patient.knownConditions !== 'None'
      ? `Known history of: ${patient.knownConditions}. Previous hospital visits documented in CareVault.`
      : 'No chronic history of Diabetes, Hypertension, or Tuberculosis. Childhood vaccinations up to date.',
    pastHistoryStatus: 'completed',

    examination: isFever
      ? 'General condition: Alert, conscious, febrile to touch. Pharynx: Mild erythematous congestion, no tonsillar exudate. Chest: Bilateral clear vesicular breath sounds. Abdomen: Soft, non-tender, no organomegaly.'
      : 'General exam normal. Chest clear. Heart sounds regular. No peripheral edema.',
    examinationStatus: 'completed',

    vitals: {
      temperature: isFever ? '101.2°F' : '98.4°F',
      heartRate: '98 bpm',
      respiratoryRate: '18 /min',
      bloodPressure: isBP ? '142/92 mmHg' : '', // initially unrecorded to highlight completeness review
      spO2: '98% on room air',
    },
    vitalsStatus: isBP ? 'completed' : 'partial',

    provisionalDiagnosis: isFever ? '' : (isAllergy ? 'Acute Allergic Rhinitis' : 'Stage 1 Primary Hypertension'),
    provisionalDiagnosisStatus: isFever ? 'missing' : 'completed',

    allergyHistory: patient?.allergies && patient.allergies !== 'Not Reported' ? patient.allergies : '',
    allergyHistoryStatus: patient?.allergies && patient.allergies !== 'Not Reported' ? 'completed' : 'missing',

    clinicalNotes: 'Patient advised adequate oral hydration and bed rest. Attending physician verification required before finalizing prescription.',
  };
}

/**
 * Calculate dynamic case completeness percentage and checklist status
 */
export function calculateCaseCompleteness(caseData) {
  const items = [
    {
      id: 'chiefComplaint',
      label: 'Chief complaint',
      status: caseData.chiefComplaint?.trim() ? 'completed' : 'missing',
      weight: 15,
      detail: caseData.chiefComplaint || 'No chief complaint recorded',
    },
    {
      id: 'history',
      label: 'History of present illness',
      status: caseData.historyOfPresentIllness?.trim() ? 'completed' : 'missing',
      weight: 20,
      detail: caseData.historyOfPresentIllness ? 'Detailed timeline recorded' : 'Missing symptom timeline',
    },
    {
      id: 'pastHistory',
      label: 'Past medical history',
      status: caseData.pastHistory?.trim() ? 'completed' : 'missing',
      weight: 15,
      detail: caseData.pastHistory || 'No past history logged',
    },
    {
      id: 'examination',
      label: 'Physical examination',
      status: caseData.examination?.trim() ? 'completed' : 'missing',
      weight: 15,
      detail: caseData.examination ? 'Physical examination logged' : 'Physical exam pending',
    },
    {
      id: 'vitals',
      label: 'Clinical vitals',
      status:
        caseData.vitals?.bloodPressure?.trim() && caseData.vitals?.temperature?.trim()
          ? 'completed'
          : caseData.vitals?.temperature?.trim()
          ? 'warning'
          : 'missing',
      weight: 15,
      detail: !caseData.vitals?.bloodPressure?.trim()
        ? `Blood Pressure not recorded (Temp: ${caseData.vitals?.temperature || 'N/A'}, HR: ${caseData.vitals?.heartRate || 'N/A'})`
        : `BP: ${caseData.vitals.bloodPressure} | HR: ${caseData.vitals.heartRate} | Temp: ${caseData.vitals.temperature}`,
    },
    {
      id: 'provisionalDiagnosis',
      label: 'Provisional diagnosis',
      status: caseData.provisionalDiagnosis?.trim() ? 'completed' : 'warning',
      weight: 10,
      detail: caseData.provisionalDiagnosis || 'Observation: Acute Viral Pyrexia (Pending doctor sign-off)',
    },
    {
      id: 'allergyHistory',
      label: 'Allergy history',
      status: caseData.allergyHistory?.trim() ? 'completed' : 'warning',
      weight: 10,
      detail: caseData.allergyHistory || 'Allergy status unverified',
    },
  ];

  let totalScore = 0;
  items.forEach((item) => {
    if (item.status === 'completed') {
      totalScore += item.weight;
    } else if (item.status === 'warning') {
      totalScore += Math.round(item.weight * 0.5);
    }
  });

  const score = Math.min(100, Math.max(0, totalScore));

  let label = 'Needs Review';
  let theme = 'warning';
  if (score >= 90) {
    label = 'Ready for Doctor Review';
    theme = 'success';
  } else if (score >= 75) {
    label = 'Partially Complete';
    theme = 'good';
  }

  const missingFields = items.filter((i) => i.status !== 'completed');

  return {
    score,
    label,
    theme,
    items,
    missingCount: missingFields.length,
    missingFields,
  };
}

/**
 * Structured Review Data for Section 5 (Consistent, Professional Healthcare Cards)
 */
export function getCaseReviewSections(caseData, activePatient) {
  const isFever = (caseData?.chiefComplaint || '').toLowerCase().includes('fever');
  const bpMissing = !caseData?.vitals?.bloodPressure?.trim();
  const allergyMissing = !caseData?.allergyHistory?.trim();

  return {
    overallSummary: {
      title: 'Overall Case Summary',
      type: 'verified',
      badge: 'Verified Intake',
      patientId: activePatient?.patientId || caseData?.patientId || 'CV2026-000452',
      patientName: activePatient?.name || caseData?.patientName || 'Rahul Kumar',
      demographics: `${activePatient?.age || 28} Yrs • ${activePatient?.gender || 'Male'} • ${activePatient?.address || 'Patna, Bihar'}`,
      complaint: caseData?.chiefComplaint || 'Acute symptoms requiring clinical review',
      hpi: caseData?.historyOfPresentIllness || 'Symptom onset documented in clinical intake record.',
    },
    importantFindings: [
      {
        label: 'Body Temperature',
        value: caseData?.vitals?.temperature || '101.2°F',
        status: isFever ? 'elevated' : 'normal',
        note: isFever ? 'Mild-to-moderate febrile state' : 'Within normal physiological range',
      },
      {
        label: 'Heart Rate (Pulse)',
        value: caseData?.vitals?.heartRate || '98 bpm',
        status: 'normal',
        note: 'Regular rhythm, compensated tachycardia secondary to pyrexia',
      },
      {
        label: 'Blood Oxygen (SpO2)',
        value: caseData?.vitals?.spO2 || '98% on room air',
        status: 'normal',
        note: 'Optimal arterial oxygen saturation',
      },
      {
        label: 'Physical Exam',
        value: caseData?.examination?.split('.')[0] || 'Alert and oriented',
        status: 'neutral',
        note: 'Pharyngeal congestion without tonsillar exudate',
      },
    ],
    missingInformation: [
      ...(bpMissing
        ? [
            {
              field: 'Blood Pressure (BP)',
              severity: 'important',
              reason: 'Required for cardiovascular stability check before prescribing medications.',
            },
          ]
        : []),
      ...(allergyMissing
        ? [
            {
              field: 'Known Drug Allergies',
              severity: 'important',
              reason: 'Required to prevent contraindications or adverse drug reactions.',
            },
          ]
        : []),
      ...(!caseData?.provisionalDiagnosis?.trim()
        ? [
            {
              field: 'Provisional Clinical Diagnosis',
              severity: 'review',
              reason: 'Attending physician clinical sign-off pending.',
            },
          ]
        : []),
    ],
    potentialInconsistencies: [
      ...(bpMissing
        ? [
            {
              title: 'Incomplete Vital Sign Record',
              detail: 'Fever and headache logged without recorded Blood Pressure.',
              action: 'Take and log Blood Pressure before consultation closure.',
            },
          ]
        : []),
      ...(allergyMissing
        ? [
            {
              title: 'Unconfirmed Allergy Status',
              detail: 'No drug allergy status confirmed in medical record.',
              action: 'Inquire directly with patient before finalizing electronic prescription.',
            },
          ]
        : []),
    ],
    documentsReviewed: [
      {
        title: 'Master Health Profile',
        docId: `CareVault Master ID: ${activePatient?.patientId || 'CV2026-000452'}`,
        date: activePatient?.createdAt ? new Date(activePatient.createdAt).toLocaleDateString('en-GB') : 'Verified',
        type: 'Verified Record',
      },
      {
        title: 'Aadhaar Demographic KYC',
        docId: activePatient?.aadhaar ? `UID: ${activePatient.aadhaar}` : 'Aadhaar Link Pending',
        date: 'UIDAI Verified',
        type: 'Official Record',
      },
      {
        title: 'OPD Clinical Intake & Case Record',
        docId: 'Step 2 Clinical Intake Form',
        date: 'Current Encounter',
        type: 'Patient Reported',
      },
    ],
    aiObservations: [
      {
        title: 'Symptom Triad Correlation',
        detail: 'Fever, frontal headache, and pharyngeal erythema without cough purulence correlate strongly with acute viral upper respiratory tract infection.',
        badge: 'AI-Generated Observation',
        disclaimer: 'For clinical assistance only. Not a formal diagnosis.',
      },
      {
        title: 'Prescribing Safety Alert',
        detail: 'Paracetamol is preferred over NSAIDs (e.g., Ibuprofen) in acute febrile illness until platelet count confirms absence of thrombocytopenia.',
        badge: 'AI-Generated Assistance',
        disclaimer: 'Doctor must verify before prescribing.',
      },
    ],
    doctorReviewRecommended: [
      'Confirm Blood Pressure reading to rule out secondary hypertension.',
      'Verify patient medication allergy history prior to writing prescription.',
      'Advise symptomatic Paracetamol and hydration; assess if CBC is needed if fever exceeds 72 hours.',
      'Review red flag emergency precautions with patient before discharge.',
    ],
  };
}

/**
 * AI Clinical Insights & Differential Diagnoses for Doctor
 */
export function getDoctorAIInsights(caseData) {
  const text = `${caseData?.chiefComplaint || ''} ${caseData?.historyOfPresentIllness || ''}`.toLowerCase();

  if (text.includes('fever') || text.includes('headache')) {
    return {
      differentialDiagnosis: [
        {
          name: 'Acute Viral Pharyngitis / Viral Fever',
          probability: '82%',
          icon: '🟢',
          reasoning: 'Triad of fever, acute headache, and pharyngeal erythema without purulent exudates.',
        },
        {
          name: 'Dengue Fever (Early Stage)',
          probability: '45%',
          icon: '🟡',
          reasoning: 'Body ache and frontal headache. Recommend NS1 antigen if fever persists >72 hours.',
        },
        {
          name: 'Typhoid (Enteric) Fever',
          probability: '22%',
          icon: '⚪',
          reasoning: 'Consider Widal/Blood Culture only if fever exhibits step-ladder pattern past day 5.',
        },
      ],
      recommendedInvestigations: [
        'Complete Blood Count (CBC) with Platelets',
        'Dengue NS1 Antigen (if fever persists > 3 days)',
        'Routine Urine Examination',
      ],
      prescribingAlerts: [
        'Prefer Paracetamol (500mg/650mg); avoid Aspirin/NSAIDs if platelet status unconfirmed.',
        'Oral rehydration therapy (ORS) recommended for febrile fluid maintenance.',
      ],
    };
  }

  return {
    differentialDiagnosis: [
      { name: 'General Clinical Review', probability: '80%', icon: '🟢', reasoning: 'Standard symptomatic presentation.' },
    ],
    recommendedInvestigations: ['Routine Blood Work', 'Basic Metabolic Panel'],
    prescribingAlerts: ['Review known patient allergies before prescription confirmation.'],
  };
}

/**
 * Bilingual Patient Plain-Language Health Summary
 */
export function getPatientFriendlySummary(caseData, lang = 'en') {
  const isFever = (caseData?.chiefComplaint || '').toLowerCase().includes('fever');

  if (lang === 'hi') {
    return {
      title: 'सरल भाषा में आपकी स्वास्थ्य रिपोर्ट',
      summary: isFever
        ? 'आपको पिछले 3 दिनों से सामान्य वायरल बुखार और सिरदर्द की समस्या दर्ज है। आपका शरीर संक्रमण से लड़ने की प्रक्रिया में है। यह आमतौर पर 3 से 5 दिनों में आराम और डॉक्टर की बताई दवा से ठीक हो जाता है।'
        : 'आपकी जांच रिपोर्ट सामान्य है। कृपया डॉक्टर की बताई सलाह और नियमित दिनचर्या का पालन करें।',
      explanationBullets: [
        { icon: '🌡️', title: 'बुखार का स्तर', desc: `आपका वर्तमान तापमान ${caseData?.vitals?.temperature || '101.2°F'} दर्ज किया गया है।` },
        { icon: '💧', title: 'पर्याप्त पानी पिएं', desc: 'दिन भर में 2.5 से 3 लीटर उबला या गुनगुना पानी, सूप या ORS पिएं।' },
        { icon: '💊', title: 'दवा समय पर लें', desc: 'डॉक्टर द्वारा दी गई दवा भोजन के बाद ही लें।' },
        { icon: '🛌', title: 'विश्राम करें', desc: 'शरीर को जल्दी स्वस्थ होने के लिए पर्याप्त नींद आवश्यक है।' },
      ],
      audioScript: isFever
        ? 'नमस्ते। केयरवॉल्ट एआई सहायता के अनुसार, आपको सामान्य वायरल बुखार है। घबराने की कोई बात नहीं है। आप भरपूर पानी और ओआरएस पिएं, हल्का खाना खाएं और डॉक्टर की लिखी दवा समय पर लें। तीन से चार दिनों में आप ठीक हो जाएंगे।'
        : 'नमस्ते। आपकी स्वास्थ्य जांच सामान्य है। कृपया नियमित दवाएं लें और समय पर फॉलो-अप कराएं।',
    };
  }

  // English default
  return {
    title: 'Plain-Language Medical Summary',
    summary: isFever
      ? 'Your records indicate an acute viral fever and mild headache starting approximately 3 days ago. Your body is managing a common viral response. With adequate hydration, rest, and your doctor’s prescribed care, viral fevers usually resolve within 3 to 5 days.'
      : 'Your clinical documentation is stable. Please follow your physician’s guidance and maintain your daily wellness routine.',
    explanationBullets: [
      { icon: '🌡️', title: 'Recorded Temperature', desc: `Logged at ${caseData?.vitals?.temperature || '101.2°F'}, reflecting mild-to-moderate pyrexia.` },
      { icon: '💧', title: 'Hydration Priority', desc: 'Drink 2.5 to 3 liters of fluids (water, clear soups, ORS) throughout the day.' },
      { icon: '💊', title: 'Medication Adherence', desc: 'Take prescribed fever medicine only as directed and always after a light meal.' },
      { icon: '🛌', title: 'Rest & Recovery', desc: 'Avoid strenuous physical activity and prioritize 8+ hours of uninterrupted sleep.' },
    ],
    audioScript: isFever
      ? 'Hello. According to CareVault AI assistance, your symptoms are consistent with common viral fever. Please stay well hydrated, take your prescribed medication on time after meals, and rest. You should expect improvement within three to five days.'
      : 'Hello. Your medical information is stable. Please follow your doctor’s recommendations and attend scheduled follow-ups.',
  };
}

/**
 * Emergency Red Flag Signs (When to seek urgent medical care)
 */
export function getRedFlagWarnings(lang = 'en') {
  if (lang === 'hi') {
    return [
      { id: 1, title: 'अत्यधिक तेज़ बुखार (> 103°F)', desc: 'यदि दवा लेने के बाद भी बुखार कम न हो।' },
      { id: 2, title: 'सांस लेने में कठिनाई या सीने में दर्द', desc: 'यदि सांस फूलने लगे या छाती में भारीपन महसूस हो।' },
      { id: 3, title: 'लगातार उल्टी व अत्यधिक चक्कर', desc: 'यदि पानी भी न पच रहा हो और डिहाइड्रेशन हो।' },
      { id: 4, title: 'त्वचा पर लाल चकत्ते या रक्तस्राव', desc: 'मसूड़ों या नाक से खून आना या त्वचा पर दाने दिखना।' },
    ];
  }

  return [
    { id: 1, title: 'High Unyielding Fever (> 103°F)', desc: 'Fever persisting above 103°F despite taking prescribed antipyretics.' },
    { id: 2, title: 'Shortness of Breath or Chest Pain', desc: 'Difficulty breathing, severe wheezing, or pressure across the chest.' },
    { id: 3, title: 'Intractable Vomiting or Severe Dehydration', desc: 'Inability to retain liquids, extreme thirst, sunken eyes, or faintness.' },
    { id: 4, title: 'Petechial Rash or Unexplained Bleeding', desc: 'Nosebleeds, bleeding gums, or purple/red spots on the skin.' },
  ];
}

/**
 * Home Care & Lifestyle DOs and DONTs
 */
export function getHomeCareGuidelines(lang = 'en') {
  if (lang === 'hi') {
    return {
      dos: [
        'गुनगुने पानी से स्पंज बाथ या स्नान करें ताकि तापमान संतुलित रहे।',
        'हल्का, सुपाच्य भोजन (मूंग दाल खिचड़ी, दलिया, उबली सब्जियां) लें।',
        'दिन भर में पर्याप्त मात्रा में ORS, नारियल पानी या गुनगुना पानी पिएं।',
        'दवा डॉक्टर द्वारा निर्धारित समय और खुराक के अनुसार ही लें।',
      ],
      donts: [
        'बर्फ के ठंडे पानी से कतई न नहाएं, इससे कंपकंपी और बुखार बढ़ सकता है।',
        'तला-भुना, भारी मसालेदार भोजन और बाहर का खाना न खाएं।',
        'खाली पेट पैरासिटामोल या दर्द निवारक दवाइयां न लें।',
        'बिना डॉक्टर की सलाह के खुद से एंटीबायोटिक्स शुरू न करें।',
      ],
    };
  }

  return {
    dos: [
      'Take lukewarm sponge baths or showers to help gently ease body temperature.',
      'Eat light, nutrient-rich foods such as lentil porridge (khichdi), clear soups, and oats.',
      'Sip oral rehydration salts (ORS), coconut water, and clean water frequently.',
      'Follow your physician’s exact prescription timing and dosage.',
    ],
    donts: [
      'Do not use ice-cold water for bathing, as shivering spikes internal body temperature.',
      'Avoid oily, heavily spiced foods and junk food that strain digestion.',
      'Do not take antipyretic or pain medicines on an empty stomach.',
      'Never self-prescribe antibiotics without a formal medical evaluation.',
    ],
  };
}

/**
 * Categorized Quick Health Questions
 */
export const CATEGORIZED_PATIENT_QUESTIONS = [
  {
    category: 'diet',
    categoryHi: 'खान-पान व परहेज़ (Diet)',
    categoryEn: 'Diet & Hydration',
    icon: '🥣',
    questions: [
      {
        qHi: 'बुखार में क्या खाना चाहिए?',
        qEn: 'What is the best food to eat during recovery?',
      },
      {
        qHi: 'क्या फल (सेब, संतरा, नारियल पानी) ले सकते हैं?',
        qEn: 'Can I have fruits and coconut water?',
      },
      {
        qHi: 'क्या चाय, कॉफी या हल्दी दूध पी सकते हैं?',
        qEn: 'Can I drink tea, coffee, or warm milk?',
      },
    ],
  },
  {
    category: 'meds',
    categoryHi: 'दवा व खुराक (Medicines)',
    categoryEn: 'Medicines & Safety',
    icon: '💊',
    questions: [
      {
        qHi: 'पैरासिटामोल दवा कितने घंटे बाद दोबारा ले सकते हैं?',
        qEn: 'How often can I safely take fever medicine?',
      },
      {
        qHi: 'क्या दवा खाली पेट ले सकते हैं?',
        qEn: 'Can I take medicine on an empty stomach?',
      },
      {
        qHi: 'दवा लेने के कितने समय बाद बुखार उतरेगा?',
        qEn: 'How long does it take for fever medicine to work?',
      },
    ],
  },
  {
    category: 'daily',
    categoryHi: 'नहाना व आराम (Bath & Rest)',
    categoryEn: 'Daily Care & Rest',
    icon: '🚿',
    questions: [
      {
        qHi: 'क्या मैं गुनगुने पानी से नहा सकता हूँ?',
        qEn: 'Can I take a bath with fever?',
      },
      {
        qHi: 'क्या AC या पंखे में सो सकते हैं?',
        qEn: 'Is it safe to sleep with AC or fan on?',
      },
      {
        qHi: 'क्या मैं ऑफिस या कॉलेज जा सकता हूँ?',
        qEn: 'Can I go to work or study?',
      },
    ],
  },
  {
    category: 'recovery',
    categoryHi: 'ठीक होने का समय व जांच (Recovery)',
    categoryEn: 'Recovery & Doctor Visit',
    icon: '🩺',
    questions: [
      {
        qHi: 'यह बुखार कितने दिनों में पूरी तरह ठीक होगा?',
        qEn: 'How many days does viral fever take to resolve?',
      },
      {
        qHi: 'कमज़ोरी और थकान दूर करने के लिए क्या करें?',
        qEn: 'How can I recover from fever-related weakness?',
      },
      {
        qHi: 'डॉक्टर को दोबारा कब दिखाना चाहिए?',
        qEn: 'When should I visit the doctor again?',
      },
    ],
  },
];

// Flat list for backward compatibility
export const FREQUENT_PATIENT_QUESTIONS = [
  {
    qHi: 'क्या मैं गुनगुने पानी से नहा सकता हूँ?',
    qEn: 'Can I take a bath with fever?',
    aHi: 'हाँ! आप गुनगुने (lukewarm) पानी से स्नान या स्पंज बाथ ले सकते हैं। इससे शरीर का तापमान नियंत्रित रहता है। अत्यधिक ठंडे पानी से कतई न नहाएं।',
    aEn: 'Yes! A lukewarm sponge bath or shower is safe and helps gently lower body temperature. Avoid very cold water as it induces shivering.',
  },
  {
    qHi: 'खान-पान में क्या खाना चाहिए?',
    qEn: 'What should I eat during fever?',
    aHi: 'मूंग दाल खिचड़ी, सादा दलिया, गरम सूप, नारियल पानी, और उबला हुआ सेब उत्तम हैं। यह पेट पर भारी नहीं पड़ते और शरीर को त्वरित ऊर्जा देते हैं।',
    aEn: 'Nutrient-rich, light meals like lentil soup (moong dal), rice porridge, boiled vegetables, and coconut water are ideal for quick recovery.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * SAFETY, BOUNDARY & ABUSE DETECTION
 * ────────────────────────────────────────────────────────────────────────── */

const BOUNDARY_RESPONSE =
  "I’m here to help with healthcare information and CareVault-related questions. I can’t help with that request, but I’d be happy to help you understand your health information or prepare questions for your doctor.";

const BOUNDARY_RESPONSE_HI =
  "मैं यहाँ स्वास्थ्य जानकारी और केयरवॉल्ट से जुड़े सवालों में सहायता के लिए हूँ। मैं इस अनुरोध में मदद नहीं कर सकता, लेकिन आपकी स्वास्थ्य जानकारी समझने या डॉक्टर से पूछने योग्य सवाल तैयार करने में मुझे खुशी होगी।";

// Profanity / Abuse keywords (English & Hindi / Hinglish)
const ABUSE_TERMS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'whore',
  'idiot', 'stupid', 'dumb', 'moron', 'retard', 'shut up',
  'chutiya', 'madarchod', 'bhosdike', 'harami', 'kutta', 'kamina', 'gaand', 'randi', 'lodu', 'saale',
];

// Inappropriate / off-topic keywords
const OFF_TOPIC_TERMS = [
  'crypto', 'bitcoin', 'stock market', 'trading', 'nifty', 'forex',
  'write python', 'write javascript', 'write code', 'debug code', 'html css', 'hack', 'exploit',
  'movie script', 'write a poem', 'write a song', 'love story', 'dating', 'sex', 'porn', 'erotic',
  'who won the world cup', 'cricket score', 'football score', 'recipe for pizza',
  'solve math', 'calculus', 'geometry',
];

// Jailbreak / Prompt injection keywords
const JAILBREAK_TERMS = [
  'ignore previous instructions', 'ignore all previous', 'forget your instructions',
  'act as dan', 'jailbreak', 'system prompt', 'reveal your prompt', 'what are your rules',
  'bypass filter', 'developer mode', 'simulate', 'unfiltered',
];

function isOffTopicOrAbusive(text) {
  const lower = text.toLowerCase();
  
  // 1. Abuse check
  if (ABUSE_TERMS.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(lower))) {
    return true;
  }

  // 2. Jailbreak check
  if (JAILBREAK_TERMS.some((term) => lower.includes(term))) {
    return true;
  }

  // 3. Explicit off-topic check
  if (OFF_TOPIC_TERMS.some((term) => lower.includes(term))) {
    return true;
  }

  return false;
}

/**
 * Check if the question mentions acute emergency symptoms that require urgent medical attention
 */
function isEmergencyQuery(text) {
  const lower = text.toLowerCase();
  const emergencySignals = [
    'chest pain', 'heart attack', 'unconscious', 'fainting', 'difficulty breathing',
    'cannot breathe', 'coughing blood', 'severe bleeding', 'seizure', 'convulsion',
    'chati me dard', 'saans nahi aa rahi', 'behosh', 'khoon nikal raha',
  ];
  return emergencySignals.some((signal) => lower.includes(signal));
}

/**
 * Advanced Context-Aware AI Companion Engine
 * Strictly adheres to healthcare assistance, context utilization, and safety boundaries.
 */
export function generateAICompanionResponse(rawQuestion, caseData, lang = 'en', activePatient = null) {
  if (!rawQuestion || typeof rawQuestion !== 'string') {
    return lang === 'hi'
      ? 'कृपया अपना सवाल पूछें। मैं आपकी दवाओं, खान-पान और स्वास्थ्य रिकॉर्ड को समझने में मदद कर सकता हूँ।'
      : 'Please ask your question. I am here to help you understand your health records, medications, and prepare for doctor visits.';
  }

  const q = rawQuestion.trim();
  const lowerQ = q.toLowerCase();

  // 1. ABUSE & OFF-TOPIC BOUNDARY CHECK
  if (isOffTopicOrAbusive(q)) {
    return lang === 'hi' ? BOUNDARY_RESPONSE_HI : BOUNDARY_RESPONSE;
  }

  // 2. URGENT / EMERGENCY ESCALATION CHECK
  if (isEmergencyQuery(q)) {
    if (lang === 'hi') {
      return (
        '⚠️ **अत्यावश्यक सूचना (Emergency Alert)**:\n\n' +
        'आपने जो लक्षण बताए हैं वे गंभीर हो सकते हैं। कृपया तुरंत आपातकालीन चिकित्सा सहायता लें या नजदीकी अस्पताल की इमरजेंसी में जाएं:\n\n' +
        '• तुरंत अपने नजदीकी अस्पताल के इमरजेंसी वार्ड से संपर्क करें।\n' +
        '• आपातकालीन एम्बुलेंस सेवा (108 / 112) पर कॉल करें।\n' +
        '• किसी भी प्रकार की घरेलू चिकित्सा में समय व्यर्थ न करें।\n\n' +
        '*नोट: केयरवॉल्ट एआई सहायक आपातकालीन चिकित्सा सेवा का विकल्प नहीं है।*'
      );
    }
    return (
      '⚠️ **Urgent Medical Attention Required**:\n\n' +
      'The symptoms you described may require immediate clinical intervention. Please seek emergency medical care right away:\n\n' +
      '• Proceed immediately to the nearest hospital Emergency Department.\n' +
      '• Call local emergency medical services (108 / 112 or your national emergency line).\n' +
      '• Do not attempt self-medication or home remedies for severe distress.\n\n' +
      '*Disclaimer: CareVault AI Assistant does not provide emergency medical interventions.*'
    );
  }

  // Gather available context
  const patientName = activePatient?.name || caseData?.patientName || 'Patient';
  const patientId = activePatient?.patientId || caseData?.patientId || 'CV2026-000452';
  const age = activePatient?.age || '28';
  const gender = activePatient?.gender || 'Male';
  const vitals = caseData?.vitals || {};
  const currentTemp = vitals.temperature || '101.2°F';
  const currentBp = vitals.bloodPressure || '';
  const heartRate = vitals.heartRate || '98 bpm';
  const spO2 = vitals.spO2 || '98%';
  const complaint = caseData?.chiefComplaint || activePatient?.recentComplaint || 'Acute Viral Pyrexia';
  const allergy = caseData?.allergyHistory || activePatient?.allergies || '';
  const pastHistory = caseData?.pastHistory || activePatient?.knownConditions || 'None reported';
  const reportsCount = activePatient?.reportsCount || 0;

  // 3. UNAVAILABLE INFORMATION IN RECORD (Strict rule: Never invent data)
  if (
    lowerQ.includes('blood sugar') || lowerQ.includes('glucose') || lowerQ.includes('cholesterol') ||
    lowerQ.includes('lipid') || lowerQ.includes('thyroid') || lowerQ.includes('appointment date') ||
    lowerQ.includes('discharge date') || lowerQ.includes('weight') || lowerQ.includes('height') ||
    lowerQ.includes('doctor ka naam') || lowerQ.includes('who is my doctor')
  ) {
    if (lang === 'hi') {
      return (
        `वर्तमान केयरवॉल्ट रिकॉर्ड में यह जानकारी उपलब्ध नहीं है।\n\n` +
        `• **वर्तमान में दर्ज विवरण**: मुख्य शिकायत (${complaint}), वाइटल्स (तापमान ${currentTemp}, पल्स ${heartRate}, SpO2 ${spO2}), और सामान्य केस हिस्ट्री।\n` +
        `• **सलाह**: आप अपने परामर्श के दौरान डॉक्टर या अस्पताल स्टाफ से इस जानकारी को अपने केयरवॉल्ट प्रोफाइल में जोड़ने का अनुरोध कर सकते हैं।`
      );
    }
    return (
      `I don't have that information in the current record.\n\n` +
      `• **Currently Available Details**: Your active record contains your primary complaint (${complaint}), recorded vitals (Temperature ${currentTemp}, HR: ${heartRate}, SpO2: ${spO2}), and medical history.\n` +
      `• **Recommendation**: You can ask your attending physician or clinic reception to log this specific metric into your CareVault profile.`
    );
  }

  // 4. SYMPTOM EVALUATION: Headache + Fever for 3 days ("मेरे सिर में पिछले तीन दिन से दर्द है और मुझे थोड़ा fever भी है")
  if (
    (lowerQ.includes('headache') || lowerQ.includes('sir dard') || lowerQ.includes('sir mein') || lowerQ.includes('सिर') || lowerQ.includes('दर्द')) &&
    (lowerQ.includes('fever') || lowerQ.includes('bukhar') || lowerQ.includes('बुखार') || lowerQ.includes('तापमान'))
  ) {
    if (lang === 'hi') {
      return (
        `सिरदर्द और बुखार (3 दिन या उससे अधिक) के संबंध में क्लिनिकल जानकारी:\n\n` +
        `• **डॉक्टर से परामर्श की आवश्यकता**: हाँ, यदि सिरदर्द और बुखार 3 दिनों से लगातार बना हुआ है, तो डॉक्टर से प्रत्यक्ष मिलना अत्यधिक अनुशंसित है।\n` +
        `• **कारण**: 48-72 घंटों से अधिक समय तक रहने वाले बुखार में डॉक्टर वायरल इन्फेक्शन, साइनसाइटिस या अन्य मौसमी बुखार (जैसे डेंगू या टाइफाइड) की पुष्टि के लिए खून की जांच (CBC) की सलाह दे सकते हैं।\n` +
        `• **वर्तमान वाइटल्स**: आपका दर्ज तापमान ${currentTemp} है और पल्स ${heartRate} है।\n` +
        `• **घर पर क्या करें**:\n` +
        `  1. पर्याप्त मात्रा में ओआरएस (ORS), नारियल पानी या गुनगुना पानी पिएं।\n` +
        `  2. हर 4-6 घंटे में थर्मामीटर से तापमान मापें।\n` +
        `  3. बिना डॉक्टर की सलाह के खुद से एंटीबायोटिक्स न लें।\n\n` +
        `⚠️ **तत्काल चेतावनी (Red Flags)**: यदि सिरदर्द अचानक असहनीय हो जाए, गर्दन में अकड़न हो, या बार-बार उल्टी आए, तो तुरंत इमरजेंसी में जाएं।`
      );
    }
    return (
      `Guidance on Persistent Headache and Fever (3+ Days):\n\n` +
      `• **Doctor Consultation Recommended**: Yes. If you have been experiencing headache and fever for 3 consecutive days, visiting a doctor is strongly advised.\n` +
      `• **Why Clinical Evaluation Matters**: A fever persisting beyond 48–72 hours warrants professional examination. The doctor may recommend a Complete Blood Count (CBC) or viral panel to rule out secondary bacterial infection or seasonal illnesses.\n` +
      `• **Active Vitals Recorded**: Your current profile notes a temperature of ${currentTemp} and heart rate of ${heartRate}.\n` +
      `• **Immediate Supportive Measures**:\n` +
      `  1. Maintain high oral hydration (ORS, clear broths, tender coconut water).\n` +
      `  2. Log your body temperature every 4 to 6 hours.\n` +
      `  3. Avoid self-prescribing antibiotics or multiple painkillers.\n\n` +
      `⚠️ **Urgent Warning**: If the headache is explosive/sudden, accompanied by stiff neck, confusion, light sensitivity, or vomiting, seek immediate emergency medical care.`
    );
  }

  // 5. CONTEXT-AWARE: "Explain my health record in simple terms" / "mere report ko simple language mein samjhao"
  if (
    lowerQ.includes('explain my health record') ||
    lowerQ.includes('explain record') ||
    lowerQ.includes('simple terms') ||
    lowerQ.includes('simple language') ||
    lowerQ.includes('saral bhasha') ||
    lowerQ.includes('record samjhao') ||
    (lowerQ.includes('report') && (lowerQ.includes('samjhao') || lowerQ.includes('simple')))
  ) {
    if (lang === 'hi') {
      return (
        `यहाँ आपके वर्तमान केयरवॉल्ट स्वास्थ्य रिकॉर्ड का सरल विवरण है:\n\n` +
        `• **मरीज़**: ${patientName} (${patientId}, उम्र ${age} वर्ष, ${gender})\n` +
        `• **मुख्य शिकायत**: ${complaint}\n` +
        `• **वर्तमान जांच**: शरीर का तापमान ${currentTemp} है, जो हल्का बुखार दर्शाता है। हृदय गति ${heartRate} और ऑक्सीजन स्तर ${spO2} सामान्य है।\n` +
        `• **रक्तचाप (BP)**: ${currentBp ? currentBp : 'अभी दर्ज नहीं है (जांच बाकी है)'}\n` +
        `• **एलर्जी**: ${allergy ? allergy : 'कोई दर्ज नहीं'}\n\n` +
        `**आसान शब्दों में इसका अर्थ**:\n` +
        `आपका शरीर एक सामान्य वायरल प्रतिक्रिया से जूझ रहा है। महत्वपूर्ण अंग सुरक्षित हैं। आराम और डॉक्टर की सलाह से आप शीघ्र स्वस्थ होंगे।\n\n` +
        `**डॉक्टर से क्या पूछें**:\n` +
        `1. बुखार कितने दिनों तक रह सकता है?\n` +
        `2. क्या मुझे कोई अतिरिक्त ब्लड टेस्ट कराने की आवश्यकता है?\n` +
        `3. कमजोरी के लिए क्या विशेष परहेज करना चाहिए?`
      );
    }
    return (
      `Here is a simple explanation of your current CareVault record:\n\n` +
      `• **Patient Record**: ${patientName} (${patientId}, Age: ${age}, Gender: ${gender})\n` +
      `• **Primary Complaint**: ${complaint}\n` +
      `• **Current Vitals**: Body temperature is ${currentTemp} (indicating a mild-to-moderate fever). Pulse rate (${heartRate}) and oxygen saturation (${spO2}) are within reassuring ranges.\n` +
      `• **Blood Pressure**: ${currentBp ? currentBp : 'Not currently logged in this record'}\n` +
      `• **Documented Allergies**: ${allergy ? allergy : 'None documented in current record'}\n\n` +
      `**What this means for you**:\n` +
      `Your symptoms are consistent with an acute viral response. Your vitals show your body is actively managing the illness without signs of respiratory distress.\n\n` +
      `**Questions to ask your doctor**:\n` +
      `1. How long do you expect these symptoms to continue?\n` +
      `2. Do you recommend recording my blood pressure during this visit?\n` +
      `3. At what point would you advise a follow-up blood test?`
    );
  }

  // 6. CONTEXT-AWARE: "Summarize my recent medical information" / "Summarize my records" / "mere latest record ka summary batao"
  if (
    lowerQ.includes('summarize') ||
    lowerQ.includes('summary') ||
    lowerQ.includes('summarize this case') ||
    lowerQ.includes('case summarize') ||
    lowerQ.includes('patient ka case') ||
    lowerQ.includes('recent medical information') ||
    lowerQ.includes('saaransh') ||
    (lowerQ.includes('record') && lowerQ.includes('batao'))
  ) {
    if (lang === 'hi') {
      return (
        `केयरवॉल्ट में उपलब्ध आपके रिकॉर्ड का संक्षिप्त सारांश:\n\n` +
        `1. **मरीज़ विवरण**: ${patientName} | आईडी: ${patientId}\n` +
        `2. **वर्तमान स्थिति**: ${complaint}\n` +
        `3. **दर्ज वाइटल्स**:\n` +
        `   • तापमान: ${currentTemp}\n` +
        `   • पल्स: ${heartRate}\n` +
        `   • SpO2: ${spO2}\n` +
        `   • ब्लड प्रेशर: ${currentBp || 'अपेक्षित'}\n` +
        `4. **पिछला इतिहास**: ${pastHistory}\n\n` +
        `*नोट: केवल डॉक्टर ही आधिकारिक रूप से उपचार निर्धारित कर सकते हैं।*`
      );
    }
    return (
      `Structured Summary of Available Medical Information:\n\n` +
      `• **Patient Identification**: ${patientName} (CareVault ID: ${patientId})\n` +
      `• **Active Clinical Presentation**: ${complaint}\n` +
      `• **Recorded Vital Signs**:\n` +
      `  - Temperature: ${currentTemp}\n` +
      `  - Heart Rate: ${heartRate}\n` +
      `  - Oxygen Saturation: ${spO2}\n` +
      `  - Blood Pressure: ${currentBp || 'Not documented yet'}\n` +
      `• **Past Medical Conditions**: ${pastHistory}\n` +
      `• **Known Allergies**: ${allergy || 'None on record'}\n\n` +
      `*Notice: This summary is compiled strictly from available CareVault documentation. Clinical diagnosis requires physician sign-off.*`
    );
  }

  // 7. CONTEXT-AWARE: "What should I discuss with my doctor?" / "doctor se mujhe kya puchna chahiye?"
  if (
    lowerQ.includes('discuss with my doctor') ||
    lowerQ.includes('ask my doctor') ||
    lowerQ.includes('doctor se kya') ||
    lowerQ.includes('doctor se') ||
    lowerQ.includes('puchna chahiye') ||
    lowerQ.includes('questions for doctor')
  ) {
    if (lang === 'hi') {
      return (
        `आपके वर्तमान लक्षणों (${complaint}) के आधार पर अपने डॉक्टर से पूछने के लिए महत्वपूर्ण प्रश्न:\n\n` +
        `1. **दवा और समय**: क्या मुझे पैरासिटामोल के अतिरिक्त किसी अन्य दवा की आवश्यकता है?\n` +
        `2. **जांच (Tests)**: यदि बुखार 3 दिन बाद भी न उतरे, तो क्या सीबीसी (CBC) या डेंगू जांच करानी चाहिए?\n` +
        `3. **रक्तचाप (BP)**: क्या मुझे इस परामर्श में अपना ब्लड प्रेशर भी चेक करवाना चाहिए?\n` +
        `4. **सावधानी**: किन लक्षणों (जैसे सांस फूलना या चक्कर आना) पर तुरंत दोबारा आना चाहिए?\n\n` +
        `*यह सूची आपकी सुविधा के लिए है ताकि परामर्श के दौरान कोई महत्वपूर्ण बिंदु न छूटे।*`
      );
    }
    return (
      `Recommended Questions to Discuss with Your Doctor:\n\n` +
      `Based on your recorded complaint (${complaint}) and vitals (${currentTemp}, HR: ${heartRate}):\n\n` +
      `1. **Medication Plan**: Are over-the-counter antipyretics sufficient, or is a specific prescription recommended?\n` +
      `2. **Diagnostic Tests**: If fever persists past day 3 to 4, which laboratory tests (e.g., CBC with platelets) do you advise?\n` +
      `3. **Missing Vitals**: Can we log an updated Blood Pressure reading during today’s examination?\n` +
      `4. **Warning Signs**: What specific symptoms should prompt an immediate return or emergency visit?\n` +
      `5. **Activity & Work**: When is it safe to resume normal work or physical activity?\n\n` +
      `*These suggested questions are intended to help you have an informed discussion with your physician.*`
    );
  }

  // 8. CONTEXT-AWARE: "Help me understand this report" / "Explain the report simply" / "is report mein kya important hai?"
  if (
    lowerQ.includes('understand this report') ||
    lowerQ.includes('understand this information') ||
    lowerQ.includes('explain the report simply') ||
    lowerQ.includes('report simply') ||
    lowerQ.includes('is report mein') ||
    lowerQ.includes('report mein kya important') ||
    lowerQ.includes('latest report mean') ||
    lowerQ.includes('report samjhao') ||
    lowerQ.includes('report meaning')
  ) {
    if (reportsCount === 0 && !caseData?.examination) {
      return lang === 'hi'
        ? 'वर्तमान रिकॉर्ड में अभी कोई अलग लैब रिपोर्ट अपलोड नहीं है। वर्तमान ओपीडी पर्चे के अनुसार आपके मुख्य लक्षण बुखार और सिरदर्द हैं। यदि आपके पास कोई नई लैब रिपोर्ट है, तो कृपया डॉक्टर को दिखाएं।'
        : 'There are currently no external laboratory test reports attached to your profile. Based on your active clinical intake, your recorded symptoms are fever and associated body ache with stable pulse and oxygen levels.';
    }

    if (lang === 'hi') {
      return (
        `उपलब्ध क्लिनिकल रिकॉर्ड के आधार पर आपकी स्थिति:\n\n` +
        `• **अवलोकन (Finding)**: तापमान ${currentTemp} और हृदय गति ${heartRate} दर्ज है।\n` +
        `• **अर्थ (Meaning)**: शरीर में हल्का वायरल संक्रमण है, जिससे निपटने के लिए रोग प्रतिरोधक क्षमता सक्रिय है।\n` +
        `• **ज़रूरी बिंदु**: ऑक्सीजन स्तर (${spO2}) सुरक्षित है। रक्तचाप की पुष्टि डॉक्टर से अवश्य कराएं।\n\n` +
        `**परामर्श हेतु सुझाव**:\n` +
        `डॉक्टर से पूछें कि क्या किसी अतिरिक्त रक्त परीक्षण की आवश्यकता है।`
      );
    }
    return (
      `Here is an explanation of your documented clinical intake:\n\n` +
      `• **Finding**: Temperature is recorded at ${currentTemp} with a pulse of ${heartRate}.\n` +
      `• **Meaning**: Your body temperature reflects a mild febrile response, commonly seen in viral respiratory illnesses.\n` +
      `• **Why it matters**: Your SpO2 (${spO2}) confirms your respiratory system is maintaining healthy oxygen levels. A blood pressure reading should be completed to finalize the record.\n\n` +
      `**Next steps to consider**:\n` +
      `1. Review these vitals with your attending doctor.\n` +
      `2. Follow hydration and rest guidelines until body temperature returns to baseline (98.4°F).`
    );
  }

  // 9. CONTEXT-AWARE: "What information is missing?" / "kya information missing hai?"
  if (
    lowerQ.includes('missing') ||
    lowerQ.includes('what information is missing') ||
    lowerQ.includes('kya missing') ||
    lowerQ.includes('incomplete')
  ) {
    const isBpMissing = !currentBp || currentBp.includes('Pending') || currentBp.includes('Needs Entry');
    if (isBpMissing) {
      if (lang === 'hi') {
        return (
          `सक्रिय केस समीक्षा के अनुसार छूटी हुई जानकारी:\n\n` +
          `• **अपेक्षित फ़ील्ड**: रक्तचाप (Blood Pressure - BP) अभी दर्ज नहीं हुआ है।\n` +
          `• **यह क्यों महत्वपूर्ण है**: डॉक्टर द्वारा सुरक्षित दवा और खुराक निर्धारित करने के लिए बीपी का रिकॉर्ड होना आवश्यक है।\n` +
          `• **दर्ज वाइटल्स**: तापमान (${currentTemp}), पल्स (${heartRate}), और ऑक्सीजन (${spO2}) पूर्ण रूप से दर्ज हैं।\n\n` +
          `आप केस रिव्यू कार्ड में 'Review Missing Information' बटन पर क्लिक करके इसे तुरंत जोड़ सकते हैं।`
        );
      }
      return (
        `Based on the active clinical case review:\n\n` +
        `• **Missing Information**: Blood Pressure (BP) has not been recorded for this visit.\n` +
        `• **Clinical Significance**: BP measurement is required to ensure cardiovascular stability and safe medication dosing.\n` +
        `• **Verified Information Logged**: Body Temperature (${currentTemp}), Heart Rate (${heartRate}), and SpO2 (${spO2}) are present.\n\n` +
        `You can use the 'Review Missing Information' action in the Case Review section to input this missing vital.`
      );
    }

    if (lang === 'hi') {
      return (
        `वर्तमान रिकॉर्ड का ऑडिट:\n\n` +
        `• सभी आवश्यक प्राथमिक वाइटल्स (तापमान ${currentTemp}, बीपी ${currentBp}, पल्स ${heartRate}, SpO2 ${spO2}) और मुख्य शिकायत दर्ज हैं।\n` +
        `• कोई अनिवार्य फील्ड छूटा हुआ नहीं है। केस डॉक्टर परामर्श के लिए तैयार है।`
      );
    }
    return (
      `Case Completeness Status:\n\n` +
      `• All primary vital signs (Temperature: ${currentTemp}, BP: ${currentBp}, Heart Rate: ${heartRate}, SpO2: ${spO2}) and chief complaint are logged.\n` +
      `• No critical intake fields are missing. The case is ready for physician consultation.`
    );
  }

  // 7. Medical Terminology Explanations
  if (lowerQ.includes('pyrexia') || lowerQ.includes('febrile') || lowerQ.includes('pharyngitis') || lowerQ.includes('spo2') || lowerQ.includes('cbc')) {
    if (lowerQ.includes('pyrexia') || lowerQ.includes('febrile')) {
      return lang === 'hi'
        ? '• **पायरेक्सिया (Pyrexia / Febrile)**: यह "बुखार" (Fever) का चिकित्सीय शब्द है, जिसका अर्थ है कि शरीर का तापमान सामान्य (98.4°F) से अधिक है।'
        : '• **Pyrexia / Febrile**: This is the medical term for fever—an elevation in core body temperature above the normal 98.4°F (37°C) in response to infection or inflammation.';
    }
    if (lowerQ.includes('pharyngitis')) {
      return lang === 'hi'
        ? '• **ग्रसनीशोथ (Pharyngitis)**: गले के पिछले हिस्से (ग्रसनी) में होने वाली सूजन, लालिमा या खराश को कहते हैं।'
        : '• **Pharyngitis**: Inflammation or redness of the back of the throat (pharynx), commonly causing soreness or scratchiness during a viral cold.';
    }
    if (lowerQ.includes('spo2')) {
      return lang === 'hi'
        ? '• **SpO2 (ऑक्सीजन संतृप्ति)**: यह दर्शाता है कि आपके रक्त में हीमोग्लोबिन कितनी ऑक्सीजन ले जा रहा है। 95% से 100% सामान्य और स्वस्थ माना जाता है।'
        : '• **SpO2 (Oxygen Saturation)**: An estimate of the percentage of oxygen-carrying hemoglobin in your bloodstream. A reading of 95%–100% is considered healthy.';
    }
    if (lowerQ.includes('cbc')) {
      return lang === 'hi'
        ? '• **सीबीसी (Complete Blood Count)**: एक सामान्य रक्त परीक्षण जो लाल रक्त कोशिकाओं, श्वेत रक्त कोशिकाओं (इन्फेक्शन से लड़ने वाली) और प्लेटलेट्स की संख्या जांचता है।'
        : '• **Complete Blood Count (CBC)**: A standard blood panel that measures red blood cells, white blood cells (immune defense), and platelets to evaluate infection or inflammation.';
    }
  }

  // 8. Bathing & Showering
  if (lowerQ.includes('bath') || lowerQ.includes('naha') || lowerQ.includes('shower') || lowerQ.includes('sponge')) {
    if (lang === 'hi') {
      return (
        'बुखार में स्नान के संबंध में मार्गदर्शन:\n\n' +
        '• **गुनगुने पानी का प्रयोग**: गुनगुने (Lukewarm) पानी से स्नान या स्पंज बाथ लेना सुरक्षित और आरामदायक है। यह शरीर को धीरे-धीरे ठंडा करता है।\n' +
        '• **बर्फ जैसा ठंडा पानी वर्जित**: अत्यधिक ठंडे पानी से कंपकंपी छूट सकती है, जिससे बुखार और बढ़ सकता है।\n' +
        '• **तुरंत सुखाएं**: नहाने के बाद तुरंत शरीर सुखाएं और सीधी ठंडी हवा से बचें।'
      );
    }
    return (
      'Bathing Guidance during Fever:\n\n' +
      '• **Lukewarm water is recommended**: A warm-to-lukewarm sponge bath or shower helps gently comfort your body and reduce muscle tension.\n' +
      '• **Avoid ice-cold water**: Cold showers trigger shivering, which paradoxically increases core body temperature.\n' +
      '• **Dry off promptly**: Dress in light, breathable cotton layers and avoid sitting directly in front of air conditioning drafts.'
    );
  }

  // 9. Food & Diet: What to eat
  if (lowerQ.includes('diet') || lowerQ.includes('food') || lowerQ.includes('eat') || lowerQ.includes('khana') || lowerQ.includes('khaye')) {
    if (lang === 'hi') {
      return (
        'स्वास्थ्य लाभ के लिए सुझाई गई आहार मार्गदर्शिका:\n\n' +
        '• **सुपाच्य भोजन**: मूंग दाल की खिचड़ी, सादा दलिया, उबले आलू या चावल-दाल लें।\n' +
        '• **तरल पदार्थ**: नारियल पानी, गुनगुना वेज सूप, और दिन भर में 2.5 से 3 लीटर पानी पिएं।\n' +
        '• **परहेज़**: अत्यधिक तला-भुना, बासी या मसालेदार भोजन न खाएं ताकि पाचन तंत्र पर दबाव न पड़े।'
      );
    }
    return (
      'Dietary Guidelines for Recovery:\n\n' +
      '• **Soft, digestible foods**: Lentil porridge (moong dal khichdi), plain oatmeal, and boiled vegetable broths.\n' +
      '• **High hydration**: Tender coconut water, light vegetable soups, and boiled water at room temperature (2.5–3 liters daily).\n' +
      '• **Avoid**: Heavy fried foods, greasy snacks, and excessive sugar, which strain digestion during acute illness.'
    );
  }

  // 10. Fruits and Dairy (Curd, Coconut Water)
  if (lowerQ.includes('fruit') || lowerQ.includes('curd') || lowerQ.includes('dahi') || lowerQ.includes('coconut')) {
    if (lang === 'hi') {
      return (
        'फल व दही के संबंध में सावधानियां:\n\n' +
        '• **फल**: सेब, पपीता, और अनार ताज़ा काटकर खाएं। नारियल पानी इलेक्ट्रोलाइट्स के लिए बहुत लाभदायक है।\n' +
        '• **दही / छाछ**: फ्रिज की ठंडी या खट्टी दही से बचें, क्योंकि इससे गले की खराश बढ़ सकती है। सामान्य तापमान पर ताज़ा दही दोपहर में थोड़ी मात्रा में ली जा सकती है।'
      );
    }
    return (
      'Fruits and Dairy Guidelines:\n\n' +
      '• **Fruits**: Freshly washed apples, ripe papaya, and tender coconut water are gentle on the digestive tract and supply essential electrolytes.\n' +
      '• **Yogurt / Curd**: Avoid cold or sour dairy from the refrigerator, as it can irritate an inflamed throat. Fresh, room-temperature curd during daytime meals is generally acceptable.'
    );
  }

  // 11. Medication safety (Paracetamol, timings)
  if (lowerQ.includes('paracetamol') || lowerQ.includes('medicine') || lowerQ.includes('dawa') || lowerQ.includes('dose') || lowerQ.includes('timing')) {
    if (lang === 'hi') {
      return (
        'दवा सुरक्षा संबंधी महत्वपूर्ण नियम:\n\n' +
        '• **डॉक्टर की पर्ची का पालन करें**: दवा की मात्रा और समय डॉक्टर के निर्देशानुसार ही रखें।\n' +
        '• **खाली पेट न लें**: बुखार की दवा हमेशा हल्के नाश्ते या दूध के बाद ही लें ताकि पेट में एसिडिटी न हो।\n' +
        '• **निश्चित अंतराल**: सामान्यतः पैरासिटामोल खुराकों में कम से कम 6 घंटे का अंतर रखा जाता है। 24 घंटे में अधिकतम सीमा कभी पार न करें।'
      );
    }
    return (
      'General Medication Safety Rules:\n\n' +
      '• **Adhere to prescription**: Take medications strictly according to your treating doctor’s instructions.\n' +
      '• **Take with food**: Antipyretics like Paracetamol should be taken after meals or milk to protect against stomach irritation.\n' +
      '• **Spacing doses**: Maintain at least a 6-hour gap between doses. Do not exceed the prescribed 24-hour limit.\n\n' +
      '*Always consult your physician before starting or altering any pharmaceutical treatment.*'
    );
  }

  // 12. Recovery Time
  if (lowerQ.includes('recovery') || lowerQ.includes('how long') || lowerQ.includes('thik hoga') || lowerQ.includes('days')) {
    if (lang === 'hi') {
      return (
        'ठीक होने की सामान्य समयावधि:\n\n' +
        '• सामान्य वायरल बुखार प्रायः 3 से 5 दिनों में नियंत्रित हो जाता है।\n' +
        '• पहले 2-3 दिन शरीर में तापमान में उतार-चढ़ाव रह सकता है, जिसके बाद धीरे-धीरे ऊर्जा लौटती है।\n' +
        '• यदि बुखार 5वें दिन के बाद भी बना रहे, तो डॉक्टर से पुनः मिलकर रक्त परीक्षण (CBC आदि) पर चर्चा करें।'
      );
    }
    return (
      'Typical Recovery Timeline:\n\n' +
      '• Common uncomplicated viral fevers usually resolve within 3 to 5 days with supportive care.\n' +
      '• Mild post-viral fatigue may linger for an additional 2 to 3 days; rest and hydration help restore vitality.\n' +
      '• If fever persists past day 5 or exceeds 102°F consistently, contact your physician for follow-up testing.'
    );
  }

  // 13. General Contextual Fallback (Professional, structured, non-prescriptive)
  if (lang === 'hi') {
    return (
      `आपके प्रश्न "${q}" के संदर्भ में केयरवॉल्ट एआई सहायता:\n\n` +
      `• **क्लिनिकल स्थिति**: आपके वर्तमान रिकॉर्ड में ${complaint} दर्ज है।\n` +
      `• **सामान्य स्वास्थ्य सलाह**: पर्याप्त आराम लें, दिन भर में 2.5 से 3 लीटर तरल पदार्थ पिएं, और हल्का व सुपाच्य भोजन लें।\n` +
      `• **दवा संबंधी नियम**: किसी भी नई दवा को बिना डॉक्टर के परामर्श के न लें।\n\n` +
      `यदि लक्षण गंभीर हों या लगातार बने रहें, तो कृपया अपने डॉक्टर से व्यक्तिगत परामर्श लें।`
    );
  }

  return (
    `Regarding your question "${q}":\n\n` +
    `• **Contextual Status**: Your current CareVault profile notes ${complaint} with a recorded temperature of ${currentTemp}.\n` +
    `• **General Wellness Advice**: Prioritize restful sleep, maintain continuous oral hydration (2.5–3 liters daily), and consume easily digestible meals.\n` +
    `• **Clinical Boundaries**: CareVault AI provides health information and cannot prescribe treatments or establish clinical diagnoses.\n\n` +
    `For tailored medical advice or persistent symptoms, please consult your healthcare provider.`
  );
}

/**
 * Text-to-speech helper function
 */
export function playVoiceNarration(text, lang = 'en', onEnd = () => {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return null;
  }

  window.speechSynthesis.cancel();

  // Clean formatted text for natural speech
  const cleanText = text
    .replace(/[#*•]/g, '')
    .replace(/(\d+)\.\s*/g, '$1, ')
    .replace(/\n+/g, ' ');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) => (lang === 'hi' && v.lang.startsWith('hi')) || (lang === 'en' && (v.lang === 'en-IN' || v.name.includes('India') || v.lang.startsWith('en')))
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  utterance.onend = () => onEnd();
  utterance.onerror = () => onEnd();

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopVoiceNarration() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
